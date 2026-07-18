"""
app/services/platform_mapping/meta_mapper.py  (Phase 2 update)

Uses the AI's broad `meta_interest_categories` (not the long-tail
intent_keywords) to search Meta's Targeting Search API, since Meta's
interest taxonomy only contains broad/generic category names.
"""

import os
import requests

GRAPH_API_VERSION = "v21.0"

META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
META_AD_ACCOUNT_ID = os.getenv("META_AD_ACCOUNT_ID")


def _resolve_interest_ids(interest_names: list[str]) -> list[dict]:
    """
    Calls Meta's Targeting Search API to find the real interest ID for each
    candidate name. Returns only successful matches.
    """
    if not META_ACCESS_TOKEN:
        return [{"name": name, "id": None} for name in interest_names]

    resolved = []
    for name in interest_names:
        try:
            resp = requests.get(
                f"https://graph.facebook.com/{GRAPH_API_VERSION}/search",
                params={
                    "type": "adinterest",
                    "q": name,
                    "access_token": META_ACCESS_TOKEN,
                },
                timeout=10,
            )
            resp.raise_for_status()
            results = resp.json().get("data", [])
            if results:
                top_match = results[0]
                resolved.append({
                    "id": top_match["id"],
                    "name": top_match["name"],
                    "audience_size": top_match.get("audience_size_lower_bound"),
                })
            else:
                continue
        except requests.RequestException as e:
            print(f"[meta_mapper] Failed to resolve interest '{name}': {e}")
            continue

    return resolved


def map_to_meta(profile: dict) -> dict:
    """
    profile: dict from audience_ai_service.generate_audience_profile()
    returns: Meta-shaped targeting_spec dict with REAL resolved interest IDs.

    Uses meta_interest_categories (broad, taxonomy-friendly) as the primary
    source, falling back to `interests` (B2C) if meta_interest_categories is
    empty for some reason.
    """
    candidate_names = profile.get("meta_interest_categories", [])
    if not candidate_names:
        candidate_names = profile.get("interests", [])

    resolved_interests = _resolve_interest_ids(candidate_names)

    spec = {
        "interests": resolved_interests,
        "behaviors": [],
        "age_min": profile.get("age_min", 25),
        "age_max": profile.get("age_max", 55),
        "resolved": bool(META_ACCESS_TOKEN),
        "note": (
            "Detailed targeting is used as an audience suggestion under Advantage+, "
            "not a hard filter - Meta may expand delivery beyond these interests. "
            "For stricter targeting, disable Advantage+ and use 'Original Audience' "
            "when creating the ad set."
        ),
    }
    return spec