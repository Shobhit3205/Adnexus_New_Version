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
from dotenv import load_dotenv

load_dotenv()

# ─── Config ──────────────────────────────────────────────────
META_APP_ID       = os.getenv("META_APP_ID")
META_APP_SECRET   = os.getenv("META_APP_SECRET")
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
META_AD_ACCOUNT   = os.getenv("META_AD_ACCOUNT_ID")
META_PAGE_ID      = os.getenv("META_PAGE_ID")

DEFAULT_LINK = "https://www.google.com"  # fallback URL


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
            "special_ad_categories": [],
            "is_adset_budget_sharing_enabled":False,
        })
        return {"campaign_id": campaign["id"], "status": "PAUSED", "platform": "meta"}
    except FacebookRequestError as e:
     raise Exception(f"Meta campaign error: {e.api_error_message()} | Body: {e.body()}")

def create_meta_ad_set(campaign_id: str, ad_set_data: dict) -> dict:
    try:
        account = init_meta_api()
        adset = account.create_ad_set(fields=[], params={
            "name":              ad_set_data["name"],
            "campaign_id":       campaign_id,
            "daily_budget":      10000,
            "billing_event":     "IMPRESSIONS",
            "optimization_goal": "REACH",
            "bid_strategy":      "LOWEST_COST_WITHOUT_CAP",
            "targeting":         {"geo_locations": {"countries": ["IN"]}},
            "status":            "PAUSED"
        })
        return {"adset_id": adset["id"], "status": "PAUSED"}
    except Exception as e:
        raise Exception(f"Meta ad set error: {str(e)}")


def create_meta_ad_creative(ad_content: dict) -> dict:
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

        creative = account.create_ad_creative(fields=[], params={
            "name": ad_content.get("name", "AdNexus Creative"),
            "object_story_spec": {
                "page_id": META_PAGE_ID,
                "link_data": {
                    "message":     ad_content.get("primary_text") or "Get Business Loan Today",
                    "link":        link_url,
                    "name":        ad_content.get("headline") or "Business Loan",
                    "description": ad_content.get("description") or "Apply Now",
                    "call_to_action": {
                        "type":  (ad_content.get("cta") or "LEARN_MORE").upper().replace(" ", "_"),
                        "value": {"link": link_url}
                    }
                }
            }
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


def submit_campaign_to_meta(campaign_data: dict, ad_content_data: dict) -> dict:
    try:
        # Default link add karo agar missing hai
        if not ad_content_data.get("link_url") and not ad_content_data.get("final_url"):
            ad_content_data["link_url"] = DEFAULT_LINK

        campaign_result = create_meta_campaign(campaign_data)
        print("STEP 1 CAMPAIGN =", campaign_result)

        adset_result = create_meta_ad_set(
            campaign_result["campaign_id"],
            {"name": f"{campaign_data['name']} - Ad Set"}
        )
        print("STEP 2 ADSET =", adset_result)

        creative_result = create_meta_ad_creative(ad_content_data)
        print("STEP 3 CREATIVE =", creative_result)

        # ad_result = create_meta_ad(
        #     adset_result["adset_id"],
        #     creative_result["creative_id"],
        #     f"{campaign_data['name']} - Ad"
        # )
        # print("STEP 4 AD =", ad_result)

        return {
            "success":          True,
            "meta_campaign_id": campaign_result["campaign_id"],
            "meta_adset_id":    adset_result["adset_id"],
            "meta_creative_id": creative_result["creative_id"],
            "meta_ad_id":       "pending_payment_method",
            "status":           "PAUSED",
            "platform":         "meta"
        }

    except Exception as e:
        print("META ERROR =", str(e))
        return {"success": False, "error": str(e), "platform": "meta"}