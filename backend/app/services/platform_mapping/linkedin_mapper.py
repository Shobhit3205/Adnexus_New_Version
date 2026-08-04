"""
app/services/platform_mapping/linkedin_mapper.py

Converts the generic AI audience profile into a LinkedIn Marketing-API-shaped
targeting spec (job function, seniority, industry facets).

LinkedIn is the most deterministic of the three platforms — facets are AND'd
together, values within a facet are OR'd. This is the best fit for B2B
products like working-capital loans, SaaS tools, etc.

Phase 1 note: AdNexus doesn't have LinkedIn Ads integrated yet at all
(no auth/campaign creation). This mapper just prepares the *shape* so the
UI can show LinkedIn suggestions; wiring to the real adTargetingFacets /
adTargetingEntities API comes later once LinkedIn auth is set up (Phase 4).
"""


def map_to_linkedin(profile: dict) -> dict:
    """
    profile: dict from audience_ai_service.generate_audience_profile()
    returns: LinkedIn-shaped targeting_spec dict
    """
    business_type = profile.get("business_type", "B2C")

    if business_type == "B2C":
        # LinkedIn isn't a great fit for pure B2C — return a minimal/empty spec
        # so the UI can show "LinkedIn not recommended for this audience"
        return {
            "job_functions": [],
            "job_seniorities": [],
            "industries": [],
            "note": "LinkedIn is optimized for B2B audiences — consider skipping this platform.",
        }

    spec = {
        "job_functions": profile.get("job_functions", []),
        "job_seniorities": profile.get("job_seniorities", []),
        "industries": [profile.get("industry_category")] if profile.get("industry_category") else [],
        "skills": profile.get("intent_keywords", [])[:5],  # keywords doubling as skill search terms
        "logic_note": (
            "Facets combine with AND logic (e.g. Job Function AND Seniority), "
            "values within a facet combine with OR logic."
        ),
    }
    return spec