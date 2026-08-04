"""
app/services/platform_mapping/google_mapper.py

Converts the generic AI audience profile into a Google Ads-shaped targeting spec.

Phase 1 note: This does NOT call the live Google Ads API (your dev token is
still test-only). It just produces the spec in Google's shape so it's ready
to plug into AudienceService/UserList creation once Standard access is approved.
"""


def map_to_google(profile: dict) -> dict:
    """
    profile: dict from audience_ai_service.generate_audience_profile()
    returns: Google-Ads-shaped targeting_spec dict
    """
    intent_keywords = profile.get("intent_keywords", [])
    business_type = profile.get("business_type", "B2C")

    # In-market segment suggestion is a *category name* here — in Phase 2,
    # this string gets matched against real in-market segment IDs via
    # GoogleAdsService search on audience_segment_view.
    in_market_hint = profile.get("industry_category", "")

    spec = {
        "custom_segment_keywords": intent_keywords,
        "in_market_category_hint": in_market_hint,
        "demographics": {
            "age_min": profile.get("age_min", 25),
            "age_max": profile.get("age_max", 55),
        },
        # Google treats these as audience *signals*, not hard filters (2026 behavior) —
        # UI should communicate this to the user.
        "note": "Signals for Performance Max / Demand Gen — Google's algorithm may expand beyond these.",
    }

    if business_type in ("B2B", "Both"):
        # For B2B, custom segment keywords double up as "URLs/apps your ideal
        # customer engages with" proxy — real implementation would also let
        # user add competitor/industry site URLs.
        spec["custom_segment_keywords"] = intent_keywords + [
            f"{kw} software" for kw in intent_keywords[:2]
        ]

    return spec