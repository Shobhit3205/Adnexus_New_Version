# app/routes/referral.py
# ────────────────────────────────────────────────────────────
# Referral & Earn ke saare API endpoints
# NOTE: get_db aur get_current_user apne existing auth.py se
# import ho rahe hain — agar function names ya path alag hain
# to niche wale imports adjust kar dena.
# ────────────────────────────────────────────────────────────

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db                 # ← apne project ke hisaab se path check karo
from app.models.models import User, Referral, Earning, Campaign
from app.routes.auth import get_current_user     # ← apne project ke hisaab se path check karo
from app.utils.referral import generate_unique_referral_code, get_referrer_by_code

router = APIRouter(prefix="/referral", tags=["Referral"])


# ════════════════════════════════════════════════════
# GET /referral/summary
# Referral code, total referrals, pending, total earnings
# ════════════════════════════════════════════════════
@router.get("/summary")
def get_referral_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id
    ).count()

    pending_referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id,
        Referral.status == "pending",
    ).count()

    total_earnings = db.query(func.coalesce(func.sum(Earning.amount), 0)).filter(
        Earning.user_id == current_user.id
    ).scalar()

    return {
        "referral_code": current_user.referral_code,
        "totalReferrals": total_referrals,
        "pendingReferrals": pending_referrals,
        "totalEarnings": float(total_earnings or 0),
    }


# ════════════════════════════════════════════════════
# GET /referral/list
# Kisko-kisko refer kiya, unka status, aur unke campaigns count
# ════════════════════════════════════════════════════
@router.get("/list")
def get_referral_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id
    ).order_by(Referral.created_at.desc()).all()

    result = []
    for r in referrals:
        referee = db.query(User).filter(User.id == r.referee_id).first()
        campaigns_count = db.query(Campaign).filter(
            Campaign.user_id == r.referee_id
        ).count()

        result.append({
            "id": r.id,
            "name": referee.name if referee else "—",
            "joined_at": referee.created_at.isoformat() if referee and referee.created_at else None,
            "status": r.status,
            "reward_amount": float(r.reward_amount or 0),
            "campaigns_count": campaigns_count,
        })

    return {"referrals": result}

# routes/referral.py mein add karo — GET /validate/{code}
# Ye public hai (login required nahi), signup page se call hoga

@router.get("/validate/{code}")
def validate_referral_code(code: str, db: Session = Depends(get_db)):
    referrer = get_referrer_by_code(db, code)
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    return {"valid": True, "name": referrer.name}