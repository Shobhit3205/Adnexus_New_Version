from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Campaign, Platform, PlatformStat, AdContent, TargetingRule, User
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import Optional, List
import os

# Google + Meta imports
try:
    from app.services.google_ads_service import submit_campaign_to_google, get_campaign_status as get_google_status
    GOOGLE_AVAILABLE = True
except Exception:
    GOOGLE_AVAILABLE = False

try:
    from app.services.meta_ads_service import submit_campaign_to_meta, get_meta_campaign_status
    META_AVAILABLE = True
except Exception:
    META_AVAILABLE = False

router = APIRouter(tags=["campaigns"])


# ════════════════════════════════════════════════════
# PYDANTIC MODELS
# ════════════════════════════════════════════════════

class TargetingData(BaseModel):
    locations: List[str] = ["Delhi", "Mumbai"]
    radius_km: int       = 25
    age_min:   int       = 25
    age_max:   int       = 55
    genders:   List[int] = [1, 2]

class AdContentData(BaseModel):
    headlines:    List[str]     = []
    descriptions: List[str]     = []
    final_url:    Optional[str] = ""
    display_url:  Optional[str] = ""
    primary_text: Optional[str] = ""
    headline:     Optional[str] = ""
    description:  Optional[str] = ""
    cta:          Optional[str] = "LEARN_MORE"
    link_url:     Optional[str] = ""
    image_url:    Optional[str] = ""

class CampaignCreateRequest(BaseModel):
    name:           str
    goal:           str             = "LEAD_GEN"
    industry:       Optional[str]   = ""
    sub_category:   Optional[str]   = ""
    business_niche: str             = ""
    budget:         float           = 10000      # daily budget ₹/day
    budget_amount:  Optional[float] = None       # total budget (daily × days) — sent from frontend
    start_date:     str             = "2026-06-01"
    end_date:       str             = "2026-06-30"
    status:         str             = "active"
    platforms:      List[str]       = []
    keywords:       List[str]       = []
    targeting:      Optional[TargetingData]  = None
    ad_content:     Optional[AdContentData] = None

class CampaignUpdateRequest(BaseModel):
    name:           Optional[str]   = None
    goal:           Optional[str]   = None
    industry:       Optional[str]   = None
    sub_category:   Optional[str]   = None
    business_niche: Optional[str]   = None
    budget:         Optional[float] = None
    start_date:     Optional[str]   = None
    end_date:       Optional[str]   = None
    status:         Optional[str]   = None


# ════════════════════════════════════════════════════
# HELPER: Calculate duration days from dates
# ════════════════════════════════════════════════════
def get_duration_days(start_date: str, end_date: str) -> int:
    try:
        from datetime import datetime
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end   = datetime.strptime(end_date,   "%Y-%m-%d")
        delta = (end - start).days
        return max(delta, 1)  # minimum 1 day
    except Exception:
        return 30  # default fallback


# ════════════════════════════════════════════════════
# HELPER: Fetch a campaign but only if it belongs to current_user.
# Returns 404 (not 403) if it doesn't exist OR belongs to someone
# else — this avoids leaking whether an ID exists at all.
# ════════════════════════════════════════════════════
def get_owned_campaign_or_404(campaign_id: int, current_user: User, db: Session) -> Campaign:
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


# ════════════════════════════════════════════════════
# 1. GET ALL CAMPAIGNS (only the logged-in user's own)
# ════════════════════════════════════════════════════
@router.get("/")
def get_campaigns(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        campaigns = db.query(Campaign).filter(Campaign.user_id == current_user.id).all()
        result = []
        for c in campaigns:
            result.append({
                "id":             c.id,
                "name":           c.name,
                "goal":           c.goal,
                "industry":       c.industry       or "",
                "sub_category":   c.sub_category   or "",
                "business_niche": c.business_niche or "",
                "budget":         c.budget,           # daily budget
                "total_budget":   c.total_budget or 0, # total budget
                "start_date":     str(c.start_date) if c.start_date else "",
                "end_date":       str(c.end_date)   if c.end_date   else "",
                "status":         c.status,
                "created_at":     str(c.created_at) if c.created_at else "",
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ════════════════════════════════════════════════════
# 2. GET SINGLE CAMPAIGN (only if owned by current_user)
# ════════════════════════════════════════════════════
@router.get("/{campaign_id}")
def get_campaign(campaign_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    campaign = get_owned_campaign_or_404(campaign_id, current_user, db)
    return {
        "id":             campaign.id,
        "name":           campaign.name,
        "goal":           campaign.goal,
        "industry":       campaign.industry       or "",
        "sub_category":   campaign.sub_category   or "",
        "business_niche": campaign.business_niche or "",
        "budget":         campaign.budget,            # daily budget
        "total_budget":   campaign.total_budget or 0, # total budget
        "start_date":     str(campaign.start_date) if campaign.start_date else "",
        "end_date":       str(campaign.end_date)   if campaign.end_date   else "",
        "status":         campaign.status,
    }


# ════════════════════════════════════════════════════
# 3. POST CREATE CAMPAIGN
# FIX: budget and total_budget stored separately
# daily budget = budget field
# total budget = daily × duration days
# Also: campaign is now tagged with the creating user's id
# ════════════════════════════════════════════════════
@router.post("/")
def create_campaign(req: CampaignCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    # ── FIX: Separate daily budget from total budget ──
    # Frontend sends budget_amount = daily × days (inflated)
    # We store budget = daily, total_budget = daily × days
    daily_budget = req.budget or 10000
    duration     = get_duration_days(req.start_date, req.end_date)
    total_budget = req.budget_amount or (daily_budget * duration)

    # ── Save campaign to DB, tagged to the logged-in user ──
    db_campaign = Campaign(
        user_id        = current_user.id,
        name           = req.name,
        goal           = req.goal,
        industry       = req.industry       or "",
        sub_category   = req.sub_category   or "",
        business_niche = req.business_niche or "",
        budget         = daily_budget,   # FIX: always store daily budget here
        total_budget   = total_budget,   # FIX: store total budget separately
        start_date     = req.start_date,
        end_date       = req.end_date,
        status         = req.status or "active",
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    campaign_id = db_campaign.id

    # ── Save targeting rule if provided ──
    if req.targeting:
        t = req.targeting
        targeting_rule = TargetingRule(
            campaign_id   = campaign_id,
            audience_type = "custom",
            locations     = ",".join(t.locations),
            industries    = req.industry or "",
            age_min       = t.age_min,
            age_max       = t.age_max,
            radius_km     = t.radius_km,
        )
        db.add(targeting_rule)
        db.commit()

    results = {
        "campaign_id": campaign_id,
        "id":          campaign_id,
        "campaign":    {"id": campaign_id, "name": req.name},
        "name":        req.name,
        "budget":      daily_budget,
        "total_budget":total_budget,
        "platforms":   {},
    }

    # ── Platform data ──
    platform_keys = req.platforms or []
    campaign_data = {
        "name":          req.name,
        "goal":          req.goal,
        "budget_amount": daily_budget,
        "start_date":    req.start_date,
        "end_date":      req.end_date,
        "keywords":      req.keywords or [req.business_niche] or ["business loan"],
        "targeting":     req.targeting.dict() if req.targeting else {
            "locations": ["Delhi", "Mumbai"],
            "age_min":   25,
            "age_max":   55,
            "radius_km": 25,
        }
    }
    ad_content_data = req.ad_content.dict() if req.ad_content else {}

    # ── Google Ads ──
    if "google" in platform_keys:
        results["platforms"]["google"] = {
            "success":  False,
            "error":    "Google Ads Standard access pending",
            "platform": "google"
        }

    # ── Meta Ads ──
    if "meta" in platform_keys and META_AVAILABLE:
        try:
            meta_result = submit_campaign_to_meta(campaign_data, ad_content_data)
        except Exception as e:
            meta_result = {"success": False, "error": str(e), "platform": "meta"}
        results["platforms"]["meta"] = meta_result

    return results


# ════════════════════════════════════════════════════
# 4. PUT UPDATE CAMPAIGN (only if owned by current_user)
# ════════════════════════════════════════════════════
@router.put("/{campaign_id}")
def update_campaign(campaign_id: int, req: CampaignUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    campaign = get_owned_campaign_or_404(campaign_id, current_user, db)

    if req.name           is not None: campaign.name           = req.name
    if req.goal           is not None: campaign.goal           = req.goal
    if req.industry       is not None: campaign.industry       = req.industry
    if req.sub_category   is not None: campaign.sub_category   = req.sub_category
    if req.business_niche is not None: campaign.business_niche = req.business_niche
    if req.status         is not None: campaign.status         = req.status
    if req.start_date     is not None: campaign.start_date     = req.start_date
    if req.end_date       is not None: campaign.end_date       = req.end_date

    # FIX: recalculate total_budget if budget or dates change
    if req.budget is not None:
        campaign.budget = req.budget
        start = str(campaign.start_date) if campaign.start_date else req.start_date or "2026-06-01"
        end   = str(campaign.end_date)   if campaign.end_date   else req.end_date   or "2026-06-30"
        campaign.total_budget = req.budget * get_duration_days(start, end)

    db.commit()
    db.refresh(campaign)
    return {"message": "Campaign updated", "id": campaign_id}


# ════════════════════════════════════════════════════
# 5. DELETE CAMPAIGN (only if owned by current_user)
# ════════════════════════════════════════════════════
@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    campaign = get_owned_campaign_or_404(campaign_id, current_user, db)
    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted"}


# ════════════════════════════════════════════════════
# 6. GET CAMPAIGN DETAIL WITH STATS (only if owned by current_user)
# ════════════════════════════════════════════════════
@router.get("/{campaign_id}/detail")
def get_campaign_detail(campaign_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    campaign = get_owned_campaign_or_404(campaign_id, current_user, db)

    # ── Platform Stats ──
    try:
        stats = db.query(PlatformStat).filter(PlatformStat.campaign_id == campaign_id).all()
        stats_data = [{
            "platform_id":   s.platform_id,
            "platform_name": s.platform.name if s.platform else "",
            "impressions":   s.impressions   or 0,
            "clicks":        s.clicks        or 0,
            "leads":         s.leads         or 0,
            "cpl":           s.cpl           or 0,
            "budget_spent":  s.budget_spent  or 0,
        } for s in stats]
    except Exception:
        stats_data = []

    # ── Targeting Rules ──
    try:
        targeting = db.query(TargetingRule).filter(
            TargetingRule.campaign_id == campaign_id
        ).first()
        targeting_data = {
            "locations": targeting.locations or "" if targeting else "",
            "age_min":   targeting.age_min   or 25  if targeting else 25,
            "age_max":   targeting.age_max   or 55  if targeting else 55,
            "radius_km": targeting.radius_km or 25  if targeting else 25,
        } if targeting else {}
    except Exception:
        targeting_data = {}

    # ── Ad Contents ──
    try:
        ad_contents = db.query(AdContent).filter(
            AdContent.campaign_id == campaign_id
        ).all()
        ad_contents_data = [{
            "platform_id":      a.platform_id,
            "platform_name":    a.platform.name if a.platform else "",
            "headline":         a.headline         or "",
            "description":      a.description      or "",
            "image_url":        a.image_url        or "",
            "cta_button":       a.cta_button       or "",
            "target_audience":  a.target_audience  or "",
            "target_age_min":   a.target_age_min   or 25,
            "target_age_max":   a.target_age_max   or 55,
            "creative_score":   a.creative_score   or 0,
            "lead_form_url":    a.lead_form_url    or "",
        } for a in ad_contents]
    except Exception:
        ad_contents_data = []

    return {
        # Campaign Info
        "id":             campaign.id,
        "name":           campaign.name,
        "goal":           campaign.goal           or "",
        "industry":       campaign.industry       or "",
        "sub_category":   campaign.sub_category   or "",
        "business_niche": campaign.business_niche or "",
        "budget":         campaign.budget         or 0,
        "total_budget":   campaign.total_budget   or 0,
        "start_date":     str(campaign.start_date) if campaign.start_date else "",
        "end_date":       str(campaign.end_date)   if campaign.end_date   else "",
        "status":         campaign.status          or "active",
        "created_at":     str(campaign.created_at) if campaign.created_at else "",

        # Related Data
        "platform_stats": stats_data,
        "targeting":      targeting_data,
        "ad_contents":    ad_contents_data,
    }

# ════════════════════════════════════════════════════
# 7. POST PLATFORMS ATTACH (only if campaign owned by current_user)
# ════════════════════════════════════════════════════
@router.post("/{campaign_id}/platforms")
def add_platforms(campaign_id: int, platform_ids: List[int], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    campaign = get_owned_campaign_or_404(campaign_id, current_user, db)
    return {"message": "Platforms noted", "campaign_id": campaign_id, "platforms": platform_ids}


# ════════════════════════════════════════════════════
# 8. GET PLATFORM STATS (only if campaign owned by current_user)
# ════════════════════════════════════════════════════
@router.get("/{campaign_id}/stats")
def get_campaign_stats(campaign_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ownership check first — throws 404 if this isn't the user's campaign
    get_owned_campaign_or_404(campaign_id, current_user, db)
    try:
        stats = db.query(PlatformStat).filter(PlatformStat.campaign_id == campaign_id).all()
        stats_data = [{
            "platform_id":  s.platform_id,
            "impressions":  s.impressions  or 0,
            "clicks":       s.clicks       or 0,
            "leads":        s.leads        or 0,
            "cpl":          s.cpl          or 0,
            "budget_spent": s.budget_spent or 0,
        } for s in stats]
        return {"campaign_id": campaign_id, "stats": stats_data}
    except Exception as e:
        return {"campaign_id": campaign_id, "stats": [], "error": str(e)}


# ════════════════════════════════════════════════════
# 9. GET PLATFORM STATUS (only if campaign owned by current_user)
# ════════════════════════════════════════════════════
@router.get("/{campaign_id}/platform-status")
def get_platform_status(campaign_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_owned_campaign_or_404(campaign_id, current_user, db)
    status = {}
    if GOOGLE_AVAILABLE:
        try:
            status["google"] = get_google_status(str(campaign_id))
        except Exception as e:
            status["google"] = {"error": str(e)}
    if META_AVAILABLE:
        try:
            status["meta"] = get_meta_campaign_status(str(campaign_id))
        except Exception as e:
            status["meta"] = {"error": str(e)}
    return {"campaign_id": campaign_id, "platform_status": status}


# ════════════════════════════════════════════════════
# 10. POST SUBMIT TO PLATFORMS (only if campaign owned by current_user)
# ════════════════════════════════════════════════════
@router.post("/{campaign_id}/submit-to-platforms")
def submit_to_platforms(campaign_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    campaign = get_owned_campaign_or_404(campaign_id, current_user, db)

    campaign_data = {
        "name":          campaign.name,
        "goal":          campaign.goal,
        "budget_amount": campaign.budget,  # daily budget
        "start_date":    str(campaign.start_date),
        "end_date":      str(campaign.end_date),
        "keywords":      [campaign.business_niche] if campaign.business_niche else ["business loan"],
    }
    results = {}
    if GOOGLE_AVAILABLE:
        try:
            results["google"] = submit_campaign_to_google(campaign_data, {})
        except Exception as e:
            results["google"] = {"success": False, "error": str(e)}
    if META_AVAILABLE:
        try:
            results["meta"] = submit_campaign_to_meta(campaign_data, {})
        except Exception as e:
            results["meta"] = {"success": False, "error": str(e)}

    return {"campaign_id": campaign_id, "results": results}