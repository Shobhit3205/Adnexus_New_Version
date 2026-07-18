from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy import Boolean

# ════════════════════════════════════════════════════
# Users Table
# ════════════════════════════════════════════════════
class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(100), unique=True, nullable=False)

    # Email/password users ke liye set hoga (hashed), Google-only users ke liye None
    password   = Column(String(255), nullable=True)

    # Google login ke liye
    google_id     = Column(String(255), unique=True, nullable=True)
    auth_provider = Column(String(20), default="email")   # "email" ya "google"

    # OTP verification ke liye
    is_verified     = Column(Boolean, default=False)
    otp_code        = Column(String(10), nullable=True)
    otp_expires_at  = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=func.now())

    # Relationship
    campaigns = relationship("Campaign", back_populates="user")
    platform_connections = relationship("PlatformConnection", back_populates="user")


# ════════════════════════════════════════════════════
# Campaigns Table
# ════════════════════════════════════════════════════
class Campaign(Base):
    __tablename__ = "campaigns"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"))
    name            = Column(String(200), nullable=False)
    goal            = Column(String(100))           # LEAD_GEN | BRAND_AWARENESS | WEBSITE_TRAFFIC
    industry        = Column(String(200))
    sub_category    = Column(String(200))
    business_niche  = Column(String(200))
    budget          = Column(Float)                 # Daily budget (₹/day)
    total_budget    = Column(Float, default=0)      # FIX: total budget = daily × duration days
    budget_spent    = Column(Float, default=0)
    status          = Column(String(50), default="active")
    start_date      = Column(Date)
    end_date        = Column(Date)
    created_at      = Column(DateTime, default=func.now())

    # Relationships
    user           = relationship("User", back_populates="campaigns")
    platform_stats = relationship("PlatformStat", back_populates="campaign")
    leads          = relationship("Lead", back_populates="campaign")
    targeting      = relationship("TargetingRule", back_populates="campaign")
    ad_contents    = relationship("AdContent", back_populates="campaign")
    lead_forms       = relationship("LeadForm", back_populates="campaign")
    form_submissions = relationship("FormSubmission", back_populates="campaign")
    click_tracking   = relationship("ClickTracking", back_populates="campaign")
    audience_profiles = relationship("AudienceProfile", back_populates="campaign")


# ════════════════════════════════════════════════════
# Platforms Table
# ════════════════════════════════════════════════════
class Platform(Base):
    __tablename__ = "platforms"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(100))

    # Relationships
    stats       = relationship("PlatformStat", back_populates="platform")
    leads       = relationship("Lead", back_populates="platform")
    ad_contents = relationship("AdContent", back_populates="platform")


# ════════════════════════════════════════════════════
# Platform Stats Table
# ════════════════════════════════════════════════════
class PlatformStat(Base):
    __tablename__ = "platform_stats"

    id            = Column(Integer, primary_key=True, index=True)
    campaign_id   = Column(Integer, ForeignKey("campaigns.id"))
    platform_id   = Column(Integer, ForeignKey("platforms.id"))
    impressions   = Column(Integer, default=0)
    clicks        = Column(Integer, default=0)
    budget_spent  = Column(Float, default=0)
    leads         = Column(Integer, default=0)
    cpl           = Column(Float, default=0)
    recorded_at   = Column(DateTime, default=func.now())

    # Relationships
    campaign  = relationship("Campaign", back_populates="platform_stats")
    platform  = relationship("Platform", back_populates="stats")


# ════════════════════════════════════════════════════
# Leads Table
# ════════════════════════════════════════════════════
class Lead(Base):
    __tablename__ = "leads"

    id             = Column(Integer, primary_key=True, index=True)
    campaign_id    = Column(Integer, ForeignKey("campaigns.id"))
    platform_id    = Column(Integer, ForeignKey("platforms.id"), nullable=True)  # FIX: nullable so no crash
    name           = Column(String(100))
    company_sector = Column(String(100))
    turnover       = Column(String(50))
    location       = Column(String(100))
    status         = Column(String(50), default="new")
    created_at     = Column(DateTime, default=func.now())

    # Relationships
    campaign = relationship("Campaign", back_populates="leads")
    platform = relationship("Platform", back_populates="leads")


# ════════════════════════════════════════════════════
# Targeting Rules Table
# ════════════════════════════════════════════════════
class TargetingRule(Base):
    __tablename__ = "targeting_rules"

    id            = Column(Integer, primary_key=True, index=True)
    campaign_id   = Column(Integer, ForeignKey("campaigns.id"))
    audience_type = Column(String(100))
    min_turnover  = Column(String(50))
    industries    = Column(String(500))
    locations     = Column(String(500))
    age_min       = Column(Integer, default=25)
    age_max       = Column(Integer, default=55)
    radius_km     = Column(Integer, default=25)

    # Relationship
    campaign = relationship("Campaign", back_populates="targeting")


# ════════════════════════════════════════════════════
# Ad Content Table
# ════════════════════════════════════════════════════
class AdContent(Base):
    __tablename__ = "ad_contents"

    id          = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    platform_id = Column(Integer, ForeignKey("platforms.id"))

    # Ad copy
    headline        = Column(String(200))
    description     = Column(String(500))
    image_url       = Column(String(500))
    cta_button      = Column(String(100))
    target_age_min  = Column(Integer, default=25)
    target_age_max  = Column(Integer, default=55)
    target_audience = Column(String(200))

    # ── NEW FIELDS (from AdNexus docs) ──────────────────
    # Stores the pixel width of the ad image for this platform
    image_width         = Column(Integer, default=1200)

    # Stores the pixel height of the ad image for this platform
    image_height        = Column(Integer, default=1200)

    # Overall creative health score (0-100) across all 4 platforms
    # e.g. 96 means ad is compatible with all platforms
    creative_score      = Column(Float, default=0)

    # JSON string storing pass/fail per platform
    # e.g. {"Google Ads": {"compatible": true}, "Facebook": {"compatible": true}}
    platform_validation = Column(Text, default="{}")

    # One URL that works on all 4 platforms as the destination
    # e.g. https://adnexus.com/lead/123
    lead_form_url       = Column(String(500), default="")
    # ────────────────────────────────────────────────────

    created_at = Column(DateTime, default=func.now())

    # Relationships
    campaign = relationship("Campaign", back_populates="ad_contents")
    platform = relationship("Platform", back_populates="ad_contents")

    # ════════════════════════════════════════════════════
# Lead Forms Table
# Stores form config per campaign
# form_type: working_capital | property_sale | 
#            product_sale | services | manufacturing |
#            appointment | admission | personal_loan
# ════════════════════════════════════════════════════
class LeadForm(Base):
    __tablename__ = "lead_forms"

    id           = Column(Integer, primary_key=True, index=True)
    campaign_id  = Column(Integer, ForeignKey("campaigns.id"))
    form_type    = Column(String(50), nullable=False)
    company_name = Column(String(200))
    company_logo = Column(String(500))
    brand_color  = Column(String(20), default="#1A73E8")
    tagline      = Column(String(300))
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime, default=func.now())

    # Relationships
    campaign    = relationship("Campaign", back_populates="lead_forms")
    submissions = relationship("FormSubmission", back_populates="form")


# ════════════════════════════════════════════════════
# Form Submissions Table
# Stores what customer filled in the form
# extra_data: JSON string for form-specific fields
# ════════════════════════════════════════════════════
class FormSubmission(Base):
    __tablename__ = "form_submissions"

    id            = Column(Integer, primary_key=True, index=True)
    campaign_id   = Column(Integer, ForeignKey("campaigns.id"))
    form_id       = Column(Integer, ForeignKey("lead_forms.id"))
    platform      = Column(String(50))
    utm_source    = Column(String(100))
    form_type     = Column(String(50))
    full_name     = Column(String(200))
    phone         = Column(String(20))
    email         = Column(String(200))
    location      = Column(String(100))
    budget_range  = Column(String(100))
    timeline      = Column(String(100))
    requirement   = Column(Text)
    extra_data    = Column(Text, default="{}")
    quality_score = Column(Integer, default=0)
    is_verified   = Column(Boolean, default=False)
    created_at    = Column(DateTime, default=func.now())

    # Relationships
    campaign = relationship("Campaign", back_populates="form_submissions")
    form     = relationship("LeadForm", back_populates="submissions")


# ════════════════════════════════════════════════════
# Click Tracking Table
# Stores clicks for Brand Awareness + Website Traffic
# No form data — just click info
# ════════════════════════════════════════════════════
class ClickTracking(Base):
    __tablename__ = "click_tracking"

    id          = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    platform    = Column(String(50))
    city        = Column(String(100))
    device      = Column(String(50))
    utm_source  = Column(String(100))
    clicked_at  = Column(DateTime, default=func.now())

    # Relationship
    campaign = relationship("Campaign", back_populates="click_tracking")

    

    # ════════════════════════════════════════════════════
# Platform Connections Table
# Stores each user's OAuth connection to an ad platform
# ════════════════════════════════════════════════════
class PlatformConnection(Base):
    __tablename__ = "platform_connections"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform      = Column(String(50), nullable=False)   # "google" | "meta" | "linkedin"
    account_id    = Column(String(200), nullable=True)
    account_name  = Column(String(200), nullable=True)
    refresh_token = Column(String(500), nullable=True)
    access_token  = Column(String(500), nullable=True)
    token_expiry  = Column(DateTime, nullable=True)
    status        = Column(String(50), default="connected")  # "connected" | "expired" | "revoked"
    created_at    = Column(DateTime, default=func.now())
    updated_at    = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship
    user = relationship("User", back_populates="platform_connections")


    # ════════════════════════════════════════════════════
# ADD THESE TO YOUR EXISTING app/models.py
# (paste below the existing classes; imports already covered
#  by your existing `from sqlalchemy import ...` line — just
#  add JSON if you don't have it imported)
# ════════════════════════════════════════════════════

# from sqlalchemy import JSON   # <-- add this import if you want native JSON instead of Text


# ════════════════════════════════════════════════════
# Audience Profiles Table
# AI-generated (or manual) generic audience profile for a campaign.
# One campaign can technically have multiple profiles over time
# (e.g. regenerated), but UI will typically use the latest one.
# ════════════════════════════════════════════════════
class AudienceProfile(Base):
    __tablename__ = "audience_profiles"

    id                = Column(Integer, primary_key=True, index=True)
    campaign_id       = Column(Integer, ForeignKey("campaigns.id"))

    source            = Column(String(20), default="ai")     # "ai" | "manual" | "hybrid"
    industry_category = Column(String(255))
    business_type     = Column(String(20))                    # "B2B" | "B2C" | "Both"

    # Comma-separated strings, matching your existing style (e.g. TargetingRule.industries)
    intent_keywords   = Column(Text)
    job_functions     = Column(Text)   # B2B only
    job_seniorities   = Column(Text)   # B2B only
    interests         = Column(Text)   # B2C only

    age_min           = Column(Integer, default=25)
    age_max           = Column(Integer, default=55)
    income_bracket    = Column(String(50))
    reasoning         = Column(Text)          # AI's 1-line "why" explanation
    raw_ai_output     = Column(Text)          # full AI JSON response, stored as text for debugging

    created_at        = Column(DateTime, default=func.now())
    updated_at        = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    campaign          = relationship("Campaign", back_populates="audience_profiles")
    platform_targets  = relationship("PlatformTargeting", back_populates="audience_profile",
                                      cascade="all, delete-orphan")


# ════════════════════════════════════════════════════
# Platform Targeting Table
# Per-platform mapped targeting spec derived from an AudienceProfile.
# targeting_spec stores platform-native shape as JSON text, e.g.:
#   Google:   {"in_market_segments": [...], "custom_segment_keywords": [...]}
#   Meta:     {"interests": [{"id":"...", "name":"..."}], "behaviors": [...]}
#   LinkedIn: {"job_functions": [...], "seniorities": [...], "industries": [...]}
# ════════════════════════════════════════════════════
class PlatformTargeting(Base):
    __tablename__ = "platform_targeting"

    id                  = Column(Integer, primary_key=True, index=True)
    audience_profile_id = Column(Integer, ForeignKey("audience_profiles.id"))

    platform            = Column(String(20), nullable=False)  # "google" | "meta" | "linkedin" | "instagram"
    targeting_spec      = Column(Text, default="{}")           # JSON string
    is_ai_suggested      = Column(Boolean, default=True)
    is_user_approved     = Column(Boolean, default=False)

    created_at           = Column(DateTime, default=func.now())
    updated_at           = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    audience_profile     = relationship("AudienceProfile", back_populates="platform_targets")


# ════════════════════════════════════════════════════
# ALSO ADD this relationship line inside your existing Campaign class,
# next to the other relationships (targeting, ad_contents, etc.):
#
#   audience_profiles = relationship("AudienceProfile", back_populates="campaign")
# ════════════════════════════════════════════════════
