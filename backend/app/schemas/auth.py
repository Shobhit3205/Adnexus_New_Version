from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ── Signup ──
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str                 # naya field
    password: str
    otp_channel: str           # "email" ya "phone" — user ne jo choose kiya


# ── Login ──
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── OTP Verify ──
class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str


# ── Resend OTP ──
class ResendOtpRequest(BaseModel):
    email: EmailStr


# ── Forgot Password ──
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ── Reset Password ──
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str


# ── User Response (password kabhi frontend ko nahi jayega) ──
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    is_verified: bool
    is_email_verified: bool
    is_phone_verified: bool
    auth_provider: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Token Response (login/verify success ke baad) ──
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Simple Message Response ──
class MessageResponse(BaseModel):
    message: str


# ── Google Login ──
class GoogleLoginRequest(BaseModel):
    id_token: str


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None


# ── Change Password ──
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str