# app/routers/places.py
#
# Proxies Google Places API (New) so the API key never reaches the browser.
# Add to your FastAPI app with:
#     from app.routers import places
#     app.include_router(places.router, prefix="/api/places", tags=["places"])
#
# Requires:  pip install httpx
# Env var:   GOOGLE_PLACES_API_KEY=your_key_here
#
# NOTE ON COST: Autocomplete requests are billed as FREE as long as they are
# linked with a session_token AND the session is terminated by a Place
# Details call. This router forwards the session_token end-to-end so that
# billing model applies. See: https://developers.google.com/maps/documentation/places/web-service/session-pricing

import os
from fastapi import APIRouter, HTTPException, Query
import httpx
import math

router = APIRouter()

GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")
AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete"
DETAILS_URL_TMPL = "https://places.googleapis.com/v1/places/{place_id}"


@router.get("/autocomplete")
async def autocomplete(
    input: str = Query(..., min_length=2, description="Partial search text typed by the user"),
    session_token: str = Query(..., description="Client-generated UUID, same for the whole typing session"),
):
    """
    Pan-India location autocomplete — covers cities, pincodes, sectors,
    localities, and buildings. Restricted to India (regionCode: 'in').
    """
    if not GOOGLE_PLACES_API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_PLACES_API_KEY not configured on server")

    body = {
        "input": input,
        "sessionToken": session_token,
        "includedRegionCodes": ["in"],
        # languageCode left default (device/browser locale); add "regionCode": "in" too if you want biased results
    }

    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.post(
            AUTOCOMPLETE_URL,
            json=body,
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
                # Only request the fields we actually use — keeps this call in the free Autocomplete SKU
                "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=f"Google Places error: {resp.text}")

    data = resp.json()
    suggestions = data.get("suggestions", [])

    results = []
    for s in suggestions:
        pred = s.get("placePrediction")
        if not pred:
            continue
        structured = pred.get("structuredFormat", {})
        main_text = structured.get("mainText", {}).get("text", pred.get("text", {}).get("text", ""))
        secondary_text = structured.get("secondaryText", {}).get("text", "")
        results.append({
            "place_id": pred.get("placeId"),
            "name": main_text,
            "secondary_text": secondary_text,
        })

    return {"results": results}

def calculate_area_diagonal_km(viewport: dict) -> float:
    """
    Given a Google Places viewport (low/high lat-lng bounding box),
    returns the real-world diagonal distance in km using the
    Haversine formula. This represents the actual physical size
    of the selected place (city, district, state, etc).
    """
    if not viewport:
        return 0.0
 
    low = viewport.get("low") or {}
    high = viewport.get("high") or {}
 
    lat1, lng1 = low.get("latitude"), low.get("longitude")
    lat2, lng2 = high.get("latitude"), high.get("longitude")
 
    if None in (lat1, lng1, lat2, lng2):
        return 0.0
 
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
 
    a = (math.sin(dphi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
 
    return round(R * c, 1)

@router.get("/details")
async def place_details(
    place_id: str = Query(..., description="place_id returned by /autocomplete"),
    session_token: str = Query(..., description="Same session_token used for the /autocomplete calls"),
):
    """
    Resolves a place_id into lat/lng + display name. This call terminates
    the autocomplete session (billed under Place Details Essentials/Basic —
    the cheapest tier, since we only ask for id/displayName/location).
    """
    if not GOOGLE_PLACES_API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_PLACES_API_KEY not configured on server")

    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(
            DETAILS_URL_TMPL.format(place_id=place_id),
            params={"sessionToken": session_token},
            headers={
                "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
                "X-Goog-FieldMask": "id,displayName,formattedAddress,location,viewport,addressComponents",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=f"Google Places error: {resp.text}")

    data = resp.json()

    # ── 1. State ──
    state = ""
    for comp in data.get("addressComponents", []):
        if "administrative_area_level_1" in comp.get("types", []):
            state = comp.get("longText", "")
            break

    # ── 2. lat/lng (with viewport-center fallback) ──
    loc = data.get("location") or {}
    lat = loc.get("latitude")
    lng = loc.get("longitude")

    if lat is None or lng is None:
        vp = data.get("viewport") or {}
        low, high = vp.get("low") or {}, vp.get("high") or {}
        if low.get("latitude") is not None and high.get("latitude") is not None:
            lat = (low["latitude"] + high["latitude"]) / 2
            lng = (low["longitude"] + high["longitude"]) / 2

    if lat is None or lng is None:
        raise HTTPException(status_code=422, detail="Google did not return coordinates for this location")

    # ── 3. Real-world size of the place (diagonal km) ──
    viewport = data.get("viewport") or {}
    area_diagonal_km = calculate_area_diagonal_km(viewport)
    if area_diagonal_km < 20:
        area_diagonal_km = 20.0

    # ── 4. Single return, everything already computed ──
    return {
        "name": data.get("displayName", {}).get("text", ""),
        "formatted_address": data.get("formattedAddress", ""),
        "state": state,
        "lat": lat,
        "lng": lng,
        "area_diagonal_km": area_diagonal_km,
    }
