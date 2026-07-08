import random
import os
import resend
from datetime import datetime, timedelta

# Resend API key set karo
resend.api_key = os.getenv("RESEND_API_KEY")


def generate_otp() -> str:
    """6-digit random OTP generate karta hai"""
    return str(random.randint(100000, 999999))


def get_otp_expiry() -> datetime:
    """OTP 10 minute ke liye valid rahega"""
    return datetime.utcnow() + timedelta(minutes=10)


def send_otp_email(to_email: str, otp_code: str, name: str = ""):
    """
    Resend API se real OTP email bhejta hai.
    """
    try:
        params = {
            "from": "AdNexus <noreply@adnexus.co.in>",  # domain verify hone tak ye default use hoga
            "to": [to_email],
            "subject": "Your AdNexus Verification Code",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #1A73E8;">AdNexus Verification</h2>
                    <p>Hi {name or 'there'},</p>
                    <p>Your OTP code is:</p>
                    <h1 style="letter-spacing: 6px; color: #111;">{otp_code}</h1>
                    <p>This code is valid for <strong>10 minutes</strong>.</p>
                    <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            """
        }
        email = resend.Emails.send(params)
        print(f"✅ OTP email sent to {to_email} | Resend ID: {email.get('id')}")
        return True
    except Exception as e:
        print(f"❌ Failed to send OTP email: {e}")
        return False