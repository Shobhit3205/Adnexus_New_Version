from sqlalchemy.orm import Session
from app.database import get_db
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from app.models.models import Campaign, LeadForm, FormSubmission, ClickTracking, User
from app.services.otp_service import send_lead_notification_email
import json

router = APIRouter(tags=["Public Forms"])


# ════════════════════════════════════════════════════
# INDUSTRY → FORM TYPE MAPPING
# This is the master map — category + sub_category
# decides which form opens automatically
# When advanced access comes — this stays same ✅
# ════════════════════════════════════════════════════
FORM_TYPE_MAP = {
    # Financial Services
    "Business Loan":         "working_capital",
    "Working Capital Loan":  "working_capital",
    "Machinery Loan":        "working_capital",
    "Invoice Finance":       "working_capital",
    "Trade Finance":         "working_capital",
    "Personal Loan":         "personal_loan",
    "Home Loan":             "personal_loan",
    "Gold Loan":             "personal_loan",
    "Vehicle Loan":          "personal_loan",
    "Education Loan":        "personal_loan",

    # Real Estate
    "Residential Property":  "property_sale",
    "Commercial Property":   "property_sale",
    "Villa / Plots":         "property_sale",
    "Affordable Housing":    "property_sale",
    "Luxury Housing":        "property_sale",
    "Co-working Space":      "property_sale",

    # Manufacturing
    "Raw Material Supply":   "manufacturing",
    "Industrial Goods":      "manufacturing",
    "Custom Furniture":      "manufacturing",
    "Jewellery":             "manufacturing",
    "Packaging Material":    "manufacturing",
    "Chemical Supply":       "manufacturing",
    "Pharmaceutical":        "manufacturing",
    "Medical Equipment":     "manufacturing",
    "Farm Equipment":        "manufacturing",
    "Agro Processing":       "manufacturing",
    "Food Processing":       "manufacturing",

    # Trading & Distribution
    "Wholesale Trading":     "product_sale",
    "Import / Export":       "product_sale",
    "FMCG Distribution":     "product_sale",
    "Retail Distribution":   "product_sale",
    "E-commerce":            "product_sale",

    # Retail
    "Fashion / Clothing":    "product_sale",
    "Electronics":           "product_sale",
    "Home Decor":            "product_sale",
    "Grocery / FMCG":        "product_sale",
    "Luxury Goods":          "product_sale",
    "Sports / Fitness":      "product_sale",

    # Food & Beverage
    "Restaurant / Cafe":     "product_sale",
    "Cloud Kitchen":         "product_sale",
    "Food Franchise":        "product_sale",
    "Catering Services":     "services",

    # IT & Technology
    "SaaS Product":          "services",
    "IT Infrastructure":     "services",
    "Digital Agency":        "services",
    "Product Development":   "services",
    "Cybersecurity":         "services",
    "Cloud Services":        "services",

    # Logistics & Transport
    "Courier Services":      "services",
    "Fleet Management":      "services",
    "Warehouse Services":    "services",
    "Cold Chain":            "services",
    "Last Mile Delivery":    "services",
    "Irrigation Services":   "services",

    # Hospitality & Tourism
    "Travel Agency":         "services",
    "Event Management":      "services",
    "Adventure Tourism":     "services",
    "Wedding Planning":      "appointment",
    "Hotel / Resort":        "appointment",

    # Healthcare
    "Hospital / Clinic":     "appointment",
    "Dental Care":           "appointment",
    "Eye Care":              "appointment",
    "Ayurveda / Wellness":   "appointment",
    "Diagnostics / Lab":     "appointment",

    # Education
    "School / College":      "admission",
    "Coaching Center":       "admission",
    "Study Abroad":          "admission",
    "Skill Development":     "admission",
    "Online Courses":        "admission",
    "Vocational Training":   "admission",

    # Agriculture
    "Organic Products":      "product_sale",
    "Seeds / Fertilizers":   "product_sale",
}


def get_form_type(sub_category: str, industry: str) -> str:
    # First try sub_category
    if sub_category and sub_category in FORM_TYPE_MAP:
        return FORM_TYPE_MAP[sub_category]
    # Fallback to industry level
    industry_defaults = {
        "Financial Services":         "working_capital",
        "Real Estate & Construction":  "property_sale",
        "Manufacturing":               "manufacturing",
        "Trading & Distribution":      "product_sale",
        "IT & Technology":             "services",
        "Healthcare & Pharma":         "appointment",
        "Education & Edtech":          "admission",
        "Retail":                      "product_sale",
        "Food & Beverage":             "product_sale",
        "Logistics & Transport":       "services",
        "Agriculture & Agro-Processing": "manufacturing",
        "Hospitality & Tourism":       "services",
    }
    return industry_defaults.get(industry, "services")


def calculate_quality_score(data: dict) -> int:
    score = 0
    if data.get("phone"):       score += 3
    if data.get("email"):       score += 2
    if data.get("full_name"):   score += 2
    if data.get("location"):    score += 1
    if data.get("budget_range"):score += 1
    if data.get("timeline"):    score += 1
    return min(score, 10)


# ════════════════════════════════════════════════════
# PYDANTIC MODELS
# ════════════════════════════════════════════════════
class LeadFormCreate(BaseModel):
    campaign_id:  int
    company_name: Optional[str] = ""
    company_logo: Optional[str] = ""
    brand_color:  Optional[str] = "#1A73E8"
    tagline:      Optional[str] = ""


class FormSubmissionCreate(BaseModel):
    full_name:    str
    phone:        str
    email:        Optional[str] = ""
    location:     Optional[str] = ""
    budget_range: Optional[str] = ""
    timeline:     Optional[str] = ""
    requirement:  Optional[str] = ""
    extra_data:   Optional[dict] = {}
    platform:     Optional[str] = ""
    utm_source:   Optional[str] = ""


class ClickTrackingCreate(BaseModel):
    platform:   Optional[str] = ""
    city:       Optional[str] = ""
    device:     Optional[str] = ""
    utm_source: Optional[str] = ""


# ════════════════════════════════════════════════════
# 1. GET: Get form config for a campaign
# Called when customer lands on the form page
# Returns form type + company branding
# ════════════════════════════════════════════════════
@router.get("/form/{campaign_id}")
def get_form_config(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found!")

    # Get form type from sub_category mapping
    form_type = get_form_type(
        campaign.sub_category or "",
        campaign.industry or ""
    )

    # Get form branding if exists
    lead_form = db.query(LeadForm).filter(
        LeadForm.campaign_id == campaign_id,
        LeadForm.is_active == True
    ).first()

    return {
        "campaign_id":   campaign_id,
        "campaign_name": campaign.name,
        "goal":          campaign.goal,
        "form_type":     form_type,
        "company_name":  lead_form.company_name if lead_form else "",
        "company_logo":  lead_form.company_logo if lead_form else "",
        "brand_color":   lead_form.brand_color  if lead_form else "#1A73E8",
        "tagline":       lead_form.tagline       if lead_form else "",
    }


# ════════════════════════════════════════════════════
# 2. POST: Save form branding (called during campaign creation)
# Owner sets company name, logo, color, tagline
# ════════════════════════════════════════════════════
@router.post("/form/{campaign_id}/setup")
def setup_lead_form(
    campaign_id: int,
    data: LeadFormCreate,
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found!")

    form_type = get_form_type(
        campaign.sub_category or "",
        campaign.industry or ""
    )

    # Check if form already exists
    existing = db.query(LeadForm).filter(
        LeadForm.campaign_id == campaign_id
    ).first()

    if existing:
        existing.company_name = data.company_name
        existing.company_logo = data.company_logo
        existing.brand_color  = data.brand_color
        existing.tagline      = data.tagline
        existing.form_type    = form_type
        db.commit()
        db.refresh(existing)
        return {"message": "Form updated!", "form_type": form_type, "form_id": existing.id}

    new_form = LeadForm(
        campaign_id  = campaign_id,
        form_type    = form_type,
        company_name = data.company_name,
        company_logo = data.company_logo,
        brand_color  = data.brand_color,
        tagline      = data.tagline,
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    return {
        "message":   "Form created!",
        "form_type": form_type,
        "form_id":   new_form.id,
        "form_url":  f"/lead/{campaign_id}"
    }




# ════════════════════════════════════════════════════
# 4. POST: Track click (Brand Awareness + Website Traffic)
# PUBLIC endpoint — no auth needed
# ════════════════════════════════════════════════════
@router.post("/click/{campaign_id}")
def track_click(
    campaign_id: int,
    data: ClickTrackingCreate,
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found!")

    click = ClickTracking(
        campaign_id = campaign_id,
        platform    = data.platform,
        city        = data.city,
        device      = data.device,
        utm_source  = data.utm_source,
    )
    db.add(click)
    db.commit()

    # Redirect to campaign's website
    return {
        "message":  "Click tracked!",
        "redirect": campaign.name,
    }


# ════════════════════════════════════════════════════
# 5. GET: Get all submissions for a campaign
# Shown in leads dashboard
# ════════════════════════════════════════════════════
@router.get("/submissions/{campaign_id}")
def get_submissions(campaign_id: int, db: Session = Depends(get_db)):
    submissions = db.query(FormSubmission).filter(
        FormSubmission.campaign_id == campaign_id
    ).all()

    return {
        "campaign_id": campaign_id,
        "total":       len(submissions),
        "submissions": [
            {
                "id":            s.id,
                "form_type":     s.form_type,
                "full_name":     s.full_name,
                "phone":         s.phone,
                "email":         s.email,
                "location":      s.location,
                "budget_range":  s.budget_range,
                "timeline":      s.timeline,
                "requirement":   s.requirement,
                "extra_data":    json.loads(s.extra_data or "{}"),
                "platform":      s.platform,
                "quality_score": s.quality_score,
                "is_verified":   s.is_verified,
                "created_at":    str(s.created_at),
            }
            for s in submissions
        ]
    }


# ════════════════════════════════════════════════════
# 6. GET: Get click tracking for a campaign
# Shown in leads dashboard for Brand Awareness
# ════════════════════════════════════════════════════
@router.get("/clicks/{campaign_id}")
def get_clicks(campaign_id: int, db: Session = Depends(get_db)):
    clicks = db.query(ClickTracking).filter(
        ClickTracking.campaign_id == campaign_id
    ).all()

    return {
        "campaign_id": campaign_id,
        "total_clicks": len(clicks),
        "clicks": [
            {
                "id":         c.id,
                "platform":   c.platform,
                "city":       c.city,
                "device":     c.device,
                "utm_source": c.utm_source,
                "clicked_at": str(c.clicked_at),
            }
            for c in clicks
        ]
    }

@router.post("/submit/{campaign_id}")
def submit_form(
    campaign_id: int,
    data: FormSubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found!")

    form_type = get_form_type(
        campaign.sub_category or "",
        campaign.industry or ""
    )

    lead_form = db.query(LeadForm).filter(
        LeadForm.campaign_id == campaign_id
    ).first()

    quality_score = calculate_quality_score(data.dict())

    submission = FormSubmission(
        campaign_id   = campaign_id,
        form_id       = lead_form.id if lead_form else None,
        platform      = data.platform,
        utm_source    = data.utm_source,
        form_type     = form_type,
        full_name     = data.full_name,
        phone         = data.phone,
        email         = data.email,
        location      = data.location,
        budget_range  = data.budget_range,
        timeline      = data.timeline,
        requirement   = data.requirement,
        extra_data    = json.dumps(data.extra_data),
        quality_score = quality_score,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # ── Owner ko email notification bhejo (background mein, response slow na ho) ──
    owner = db.query(User).filter(User.id == campaign.user_id).first()
    print(f"DEBUG: campaign.user_id = {campaign.user_id}, owner = {owner}, owner.email = {owner.email if owner else 'N/A'}")
    if owner and owner.email:
        background_tasks.add_task(
            send_lead_notification_email,
            to_email=owner.email,
            owner_name=owner.name,
            lead_name=data.full_name,
            lead_contact=data.phone,
            campaign_name=campaign.name,
            platform=data.platform or "",
        )

    return {
        "message":       "Form submitted successfully!",
        "submission_id": submission.id,
        "quality_score": quality_score,
    }