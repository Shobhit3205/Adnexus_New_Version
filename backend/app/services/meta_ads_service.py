# ============================================================
# backend/app/services/meta_ads_service.py
# ============================================================

from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.adcreative import AdCreative
from facebook_business.adobjects.ad import Ad
from facebook_business.exceptions import FacebookRequestError
import os
import hmac
import hashlib
import base64
from facebook_business.adobjects.adimage import AdImage
from dotenv import load_dotenv

load_dotenv()

# ─── Config ──────────────────────────────────────────────────
META_APP_ID       = os.getenv("META_APP_ID")
META_APP_SECRET   = os.getenv("META_APP_SECRET")
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
META_AD_ACCOUNT   = os.getenv("META_AD_ACCOUNT_ID")
META_PAGE_ID      = os.getenv("META_PAGE_ID")
# Optional — sirf tab chahiye jab user Instagram bhi select kare.
# Ye Instagram Business account ka ID hota hai (Page se linked).
META_INSTAGRAM_ACCOUNT_ID = os.getenv("META_INSTAGRAM_ACCOUNT_ID")

DEFAULT_LINK = "https://www.google.com"  # fallback URL

# Meta custom_locations ke liye allowed radius range (kilometers mein)
META_MIN_RADIUS_KM = 1
META_MAX_RADIUS_KM = 80


def init_meta_api():
    FacebookAdsApi.init(
        app_id=META_APP_ID,
        app_secret=META_APP_SECRET,
        access_token=META_ACCESS_TOKEN
    )
    return AdAccount(META_AD_ACCOUNT)


def create_meta_campaign(campaign_data: dict) -> dict:
    try:
        account = init_meta_api()
        objective_map = {
            "LEAD_GEN":        "OUTCOME_LEADS",
            "BRAND_AWARENESS": "OUTCOME_AWARENESS",
        }
        objective = objective_map.get(campaign_data.get("goal", "LEAD_GEN"), "OUTCOME_TRAFFIC")
        campaign = account.create_campaign(fields=[], params={
            "name":                  campaign_data["name"],
            "objective":             objective,
            "status":                "PAUSED",
            "special_ad_categories": ["FINANCIAL_PRODUCTS_SERVICES"],
            "is_adset_budget_sharing_enabled":False,
        })
        return {"campaign_id": campaign["id"], "status": "PAUSED", "platform": "meta"}
    except FacebookRequestError as e:
        raise Exception(f"Meta campaign error: {e.api_error_message()} | Body: {e.body()}")


def create_meta_ad_set(campaign_id: str, ad_set_data: dict) -> dict:
    """
    ad_set_data can now include:
      - name (str)
      - daily_budget_rupees (float) — real daily budget in INR, converted to paise here
      - interests (list of {"id": ..., "name": ...}) — from our AI audience targeting,
        resolved via Meta's Targeting Search API. Falls back to geo-only (India) if empty.
      - locations (list of {"name": ..., "lat": ..., "lng": ...}) — jo bhi cities user ne
        search/select ki hain. Agar diya gaya hai, targeting un exact cities + radius_km
        pe hogi (custom_locations). Agar khaali hai, poore India pe fallback.
      - radius_km (float) — har city ke around kitna radius (km mein)
    """
    try:
        account = init_meta_api()

        # Convert rupees to paise (Meta wants the smallest currency unit)
        daily_budget_rupees = ad_set_data.get("daily_budget_rupees", 100)
        daily_budget_paise  = max(int(daily_budget_rupees * 100), 5000)  # Meta min ~₹50/day safeguard

        # ── Geo targeting: agar cities di gayi hain toh unhi pe custom_locations
        #    (lat/lng + radius) use karo. Warna poore India pe fallback. ──
        locations = ad_set_data.get("locations", [])
        radius_km = ad_set_data.get("radius_km", 25)
        # Meta ka allowed radius range clamp karo, taaki API reject na kare
        radius_km_clamped = max(META_MIN_RADIUS_KM, min(radius_km, META_MAX_RADIUS_KM))

        if locations:
            custom_locations = [
                {
                    "latitude":      loc["lat"],
                    "longitude":     loc["lng"],
                    "radius":        radius_km_clamped,
                    "distance_unit": "kilometer",
                }
                for loc in locations
                if loc.get("lat") is not None and loc.get("lng") is not None
            ]
            geo_locations = {"custom_locations": custom_locations} if custom_locations else {"countries": ["IN"]}
        else:
            geo_locations = {"countries": ["IN"]}

        # Build targeting — geo (city+radius ya India) + age range + AI-resolved interests
        targeting = {
            "geo_locations": geo_locations,
            "age_min": ad_set_data.get("age_min", 18),
            "age_max": ad_set_data.get("age_max", 65),
        }

        interests = ad_set_data.get("interests", [])
        valid_interests = [
            {"id": i["id"], "name": i["name"]}
            for i in interests
            if i.get("id")  # only include resolved (real ID) interests
        ]
        if valid_interests:
            targeting["flexible_spec"] = [{"interests": valid_interests}]

        targeting["targeting_automation"] = {"advantage_audience": 0}

        # ── Placements: agar user ne Step 2 mein Instagram select kiya
        #    hai, tabhi Instagram bhi placements mein shaamil karo —
        #    warna sirf Facebook. (Pehle yeh hamesha Facebook-only tha,
        #    chahe Instagram select kiya ho ya nahi.) ──
        if ad_set_data.get("instagram_selected"):
            targeting["publisher_platforms"] = ["facebook", "instagram"]
        else:
            targeting["publisher_platforms"] = ["facebook"]

        # Start/end date agar diye gaye hain toh Meta ke format mein convert karo
        from datetime import datetime as dt
        adset_params = {
            "name":              ad_set_data["name"],
            "campaign_id":       campaign_id,
            "daily_budget":      daily_budget_paise,
            "billing_event":     "IMPRESSIONS",
            "optimization_goal": "REACH",
            "bid_strategy":      "LOWEST_COST_WITHOUT_CAP",
            "targeting":         targeting,
            "status":            "PAUSED"
        }
        start_date = ad_set_data.get("start_date")
        end_date   = ad_set_data.get("end_date")
        if start_date:
            adset_params["start_time"] = dt.strptime(start_date, "%Y-%m-%d").strftime("%Y-%m-%dT00:00:00+05:30")
        if end_date:
            adset_params["end_time"] = dt.strptime(end_date, "%Y-%m-%d").strftime("%Y-%m-%dT23:59:59+05:30")

        # ── FIX: pehle yahan account.create_ad_set() DO baar call ho raha tha —
        #    dusra call adset_params ko ignore karke bina dates ke dobara
        #    ad set bana raha tha, aur usi ka result final return hota tha
        #    (matlab dates + ek extra ad set dono silently drop/duplicate ho
        #    rahe the). Ab sirf EK call hai, adset_params ke saath. ──
        adset = account.create_ad_set(fields=[], params=adset_params)

        return {"adset_id": adset["id"], "status": "PAUSED", "targeting_used": targeting}
    except Exception as e:
        raise Exception(f"Meta ad set error: {str(e)}")


def create_meta_ad_creative(ad_content: dict, instagram_selected: bool = False) -> dict:
    try:
        account = init_meta_api()

        # Link empty nahi hona chahiye
        link_url = (
            ad_content.get("link_url") or
            ad_content.get("final_url") or
            ad_content.get("website_url") or
            DEFAULT_LINK
        )
        if not link_url or not link_url.strip():
            link_url = DEFAULT_LINK

        print("LINK URL =", link_url)
        print("PAGE_ID =", META_PAGE_ID)

        link_data = {
            "message":     ad_content.get("primary_text") or "Get Business Loan Today",
            "link":        link_url,
            "name":        ad_content.get("headline") or "Business Loan",
            "description": ad_content.get("description") or "Apply Now",
            "call_to_action": {
                "type":  (ad_content.get("cta") or "LEARN_MORE").upper().replace(" ", "_"),
                "value": {"link": link_url}
            }
        }

        # ── NAYA: image ko Meta ke format ke hisaab se attach karo ──
        image_result = upload_meta_image(account, ad_content.get("image_url"))
        if image_result:
            if image_result["type"] == "url":
                link_data["picture"] = image_result["value"]
            elif image_result["type"] == "hash":
                link_data["image_hash"] = image_result["value"]

        object_story_spec = {
            "page_id": META_PAGE_ID,
            "link_data": link_data
        }
        # ── NAYA: Instagram select tha aur account ID configured hai
        #    toh hi instagram_actor_id bhejo — warna Meta creative
        #    Facebook Page se hi chalega. ──
        if instagram_selected and META_INSTAGRAM_ACCOUNT_ID:
            object_story_spec["instagram_actor_id"] = META_INSTAGRAM_ACCOUNT_ID

        creative = account.create_ad_creative(fields=[], params={
            "name": ad_content.get("name", "AdNexus Creative"),
            "object_story_spec": object_story_spec
        })
        return {"creative_id": creative["id"]}

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise Exception(f"Meta creative error: {str(e)}")


def create_meta_ad(adset_id: str, creative_id: str, ad_name: str) -> dict:
    try:
        account = init_meta_api()
        ad = account.create_ad(fields=[], params={
            Ad.Field.name:     ad_name,
            Ad.Field.adset_id: adset_id,
            Ad.Field.creative: {"creative_id": creative_id},
            Ad.Field.status:   Ad.Status.paused,
        })
        return {"ad_id": ad["id"], "status": "PAUSED"}
    except FacebookRequestError as e:
        raise Exception(f"Meta ad error: {e.api_error_message()} | Body: {e.body()}")


def get_meta_campaign_status(campaign_id: str) -> dict:
    try:
        init_meta_api()
        campaign = Campaign(campaign_id)
        data = campaign.api_get(fields=[Campaign.Field.name, Campaign.Field.status])
        return {"campaign_id": campaign_id, "status": data.get("status")}
    except FacebookRequestError as e:
        raise Exception(f"Meta status error: {e.api_error_message()}")


def submit_campaign_to_meta(campaign_data: dict, ad_content_data: dict, audience_targeting: dict = None) -> dict:
    """
    audience_targeting: optional dict, expected shape (from our meta_mapper.map_to_meta output):
        {"interests": [{"id": "...", "name": "..."}, ...], ...}
    If not provided, ad set falls back to India-wide geo targeting only.

    campaign_data mein ab "location_details" (list of {name,lat,lng}) aur
    "radius_km" bhi expect kiye jaate hain — campaigns.py router se aate hain.
    """
    try:
        if not ad_content_data.get("link_url") and not ad_content_data.get("final_url"):
            ad_content_data["link_url"] = DEFAULT_LINK

        campaign_result = create_meta_campaign(campaign_data)
        print("STEP 1 CAMPAIGN =", campaign_result)

        interests = (audience_targeting or {}).get("interests", [])
        adset_result = create_meta_ad_set(
            campaign_result["campaign_id"],
            {
                "name": f"{campaign_data['name']} - Ad Set",
                "daily_budget_rupees": campaign_data.get("budget_amount", 100),
                "interests": interests,
                "age_min": campaign_data.get("age_min", 18),
                "age_max": campaign_data.get("age_max", 65),
                "start_date": campaign_data.get("start_date"),
                "end_date": campaign_data.get("end_date"),
                # ── NAYA: location_details + radius_km yahan se pass ho rahe hain ──
                "locations": campaign_data.get("location_details", []),
                "radius_km": campaign_data.get("radius_km", 25),
                # ── NAYA: Instagram select tha ya nahi, wahi campaigns.py se aata hai ──
                "instagram_selected": campaign_data.get("instagram_selected", False),
            }
        )
        print("STEP 2 ADSET =", adset_result)

        creative_result = create_meta_ad_creative(
            ad_content_data,
            instagram_selected=campaign_data.get("instagram_selected", False),
        )
        print("STEP 3 CREATIVE =", creative_result)

        ad_result = create_meta_ad(
            adset_result["adset_id"],
            creative_result["creative_id"],
            f"{campaign_data['name']} - Ad"
        )
        print("STEP 4 AD =", ad_result)

        return {
            "success":          True,
            "meta_campaign_id": campaign_result["campaign_id"],
            "meta_adset_id":    adset_result["adset_id"],
            "meta_creative_id": creative_result["creative_id"],
            "status":           "PAUSED",
            "platform":         "meta",
            "targeting_used":   adset_result.get("targeting_used"),
            "meta_ad_id": ad_result["ad_id"],
        }

    except Exception as e:
        print("META ERROR =", str(e))
        return {"success": False, "error": str(e), "platform": "meta"}


def get_meta_campaign_insights(campaign_id: str) -> dict:
    """
    Meta Insights API se ek campaign ka performance data laata hai:
    impressions, clicks, spend, reach, ctr, cpc, cpm
    """
    try:
        init_meta_api()
        campaign = Campaign(campaign_id)
        insights = campaign.get_insights(fields=[
            "impressions", "clicks", "spend", "reach", "ctr", "cpc", "cpm"
        ], params={"date_preset": "maximum"})

        if insights:
            data = insights[0]
            return {
                "impressions": int(data.get("impressions", 0)),
                "clicks":      int(data.get("clicks", 0)),
                "spend":       float(data.get("spend", 0)),
                "reach":       int(data.get("reach", 0)),
                "ctr":         float(data.get("ctr", 0)),
                "cpc":         float(data.get("cpc", 0)),
                "cpm":         float(data.get("cpm", 0)),
            }
        return {"impressions": 0, "clicks": 0, "spend": 0, "reach": 0, "ctr": 0, "cpc": 0, "cpm": 0}
    except FacebookRequestError as e:
        raise Exception(f"Meta insights error: {e.api_error_message()}")
    except Exception as e:
        raise Exception(f"Meta insights error: {str(e)}")

def upload_meta_image(account, image_url_or_data: str):
    """
    Meta ke liye image ready karta hai:
    - Agar image_url_or_data ek public http(s) URL hai (template/AI se aayi),
      seedha wahi return karta hai — 'picture' field mein use hoga.
    - Agar yeh base64 data-URI hai (user ne khud upload kiya), Meta ke
      Ad Images API se upload karke ek 'hash' return karta hai —
      'image_hash' field mein use hoga.
    """
    if not image_url_or_data:
        return None

    if image_url_or_data.startswith("http://") or image_url_or_data.startswith("https://"):
        return {"type": "url", "value": image_url_or_data}

    if image_url_or_data.startswith("data:image"):
        try:
            header, b64data = image_url_or_data.split(",", 1)
        except ValueError:
            return None
        try:
            image = AdImage(parent_id=account.get_id_assured())
            image[AdImage.Field.bytes] = b64data
            image.remote_create()
            return {"type": "hash", "value": image[AdImage.Field.hash]}
        except Exception as e:
            print(f"Meta image upload warning: {e}")
            return None

    return None
