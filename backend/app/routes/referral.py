from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict, deque

from app.database import get_db
from app.models.models import User, Referral, Earning, Campaign
from app.routes.auth import get_current_user
from app.utils.referral import generate_unique_referral_code, get_referrer_by_code

router = APIRouter(prefix="/referral", tags=["Referral"])


# ════════════════════════════════════════════════════
# Referral Network Size + Title Calculation
# ════════════════════════════════════════════════════

TITLE_THRESHOLDS = [
    (3125, "RSM"),
    (625,  "Area Sales Manager"),
    (125,  "Sales Team Leader"),
    (25,   "Senior Sales Officer"),
    (5,    "Sales Coordinator"),
]


def _build_completed_referral_map(db: Session) -> dict:
    rows = db.query(Referral.referrer_id, Referral.referee_id).filter(
        Referral.status == "completed"
    ).all()

    tree = defaultdict(list)
    for referrer_id, referee_id in rows:
        tree[referrer_id].append(referee_id)
    return tree


def get_network_size(db: Session, user_id: int, tree=None) -> int:
    if tree is None:
        tree = _build_completed_referral_map(db)

    visited = set()
    queue = deque(tree.get(user_id, []))

    while queue:
        current = queue.popleft()
        if current in visited:
            continue
        visited.add(current)
        queue.extend(tree.get(current, []))

    return len(visited)


def get_title(network_size: int):
    for threshold, title in TITLE_THRESHOLDS:
        if network_size >= threshold:
            return title
    return None


# ════════════════════════════════════════════════════
# GET /referral/summary
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
        Referral.status.in_(["pending", "on_hold"]),
    ).count()

    total_earnings = db.query(func.coalesce(func.sum(Earning.amount), 0)).filter(
        Earning.user_id == current_user.id
    ).scalar()

    pending_rewards_amount = db.query(func.coalesce(func.sum(Referral.commission_amount), 0)).filter(
        Referral.referrer_id == current_user.id,
        Referral.status == "completed",
        Referral.reward_granted == False,
    ).scalar()

    network_size = get_network_size(db, current_user.id)
    title = get_title(network_size)

    return {
        "referral_code": current_user.referral_code,
        "totalReferrals": total_referrals,
        "pendingReferrals": pending_referrals,
        "pendingRewardsAmount": float(pending_rewards_amount or 0),
        "totalEarnings": float(total_earnings or 0),
        "networkSize": network_size,
        "title": title,
    }


# ════════════════════════════════════════════════════
# GET /referral/list
# ════════════════════════════════════════════════════
@router.get("/list")
def get_referral_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id
    ).order_by(Referral.created_at.desc()).all()

    tree = _build_completed_referral_map(db)

    result = []
    for r in referrals:
        referee = db.query(User).filter(User.id == r.referee_id).first()
        campaigns_count = db.query(Campaign).filter(
            Campaign.user_id == r.referee_id
        ).count()

        referee_network_size = get_network_size(db, r.referee_id, tree=tree)
        referee_title = get_title(referee_network_size)

        result.append({
            "id": r.id,
            "name": referee.name if referee else "—",
            "joined_at": referee.created_at.isoformat() if referee and referee.created_at else None,
            "status": r.status,
            "reward_amount": float(r.commission_amount or 0),
            "campaigns_count": campaigns_count,
            "network_size": referee_network_size,
            "title": referee_title,
        })

    return {"referrals": result}


# ════════════════════════════════════════════════════
# GET /referral/validate/{code}
# ════════════════════════════════════════════════════
@router.get("/validate/{code}")
def validate_referral_code(code: str, db: Session = Depends(get_db)):
    referrer = get_referrer_by_code(db, code)
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    return {"valid": True, "name": referrer.name}