import re
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import os


from app.database import get_db
from app.models.models import User,Referral 
from app.utils.referral import generate_unique_referral_code, get_referrer_by_code

from app.schemas.auth import (
    SignupRequest, LoginRequest, VerifyOtpRequest,
    ResendOtpRequest, UserResponse, TokenResponse, MessageResponse,
    GoogleLoginRequest, UpdateProfileRequest, ChangePasswordRequest,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.core.security import (
    hash_password, verify_password,
    create_access_token, get_current_user
)
from app.services.otp_service import (
    generate_otp, get_otp_expiry, send_otp_email, send_otp_sms
)
from app.models.models import User, Referral
REFERRAL_REWARD_AMOUNT = 0

router = APIRouter()

PHONE_REGEX = re.compile(r"^[6-9]\d{9}$")  # India: 10 digit, starts 6-9


def _send_otp(channel: str, email: str, phone: str, otp_code: str, name: str):
    """Chosen channel par OTP bhejta hai."""
    if channel == "phone":
        return send_otp_sms(phone=phone, otp_code=otp_code)
    return send_otp_email(to_email=email, otp_code=otp_code, name=name)


# ════════════════════════════════════════════════════
# SIGNUP
# ════════════════════════════════════════════════════
@router.post("/signup", response_model=MessageResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if data.otp_channel not in ("email", "phone"):
        raise HTTPException(status_code=400, detail="otp_channel must be 'email' or 'phone'")

    if not PHONE_REGEX.match(data.phone):
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit phone number")

    # ── Referral code validate karo (agar diya gaya hai) ──
    # Invalid code hone par signup yahin rok denge — koi user create nahi hoga.
    referrer = None
    if data.referral_code:
        referrer = get_referrer_by_code(db, data.referral_code)
        if not referrer:
            raise HTTPException(
                status_code=400,
                detail="Invalid referral code. Please check the link and try again."
            )

    # Check karo email already exist to nahi karta
    # Check karo email/phone already exist to nahi karta
    existing_email = db.query(User).filter(User.email == data.email).first()
    existing_phone = db.query(User).filter(User.phone == data.phone).first()
    existing_user = existing_email or existing_phone

    if existing_user:
        if existing_user.is_verified:
            # Verified user already hai — genuine duplicate, error do
            raise HTTPException(status_code=400, detail="Email or phone already registered")
        else:
            # User pehle try kar chuka tha but verify nahi hua (OTP fail hua tha shayad)
            # — naya OTP generate karke resend kar do, duplicate error mat do
            otp_code = generate_otp()
            existing_user.otp_code = otp_code
            existing_user.otp_expires_at = get_otp_expiry()
            existing_user.otp_channel = data.otp_channel
            db.commit()

            sent = _send_otp(data.otp_channel, existing_user.email, existing_user.phone, otp_code, existing_user.name)
            if not sent:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to send OTP via {data.otp_channel}. Please use Resend OTP."
                )

            channel_label = "phone" if data.otp_channel == "phone" else "email"
            return {"message": f"OTP resent to your {channel_label}."}

    # OTP generate karo (naya user ke liye)
    otp_code = generate_otp()
    otp_expiry = get_otp_expiry()

    # Har naye user ko apna unique referral code milega,
    # taaki wo khud aage refer kar sake
    own_referral_code = generate_unique_referral_code(db)

    # Naya user banao (abhi unverified)
    new_user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password=hash_password(data.password),
        auth_provider="email",
        is_verified=False,
        is_email_verified=False,
        is_phone_verified=False,
        otp_code=otp_code,
        otp_expires_at=otp_expiry,
        otp_channel=data.otp_channel,
        referral_code=own_referral_code,
        referred_by=referrer.id if referrer else None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Agar valid referrer tha, to Referral table me relationship record bana do
    if referrer:
        new_referral = Referral(
            referrer_id=referrer.id,
            referee_id=new_user.id,
            status="pending",   # reward trigger hone tak pending rahega
        )
        db.add(new_referral)
        db.commit()

    # Chosen channel par OTP bhejo
    sent = _send_otp(data.otp_channel, data.email, data.phone, otp_code, data.name)
    if not sent:
        raise HTTPException(
            status_code=500,
            detail=f"Signup successful but failed to send OTP via {data.otp_channel}. Please use Resend OTP."
        )

    channel_label = "phone" if data.otp_channel == "phone" else "email"
    return {"message": f"Signup successful. Please check your {channel_label} for the OTP."}


# ════════════════════════════════════════════════════
# VERIFY OTP
# ════════════════════════════════════════════════════
@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")

    if user.otp_code != data.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired, please request a new one")

    if user.otp_channel == "phone":
        user.is_phone_verified = True
    else:
        user.is_email_verified = True

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    user.otp_channel = None

    # ── Referral reward trigger ──
    # Referee ka OTP verify ho gaya — agar isse kisi ne refer kiya tha,
    # us referral ko "completed" mark kar do
    if user.referred_by:
        referral = db.query(Referral).filter(
            Referral.referee_id == user.id,
            Referral.status == "pending",
        ).first()
        if referral:
            referral.status = "completed"
            referral.reward_amount = REFERRAL_REWARD_AMOUNT  # abhi 0, amount decide hote hi update kar dena

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})

    return {"access_token": token, "user": user}


# ════════════════════════════════════════════════════
# RESEND OTP
# ════════════════════════════════════════════════════
@router.post("/resend-otp", response_model=MessageResponse)
def resend_otp(data: ResendOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")

    # Naya OTP generate karo — usi channel par jo signup ke waqt chuna tha
    otp_code = generate_otp()
    user.otp_code = otp_code
    user.otp_expires_at = get_otp_expiry()
    db.commit()

    channel = user.otp_channel or "email"
    sent = _send_otp(channel, user.email, user.phone, otp_code, user.name)
    if not sent:
        raise HTTPException(status_code=500, detail=f"Failed to resend OTP via {channel}")

    channel_label = "phone" if channel == "phone" else "email"
    return {"message": f"A new OTP has been sent to your {channel_label}."}


# ════════════════════════════════════════════════════
# LOGIN
# ════════════════════════════════════════════════════
MAX_ATTEMPTS = 3
LOCKOUT_MINUTES = 2

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail={"message": "Invalid email or password"})

    now = datetime.utcnow()

    # ── Already locked? ──
    if user.lockout_until and user.lockout_until > now:
        retry_after = int((user.lockout_until - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail={
                "message": "Too many failed attempts. Please try again later.",
                "locked": True,
                "retry_after": retry_after,
            },
        )

    # Agar lockout ka time nikal chuka hai, to ye ab "bonus/1 attempt" hai
    was_in_cooldown = user.lockout_until is not None and user.lockout_until <= now

    # ── Wrong password ──
    if not user.password or not verify_password(data.password, user.password):

        if was_in_cooldown:
            # Bonus attempt bhi galat -> turant phir se 2 min lock
            user.lockout_until = now + timedelta(minutes=LOCKOUT_MINUTES)
            user.failed_login_attempts = 0
            db.commit()
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Incorrect password. Locked again for 2 minutes.",
                    "locked": True,
                    "retry_after": LOCKOUT_MINUTES * 60,
                },
            )

        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1

        if user.failed_login_attempts >= MAX_ATTEMPTS:
            user.lockout_until = now + timedelta(minutes=LOCKOUT_MINUTES)
            user.failed_login_attempts = 0
            db.commit()
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Too many failed attempts. Account locked for 2 minutes.",
                    "locked": True,
                    "retry_after": LOCKOUT_MINUTES * 60,
                },
            )

        attempts_left = MAX_ATTEMPTS - user.failed_login_attempts
        db.commit()
        raise HTTPException(
            status_code=401,
            detail={"message": "Invalid email or password", "attempts_left": attempts_left},
        )

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your account first")

    # ── Success: sab reset ──
    user.failed_login_attempts = 0
    user.lockout_until = None
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "user": user}

# ════════════════════════════════════════════════════
# GET CURRENT USER (/me)
# ════════════════════════════════════════════════════
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ════════════════════════════════════════════════════
# GOOGLE LOGIN
# ════════════════════════════════════════════════════
@router.post("/google", response_model=TokenResponse)
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")

    try:
        # Google ke saath token verify karo
        idinfo = google_id_token.verify_oauth2_token(
            data.id_token, google_requests.Request(), google_client_id
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_email = idinfo.get("email")
    google_id = idinfo.get("sub")
    google_name = idinfo.get("name", google_email.split("@")[0])

    if not google_email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Check karo user already exist karta hai (email se)
    user = db.query(User).filter(User.email == google_email).first()

    if user:
        # Agar pehle email/password se bana tha, ab google_id link kar do
        if not user.google_id:
            user.google_id = google_id
            user.auth_provider = "google"
            db.commit()
            db.refresh(user)
    else:
        # Naya user banao — Google se aaya hai to auto-verified
        user = User(
            name=google_name,
            email=google_email,
            google_id=google_id,
            auth_provider="google",
            is_verified=True,  # Google already verify kar chuka hai
            is_email_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})

    return {"access_token": token, "user": user}

# ════════════════════════════════════════════════════
# UPDATE CURRENT USER (/me)
# ════════════════════════════════════════════════════
@router.patch("/me", response_model=UserResponse)
def update_me(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.email and data.email != current_user.email:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = data.email
        current_user.is_email_verified = False  # naya email dobara verify karna hoga

    if data.phone and data.phone != current_user.phone:
        if not PHONE_REGEX.match(data.phone):
            raise HTTPException(status_code=400, detail="Please enter a valid 10-digit phone number")
        existing = db.query(User).filter(User.phone == data.phone).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already in use")
        current_user.phone = data.phone
        current_user.is_phone_verified = False  # naya phone dobara verify karna hoga

    if data.name:
        current_user.name = data.name

    db.commit()
    db.refresh(current_user)
    return current_user


# ════════════════════════════════════════════════════
# CHANGE PASSWORD (/me/password)
# ════════════════════════════════════════════════════
@router.patch("/me/password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Google-login users ke paas password hi nahi hota
    if not current_user.password:
        raise HTTPException(
            status_code=400,
            detail="This account uses Google sign-in and has no password set."
        )

    # Current password verify karo
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Same password dobara set na hone do
    if verify_password(data.new_password, current_user.password):
        raise HTTPException(status_code=400, detail="New password must be different from current password")

    current_user.password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated successfully."}


# ════════════════════════════════════════════════════
# VERIFY RESET OTP — checks the code only, doesn't reset yet
# (used by the frontend's 2-step reset flow: verify code, then set new password)
# ════════════════════════════════════════════════════
@router.post("/verify-reset-otp", response_model=MessageResponse)
def verify_reset_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.otp_code or user.otp_code != data.otp_code:
        raise HTTPException(status_code=400, detail="Invalid code")

    if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code expired, please request a new one")

    return {"message": "Code verified."}


# ════════════════════════════════════════════════════
# FORGOT PASSWORD — sends OTP to email
# ════════════════════════════════════════════════════
@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    if not user.password:
        raise HTTPException(
            status_code=400,
            detail="This account uses Google sign-in and has no password to reset."
        )

    # Reuse the same OTP fields used for signup verification
    otp_code = generate_otp()
    user.otp_code = otp_code
    user.otp_expires_at = get_otp_expiry()
    db.commit()

    send_otp_email(to_email=data.email, otp_code=otp_code, name=user.name)

    return {"message": "A password reset code has been sent to your email."}


# ════════════════════════════════════════════════════
# RESET PASSWORD — verifies OTP, sets new password
# ════════════════════════════════════════════════════
@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.otp_code or user.otp_code != data.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired, please request a new one")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user.password = hash_password(data.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}
