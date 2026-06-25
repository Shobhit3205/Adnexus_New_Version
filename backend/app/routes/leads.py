from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Lead, Campaign, Platform
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter(tags=["leads"])


# ════════════════════════════════════════════════════
# HELPER: Generate lead form URL
# Same logic as ad_content.py — one URL per campaign
# that works on all 4 platforms (Google, FB, IG, LinkedIn)
# ════════════════════════════════════════════════════
def generate_lead_form_url(campaign_id: int) -> str:
    base_url = os.getenv("APP_BASE_URL", "https://adnexus.com")
    return f"{base_url}/lead/{campaign_id}"


# ════════════════════════════════════════════════════
# HELPER: Safe platform name
# FIX: returns "" instead of crashing if platform is
# missing or platform_id is null/invalid
# ════════════════════════════════════════════════════
def safe_platform_name(lead: Lead) -> str:
    try:
        if lead.platform and lead.platform.name:
            return lead.platform.name
        return ""
    except Exception:
        return ""


# ════════════════════════════════════════════════════
# PYDANTIC MODELS
# ════════════════════════════════════════════════════
class LeadCreate(BaseModel):
    campaign_id:    int
    platform_id:    Optional[int] = None   # FIX: optional so missing platform doesn't crash
    name:           str
    company_sector: str
    turnover:       str
    location:       str
    status:         Optional[str] = "new"

class LeadUpdate(BaseModel):
    status: str


# ════════════════════════════════════════════════════
# 1. POST: Create a new lead
# FIX: generates and returns lead_form_url
# ════════════════════════════════════════════════════
@router.post("/")
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    # Validate campaign exists
    campaign = db.query(Campaign).filter(Campaign.id == lead.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign nahi mila!")

    # FIX: validate platform only if platform_id is provided
    if lead.platform_id is not None:
        platform = db.query(Platform).filter(Platform.id == lead.platform_id).first()
        if not platform:
            raise HTTPException(status_code=404, detail="Platform nahi mila!")

    new_lead = Lead(
        campaign_id    = lead.campaign_id,
        platform_id    = lead.platform_id,  # can be None — no crash
        name           = lead.name,
        company_sector = lead.company_sector,
        turnover       = lead.turnover,
        location       = lead.location,
        status         = lead.status,
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    # Generate lead form URL for this campaign
    lead_form_url = generate_lead_form_url(lead.campaign_id)

    return {
        "message":       "Lead add ho gaya!",
        "lead_form_url": lead_form_url,   # one URL for all 4 platforms
        "lead": {
            "id":            new_lead.id,
            "name":          new_lead.name,
            "company_sector":new_lead.company_sector,
            "turnover":      new_lead.turnover,
            "location":      new_lead.location,
            "status":        new_lead.status,
            "platform_name": safe_platform_name(new_lead),  # FIX: safe, no crash
        }
    }


# ════════════════════════════════════════════════════
# 2. GET: Fetch all leads
# FIX: safe_platform_name — no crash on null platform
# ════════════════════════════════════════════════════
@router.get("/")
def get_leads(db: Session = Depends(get_db)):
    try:
        leads = db.query(Lead).all()
        return {
            "leads": [
                {
                    "id":             l.id,
                    "campaign_id":    l.campaign_id,
                    "platform_id":    l.platform_id,
                    "platform_name":  safe_platform_name(l),  # FIX: was l.platform.name — crashes if null
                    "name":           l.name,
                    "company_sector": l.company_sector,
                    "turnover":       l.turnover,
                    "location":       l.location,
                    "status":         l.status,
                    "created_at":     str(l.created_at),
                    "lead_form_url":  generate_lead_form_url(l.campaign_id),
                }
                for l in leads
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ════════════════════════════════════════════════════
# 3. GET: Fetch leads for a specific campaign
# FIX: safe_platform_name — no crash on null platform
# ════════════════════════════════════════════════════
@router.get("/campaign/{campaign_id}")
def get_campaign_leads(campaign_id: int, db: Session = Depends(get_db)):
    # Validate campaign exists
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign nahi mila!")

    leads         = db.query(Lead).filter(Lead.campaign_id == campaign_id).all()
    lead_form_url = generate_lead_form_url(campaign_id)

    return {
        "campaign_id":   campaign_id,
        "lead_form_url": lead_form_url,   # same URL for all 4 platforms
        "leads": [
            {
                "id":             l.id,
                "platform_name":  safe_platform_name(l),  # FIX: was l.platform.name — crashes if null
                "name":           l.name,
                "company_sector": l.company_sector,
                "turnover":       l.turnover,
                "location":       l.location,
                "status":         l.status,
                "created_at":     str(l.created_at),
            }
            for l in leads
        ]
    }


# ════════════════════════════════════════════════════
# 4. PUT: Update lead status
# ════════════════════════════════════════════════════
@router.put("/{lead_id}")
def update_lead_status(lead_id: int, lead_data: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead nahi mila!")

    # Validate status value
    allowed_statuses = ["new", "contacted", "qualified", "converted", "rejected"]
    if lead_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {', '.join(allowed_statuses)}"
        )

    lead.status = lead_data.status
    db.commit()
    db.refresh(lead)
    return {
        "message": "Lead status update ho gaya!",
        "status":  lead.status
    }


# ════════════════════════════════════════════════════
# 5. DELETE: Delete a lead
# ════════════════════════════════════════════════════
@router.delete("/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead nahi mila!")
    db.delete(lead)
    db.commit()
    return {"message": "Lead is deleted !"}