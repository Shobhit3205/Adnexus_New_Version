from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    Campaign, Platform, PlatformStat, AdContent, TargetingRule, User,
    Lead, LeadForm, FormSubmission, ClickTracking,
    AudienceProfile, PlatformTargeting,
)
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import Optional, List
import os

# Google + Meta imports
try:
    from app.services.google_ads_service import (
        submit_campaign_to_google,
        get_campaign_status as get_google_status,
        get_google_campaign_insights,
        get_google_campaign_status,
    )
    GOOGLE_AVAILABLE = True
except Exception:
    GOOGLE_AVAILABLE = False

try:
    from app.services.meta_ads_service import submit_campaign_to_meta, get_meta_campaign_status, get_meta_campaign_insights
    META_AVAILABLE = True
except Exception:
    META_AVAILABLE = False
try:
    from app.services.audience_ai_service import generate_audience_profile
    from app.services.platform_mapping.meta_mapper import map_to_meta
    AUDIENCE_AI_AVAILABLE = True
except Exception:
    AUDIENCE_AI_AVAILABLE = False

router = APIRouter(tags=["campaigns"])


# ════════════════════════════════════════════════════
# PYDANTIC MODELS
# ════════════════════════════════════════════════════

# ── NAYA: ek city ka lat/lng bhi carry karta hai, taaki Meta/Google
# custom-location (proximity) targeting kar sakein, na ki sirf naam ═
class LocationDetail(BaseModel):
    name: str
    lat:  float
    lng:  float


class TargetingData(BaseModel):
    locations:        List[str]            = ["Delhi", "Mumbai"]
    # ── NAYA: frontend se city ka naam + lat/lng dono aate hain ab ──
    location_details: List[LocationDetail]  = []
    radius_km:        int                   = 25
    age_min:          int                   = 25
    age_max:          int                   = 55
    genders:          List[int]             = [1, 2]

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

    # ── NAYA: Business Profile / Targeting Suggestion fields (Step 6) ──
    company_name:    Optional[str] = ""
    company_email:   Optional[str] = ""
    company_phone:   Optional[str] = ""
    company_pincode: Optional[str] = ""

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
        # ── NAYA: Business Profile fields ──
        company_name    = req.company_name    or "",
        company_email   = req.company_email   or "",
        company_phone   = req.company_phone   or "",
        company_pincode = req.company_pincode or "",
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    campaign_id = db_campaign.id
    db_campaign.website_url = req.ad_content.link_url or req.ad_content.final_url or "" if req.ad_content else ""
    db.commit()

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
    if "google" in platform_keys and GOOGLE_AVAILABLE:
        try:
            google_result = submit_campaign_to_google(campaign_data, ad_content_data)
        except Exception as e:
            google_result = {"success": False, "error": str(e), "platform": "google"}
        results["platforms"]["google"] = google_result

        # ── Google IDs DB mein save karo, taaki baad mein stats/status sync ke liye use ho sakein ──
        if google_result.get("success"):
            db_campaign.google_campaign_id = google_result.get("google_campaign_id")
            db_campaign.google_ad_group_id  = google_result.get("google_ad_group_id")
            db_campaign.google_ad_id        = google_result.get("google_ad_id")
            db.commit()

    # ── Age targeting + Location targeting bhi campaign_data mein
    #    daalo (Meta/Google service tak pahunchane ke liye, top-level
    #    keys ke roop mein — nested "targeting" dict ke bharose nahi
    #    rehna, taaki services simple .get() se access kar sakein) ──
    if req.targeting:
        campaign_data["age_min"]         = req.targeting.age_min
        campaign_data["age_max"]         = req.targeting.age_max
        campaign_data["radius_km"]       = req.targeting.radius_km
        # ── NAYA: lat/lng wali location list — Meta custom_locations
        #    aur Google proximity criterion dono isi se banenge ──
        campaign_data["location_details"] = [loc.dict() for loc in req.targeting.location_details]
    else:
        campaign_data["age_min"]          = 25
        campaign_data["age_max"]          = 55
        campaign_data["radius_km"]        = 25
        campaign_data["location_details"] = []

    # ── Meta Ads (Instagram bhi isi Meta Ad Account se chalta hai) ──
    if ("meta" in platform_keys or "instagram" in platform_keys) and META_AVAILABLE:
        # Generate AI audience targeting first (if available), so the real
        # Meta Ad Set uses AI-resolved interests instead of just geo-only.
        audience_targeting_for_meta = None
        if AUDIENCE_AI_AVAILABLE:
            try:
                ai_profile = generate_audience_profile(
                    ad_title=ad_content_data.get("headline") or req.name,
                    ad_description=(
                        ad_content_data.get("primary_text")
                        or ad_content_data.get("description")
                        or req.business_niche
                    ),
                    industry=req.industry or "",
                    sub_category=req.sub_category or "",
                )
                audience_targeting_for_meta = map_to_meta(ai_profile)
            except Exception as e:
                # Non-fatal — Meta submission still proceeds with geo-only targeting
                print(f"[create_campaign] Audience targeting generation failed: {e}")
 
        try:
            meta_result = submit_campaign_to_meta(
                campaign_data,
                ad_content_data,
                audience_targeting=audience_targeting_for_meta,
            )
        except Exception as e:
            meta_result = {"success": False, "error": str(e), "platform": "meta"}
        results["platforms"]["meta"] = meta_result
        if "instagram" in platform_keys:
            results["platforms"]["instagram"] = meta_result

        # ── Meta IDs DB mein save karo, taaki baad mein stats sync ke liye use ho sakein ──
        if meta_result.get("success"):
            db_campaign.meta_campaign_id = meta_result.get("meta_campaign_id")
            db_campaign.meta_adset_id    = meta_result.get("meta_adset_id")
            db_campaign.meta_ad_id       = meta_result.get("meta_ad_id")
            db.commit()
    # ── NAYA: Agar koi bhi platform pe launch successful nahi hua,
    #    to status "active" na rahe — asli situation reflect ho ──
    any_platform_live = any(
        p.get("success") for p in results["platforms"].values()
    )
    if not any_platform_live:
        db_campaign.status = "not_connected"
        db.commit()
    else:
        db_campaign.status = "active"
        db.commit()
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

    # ── AudienceProfile ke andar PlatformTargeting bhi hai — pehle usse clear karo ──
    profile_ids = [
        row[0] for row in
        db.query(AudienceProfile.id).filter(AudienceProfile.campaign_id == campaign_id).all()
    ]
    if profile_ids:
        db.query(PlatformTargeting).filter(
            PlatformTargeting.audience_profile_id.in_(profile_ids)
        ).delete(synchronize_session=False)

    # ── LeadForm ke andar FormSubmission bhi hai — pehle usse clear karo ──
    form_ids = [
        row[0] for row in
        db.query(LeadForm.id).filter(LeadForm.campaign_id == campaign_id).all()
    ]
    if form_ids:
        db.query(FormSubmission).filter(
            FormSubmission.form_id.in_(form_ids)
        ).delete(synchronize_session=False)

    # ── Ab campaign se seedhe linked sab tables clear karo ──
    db.query(TargetingRule).filter(TargetingRule.campaign_id == campaign_id).delete()
    db.query(AdContent).filter(AdContent.campaign_id == campaign_id).delete()
    db.query(PlatformStat).filter(PlatformStat.campaign_id == campaign_id).delete()
    db.query(Lead).filter(Lead.campaign_id == campaign_id).delete()
    db.query(LeadForm).filter(LeadForm.campaign_id == campaign_id).delete()
    db.query(FormSubmission).filter(FormSubmission.campaign_id == campaign_id).delete()
    db.query(ClickTracking).filter(ClickTracking.campaign_id == campaign_id).delete()
    db.query(AudienceProfile).filter(AudienceProfile.campaign_id == campaign_id).delete()

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
            "reach":         s.reach         or 0,  
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

        # ── NAYA: Business Profile fields bhi detail response mein ──
        "company_name":     campaign.company_name    or "",
        "company_email":    campaign.company_email   or "",
        "company_phone":    campaign.company_phone   or "",
        "company_pincode":  campaign.company_pincode or "",
        "website_url":      campaign.website_url     or "",

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
            "platform_id":   s.platform_id,
            "platform_name": s.platform.name if s.platform else "",
            "impressions":   s.impressions   or 0,
            "clicks":        s.clicks        or 0,
            "leads":         s.leads         or 0,
            "cpl":           s.cpl           or 0,
            "spend":         s.budget_spent  or 0,   # frontend "spend" expect karta hai
            "budget_spent":  s.budget_spent  or 0,   # backward-compat
            "reach":         s.reach         or 0,   # 🆕

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

# ════════════════════════════════════════════════════
# 11. POST SYNC PLATFORM STATS (only if campaign owned by current_user)
# Generic, platform-agnostic sync — works for any connected platform.
# Jab naya platform add ho (Google, LinkedIn), bas PLATFORM_INSIGHT_FETCHERS
# aur PLATFORM_STATUS_FETCHERS dict mein ek line add karni hogi — baaki
# sab code same rahega.
# ════════════════════════════════════════════════════

PLATFORM_INSIGHT_FETCHERS = {}
PLATFORM_STATUS_FETCHERS  = {}

if META_AVAILABLE:
    PLATFORM_INSIGHT_FETCHERS["meta"] = lambda campaign: get_meta_campaign_insights(campaign.meta_campaign_id)
    PLATFORM_STATUS_FETCHERS["meta"]  = lambda campaign: get_meta_campaign_status(campaign.meta_campaign_id)

if GOOGLE_AVAILABLE:
    PLATFORM_INSIGHT_FETCHERS["google"] = lambda campaign: get_google_campaign_insights(campaign.google_campaign_id)
    PLATFORM_STATUS_FETCHERS["google"]  = lambda campaign: get_google_campaign_status(campaign.google_campaign_id)


# ── Har platform ka apna status vocabulary hota hai — inko apne
#    unified status (active | paused | ended | error) mein map karo.
META_STATUS_MAP = {
    "ACTIVE":          "active",
    "PAUSED":          "paused",
    "CAMPAIGN_PAUSED": "paused",
    "ARCHIVED":        "ended",
    "DELETED":         "ended",
    "WITH_ISSUES":     "error",
    "IN_PROCESS":      "paused",
}

GOOGLE_STATUS_MAP = {
    "ENABLED": "active",
    "PAUSED":  "paused",
    "REMOVED": "ended",
}

PLATFORM_STATUS_MAPS = {
    "meta":   META_STATUS_MAP,
    "google": GOOGLE_STATUS_MAP,
}

# Agar campaign multiple platforms pe live hai, priority order decide karo
# ki final unified status kisko maana jaye (sabse "healthy" status jeetega)
STATUS_PRIORITY = ["active", "paused", "error", "ended"]


@router.post("/{campaign_id}/sync-stats")
def sync_platform_stats(campaign_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    campaign = get_owned_campaign_or_404(campaign_id, current_user, db)

    synced = {}
    errors = {}
    resolved_statuses = []  # unified statuses collected across all platforms this campaign runs on

    for platform_key, fetch_fn in PLATFORM_INSIGHT_FETCHERS.items():
        id_field = f"{platform_key}_campaign_id"
        if not getattr(campaign, id_field, None):
            continue  # yeh campaign is platform pe launch hi nahi hua

        try:
            insights = fetch_fn(campaign)

            platform_row = db.query(Platform).filter(Platform.name.ilike(platform_key)).first()
            if not platform_row:
                platform_row = Platform(name=platform_key, icon="")
                db.add(platform_row)
                db.commit()
                db.refresh(platform_row)

            stat = db.query(PlatformStat).filter(
                PlatformStat.campaign_id == campaign_id,
                PlatformStat.platform_id == platform_row.id,
            ).first()

            if stat:
                stat.impressions  = insights.get("impressions", 0)
                stat.clicks       = insights.get("clicks", 0)
                stat.budget_spent = insights.get("spend", 0)
                stat.reach        = insights.get("reach", 0)
            else:
                stat = PlatformStat(
                    campaign_id  = campaign_id,
                    platform_id  = platform_row.id,
                    impressions  = insights.get("impressions", 0),
                    clicks       = insights.get("clicks", 0),
                    budget_spent = insights.get("spend", 0),
                    reach        = insights.get("reach", 0),
                )
                db.add(stat)

            db.commit()
            synced[platform_key] = insights

        except Exception as e:
            errors[platform_key] = str(e)

        # ── Platform se actual campaign status bhi fetch karo ──
        if platform_key in PLATFORM_STATUS_FETCHERS:
            try:
                status_result = PLATFORM_STATUS_FETCHERS[platform_key](campaign)
                raw_status = (status_result.get("status") or "").upper()
                status_map = PLATFORM_STATUS_MAPS.get(platform_key, {})
                mapped_status = status_map.get(raw_status)

                if mapped_status:
                    resolved_statuses.append(mapped_status)
                    synced.setdefault(platform_key, {})["platform_status"] = mapped_status
                else:
                    errors[f"{platform_key}_status"] = f"Unrecognized status: {raw_status}"

            except Exception as e:
                errors[f"{platform_key}_status"] = str(e)

    # ── Unified status decide karo aur DB mein save karo ──
    if resolved_statuses:
        for candidate in STATUS_PRIORITY:
            if candidate in resolved_statuses:
                campaign.status = candidate
                break
        db.commit()

    if not synced and not errors:
        raise HTTPException(status_code=400, detail="Yeh campaign kisi bhi platform pe launch nahi hua hai")

    return {
        "message":         "Sync complete",
        "synced":          synced,
        "errors":          errors,
        "campaign_status": campaign.status,
    }