# ============================================================
# backend/app/routes/oauth.py
# Google OAuth — per-user connection flow
# pip install google-auth-oauthlib google-auth
# ============================================================
import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request as GoogleRequest
import os
from datetime import datetime

from app.database import get_db
from app.models.models import PlatformConnection, User
from app.core.security import get_current_user

_pkce_store: dict[str, str] = {}

router = APIRouter(tags=["oauth"])

# ─── Config (static, .env se) ─────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_ADS_CLIENT_ID")      # google-ads.yaml wala hi client_id
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_ADS_CLIENT_SECRET")  # google-ads.yaml wala hi client_secret
REDIRECT_URI         = "http://localhost:8000/api/oauth/google/callback"

SCOPES = ["https://www.googleapis.com/auth/adwords"]

# ─── Meta config ─────────────────────────────────────────────
META_APP_ID       = os.getenv("META_APP_ID")
META_APP_SECRET   = os.getenv("META_APP_SECRET")
META_REDIRECT_URI = "https://smasher-throwing-shimmy.ngrok-free.dev/api/oauth/meta/callback"
META_SCOPES       = "ads_management,ads_read,business_management"

def get_google_flow():
    client_config = {
        "web": {
            "client_id":     GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri":      "https://accounts.google.com/o/oauth2/auth",
            "token_uri":     "https://oauth2.googleapis.com/token",
            "redirect_uris":  [REDIRECT_URI],
        }
    }
    flow = Flow.from_client_config(client_config, scopes=SCOPES, redirect_uri=REDIRECT_URI)
    return flow


# ════════════════════════════════════════════════════
# 1. CONNECT — user ko Google consent screen pe bhejo
# ════════════════════════════════════════════════════
@router.get("/google/connect")
def google_connect(current_user: User = Depends(get_current_user)):
    flow = get_google_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        state=str(current_user.id),
    )
    # PKCE verifier ko state ke against store kar do
    _pkce_store[str(current_user.id)] = flow.code_verifier
    return {"auth_url": auth_url}


# ════════════════════════════════════════════════════
# 2. CALLBACK — Google se code aayega, token exchange karo
# ════════════════════════════════════════════════════

@router.get("/google/callback")
def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    user_id = int(state)

    flow = get_google_flow()
    flow.code_verifier = _pkce_store.pop(state, None)  # saved verifier wapas set karo

    try:
        flow.fetch_token(code=code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {e}")
    

    credentials = flow.credentials

    # ── Existing connection check karo (upsert) ──
    connection = db.query(PlatformConnection).filter(
        PlatformConnection.user_id == user_id,
        PlatformConnection.platform == "google",
    ).first()

    if not connection:
        connection = PlatformConnection(user_id=user_id, platform="google")
        db.add(connection)

    connection.refresh_token = credentials.refresh_token
    connection.access_token  = credentials.token
    connection.status        = "connected"
    connection.updated_at    = datetime.utcnow()

    db.commit()

    # ── Frontend ko wapas redirect karo (popup band karne ka signal) ──
    return RedirectResponse(url="http://localhost:3000/oauth-success?platform=google")

# ════════════════════════════════════════════════════
# 3. GET CONNECTIONS — user ke connected platforms ki list
# ════════════════════════════════════════════════════
@router.get("/connections")
def get_connections(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    connections = db.query(PlatformConnection).filter(
        PlatformConnection.user_id == current_user.id,
        PlatformConnection.status == "connected",
    ).all()

    return {
        c.platform: {
            "connected":    True,
            "account_id":   c.account_id,
            "account_name": c.account_name,
        }
        for c in connections
    }

# ════════════════════════════════════════════════════
# 4. META CONNECT — user ko Facebook consent screen pe bhejo
# ════════════════════════════════════════════════════
@router.get("/meta/connect")
def meta_connect(current_user: User = Depends(get_current_user)):
    auth_url = (
        "https://www.facebook.com/v19.0/dialog/oauth"
        f"?client_id={META_APP_ID}"
        f"&redirect_uri={META_REDIRECT_URI}"
        f"&state={current_user.id}"
        f"&scope={META_SCOPES}"
        "&response_type=code"
    )
    return {"auth_url": auth_url}


# ════════════════════════════════════════════════════
# 5. META CALLBACK — Facebook se code aayega, token exchange karo
# ════════════════════════════════════════════════════
@router.get("/meta/callback")
def meta_callback(code: str, state: str, db: Session = Depends(get_db)):
    user_id = int(state)

    # ── Step 1: code ko short-lived access_token se exchange karo ──
    token_res = requests.get(
        "https://graph.facebook.com/v19.0/oauth/access_token",
        params={
            "client_id":     META_APP_ID,
            "client_secret": META_APP_SECRET,
            "redirect_uri":  META_REDIRECT_URI,
            "code":          code,
        },
    )
    token_data = token_res.json()
    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {token_data}")

    short_lived_token = token_data["access_token"]

    # ── Step 2: short-lived ko long-lived token mein convert karo (~60 din valid) ──
    long_res = requests.get(
        "https://graph.facebook.com/v19.0/oauth/access_token",
        params={
            "grant_type":        "fb_exchange_token",
            "client_id":         META_APP_ID,
            "client_secret":     META_APP_SECRET,
            "fb_exchange_token": short_lived_token,
        },
    )
    long_data = long_res.json()
    final_token = long_data.get("access_token", short_lived_token)

    # ── Existing connection check karo (upsert) ──
    connection = db.query(PlatformConnection).filter(
        PlatformConnection.user_id == user_id,
        PlatformConnection.platform == "meta",
    ).first()

    if not connection:
        connection = PlatformConnection(user_id=user_id, platform="meta")
        db.add(connection)

    connection.access_token = final_token
    connection.status       = "connected"
    connection.updated_at   = datetime.utcnow()

    db.commit()

    return RedirectResponse(url="http://localhost:3000/oauth-success?platform=meta")