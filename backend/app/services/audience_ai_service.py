"""
app/services/audience_ai_service.py  (Phase 2 update)

Generates a structured "Audience Profile" from ad content using Groq
(llama-3.3-70b-versatile).

Phase 2 change: added `meta_interest_categories` — broad, Meta-taxonomy-friendly
interest names (e.g. "Small business", "Entrepreneurship"), separate from the
long-tail `intent_keywords` (e.g. "working capital loan") which are better
suited for Google custom segments / LinkedIn skills but rarely match Meta's
fixed interest list.
"""

import os
import json
import re
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are an ad-targeting analyst for a B2B/B2C ad campaign platform.
Given an ad's title, description, and industry, return ONLY a valid JSON object
(no markdown, no extra text, no explanation outside the JSON) in this exact shape:

{
  "industry_category": "string - specific industry/niche",
  "business_type": "B2B" | "B2C" | "Both",
  "intent_keywords": ["3-6 specific long-tail keywords/phrases someone actively searching for this would use, e.g. 'working capital loan'"],
  "meta_interest_categories": ["3-6 BROAD interest category names that exist in Meta/Facebook's fixed ad-interest taxonomy, e.g. 'Small business', 'Entrepreneurship', 'Personal finance', 'Business loans', 'Financial services' - these must be short, generic, well-known category names, NOT long-tail phrases"],
  "job_functions": ["job functions relevant if B2B, e.g. Finance, Operations - empty array if B2C"],
  "job_seniorities": ["seniority levels relevant if B2B, e.g. Owner, Director, CXO - empty array if B2C"],
  "interests": ["consumer interest categories relevant if B2C - empty array if pure B2B"],
  "age_min": 25,
  "age_max": 55,
  "reasoning": "one sentence explaining why this audience fits the ad"
}

Rules:
- Never include sensitive categories (health conditions, religion, political affiliation, sexual orientation).
- intent_keywords: specific, long-tail (2-4 words each) - good for Google custom segments and LinkedIn skills.
- meta_interest_categories: broad, generic, single-or-two-word category names that are likely to exist as real Meta ad interests
  (think: "Small business", "Entrepreneurship", "Investment", "Loan", "Real estate", "Fashion", "Fitness" - NOT specific
  product phrases like "working capital loan").
- If business_type is "B2B", interests should be an empty array.
- If business_type is "B2C", job_functions and job_seniorities should be empty arrays.
- If "Both", populate whichever fields are genuinely relevant.
"""


def _extract_json(raw_text: str) -> dict:
    """Groq sometimes wraps JSON in ```json fences even when told not to — strip them."""
    cleaned = re.sub(r"^```json\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE)
    cleaned = cleaned.strip()
    return json.loads(cleaned)


def generate_audience_profile(ad_title: str, ad_description: str,
                               industry: str = "", sub_category: str = "") -> dict:
    """
    Calls Groq to analyze ad content and return a structured audience profile dict.
    Raises ValueError if the AI response isn't valid JSON (caller should handle gracefully).
    """
    user_prompt = f"""Ad Title: {ad_title}
Ad Description: {ad_description}
Industry: {industry or "Not specified"}
Sub-category: {sub_category or "Not specified"}

Analyze this and return the audience profile JSON."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=700,
    )

    raw_text = response.choices[0].message.content

    try:
        profile = _extract_json(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI returned invalid JSON: {raw_text[:200]}") from e

    profile.setdefault("intent_keywords", [])
    profile.setdefault("meta_interest_categories", [])
    profile.setdefault("job_functions", [])
    profile.setdefault("job_seniorities", [])
    profile.setdefault("interests", [])
    profile.setdefault("age_min", 25)
    profile.setdefault("age_max", 55)
    profile.setdefault("reasoning", "")

    return profile