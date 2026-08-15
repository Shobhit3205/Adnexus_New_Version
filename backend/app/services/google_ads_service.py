# ============================================================
# backend/app/services/google_ads_service.py
# Google Ads API Integration — Test + Production same code
# pip install google-ads
# ============================================================

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from datetime import datetime, timedelta
import os
from datetime import datetime
from dotenv import load_dotenv
import requests

load_dotenv()

# ─── Config ──────────────────────────────────────────────────
CUSTOMER_ID       = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
LOGIN_CUSTOMER_ID = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")

CUSTOMER_ID = CUSTOMER_ID.replace("-", "") if CUSTOMER_ID else ""
LOGIN_CUSTOMER_ID = LOGIN_CUSTOMER_ID.replace("-", "") if LOGIN_CUSTOMER_ID else ""


# ─── Client banao ────────────────────────────────────────────
def get_google_ads_client():
    try:
        import os
        yaml_path = os.path.join(os.path.dirname(__file__), '..', '..', 'google-ads.yaml')
        client = GoogleAdsClient.load_from_storage(
            path=yaml_path,
        )
        return client
    except Exception as e:
        raise Exception(f"Google Ads client banane mein error: {e}")

# ════════════════════════════════════════════════════════════
# 1. CAMPAIGN BANAO
# ════════════════════════════════════════════════════════════
def create_google_campaign(campaign_data: dict) -> dict:
    """
    campaign_data = {
        "name": "Loan Goods Q1 2026",
        "budget_amount": 10000,      # rupees mein
        "start_date": "2026-05-27",
        "end_date": "2026-06-27",
        "goal": "LEAD_GEN"           # ya "BRAND_AWARENESS"
    }
    Returns: { "campaign_id": "...", "budget_id": "...", "status": "PAUSED" }
    """
    client = get_google_ads_client()

    # ─── Step 1: Budget banao ─────────────────────────────────
    budget_service     = client.get_service("CampaignBudgetService")
    budget_operation   = client.get_type("CampaignBudgetOperation")
    budget             = budget_operation.create

    budget.name = f"{campaign_data['name']} Budget {datetime.now().strftime('%Y%m%d%H%M%S')}"
    budget.delivery_method         = client.enums.BudgetDeliveryMethodEnum.STANDARD
    budget_amount = max(float(campaign_data.get("budget_amount", 1000)), 1.0)
    budget.amount_micros = int(budget_amount * 1_000_000)

    try:
        budget_response = budget_service.mutate_campaign_budgets(
            customer_id=CUSTOMER_ID,
            operations=[budget_operation]
        )
        budget_resource_name = budget_response.results[0].resource_name
    except GoogleAdsException as ex:
        print("========== GOOGLE ADS ERROR ==========")
        print(ex)
        print("======================================")
        raise Exception(str(ex))

    # ─── Step 2: Campaign banao ───────────────────────────────
    campaign_service   = client.get_service("CampaignService")
    campaign_operation = client.get_type("CampaignOperation")
    campaign           = campaign_operation.create

    print(type(campaign))
    print(campaign)
    campaign.name                  = campaign_data["name"]
    campaign.status                = client.enums.CampaignStatusEnum.PAUSED  # TEST mein PAUSED
    campaign.campaign_budget       = budget_resource_name

    campaign.contains_eu_political_advertising = (
    client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
    )

    # Bidding strategy — goal ke hisaab se
    campaign.manual_cpc.enhanced_cpc_enabled = False

    # Search campaign
    campaign.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH

    # Dates
    start = datetime.strptime(campaign_data["start_date"], "%Y-%m-%d")
    end   = datetime.strptime(campaign_data["end_date"], "%Y-%m-%d")
    campaign.start_date_time = start.strftime("%Y-%m-%d 00:00:00")
    campaign.end_date_time   = end.strftime("%Y-%m-%d 23:59:59")

    # Network settings
    campaign.network_settings.target_google_search   = True
    campaign.network_settings.target_search_network  = True
    campaign.network_settings.target_content_network = False
    campaign.manual_cpc = client.get_type("ManualCpc")

    try:
        campaign_response = campaign_service.mutate_campaigns(
            customer_id=CUSTOMER_ID,
            operations=[campaign_operation]
        )
        campaign_resource = campaign_response.results[0].resource_name
        campaign_id = campaign_resource.split("/")[-1]

    except GoogleAdsException as ex:
        print("======== GOOGLE ADS ERROR ========")
        print(f"Request ID: {ex.request_id}")
        print(f"Status Code: {ex.error.code().name}")

        for error in ex.failure.errors:
            print("Message :", error.message)
            print("Location:", error.location)

        print("==================================")
        raise

    return {
        "campaign_id": campaign_id,
        "campaign_resource": campaign_resource,
        "budget_resource": budget_resource_name,
        "status": "PAUSED",
        "platform": "google"
    }

# ════════════════════════════════════════════════════════════
# HELPER: Daily budget ke hisaab se CPC bid nikaalo
# ════════════════════════════════════════════════════════════
def calculate_cpc_bid(daily_budget: float) -> float:
    """
    Fixed ₹50 bid ki jagah — budget ke proportion mein bid nikaalte hain,
    taaki chhoti budget pe bid bhi chhoti ho (auction mein pura din chale)
    aur badi budget pe bid competitive ho sake.

    Formula: daily_budget ka 3%, min ₹15, max ₹200 (safety cap taaki
    bhoolse bahut zyada bid na chali jaaye).
    """
    bid = daily_budget * 0.03
    return round(max(15, min(bid, 200)), 2)


# ════════════════════════════════════════════════════════════
# 2. AD GROUP BANAO
# ════════════════════════════════════════════════════════════
def create_ad_group(campaign_resource: str, ad_group_data: dict) -> dict:
    """
    ad_group_data = {
        "name": "Loan Goods - Working Capital",
        "cpc_bid": 50,     # rupees mein
        "keywords": ["working capital loan", "business loan", "machinery loan"]
    }
    Returns: { "ad_group_id": "...", "ad_group_resource": "..." }
    """
    client = get_google_ads_client()

    # ─── Ad Group banao ───────────────────────────────────────
    ag_service   = client.get_service("AdGroupService")
    ag_operation = client.get_type("AdGroupOperation")
    ag           = ag_operation.create

    ag.name                = ad_group_data["name"]
    ag.campaign            = campaign_resource
    ag.status              = client.enums.AdGroupStatusEnum.ENABLED
    ag.type_               = client.enums.AdGroupTypeEnum.SEARCH_STANDARD
    ag.cpc_bid_micros      = int(ad_group_data.get("cpc_bid", 50)) * 1_000_000

    try:
        ag_response        = ag_service.mutate_ad_groups(
            customer_id=CUSTOMER_ID,
            operations=[ag_operation]
        )
        ag_resource        = ag_response.results[0].resource_name
        ag_id              = ag_resource.split("/")[-1]
    except GoogleAdsException as ex:
        raise Exception(f"Ad Group error: {ex.error.code().name}")

    # ─── Keywords add karo ────────────────────────────────────
    keyword_service    = client.get_service("AdGroupCriterionService")
    keyword_operations = []

    for keyword_text in ad_group_data.get("keywords", []):
        kw_op              = client.get_type("AdGroupCriterionOperation")
        kw                 = kw_op.create
        kw.ad_group        = ag_resource
        kw.status          = client.enums.AdGroupCriterionStatusEnum.ENABLED
        kw.keyword.text    = keyword_text
        kw.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
        keyword_operations.append(kw_op)

    if keyword_operations:
        try:
            keyword_service.mutate_ad_group_criteria(
                customer_id=CUSTOMER_ID,
                operations=keyword_operations
            )
        except GoogleAdsException as ex:
            raise Exception(f"Keywords error: {ex.error.code().name}")

    return {
        "ad_group_id":       ag_id,
        "ad_group_resource": ag_resource,
        "keywords_added":    len(ad_group_data.get("keywords", []))
    }


# ════════════════════════════════════════════════════════════
# 3. RESPONSIVE SEARCH AD BANAO
# ════════════════════════════════════════════════════════════
def create_responsive_search_ad(ag_resource: str, ad_content: dict) -> dict:
    """
    ad_content = {
        "headlines":     ["Working Capital Loan", "Fast Business Loan", "Apply in 5 Minutes"],
        "descriptions":  ["Get ₹10L-₹5Cr instantly. Apply now.", "No collateral needed. Quick approval."],
        "final_url":     "https://yourdomain.com/apply",
        "display_url":   "yourdomain.com/loan"
    }
    Returns: { "ad_id": "..." }
    """

    print(f"DEBUG Headlines: {len(ad_content.get('headlines', []))}, Descriptions: {len(ad_content.get('descriptions', []))}")
    print(f"DEBUG Content: {ad_content}")

    client       = get_google_ads_client()
    ad_service   = client.get_service("AdGroupAdService")
    ad_operation = client.get_type("AdGroupAdOperation")
    ad_group_ad  = ad_operation.create

    ad_group_ad.ad_group = ag_resource
    ad_group_ad.status   = client.enums.AdGroupAdStatusEnum.PAUSED

    # Responsive Search Ad
    # Responsive Search Ad
    rsa = ad_group_ad.ad.responsive_search_ad

    # ── Safety net: Google ko min 3 headlines, min 2 descriptions chahiye ──
    headlines_list = list(ad_content.get("headlines", []))
    descriptions_list = list(ad_content.get("descriptions", []))

    base_headline = ad_content.get("headline") or (headlines_list[0] if headlines_list else "Apply Now")
    base_desc = ad_content.get("description") or ad_content.get("primary_text") or "Apply now for quick approval."
    cta_text = ad_content.get("cta", "Apply Now")

    # Extra headlines/descriptions isi ad ke apne text se banao — koi bahar ka text nahi
    desc_first_part = base_desc.split(".")[0].strip()[:30] or base_headline[:30]
    fallback_headlines = [
        base_headline,
        desc_first_part,
        cta_text,
    ]
    for fh in fallback_headlines:
        if len(headlines_list) >= 3:
            break
        if fh and fh not in headlines_list:
            headlines_list.append(fh)

    combined_desc = f"{base_headline}. {cta_text}."[:90]
    fallback_descriptions = [
        base_desc,
        combined_desc,
    ]
    for fd in fallback_descriptions:
        if len(descriptions_list) >= 2:
            break
        if fd and fd not in descriptions_list:
            descriptions_list.append(fd)

    ad_content["headlines"] = headlines_list
    ad_content["descriptions"] = descriptions_list
    print(f"DEBUG AFTER FALLBACK — Headlines: {len(headlines_list)}, Descriptions: {len(descriptions_list)}")
    print(f"DEBUG Headlines list: {headlines_list}")
    print(f"DEBUG Descriptions list: {descriptions_list}")

    pinned_headline_fields = [
        client.enums.ServedAssetFieldTypeEnum.HEADLINE_1,
        client.enums.ServedAssetFieldTypeEnum.HEADLINE_2,
        client.enums.ServedAssetFieldTypeEnum.HEADLINE_3,
    ]
    for i, headline_text in enumerate(ad_content["headlines"][:3]):
        headline      = client.get_type("AdTextAsset")
        headline.text = headline_text
        headline.pinned_field = pinned_headline_fields[i]
        rsa.headlines.append(headline)

    # Descriptions — sabko pin karo taaki fixed order mein hi dikhein
    pinned_desc_fields = [
        client.enums.ServedAssetFieldTypeEnum.DESCRIPTION_1,
        client.enums.ServedAssetFieldTypeEnum.DESCRIPTION_2,
    ]
    for i, desc_text in enumerate(ad_content["descriptions"][:2]):
        desc      = client.get_type("AdTextAsset")
        desc.text = desc_text
        desc.pinned_field = pinned_desc_fields[i]
        rsa.descriptions.append(desc)

    # URLs
    ad_group_ad.ad.final_urls.append(ad_content["final_url"])
    rsa.path1 = ad_content.get("display_url", "").split("/")[0]
    rsa.path2 = "/".join(ad_content.get("display_url", "").split("/")[1:]) if "/" in ad_content.get("display_url", "") else ""

    try:
        ad_response = ad_service.mutate_ad_group_ads(
            customer_id=CUSTOMER_ID,
            operations=[ad_operation]
        )
        ad_resource = ad_response.results[0].resource_name
        ad_id       = ad_resource.split("/")[-1]
    except GoogleAdsException as ex:
        raise Exception(f"Ad create error: {ex.error.code().name}")

    return {
        "ad_id":       ad_id,
        "ad_resource": ad_resource,
        "status":      "PAUSED"
    }


# ════════════════════════════════════════════════════════════
# 4. CAMPAIGN STATUS CHECK
# ════════════════════════════════════════════════════════════
def get_campaign_status(campaign_id: str) -> dict:
    """
    Google se latest campaign status fetch karo
    Returns: { "status": "PAUSED/ENABLED/REMOVED", "impressions": 0, "clicks": 0, "cost": 0 }
    """
    client          = get_google_ads_client()
    ga_service      = client.get_service("GoogleAdsService")

    query = f"""
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros
        FROM campaign
        WHERE campaign.id = {campaign_id}
    """

    try:
        response = ga_service.search(customer_id=CUSTOMER_ID, query=query)
        for row in response:
            return {
                "campaign_id": str(row.campaign.id),
                "name":        row.campaign.name,
                "status":      row.campaign.status.name,
                "impressions": row.metrics.impressions,
                "clicks":      row.metrics.clicks,
                "cost":        row.metrics.cost_micros / 1_000_000  # rupees mein
            }
    except GoogleAdsException as ex:
        raise Exception(f"Status fetch error: {ex.error.code().name}")

    return {"status": "NOT_FOUND"}


# ════════════════════════════════════════════════════════════
# 5. AGE TARGETING SET KARO
# ════════════════════════════════════════════════════════════
def set_age_targeting(ad_group_resource: str, age_min: int, age_max: int):

    client = get_google_ads_client()
    criterion_service = client.get_service("AdGroupCriterionService")

    age_ranges = []

    if age_min <= 24:
        age_ranges.append(client.enums.AgeRangeTypeEnum.AGE_RANGE_18_24)

    if age_min <= 34 and age_max >= 25:
        age_ranges.append(client.enums.AgeRangeTypeEnum.AGE_RANGE_25_34)

    if age_min <= 44 and age_max >= 35:
        age_ranges.append(client.enums.AgeRangeTypeEnum.AGE_RANGE_35_44)

    if age_min <= 54 and age_max >= 45:
        age_ranges.append(client.enums.AgeRangeTypeEnum.AGE_RANGE_45_54)

    if age_min <= 64 and age_max >= 55:
        age_ranges.append(client.enums.AgeRangeTypeEnum.AGE_RANGE_55_64)

    if age_max >= 65:
        age_ranges.append(client.enums.AgeRangeTypeEnum.AGE_RANGE_65_UP)


    operations = []
    for age_range in age_ranges:
           op = client.get_type("AdGroupCriterionOperation")
           crit = op.create
           crit.ad_group = ad_group_resource
           crit.age_range.type_ = age_range
           operations.append(op)

    if operations:
        criterion_service.mutate_ad_group_criteria(
            customer_id=CUSTOMER_ID,
            operations=operations
        )
# ════════════════════════════════════════════════════════════
# 6. LOCATION TARGETING SET KARO (NAYA)
# ════════════════════════════════════════════════════════════
def set_location_targeting(campaign_resource: str, locations: list, radius_km: float):
    """
    Google Ads mein city+radius targeting "proximity" criterion se hoti hai
    (CampaignCriterion.proximity) — ek criterion per city, radius sabke
    liye same rehta hai (jaisa frontend se aata hai).

    locations = [{"name": "Delhi", "lat": 28.6139, "lng": 77.2090}, ...]
    radius_km = 25  (frontend ka radiusKm)

    Agar locations khaali hai, function kuch nahi karta (campaign poore
    India pe hi chalega, jo Google ka account-level default hai).
    """
    if not locations:
        return

    client = get_google_ads_client()
    criterion_service = client.get_service("CampaignCriterionService")

    operations = []
    for loc in locations:
        if loc.get("lat") is None or loc.get("lng") is None:
            continue
        op   = client.get_type("CampaignCriterionOperation")
        crit = op.create
        crit.campaign = campaign_resource
        crit.proximity.radius = radius_km
        crit.proximity.radius_units = client.enums.ProximityRadiusUnitsEnum.KILOMETERS
        crit.proximity.geo_point.latitude_in_micro_degrees  = int(loc["lat"] * 1_000_000)
        crit.proximity.geo_point.longitude_in_micro_degrees = int(loc["lng"] * 1_000_000)
        operations.append(op)

    if operations:
        criterion_service.mutate_campaign_criteria(
            customer_id=CUSTOMER_ID,
            operations=operations
        )


# ════════════════════════════════════════════════════════════
# 7. MAIN FUNCTION — campaigns.py se yeh call karo
# ════════════════════════════════════════════════════════════
def submit_campaign_to_google(campaign_data: dict, ad_content_data: dict) -> dict:
    """
    Ek hi function call — poora campaign Google pe submit ho jaata hai
    campaigns.py route se ise call karo

    campaign_data mein ab "location_details" (list of {name,lat,lng}) aur
    "radius_km" bhi expect kiye jaate hain — campaigns.py router se aate hain.

    Returns: {
        "success": True,
        "google_campaign_id": "...",
        "google_ad_group_id": "...",
        "google_ad_id": "...",
        "status": "PAUSED"
    }
    """
    try:
# Step 1: Campaign banao
        campaign_result = create_google_campaign(campaign_data)

        # ── Location (city + radius) targeting — campaign level pe hi sahi hai ──
        try:
            set_location_targeting(
                campaign_result["campaign_resource"],
                campaign_data.get("location_details", []),
                campaign_data.get("radius_km", 25)
            )
        except Exception as e:
            print(f"Location targeting warning: {e}")  # non-fatal, campaign phir bhi chalega

        # Step 2: Ad group banao
        suggested_cpc = calculate_cpc_bid(campaign_data.get("budget_amount", 1000))
        
        ag_result = create_ad_group(
            campaign_result["campaign_resource"],
            {
                "name":     f"{campaign_data['name']} - Ad Group",
                "cpc_bid":  suggested_cpc,
                "keywords": campaign_data.get("keywords", ["business loan", "working capital"])
            }
        )

        # ── Age targeting ab Ad Group level pe (ad group banne ke baad) ──
        try:
            set_age_targeting(
                ag_result["ad_group_resource"],
                campaign_data.get("age_min", 18),
                campaign_data.get("age_max", 65)
            )
        except Exception as e:
            print(f"Age targeting warning: {e}")  # non-fatal, campaign phir bhi chalega

        # Step 3: Ad banao
# Step 3: Ad banao
        ad_result = create_responsive_search_ad(
            ag_result["ad_group_resource"],
            ad_content_data
        )

        # ── Image Extension add karo (agar image_url diya gaya hai) ──
        if ad_content_data.get("image_url"):
            try:
                asset_resource = upload_image_asset(
                    ad_content_data["image_url"],
                    f"{campaign_data['name']} Image {datetime.now().strftime('%Y%m%d%H%M%S')}"
                )
                add_image_extension(campaign_result["campaign_resource"], asset_resource)
            except Exception as e:
                print(f"Image extension warning: {e}")  # non-fatal, campaign phir bhi chalega

        return {
            "success":             True,
            "google_campaign_id":  campaign_result["campaign_id"],
            "google_ad_group_id":  ag_result["ad_group_id"],
            "google_ad_id":        ad_result["ad_id"],
            "status":              "PAUSED",
            "platform":            "google"
        }

    except Exception as e:
        return {
            "success": False,
            "error":   str(e),
            "platform": "google"
        }

# ════════════════════════════════════════════════════════════
# 8. INSIGHTS + STATUS — Meta ke saath consistent shape mein wrap
#    (sync_platform_stats router mein generic dicts ke liye use hote hain)
# ════════════════════════════════════════════════════════════
def get_google_campaign_insights(campaign_id: str) -> dict:
    """
    get_campaign_status() already ek hi query mein status + metrics
    laata hai — bas yahan sirf metrics wala hissa Meta jaisi shape
    (impressions, clicks, spend, reach) mein return karo.
    """
    data = get_campaign_status(campaign_id)
    return {
        "impressions": data.get("impressions", 0),
        "clicks":      data.get("clicks", 0),
        "spend":       data.get("cost", 0),
        "reach":       0,  # Google Search campaigns unique reach report nahi karte jaise Meta karta hai
    }


def get_google_campaign_status(campaign_id: str) -> dict:
    """
    Sirf status field chahiye router ke PLATFORM_STATUS_FETCHERS ke liye —
    Meta ke get_meta_campaign_status() jaisi hi shape.
    """
    data = get_campaign_status(campaign_id)
    return {"campaign_id": campaign_id, "status": data.get("status")}    


# ════════════════════════════════════════════════════════════
# 9. IMAGE EXTENSION — campaign ke saath image dikhane ke liye
# ════════════════════════════════════════════════════════════
def upload_image_asset(image_url: str, asset_name: str) -> str:
    """
    Image URL se image download karke Google Ads mein "Asset" banata hai.
    Returns: asset resource name (jaise 'customers/123/assets/456')
    """
    client = get_google_ads_client()
    asset_service = client.get_service("AssetService")

    # ── Fix: agar base64 data-URI hai (user-uploaded image), pehle
    #    Cloudinary pe upload karke real URL banao, taaki requests.get()
    #    kaam kar sake — wo base64 handle nahi kar sakta ──
    if image_url.startswith("data:image"):
        from app.services.upload_to_cloudinary import upload_base64_to_cloudinary
        image_url = upload_base64_to_cloudinary(image_url)

    image_response = requests.get(image_url, timeout=15)
    image_response.raise_for_status()

    asset_operation = client.get_type("AssetOperation")
    asset = asset_operation.create
    asset.name = asset_name
    asset.type_ = client.enums.AssetTypeEnum.IMAGE
    asset.image_asset.data = image_response.content

    response = asset_service.mutate_assets(
        customer_id=CUSTOMER_ID,
        operations=[asset_operation]
    )
    return response.results[0].resource_name


def add_image_extension(campaign_resource: str, asset_resource: str):
    """
    Uploaded image asset ko campaign ke saath link karta hai —
    isse search results mein ad ke saath chhota image thumbnail dikhta hai.
    """
    client = get_google_ads_client()
    campaign_asset_service = client.get_service("CampaignAssetService")

    op = client.get_type("CampaignAssetOperation")
    ca = op.create
    ca.campaign = campaign_resource
    ca.asset = asset_resource
    ca.field_type = client.enums.AssetFieldTypeEnum.AD_IMAGE

    campaign_asset_service.mutate_campaign_assets(
        customer_id=CUSTOMER_ID,
        operations=[op]
    )

def delete_google_campaign(campaign_resource: str) -> dict:
    """Rollback: agar dusra platform fail ho jaaye to Google campaign remove karo."""
    try:
        client = get_google_ads_client()
        campaign_service = client.get_service("CampaignService")
        from google.protobuf import field_mask_pb2

        op = client.get_type("CampaignOperation")
        op.update.resource_name = campaign_resource
        op.update.status = client.enums.CampaignStatusEnum.REMOVED
        op.update_mask.CopyFrom(field_mask_pb2.FieldMask(paths=["status"]))

        campaign_service.mutate_campaigns(customer_id=CUSTOMER_ID, operations=[op])
        return {"success": True}
    except Exception as e:
        print(f"[rollback] Google campaign remove failed: {e}")
        return {"success": False, "error": str(e)}        