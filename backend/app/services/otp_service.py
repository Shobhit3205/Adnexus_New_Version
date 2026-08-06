import random
import os
import requests
import resend
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from app.models.models import Campaign, LeadForm, FormSubmission, ClickTracking, User
# from app.services.otp_service import send_lead_notification_email

# Resend API key set karo
resend.api_key = os.getenv("RESEND_API_KEY")

# Fast2SMS API key set karo (.env mein FAST2SMS_API_KEY add karna)
FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY")


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


def send_otp_sms(phone: str, otp_code: str) -> bool:
    """
    Fast2SMS API se real OTP SMS bhejta hai.
    NOTE: India mein OTP route use karne ke liye Fast2SMS dashboard par
    DLT registration (sender ID + template approval) karwana zaroori hai,
    warna carriers SMS ko silently block kar dete hain. Ye ek baar ka
    setup step hai, dashboard se hi hota hai — code se nahi.
    """
    if not FAST2SMS_API_KEY:
        print("❌ FAST2SMS_API_KEY set nahi hai .env mein")
        return False

    try:
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "route": "otp",
            "variables_values": otp_code,
            "numbers": phone,
        }
        headers = {
            "authorization": FAST2SMS_API_KEY,
        }
        response = requests.post(url, data=payload, headers=headers, timeout=10)
        result = response.json()

        if result.get("return") is True:
            print(f"✅ OTP SMS sent to {phone}")
            return True
        else:
            print(f"❌ Failed to send OTP SMS: {result}")
            return False
    except Exception as e:
        print(f"❌ Failed to send OTP SMS: {e}")
        return False


def send_lead_notification_email(
    to_email: str,
    owner_name: str,
    lead_name: str,
    lead_contact: str,
    campaign_name: str,
    platform: str = "",
):
    """
    Resend API se lead notification email bhejta hai owner ko.
    """
    try:
        params = {
            "from": "AdNexus <noreply@adnexus.co.in>",
            "to": [to_email],
            "subject": f"🔔 Naya Lead: {campaign_name}",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #1A73E8;">🎯 Naya Lead Aaya Hai!</h2>
                    <p>Hi {owner_name or 'there'},</p>
                    <p>Aapki campaign <strong>{campaign_name}</strong>{f' ({platform})' if platform else ''} se ek naya lead generate hua hai:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #eee;"><strong>Name</strong></td>
                            <td style="padding: 8px; border: 1px solid #eee;">{lead_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #eee;"><strong>Contact</strong></td>
                            <td style="padding: 8px; border: 1px solid #eee;">{lead_contact}</td>
                        </tr>
                    </table>
                    <a href="https://adnexus.co.in/dashboard/leads" style="background: #1A73E8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Dashboard Pe Dekho</a>
                    <p style="color: #888; font-size: 12px; margin-top: 24px;">AdNexus — Ad Campaign Management</p>
                </div>
            """
        }
        email = resend.Emails.send(params)
        print(f"✅ Lead notification email sent to {to_email} | Resend ID: {email.get('id')}")
        return True
    except Exception as e:
        print(f"❌ Failed to send lead notification email: {e}")
        return False