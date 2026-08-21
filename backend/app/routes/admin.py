# ════════════════════════════════════════════════════
# app/routes/admin.py
#
# All routes here are protected by get_current_admin.
# Only the account whose email matches ADMIN_EMAIL (in .env)
# can call any of these — every other user gets 403,
# no matter what the frontend shows or hides.
# ════════════════════════════════════════════════════

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.models import (
    User, Campaign, AdContent, Lead, FormSubmission, ClickTracking, Platform, Referral
)
from app.core.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


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
            "created_at": user.created_at,
        },
        "campaigns": campaigns_data,
    }


# ════════════════════════════════════════════════════
# GET /api/admin/users/{user_id}/referrals
# Kisi ek user ne kisko-kisko refer kiya — naam, joined date,
# referral status, aur unke apne campaigns count.
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
            "campaigns_count": campaigns_count,
        })

    return {
        "referrer_name": user.name,
        "referrals": result,
    }


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