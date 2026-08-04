"""
AdNexus Support Chatbot — FastAPI router
-----------------------------------------
  1. Rule-based intent matching for common queries -> instant auto-reply.
  2. Anything that doesn't match a rule -> Google Gemini API (free tier,
     no credit card needed) generates a reply, grounded with an
     AdNexus-specific system prompt.
  3. If Gemini itself is unsure, or the API call fails, the query is saved
     to DB as pending and your admin team can reply manually (see the
     admin_router endpoints below / AdminChatPanel.jsx).

Setup:
    pip install google-generativeai
    Get a free API key (no card required): https://aistudio.google.com/apikey
    Add to .env:  GEMINI_API_KEY=AIza...

Drop this file in your FastAPI app (e.g. app/routes/chat_router.py) and include it:
    from app.routes import chat_router
    app.include_router(chat_router.router, prefix="/api")
    app.include_router(chat_router.admin_router, prefix="/api/admin")
"""

import os
import re
import uuid
from datetime import datetime
from typing import Optional, List, Literal

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Session

from app.models.models import Base   # same Base your other models use
from app.database import get_db      # your existing DB session dependency
# ^ if get_db lives elsewhere (e.g. app.database.database), adjust this import
#   to match wherever campaigns.py / leads.py import it from.


# ---------------------------------------------------------------------------
# LLM toggle — on by default now, using Gemini's free tier
# ---------------------------------------------------------------------------
LLM_ENABLED = True  # set False any time to fall back to pure admin-queue mode


# ---------------------------------------------------------------------------
# DB Models
# ---------------------------------------------------------------------------
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)  # null = anonymous/guest user
    status = Column(String, default="open")  # "open" | "pending_human" | "resolved"
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" | "assistant" | "admin"
    content = Column(Text, nullable=False)
    source = Column(String, nullable=True)  # "rule" | "llm" | "pending" | "admin"
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    source: Literal["rule", "llm", "pending"]
    quick_replies: List[str] = []
    escalate: bool = False


class AdminReplyRequest(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# Rule-based intent matching
# ---------------------------------------------------------------------------
# Each intent: keywords (regex, case-insensitive) -> canned response + quick replies.
# Keep this list growing based on which queries end up "pending" most often
# (see GET /api/admin/chat/sessions?status=pending_human).
INTENTS = [
    {
        "name": "create_campaign",
        "patterns": [r"create.*campaign", r"campaign.*(kaise|kese|how)", r"naya campaign"],
        "response": (
            "Naya campaign banane ke liye Dashboard se 'Create Campaign' pe click karo. "
            "Wizard mein Step 2 (Platforms) mein apna Google/Meta ads account connect karna hoga, "
            "phir targeting aur budget set karke launch kar sakte ho."
        ),
        "quick_replies": ["Platform kaise connect kare?", "Budget kaise set kare?"],
    },
    {
        "name": "connect_platform",
        "patterns": [r"connect.*(account|platform|meta|google)", r"oauth", r"platform.*link"],
        "response": (
            "Platform connect karne ke liye CreateCampaign wizard ke Step 2 mein jao — "
            "har platform card pe 'Connect Account' button milega. Click karte hi OAuth flow "
            "khulega jaha apne Google/Meta account se login karke permission dena hoga."
        ),
        "quick_replies": ["Google Ads connect nahi ho raha", "Meta Ads connect nahi ho raha"],
    },
    {
        "name": "lead_status",
        "patterns": [r"lead.*status", r"lead.*kaise dekh", r"lead.*track"],
        "response": (
            "Leads section mein har lead ka status timeline dikhta hai — New, Contacted, "
            "Follow-up, Converted. Status pe click karke update kar sakte ho, aur follow-up "
            "date bhi set kar sakte ho."
        ),
        "quick_replies": ["WhatsApp se lead contact kaise kare?"],
    },
    {
        "name": "whatsapp_lead",
        "patterns": [r"whatsapp"],
        "response": (
            "Lead ke detail modal mein WhatsApp icon milega — click karte hi seedha us lead "
            "ke number pe WhatsApp chat khul jayegi."
        ),
        "quick_replies": [],
    },
]


def match_intent(message: str):
    msg = message.lower().strip()
    for intent in INTENTS:
        for pattern in intent["patterns"]:
            if re.search(pattern, msg):
                return intent
    return None


# ---------------------------------------------------------------------------
# LLM fallback — Google Gemini (free tier, no billing required)
# ---------------------------------------------------------------------------
ADNEXUS_SYSTEM_PROMPT = """You are the AdNexus support assistant. AdNexus is a B2B SaaS \
ad campaign management platform for SMBs and digital marketing agencies in India. Features \
include: campaign creation wizard, lead management with status timelines, AI-generated ad \
content, Google Ads and Meta/Facebook Ads integration (via OAuth, each user connects their \
own ad account), WhatsApp integration for lead contact, and an admin dashboard.

Rules:
- Only answer questions about using the AdNexus platform.
- If you don't know a specific detail (exact pricing, an undocumented feature, account-specific \
issues), say you're not sure and offer to connect them to the support team — do NOT guess or \
invent details.
- Keep answers short (2-4 sentences), practical, and in the same language/style the user wrote in \
(Hindi/Hinglish or English).
- Never share internal implementation details (database structure, API keys, backend code).
"""

_gemini_model = None


def _get_gemini_model():
    global _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        _gemini_model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            system_instruction=ADNEXUS_SYSTEM_PROMPT,
        )
    return _gemini_model


def call_llm_fallback(message: str, history: List[dict]) -> tuple[str, bool]:
    """Returns (reply_text, should_escalate_to_human)."""
    model = _get_gemini_model()

    # Gemini's chat history format: role "model" instead of "assistant"
    gemini_history = [
        {"role": "model" if h["role"] == "assistant" else "user", "parts": [h["content"]]}
        for h in history
    ]
    chat = model.start_chat(history=gemini_history)
    response = chat.send_message(message)
    reply = (response.text or "").strip()

    uncertainty_markers = ["not sure", "connect you to", "support team", "don't have that"]
    should_escalate = any(marker in reply.lower() for marker in uncertainty_markers)
    return reply, should_escalate


# ---------------------------------------------------------------------------
# User-facing router
# ---------------------------------------------------------------------------
router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    # 1. Get or create session
    session_id = req.session_id or None
    clean_user_id = req.user_id or None  # treat "" as no user (avoids FK/type errors)
    session = None
    if session_id:
        session = db.query(ChatSession).filter_by(id=session_id).first()
    if not session:
        session = ChatSession(user_id=clean_user_id, status="open")
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id

    # 2. Save incoming user message
    db.add(ChatMessage(session_id=session_id, role="user", content=req.message))
    db.commit()

    # 3. Try rule-based match first
    intent = match_intent(req.message)
    if intent:
        reply_text = intent["response"]
        source = "rule"
        quick_replies = intent.get("quick_replies", [])
        escalate = False

    elif LLM_ENABLED:
        history_rows = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id, ChatMessage.role.in_(["user", "assistant"]))
            .order_by(ChatMessage.created_at.desc())
            .limit(10)
            .all()
        )
        history = [{"role": r.role, "content": r.content} for r in reversed(history_rows[1:])]
        try:
            reply_text, escalate = call_llm_fallback(req.message, history)
            source = "llm"
        except Exception:
            reply_text = (
                "Aapka sawaal hamari support team ko bhej diya gaya hai, "
                "wo jald hi reply karenge."
            )
            source = "pending"
            escalate = True
            session.status = "pending_human"
        quick_replies = []

    else:
        # Phase 1: no LLM configured — hand off to the admin queue.
        reply_text = (
            "Aapka sawaal hamari support team ko bhej diya gaya hai, "
            "wo jald hi is chat mein reply karenge."
        )
        source = "pending"
        quick_replies = []
        escalate = True
        session.status = "pending_human"

    # 4. Save assistant reply + persist session status
    db.add(ChatMessage(session_id=session_id, role="assistant", content=reply_text, source=source))
    db.add(session)
    db.commit()

    return ChatResponse(
        session_id=session_id,
        reply=reply_text,
        source=source,
        quick_replies=quick_replies,
        escalate=escalate,
    )


@router.get("/chat/{session_id}/history")
def get_history(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    messages = (
        db.query(ChatMessage)
        .filter_by(session_id=session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [
        {"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()}
        for m in messages
    ]


# ---------------------------------------------------------------------------
# Admin router — mount separately so you can put it behind your existing
# admin-auth dependency. In main.py:
#   from app.routes import chat_router
#   app.include_router(chat_router.router, prefix="/api")
#   app.include_router(chat_router.admin_router, prefix="/api/admin")
# ---------------------------------------------------------------------------
admin_router = APIRouter(tags=["chat-admin"])


@admin_router.get("/chat/sessions")
def list_sessions(status: Optional[str] = None, db: Session = Depends(get_db)):
    """
    List chat sessions, optionally filtered by status
    (open | pending_human | resolved). Use ?status=pending_human
    to see what the support team needs to answer right now.
    """
    query = db.query(ChatSession)
    if status:
        query = query.filter_by(status=status)
    sessions = query.order_by(ChatSession.created_at.desc()).all()

    result = []
    for s in sessions:
        last_msg = (
            db.query(ChatMessage)
            .filter_by(session_id=s.id)
            .order_by(ChatMessage.created_at.desc())
            .first()
        )
        result.append({
            "session_id": s.id,
            "user_id": s.user_id,
            "status": s.status,
            "created_at": s.created_at.isoformat(),
            "last_message": last_msg.content if last_msg else None,
        })
    return result


@admin_router.get("/chat/sessions/{session_id}/messages")
def get_session_messages(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    messages = (
        db.query(ChatMessage)
        .filter_by(session_id=session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return {
        "session_id": session_id,
        "status": session.status,
        "messages": [
            {"role": m.role, "content": m.content, "source": m.source, "created_at": m.created_at.isoformat()}
            for m in messages
        ],
    }


@admin_router.post("/chat/sessions/{session_id}/reply")
def admin_reply(session_id: str, req: AdminReplyRequest, db: Session = Depends(get_db)):
    """Support team posts a reply — this shows up as an 'admin' message in the
    user's chat next time they fetch history (or via polling in ChatWidget.jsx)."""
    session = db.query(ChatSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    db.add(ChatMessage(session_id=session_id, role="admin", content=req.message, source="admin"))
    session.status = "resolved"
    db.add(session)
    db.commit()

    return {"ok": True, "session_id": session_id, "status": "resolved"}