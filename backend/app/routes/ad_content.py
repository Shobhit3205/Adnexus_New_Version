from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import AdContent, Campaign, Platform
from pydantic import BaseModel
from typing import Optional, List
import os, json
import httpx

# ════════════════════════════════════════════════════
# SINGLE ROUTER — was defined twice before (BUG FIXED)
# ════════════════════════════════════════════════════
router = APIRouter()


# ── Platform validation rules ──
# Each platform has its own character limits.
# If ad content exceeds these, the platform will reject the ad.
PLATFORM_RULES = {
    "Google Ads": {
        "headline_max":    30,
        "description_max": 90,
        "image_width":     1200,
        "image_height":    628,
    },
    "Facebook": {
        "headline_max":    40,
        "description_max": 125,
        "image_width":     1200,
        "image_height":    1200,
    },
    "Instagram": {
        "headline_max":    40,
        "description_max": 125,
        "image_width":     1080,
        "image_height":    1080,
    },
    "LinkedIn": {
        "headline_max":    70,
        "description_max": 150,
        "image_width":     1200,
        "image_height":    627,
    },
}

# ── Platform name map from platform_id ──
PLATFORM_ID_NAME = {
    1: "Google Ads",
    2: "LinkedIn",
    3: "Facebook",
    4: "Instagram",
}


# ════════════════════════════════════════════════════
# HELPER: Validate ad content against platform rules
# Returns validation result + score for one platform
# ════════════════════════════════════════════════════
def validate_for_platform(platform_name: str, headline: str, description: str) -> dict:
    rules = PLATFORM_RULES.get(platform_name)
    if not rules:
        return {"compatible": True, "issues": [], "score": 100}

    issues = []

    # Check headline length
    if len(headline) > rules["headline_max"]:
        issues.append(
            f"Headline too long: {len(headline)} chars (max {rules['headline_max']})"
        )

    # Check description length
    if len(description) > rules["description_max"]:
        issues.append(
            f"Description too long: {len(description)} chars (max {rules['description_max']})"
        )

    # Check headline is not empty
    if not headline.strip():
        issues.append("Headline is empty")

    # Check description is not empty
    if not description.strip():
        issues.append("Description is empty")

    compatible = len(issues) == 0

    # Score: start at 100, deduct 20 per issue
    score = max(0, 100 - (len(issues) * 20))

    return {
        "compatible": compatible,
        "issues":     issues,
        "score":      score,
    }


# ════════════════════════════════════════════════════
# HELPER: Calculate overall creative health score
# Averages scores across all 4 platforms
# ════════════════════════════════════════════════════
def calculate_health_score(headline: str, description: str) -> dict:
    results     = {}
    total_score = 0
    count       = 0

    for platform_name in PLATFORM_RULES:
        result = validate_for_platform(platform_name, headline, description)
        results[platform_name] = result
        total_score += result["score"]
        count += 1

    overall_score = round(total_score / count) if count > 0 else 0

    return {
        "platforms":     results,
        "overall_score": overall_score,
    }


# ════════════════════════════════════════════════════
# HELPER: Generate lead form URL for a campaign
# One URL that works on all 4 platforms
# ════════════════════════════════════════════════════
def generate_lead_form_url(campaign_id: int) -> str:
    base_url = os.getenv("APP_BASE_URL", "https://adnexus.com")
    return f"{base_url}/lead/{campaign_id}"


# ════════════════════════════════════════════════════
# HELPER: Groq API call
# ════════════════════════════════════════════════════
async def call_gemini(prompt: str, max_tokens: int = 2000) -> str:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY set nahi hai!")

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type":  "application/json",
            },
            json={
                "model":      "llama-3.3-70b-versatile",
                "messages":   [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": 0.7,
            }
        )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Groq API error: {response.text}")

    data = response.json()
    text = data["choices"][0]["message"]["content"]
    text = text.replace("```json", "").replace("```", "").strip()
    return text


# ════════════════════════════════════════════════════
# HELPER: Unsplash image fetch
# ════════════════════════════════════════════════════
async def get_unsplash_image(query: str) -> str:
    import time
    clean_query = query.strip().replace(" ", ",")[:60]
    seed        = int(time.time())
    source_url  = f"https://source.unsplash.com/800x500/?{clean_query}&sig={seed}"

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp      = await client.get(source_url)
            final_url = str(resp.url)
            if "images.unsplash.com" in final_url or "plus.unsplash.com" in final_url:
                return final_url
            raise ValueError("Unexpected redirect destination")
    except Exception:
        fallback_map = {
            "business finance":   "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
            "savings investment": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
            "technology":         "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
            "logistics":          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
            "default":            "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
        }
        for key, url in fallback_map.items():
            if key in query:
                return url
        return fallback_map["default"]


# ════════════════════════════════════════════════════
# HELPER: Pick Unsplash keyword from business niche
# ════════════════════════════════════════════════════
def niche_to_image_query(business_niche: str, goal: str) -> str:
    niche_lower  = business_niche.lower()
    keyword_map  = [
        (["loan", "lending", "credit", "working capital", "msme", "nbfc"], "business finance office"),
        (["fixed deposit", "fd", "investment", "returns", "saving"],        "savings investment money"),
        (["invoice", "discounting", "factoring"],                           "invoice business documents"),
        (["insurance"],                                                      "insurance protection business"),
        (["saas", "software", "automation", "tech", "platform"],            "technology software business"),
        (["logistics", "transport", "fleet", "supply chain"],               "logistics transport trucks"),
        (["machinery", "equipment", "manufacturing"],                        "factory machinery industry"),
        (["real estate", "property", "construction"],                        "real estate building office"),
        (["healthcare", "pharma", "medical"],                                "healthcare medical office"),
        (["education", "training", "edtech"],                                "education learning office"),
        (["partner", "partnership", "grow", "payout"],                      "business partnership team"),
        (["b2b", "enterprise", "corporate"],                                 "corporate business meeting"),
    ]
    for keywords, image_query in keyword_map:
        if any(kw in niche_lower for kw in keywords):
            return image_query
    goal_lower = (goal or "").lower()
    if "lead" in goal_lower:   return "business growth success"
    if "brand" in goal_lower:  return "brand corporate professional"
    return "business india office professional"


# ════════════════════════════════════════════════════
# PYDANTIC MODELS
# ════════════════════════════════════════════════════
class AdContentCreate(BaseModel):
    platform_id:     int
    headline:        str
    description:     str
    image_url:       Optional[str] = ""
    cta_button:      Optional[str] = "Apply Now"
    target_age_min:  Optional[int] = 25
    target_age_max:  Optional[int] = 55
    target_audience: Optional[str] = ""

class AiGenerateRequest(BaseModel):
    campaign_name:  Optional[str]  = "B2B Campaign"
    business_niche: str
    goal:           Optional[str]  = "Lead Gen"
    budget:         Optional[str]  = ""
    platforms:      List[str]

class AiGenerateResponse(BaseModel):
    platforms:  dict
    image_url:  Optional[str] = None

class LocationReachRequest(BaseModel):
    platforms:      List[str]
    daily_budget:   float
    duration_days:  int
    business_niche: str
    goal:           Optional[str]  = "Lead Gen"
    cities:         List[str]

class LocationReachResponse(BaseModel):
    cities:        dict
    total_summary: dict
    best_city:     str
    strategy_tip:  str


# ════════════════════════════════════════════════════
# ROUTE 1 — POST: Save ad content for a campaign
# Also runs validation + health score + lead form URL
# ════════════════════════════════════════════════════
@router.post("/{campaign_id}/ad-content")
def create_ad_content(
    campaign_id: int,
    content: AdContentCreate,
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign nahi mila!")

    # ── Get platform name for validation ──
    platform_name = PLATFORM_ID_NAME.get(content.platform_id, "")

    # ── Validate against this platform's rules ──
    validation = validate_for_platform(
        platform_name,
        content.headline,
        content.description
    )

    # ── Calculate overall health score across all platforms ──
    health = calculate_health_score(content.headline, content.description)

    # ── Generate lead form URL (one URL for all platforms) ──
    lead_form_url = generate_lead_form_url(campaign_id)

    # ── Get image dimensions from platform rules ──
    rules        = PLATFORM_RULES.get(platform_name, {})
    image_width  = rules.get("image_width",  1200)
    image_height = rules.get("image_height", 1200)

    # ── Check if ad content already exists for this platform ──
    existing = db.query(AdContent).filter(
        AdContent.campaign_id == campaign_id,
        AdContent.platform_id == content.platform_id
    ).first()

    if existing:
        # Update existing record
        existing.headline             = content.headline
        existing.description          = content.description
        existing.image_url            = content.image_url
        existing.cta_button           = content.cta_button
        existing.target_age_min       = content.target_age_min
        existing.target_age_max       = content.target_age_max
        existing.target_audience      = content.target_audience
        existing.image_width          = image_width
        existing.image_height         = image_height
        existing.creative_score       = health["overall_score"]
        existing.platform_validation  = json.dumps(health["platforms"])
        existing.lead_form_url        = lead_form_url
        db.commit()
        db.refresh(existing)
        ad = existing
    else:
        # Create new record
        ad = AdContent(
            campaign_id         = campaign_id,
            platform_id         = content.platform_id,
            headline            = content.headline,
            description         = content.description,
            image_url           = content.image_url,
            cta_button          = content.cta_button,
            target_age_min      = content.target_age_min,
            target_age_max      = content.target_age_max,
            target_audience     = content.target_audience,
            image_width         = image_width,
            image_height        = image_height,
            creative_score      = health["overall_score"],
            platform_validation = json.dumps(health["platforms"]),
            lead_form_url       = lead_form_url,
        )
        db.add(ad)
        db.commit()
        db.refresh(ad)

    return {
        "message":       "Ad content save ho gaya!",
        "lead_form_url": lead_form_url,
        "validation": {
            "platform":   platform_name,
            "compatible": validation["compatible"],
            "issues":     validation["issues"],
        },
        "creative_health": {
            "overall_score": health["overall_score"],
            "platforms": {
                name: {
                    "compatible": data["compatible"],
                    "issues":     data["issues"],
                    "score":      data["score"],
                }
                for name, data in health["platforms"].items()
            },
        },
        "ad_content": {
            "id":          ad.id,
            "campaign_id": ad.campaign_id,
            "platform_id": ad.platform_id,
            "headline":    ad.headline,
            "description": ad.description,
            "cta_button":  ad.cta_button,
        },
    }


# ════════════════════════════════════════════════════
# ROUTE 2 — GET: Fetch all ad content for a campaign
# ════════════════════════════════════════════════════
@router.get("/{campaign_id}/ad-content")
def get_ad_contents(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign nahi mila!")

    ads = db.query(AdContent).filter(AdContent.campaign_id == campaign_id).all()

    return {
        "ad_contents": [
            {
                "id":                 a.id,
                "platform_id":        a.platform_id,
                "platform_name":      a.platform.name if a.platform else "",
                "headline":           a.headline,
                "description":        a.description,
                "image_url":          a.image_url,
                "cta_button":         a.cta_button,
                "target_audience":    a.target_audience,
                "target_age_min":     a.target_age_min,
                "target_age_max":     a.target_age_max,
                "image_width":        a.image_width,
                "image_height":       a.image_height,
                "creative_score":     a.creative_score,
                "platform_validation":json.loads(a.platform_validation) if a.platform_validation else {},
                "lead_form_url":      a.lead_form_url,
            }
            for a in ads
        ]
    }


# ════════════════════════════════════════════════════
# ROUTE 3 — PUT: Update existing ad content
# Re-runs validation and health score on update
# ════════════════════════════════════════════════════
@router.put("/{campaign_id}/ad-content/{ad_id}")
def update_ad_content(
    campaign_id: int,
    ad_id:       int,
    content:     AdContentCreate,
    db:          Session = Depends(get_db)
):
    ad = db.query(AdContent).filter(
        AdContent.id          == ad_id,
        AdContent.campaign_id == campaign_id
    ).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad content nahi mila!")

    # Re-run validation on updated content
    platform_name = PLATFORM_ID_NAME.get(content.platform_id, "")
    validation    = validate_for_platform(platform_name, content.headline, content.description)
    health        = calculate_health_score(content.headline, content.description)
    lead_form_url = generate_lead_form_url(campaign_id)
    rules         = PLATFORM_RULES.get(platform_name, {})

    ad.headline            = content.headline
    ad.description         = content.description
    ad.image_url           = content.image_url
    ad.cta_button          = content.cta_button
    ad.target_age_min      = content.target_age_min
    ad.target_age_max      = content.target_age_max
    ad.target_audience     = content.target_audience
    ad.image_width         = rules.get("image_width",  1200)
    ad.image_height        = rules.get("image_height", 1200)
    ad.creative_score      = health["overall_score"]
    ad.platform_validation = json.dumps(health["platforms"])
    ad.lead_form_url       = lead_form_url

    db.commit()
    db.refresh(ad)

    return {
        "message": "Ad content update ho gaya!",
        "validation": {
            "platform":   platform_name,
            "compatible": validation["compatible"],
            "issues":     validation["issues"],
        },
        "creative_health": {
            "overall_score": health["overall_score"],
        },
    }


# ════════════════════════════════════════════════════
# ROUTE 4 — GET: Validate ad content for all platforms
# Call this to check if an ad is ready to post
# ════════════════════════════════════════════════════
@router.get("/{campaign_id}/ad-content/{ad_id}/validate")
def validate_ad_content(
    campaign_id: int,
    ad_id:       int,
    db:          Session = Depends(get_db)
):
    ad = db.query(AdContent).filter(
        AdContent.id          == ad_id,
        AdContent.campaign_id == campaign_id
    ).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad content nahi mila!")

    health = calculate_health_score(ad.headline or "", ad.description or "")

    # Build the response exactly like the PDF showed:
    # ✓ Google Compatible
    # ✓ Facebook Compatible
    # Score: 96/100
    platform_status = {}
    for platform_name, data in health["platforms"].items():
        platform_status[platform_name] = {
            "compatible": data["compatible"],
            "score":      data["score"],
            "issues":     data["issues"],
            "label":      "✓ Compatible" if data["compatible"] else "✗ Needs Fix",
        }

    return {
        "campaign_id":      campaign_id,
        "ad_id":            ad_id,
        "lead_form_url":    ad.lead_form_url,
        "overall_score":    health["overall_score"],
        "platform_status":  platform_status,
        "ready_to_publish": health["overall_score"] >= 80,
    }


# ════════════════════════════════════════════════════
# ROUTE 5 — POST: AI Generate ad content
# ════════════════════════════════════════════════════
@router.post("/ai-generate")
async def ai_generate_ad_content(request: AiGenerateRequest):
    platform_names = ", ".join(request.platforms)

    prompt = f"""You are an expert B2B ad copywriter for Indian businesses.
Generate highly effective ad content for multiple platforms.
Return ONLY a valid JSON object, no markdown, no explanation, no extra text.

IMPORTANT CHARACTER LIMITS — strictly follow these or the ad will be rejected:
- Google Ads: headline max 30 chars, description max 90 chars
- Facebook: headline max 40 chars, description max 125 chars
- Instagram: headline max 40 chars, description max 125 chars
- LinkedIn: headline max 70 chars, description max 150 chars

Format:
{{
  "platforms": {{
    "Google Ads": {{
      "headline": "...",
      "description": "...",
      "cta_button": "Apply Now",
      "target_audience": "...",
      "target_age_min": 28,
      "target_age_max": 55
    }},
    "LinkedIn": {{
      "headline": "...",
      "description": "...",
      "cta_button": "Learn More",
      "target_audience": "...",
      "target_age_min": 28,
      "target_age_max": 55
    }}
  }}
}}

Rules:
- cta_button must be exactly one of: Apply Now, Learn More, Contact Us, Get Started, Book a Call, Download Now
- Make content platform-specific (Google Ads = search intent, LinkedIn = professional tone, Facebook/Instagram = engaging & visual)
- Only generate for these platforms: {platform_names}
- Use Indian context (₹, crore, lakh where relevant)
- STRICTLY respect character limits above

Campaign: {request.campaign_name}
Business / Product: {request.business_niche}
Goal: {request.goal}
Daily Budget: ₹{request.budget}/day
Platforms: {platform_names}

Return ONLY the JSON, nothing else."""

    try:
        import asyncio
        image_query         = niche_to_image_query(request.business_niche, request.goal or "")
        text_task           = call_gemini(prompt, max_tokens=1500)
        image_task          = get_unsplash_image(image_query)
        text, image_url     = await asyncio.gather(text_task, image_task)
        parsed              = json.loads(text)

        # ── Validate AI-generated content against platform rules ──
        # Warn if AI itself violated the limits
        platforms_data = parsed.get("platforms", {})
        for pname, pdata in platforms_data.items():
            rules = PLATFORM_RULES.get(pname, {})
            headline    = pdata.get("headline", "")
            description = pdata.get("description", "")
            # Auto-truncate if AI exceeded limits (safety net)
            if rules.get("headline_max") and len(headline) > rules["headline_max"]:
                pdata["headline"] = headline[:rules["headline_max"]]
            if rules.get("description_max") and len(description) > rules["description_max"]:
                pdata["description"] = description[:rules["description_max"]]

        return {
            "platforms": platforms_data,
            "image_url": image_url,
        }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI response parse nahi hua: {str(e)}")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI request timeout. Dobara try karo.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


# ════════════════════════════════════════════════════
# ROUTE 6 — POST: Location reach estimation
# ════════════════════════════════════════════════════
@router.post("/location-reach")
async def estimate_location_reach(request: LocationReachRequest):
    total_budget   = request.daily_budget * request.duration_days
    platform_names = ", ".join(request.platforms)
    cities_list    = ", ".join(request.cities)

    prompt = f"""You are an expert digital advertising analyst specializing in Indian B2B markets.
Given campaign details, estimate realistic audience reach for each Indian city.
Return ONLY a valid JSON object, no markdown, no explanation, no extra text.

Format:
{{
  "cities": {{
    "Delhi NCR": {{
      "city": "Delhi NCR",
      "total_audience": "45L",
      "estimated_impressions": "1.2L",
      "estimated_reach": "38,000",
      "estimated_leads": "180",
      "cpm": "₹85",
      "cpc": "₹12",
      "competition_level": "High",
      "recommendation": "Best for B2B finance leads due to large corporate density"
    }}
  }},
  "total_summary": {{
    "total_reach": "1.1L",
    "total_impressions": "3.5L",
    "total_leads": "420",
    "avg_cpm": "₹78",
    "total_budget": "₹45,000"
  }},
  "best_city": "Delhi NCR",
  "strategy_tip": "Focus 60% budget on Delhi NCR + Mumbai for best B2B lead quality"
}}

Rules:
- Use Indian number format (L = lakh, Cr = crore, K = thousand)
- Base estimates on actual Indian digital ad market CPMs: Google ₹60-120, LinkedIn ₹150-300, Facebook ₹40-90
- LinkedIn reach is smaller but higher B2B quality
- City business density order: Mumbai > Delhi > Bangalore > Hyderabad > Chennai > Pune
- competition_level must be one of: Low, Medium, High, Very High
- Be realistic, not overly optimistic
- Generate data for ONLY these cities: {cities_list}

Campaign Details:
Platforms: {platform_names}
Business/Product: {request.business_niche}
Goal: {request.goal}
Daily Budget: ₹{request.daily_budget:,.0f}/day
Duration: {request.duration_days} days
Total Budget: ₹{total_budget:,.0f}
Cities: {cities_list}

Return ONLY the JSON object, nothing else."""

    try:
        text   = await call_gemini(prompt, max_tokens=2000)
        parsed = json.loads(text)
        return LocationReachResponse(
            cities        = parsed.get("cities", {}),
            total_summary = parsed.get("total_summary", {}),
            best_city     = parsed.get("best_city", ""),
            strategy_tip  = parsed.get("strategy_tip", ""),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI response parse nahi hua: {str(e)}")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI request timeout. Dobara try karo.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location reach estimation failed: {str(e)}")