from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import os

from app.database import get_db
from app.models.models import User

from app.schemas.auth import (
    SignupRequest, LoginRequest, VerifyOtpRequest,
    ResendOtpRequest, UserResponse, TokenResponse, MessageResponse,
    GoogleLoginRequest, UpdateProfileRequest, ChangePasswordRequest
)
from app.core.security import (
    hash_password, verify_password,
    create_access_token, get_current_user
)
from app.services.otp_service import generate_otp, get_otp_expiry, send_otp_email

router = APIRouter()


# ════════════════════════════════════════════════════
# SIGNUP
# ════════════════════════════════════════════════════
@router.post("/signup", response_model=MessageResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # Check karo email already exist to nahi karta
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # OTP generate karo
    otp_code = generate_otp()
    otp_expiry = get_otp_expiry()

    # Naya user banao (abhi unverified)
    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        auth_provider="email",
        is_verified=False,
        otp_code=otp_code,
        otp_expires_at=otp_expiry,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # OTP email bhejo
    send_otp_email(to_email=data.email, otp_code=otp_code, name=data.name)

    return {"message": "Signup successful. Please check your email for the OTP."}


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

    # Verify kar do
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)

    # Auto-login: token generate karo
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

    # Naya OTP generate karo
    otp_code = generate_otp()
    user.otp_code = otp_code
    user.otp_expires_at = get_otp_expiry()
    db.commit()

    send_otp_email(to_email=data.email, otp_code=otp_code, name=user.name)

    return {"message": "A new OTP has been sent to your email."}


# ════════════════════════════════════════════════════
# LOGIN
# ════════════════════════════════════════════════════
@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not user.password or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first")

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