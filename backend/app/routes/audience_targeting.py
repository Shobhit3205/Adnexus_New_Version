import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Campaign, AudienceProfile, PlatformTargeting
from app.schemas_audience_targeting import (
    AudienceGenerateRequest,
    AudienceProfileOut,
    PlatformTargetingOut,
    PlatformTargetingUpdate,
)
from app.services.audience_ai_service import generate_audience_profile
from app.services.platform_mapping.google_mapper import map_to_google
from app.services.platform_mapping.meta_mapper import map_to_meta
from app.services.platform_mapping.linkedin_mapper import map_to_linkedin

router = APIRouter(prefix="/api/campaigns", tags=["Audience Targeting"])


def _csv(values: list) -> str:
    return ",".join(values) if values else ""


def _from_csv(value: str) -> list:
    return [v.strip() for v in value.split(",") if v.strip()] if value else []


def _serialize_profile(profile: AudienceProfile) -> AudienceProfileOut:
    return AudienceProfileOut(
        id=profile.id,
        campaign_id=profile.campaign_id,
        source=profile.source,
        industry_category=profile.industry_category,
        business_type=profile.business_type,
        intent_keywords=_from_csv(profile.intent_keywords),
        job_functions=_from_csv(profile.job_functions),
        job_seniorities=_from_csv(profile.job_seniorities),
        interests=_from_csv(profile.interests),
        age_min=profile.age_min,
        age_max=profile.age_max,
        reasoning=profile.reasoning,
        platform_targets=[
            PlatformTargetingOut(
                platform=pt.platform,
                targeting_spec=json.loads(pt.targeting_spec or "{}"),
                is_ai_suggested=pt.is_ai_suggested,
                is_user_approved=pt.is_user_approved,
            )
            for pt in profile.platform_targets
        ],
    )


@router.post("/{campaign_id}/audience/generate", response_model=AudienceProfileOut)
def generate_audience(campaign_id: int, payload: AudienceGenerateRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    try:
        ai_profile = generate_audience_profile(
            ad_title=payload.ad_title,
            ad_description=payload.ad_description,
            industry=payload.industry or campaign.industry or "",
            sub_category=payload.sub_category or campaign.sub_category or "",
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")

    profile = AudienceProfile(
        campaign_id=campaign_id,
        source="ai",
        industry_category=ai_profile.get("industry_category"),
        business_type=ai_profile.get("business_type"),
        intent_keywords=_csv(ai_profile.get("intent_keywords", [])),
        job_functions=_csv(ai_profile.get("job_functions", [])),
        job_seniorities=_csv(ai_profile.get("job_seniorities", [])),
        interests=_csv(ai_profile.get("interests", [])),
        age_min=ai_profile.get("age_min", 25),
        age_max=ai_profile.get("age_max", 55),
        reasoning=ai_profile.get("reasoning", ""),
        raw_ai_output=json.dumps(ai_profile),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    mappers = {
        "google": map_to_google,
        "meta": map_to_meta,
        "linkedin": map_to_linkedin,
    }
    for platform_name, mapper_fn in mappers.items():
        spec = mapper_fn(ai_profile)
        pt = PlatformTargeting(
            audience_profile_id=profile.id,
            platform=platform_name,
            targeting_spec=json.dumps(spec),
            is_ai_suggested=True,
            is_user_approved=False,
        )
        db.add(pt)

    db.commit()
    db.refresh(profile)

    return _serialize_profile(profile)


@router.get("/{campaign_id}/audience", response_model=AudienceProfileOut)
def get_audience(campaign_id: int, db: Session = Depends(get_db)):
    profile = (
        db.query(AudienceProfile)
        .filter(AudienceProfile.campaign_id == campaign_id)
        .order_by(AudienceProfile.created_at.desc())
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="No audience profile found for this campaign yet")

    return _serialize_profile(profile)


@router.put("/{campaign_id}/audience/{platform}", response_model=PlatformTargetingOut)
def update_platform_targeting(
    campaign_id: int, platform: str, payload: PlatformTargetingUpdate, db: Session = Depends(get_db)
):
    profile = (
        db.query(AudienceProfile)
        .filter(AudienceProfile.campaign_id == campaign_id)
        .order_by(AudienceProfile.created_at.desc())
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="No audience profile found for this campaign")

    pt = (
        db.query(PlatformTargeting)
        .filter(PlatformTargeting.audience_profile_id == profile.id, PlatformTargeting.platform == platform)
        .first()
    )
    if not pt:
        raise HTTPException(status_code=404, detail=f"No targeting entry found for platform '{platform}'")

    pt.targeting_spec = json.dumps(payload.targeting_spec)
    pt.is_ai_suggested = False
    pt.is_user_approved = payload.is_user_approved if payload.is_user_approved is not None else True
    db.commit()
    db.refresh(pt)

    return PlatformTargetingOut(
        platform=pt.platform,
        targeting_spec=json.loads(pt.targeting_spec),
        is_ai_suggested=pt.is_ai_suggested,
        is_user_approved=pt.is_user_approved,
    )