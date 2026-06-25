# ============================================================
# backend/app/services/google_ads_service.py
# Google Ads API Integration — Test + Production same code
# pip install google-ads
# ============================================================

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# ─── Config ──────────────────────────────────────────────────
CUSTOMER_ID       = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
LOGIN_CUSTOMER_ID = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")

# Yeh add karo CUSTOMER_ID ke baad:
CUSTOMER_ID = CUSTOMER_ID.replace("-", "") if CUSTOMER_ID else ""
LOGIN_CUSTOMER_ID = LOGIN_CUSTOMER_ID.replace("-", "") if LOGIN_CUSTOMER_ID else ""

# print("CUSTOMER_ID =", CUSTOMER_ID)
# print("LOGIN_CUSTOMER_ID =", LOGIN_CUSTOMER_ID)


# ─── Client banao ────────────────────────────────────────────
def get_google_ads_client():
    try:
        import os
        yaml_path = os.path.join(os.path.dirname(__file__), '..', '..', 'google-ads.yaml')
        client = GoogleAdsClient.load_from_storage(
            path=yaml_path,
              # ← version explicitly do
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

    budget.name                    = f"{campaign_data['name']} Budget"
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
        raise Exception(f"Budget create error: {ex.error.code().name}")

    # ─── Step 2: Campaign banao ───────────────────────────────
    campaign_service   = client.get_service("CampaignService")
    campaign_operation = client.get_type("CampaignOperation")
    campaign           = campaign_operation.create

    campaign.name                  = campaign_data["name"]
    campaign.status                = client.enums.CampaignStatusEnum.PAUSED  # TEST mein PAUSED
    campaign.campaign_budget       = budget_resource_name

    # Bidding strategy — goal ke hisaab se
    if campaign_data.get("goal") == "LEAD_GEN":
        campaign.target_cpa.target_cpa_micros = 500_000_000  # ₹500 target CPA
    else:
        campaign.maximize_conversions.target_cpa_micros = 0

    # Search campaign
    campaign.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH

    # Dates
    start = datetime.strptime(campaign_data["start_date"], "%Y-%m-%d")
    end   = datetime.strptime(campaign_data["end_date"],   "%Y-%m-%d")
    campaign.start_date = start.strftime("%Y%m%d")
    campaign.end_date   = end.strftime("%Y%m%d")

    # Network settings
    campaign.network_settings.target_google_search   = True
    campaign.network_settings.target_search_network  = True
    campaign.network_settings.target_content_network = False

    try:
        campaign_response = campaign_service.mutate_campaigns(
            customer_id=CUSTOMER_ID,
            operations=[campaign_operation]
        )
        campaign_resource = campaign_response.results[0].resource_name
        campaign_id       = campaign_resource.split("/")[-1]
    except GoogleAdsException as ex:
        raise Exception(f"Campaign create error: {ex.error.code().name}")

    return {
        "campaign_id":       campaign_id,
        "campaign_resource": campaign_resource,
        "budget_resource":   budget_resource_name,
        "status":            "PAUSED",
        "platform":          "google"
    }


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
    client       = get_google_ads_client()
    ad_service   = client.get_service("AdGroupAdService")
    ad_operation = client.get_type("AdGroupAdOperation")
    ad_group_ad  = ad_operation.create

    ad_group_ad.ad_group = ag_resource
    ad_group_ad.status   = client.enums.AdGroupAdStatusEnum.PAUSED

    # Responsive Search Ad
    rsa = ad_group_ad.ad.responsive_search_ad

    # Headlines — min 3, max 15
    for i, headline_text in enumerate(ad_content["headlines"][:15]):
        headline      = client.get_type("AdTextAsset")
        headline.text = headline_text
        if i < 3:
            headline.pinned_field = client.enums.ServedAssetFieldTypeEnum.HEADLINE_1 if i == 0 else \
                                    client.enums.ServedAssetFieldTypeEnum.HEADLINE_2 if i == 1 else \
                                    client.enums.ServedAssetFieldTypeEnum.HEADLINE_3
        rsa.headlines.append(headline)

    # Descriptions — min 2, max 4
    for desc_text in ad_content["descriptions"][:4]:
        desc      = client.get_type("AdTextAsset")
        desc.text = desc_text
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
# 5. MAIN FUNCTION — campaigns.py se yeh call karo
# ════════════════════════════════════════════════════════════
def submit_campaign_to_google(campaign_data: dict, ad_content_data: dict) -> dict:
    """
    Ek hi function call — poora campaign Google pe submit ho jaata hai
    campaigns.py route se ise call karo

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

        # Step 2: Ad group banao
        ag_result = create_ad_group(
            campaign_result["campaign_resource"],
            {
                "name":     f"{campaign_data['name']} - Ad Group",
                "cpc_bid":  50,
                "keywords": campaign_data.get("keywords", ["business loan", "working capital"])
            }
        )

        # Step 3: Ad banao
        ad_result = create_responsive_search_ad(
            ag_result["ad_group_resource"],
            ad_content_data
        )

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