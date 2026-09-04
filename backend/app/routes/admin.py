# ════════════════════════════════════════════════════
# app/routes/admin.py
#
# All routes here are protected by get_current_admin.
# Only the account whose email matches ADMIN_EMAIL (in .env)
# can call any of these — every other user gets 403,
# no matter what the frontend shows or hides.
#
# CHANGES IN THIS VERSION (referral payment tracking):
#   - get_all_users(): now also returns is_paid_associate
#   - get_user_referrals(): now also returns payment_received,
#     reward_granted, commission_amount
#   - NEW: PATCH /users/{user_id}/mark-paid-associate
#   - NEW: PATCH /referrals/{referral_id}/mark-payment-received
#   - NEW: PATCH /referrals/{referral_id}/grant-reward
# ════════════════════════════════════════════════════

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.models import (
    User, Campaign, AdContent, Lead, FormSubmission, ClickTracking, Platform,
    Referral, Earning,  # ← Earning added
)
from app.core.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

# Flat 20% commission on the ₹10,000 associate fee.
# Agar future mein associate fee variable ho sakta hai, is constant ko
# calculation ke waqt actual referee payment ka 20% karna better hoga.
REFERRAL_COMMISSION_AMOUNT = 2000


# ════════════════════════════════════════════════════
# GET /api/admin/overview
# Quick top-level numbers for a dashboard header
# ════════════════════════════════════════════════════
@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_campaigns = db.query(func.count(Campaign.id)).scalar()
    total_leads = db.query(func.count(Lead.id)).scalar()
    total_budget_spent = db.query(func.coalesce(func.sum(Campaign.budget_spent), 0)).scalar()
    active_campaigns = db.query(func.count(Campaign.id)).filter(Campaign.status == "active").scalar()

    return {
        "total_users": total_users,
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "total_leads": total_leads,
        "total_budget_spent": total_budget_spent,
    }


# ════════════════════════════════════════════════════
# GET /api/admin/users
# List every user with a quick summary of their activity.
# referral_count = kitne logon ko is user ne refer kiya
# (Referral.referrer_id = is user ki id)
# ════════════════════════════════════════════════════
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    users = db.query(User).order_by(User.created_at.desc()).all()

    result = []
    for u in users:
        campaign_count = db.query(func.count(Campaign.id)).filter(Campaign.user_id == u.id).scalar()
        total_spent = db.query(func.coalesce(func.sum(Campaign.budget_spent), 0)).filter(
            Campaign.user_id == u.id
        ).scalar()
        referral_count = db.query(func.count(Referral.id)).filter(
            Referral.referrer_id == u.id
        ).scalar()

        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "auth_provider": u.auth_provider,
            "is_verified": u.is_verified,
            "is_paid_associate": u.is_paid_associate,   # ← NEW
            "created_at": u.created_at,
            "campaign_count": campaign_count,
            "total_budget_spent": total_spent,
            "referral_count": referral_count,
        })

    return {"users": result}


# ════════════════════════════════════════════════════
# GET /api/admin/users/{user_id}
# Full detail for one user — their campaigns, ad content,
# leads, everything
# ════════════════════════════════════════════════════
@router.get("/users/{user_id}")
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    campaigns = db.query(Campaign).filter(Campaign.user_id == user_id).all()

    campaigns_data = []
    for c in campaigns:
        ad_contents = db.query(AdContent).filter(AdContent.campaign_id == c.id).all()
        leads_count = db.query(func.count(Lead.id)).filter(Lead.campaign_id == c.id).scalar()
        submissions_count = db.query(func.count(FormSubmission.id)).filter(
            FormSubmission.campaign_id == c.id
        ).scalar()

        campaigns_data.append({
            "id": c.id,
            "name": c.name,
            "goal": c.goal,
            "industry": c.industry,
            "sub_category": c.sub_category,
            "budget": c.budget,
            "total_budget": c.total_budget,
            "budget_spent": c.budget_spent,
            "status": c.status,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "created_at": c.created_at,
            "leads_count": leads_count,
            "form_submissions_count": submissions_count,
            "ad_contents": [
                {
                    "id": ac.id,
                    "platform_id": ac.platform_id,
                    "headline": ac.headline,
                    "description": ac.description,
                    "image_url": ac.image_url,
                    "cta_button": ac.cta_button,
                    "creative_score": ac.creative_score,
                    "lead_form_url": ac.lead_form_url,
                }
                for ac in ad_contents
            ],
        })

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "auth_provider": user.auth_provider,
            "is_verified": user.is_verified,
            "is_paid_associate": user.is_paid_associate,   # ← NEW
            "created_at": user.created_at,
        },
        "campaigns": campaigns_data,
    }


# ════════════════════════════════════════════════════
# PATCH /api/admin/users/{user_id}/mark-paid-associate
# NEW — Admin yahan tick karta hai jab A ne apna ₹10,000
# associate-fee manually pay kar diya ho (proof verify karke).
#
# Important: jab A khud verify hota hai, uske pehle se pade
# "on_hold" referrals (jahan B ka payment aa chuka tha lekin A
# khud abhi tak verified nahi tha) automatically release ho
# jaate hain — commission calculate hoke Earning table mein add.
# ════════════════════════════════════════════════════
@router.patch("/users/{user_id}/mark-paid-associate")
def mark_paid_associate(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_paid_associate:
        return {"status": "already_paid_associate", "released_referrals": 0}

    user.is_paid_associate = True
    user.paid_associate_verified_at = func.now()
    db.commit()

    # A ke referrals dhoondo jahan B ka payment already verified tha,
    # lekin A khud verified na hone ki wajah se "on_hold" pade the.
    on_hold_referrals = db.query(Referral).filter(
        Referral.referrer_id == user_id,
        Referral.payment_received == True,
        Referral.status != "completed",
    ).all()

    for r in on_hold_referrals:
        r.commission_amount = REFERRAL_COMMISSION_AMOUNT
        r.status = "completed"
        db.add(Earning(user_id=user_id, amount=r.commission_amount, referral_id=r.id))

    db.commit()

    return {"status": "ok", "released_referrals": len(on_hold_referrals)}


# ════════════════════════════════════════════════════
# GET /api/admin/users/{user_id}/referrals
# Kisi ek user ne kisko-kisko refer kiya — naam, joined date,
# referral status, payment/reward status, aur campaigns count.
# Users table mein referral_count pe click karke ye khulega.
# ════════════════════════════════════════════════════
@router.get("/users/{user_id}/referrals")
def get_user_referrals(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    referrals = db.query(Referral).filter(
        Referral.referrer_id == user_id
    ).order_by(Referral.created_at.desc()).all()

    result = []
    for r in referrals:
        referee = db.query(User).filter(User.id == r.referee_id).first()
        campaigns_count = db.query(func.count(Campaign.id)).filter(
            Campaign.user_id == r.referee_id
        ).scalar()

        result.append({
            "id": r.id,
            "name": referee.name if referee else "—",
            "email": referee.email if referee else None,
            "joined_at": referee.created_at.isoformat() if referee and referee.created_at else None,
            "status": r.status,
            "payment_received": r.payment_received,        # ← NEW
            "reward_granted": r.reward_granted,             # ← NEW
            "commission_amount": float(r.commission_amount) if r.commission_amount else 0,  # ← NEW
            "campaigns_count": campaigns_count,
        })

    return {
        "referrer_id": user.id,      # ← NEW — frontend modal-refresh ke liye chahiye
        "referrer_name": user.name,
        "referrals": result,
    }


# ════════════════════════════════════════════════════
# PATCH /api/admin/referrals/{referral_id}/mark-payment-received
# NEW — Admin yahan tick karta hai jab B (referee) ne apna
# ₹10,000 associate-fee manually pay kar diya ho (proof verify karke).
#
# Commission tabhi turant "Total Earnings" mein reflect hota hai
# jab DONO conditions poori hon:
#   1) Referral row khud exist karta hai (guaranteed — signup
#      A ke referral link/code se hi hua tha)
#   2) A (referrer) khud is_paid_associate == True ho
#
# Agar A abhi verified nahi hai, referral "on_hold" reh jata hai
# aur jaise hi A verify hota hai (mark-paid-associate), yeh
# apne aap release ho jayega (upar wale endpoint mein logic hai).
# ════════════════════════════════════════════════════
@router.patch("/referrals/{referral_id}/mark-payment-received")
def mark_payment_received(
    referral_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    if referral.payment_received:
        return {"status": "already_marked", "referral_status": referral.status}

    referral.payment_received = True
    referral.payment_verified_at = func.now()

    referrer = db.query(User).filter(User.id == referral.referrer_id).first()

    if not referrer or not referrer.is_paid_associate:
        # Condition 2 fail — referrer khud abhi verified associate nahi hai.
        # Commission calculate NAHI hoga abhi, referral "on_hold" rahega.
        referral.status = "on_hold"
        db.commit()
        return {"status": "on_hold", "reason": "Referrer not yet a verified associate"}

    # Dono conditions pass — commission ab calculate/credit ho sakta hai
    referral.commission_amount = REFERRAL_COMMISSION_AMOUNT
    referral.status = "completed"
    db.add(Earning(user_id=referral.referrer_id, amount=referral.commission_amount, referral_id=referral.id))
    db.commit()

    return {"status": "completed", "commission_amount": referral.commission_amount}


# ════════════════════════════════════════════════════
# PATCH /api/admin/referrals/{referral_id}/grant-reward
# NEW — Admin yahan tick karta hai jab A ko actual mein manually
# (UPI/bank transfer) ₹2000 commission pay kar diya ho.
# Yeh sirf tab allowed hai jab payment_received already true ho
# (yani commission already "earned"/calculated ho chuka ho).
# ════════════════════════════════════════════════════
@router.patch("/referrals/{referral_id}/grant-reward")
def grant_reward(
    referral_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    if not referral.payment_received or referral.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Commission not yet finalized for this referral — mark payment received first",
        )

    if referral.reward_granted:
        return {"status": "already_granted"}

    referral.reward_granted = True
    referral.reward_granted_at = func.now()
    db.commit()

    return {"status": "reward_granted"}


# ════════════════════════════════════════════════════
# GET /api/admin/campaigns
# Every campaign across every user in one flat list
# (useful for a global "all campaigns" table)
# ════════════════════════════════════════════════════
@router.get("/campaigns")
def get_all_campaigns(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).all()

    result = []
    for c in campaigns:
        owner = db.query(User).filter(User.id == c.user_id).first()
        result.append({
            "id": c.id,
            "name": c.name,
            "goal": c.goal,
            "industry": c.industry,
            "status": c.status,
            "budget": c.budget,
            "budget_spent": c.budget_spent,
            "created_at": c.created_at,
            "owner_name": owner.name if owner else None,
            "owner_email": owner.email if owner else None,
        })

    return {"campaigns": result}


# ════════════════════════════════════════════════════
# GET /api/admin/campaigns/{campaign_id}
# Full detail for one campaign — its own info, the leads
# (form submissions) it generated, and its ad creatives.
# Mirrors the shape of GET /users/{user_id}.
# ════════════════════════════════════════════════════
@router.get("/campaigns/{campaign_id}")
def get_campaign_detail(
    campaign_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    owner = db.query(User).filter(User.id == campaign.user_id).first()

    submissions = db.query(FormSubmission).filter(
        FormSubmission.campaign_id == campaign_id
    ).order_by(FormSubmission.created_at.desc()).all()

    ad_contents = db.query(AdContent).filter(AdContent.campaign_id == campaign_id).all()

    return {
        "campaign": {
            "id": campaign.id,
            "name": campaign.name,
            "goal": campaign.goal,
            "industry": campaign.industry,
            "sub_category": campaign.sub_category,
            "budget": campaign.budget,
            "total_budget": campaign.total_budget,
            "budget_spent": campaign.budget_spent,
            "status": campaign.status,
            "start_date": campaign.start_date,
            "end_date": campaign.end_date,
            "created_at": campaign.created_at,
            "owner_name": owner.name if owner else None,
            "owner_email": owner.email if owner else None,
        },
        "leads": [
            {
                "id": s.id,
                "full_name": s.full_name,
                "phone": s.phone,
                "email": s.email,
                "location": s.location,
                "platform": s.platform,
                "form_type": s.form_type,
                "quality_score": s.quality_score,
                "is_verified": s.is_verified,
                "created_at": s.created_at,
            }
            for s in submissions
        ],
        "ad_contents": [
            {
                "id": ac.id,
                "platform_id": ac.platform_id,
                "headline": ac.headline,
                "description": ac.description,
                "image_url": ac.image_url,
                "cta_button": ac.cta_button,
                "creative_score": ac.creative_score,
                "lead_form_url": ac.lead_form_url,
            }
            for ac in ad_contents
        ],
    }


# ════════════════════════════════════════════════════
# GET /api/admin/leads
# Every lead/form submission across every campaign
# ════════════════════════════════════════════════════
@router.get("/leads")
def get_all_leads(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    submissions = db.query(FormSubmission).order_by(FormSubmission.created_at.desc()).all()

    result = []
    for s in submissions:
        campaign = db.query(Campaign).filter(Campaign.id == s.campaign_id).first()
        result.append({
            "id": s.id,
            "full_name": s.full_name,
            "phone": s.phone,
            "email": s.email,
            "location": s.location,
            "platform": s.platform,
            "form_type": s.form_type,
            "quality_score": s.quality_score,
            "is_verified": s.is_verified,
            "created_at": s.created_at,
            "campaign_name": campaign.name if campaign else None,
        })

    return {"leads": result}
