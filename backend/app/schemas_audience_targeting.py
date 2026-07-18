"""
Pydantic schemas for Audience Targeting feature.
Save as: app/schemas_audience_targeting.py
(or append into your existing app/schemas.py if you keep everything in one file)
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─────────────────────────────────────────────
# Request: trigger AI generation for a campaign
# ─────────────────────────────────────────────
class AudienceGenerateRequest(BaseModel):
    ad_title: str = Field(..., description="Ad headline / campaign name")
    ad_description: str = Field(..., description="Ad body / product description")
    industry: Optional[str] = None
    sub_category: Optional[str] = None
    business_goal: Optional[str] = None  # e.g. "LEAD_GEN"


# ─────────────────────────────────────────────
# AI's structured output shape (internal use)
# ─────────────────────────────────────────────
class AIAudienceProfile(BaseModel):
    industry_category: str
    business_type: str  # "B2B" | "B2C" | "Both"
    intent_keywords: List[str] = []
    job_functions: List[str] = []
    job_seniorities: List[str] = []
    interests: List[str] = []
    age_min: int = 25
    age_max: int = 55
    reasoning: str = ""


# ─────────────────────────────────────────────
# Response: platform targeting block
# ─────────────────────────────────────────────
class PlatformTargetingOut(BaseModel):
    platform: str
    targeting_spec: Dict[str, Any]
    is_ai_suggested: bool
    is_user_approved: bool

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Response: full audience profile + platform breakdown
# ─────────────────────────────────────────────
class AudienceProfileOut(BaseModel):
    id: int
    campaign_id: int
    source: str
    industry_category: Optional[str]
    business_type: Optional[str]
    intent_keywords: List[str] = []
    job_functions: List[str] = []
    job_seniorities: List[str] = []
    interests: List[str] = []
    age_min: Optional[int]
    age_max: Optional[int]
    reasoning: Optional[str]
    platform_targets: List[PlatformTargetingOut] = []

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Request: manual edit of one platform's targeting
# ─────────────────────────────────────────────
class PlatformTargetingUpdate(BaseModel):
    targeting_spec: Dict[str, Any]
    is_user_approved: Optional[bool] = True