"""
EventSync ML Recommendation Microservice
FastAPI app serving hybrid recommendations via REST API.

The service is STATELESS — it does NOT connect to MongoDB.
The Node.js backend sends all necessary data in each request.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from recommender import recommend

# ─────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────

app = FastAPI(
    title="EventSync Recommendation Engine",
    description="ML-powered event recommendations using TF-IDF + Collaborative Filtering",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock down in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────

class UserProfile(BaseModel):
    email: str
    interests: list[str] = []
    preferredCategories: list[str] = []
    preferredMode: str = "any"
    skillLevel: str = "intermediate"
    bio: Optional[str] = None

class EventData(BaseModel):
    _id: str
    title: str = ""
    tags: list[str] = []
    description: str = ""
    overview: str = ""
    category: str = ""
    difficulty: str = "intermediate"
    audience: str = ""
    mode: str = "offline"
    date: str = ""
    seatsTaken: int = 0
    capacity: int = 50

    class Config:
        # Allow _id field (underscore prefix)
        populate_by_name = True

class BookingData(BaseModel):
    email: str
    eventId: str

class RecommendRequest(BaseModel):
    user_profile: UserProfile
    events: list[dict]       # Using dict for flexibility with MongoDB's _id field
    all_bookings: list[dict] = []
    limit: int = 6

class RecommendationItem(BaseModel):
    event_id: str
    score: float
    reason: str
    debug: Optional[dict] = None

class RecommendResponse(BaseModel):
    recommendations: list[RecommendationItem]
    total_events_scored: int
    weights_used: Optional[dict] = None


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "EventSync Recommendation Engine",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/recommend", response_model=RecommendResponse)
async def get_recommendations(request: RecommendRequest):
    """
    Generate ML-powered event recommendations.
    
    Receives user profile + all events + all bookings from the Node.js backend.
    Returns ranked event IDs with scores and explanations.
    """
    try:
        user_dict = request.user_profile.model_dump()

        recommendations = recommend(
            user_profile=user_dict,
            events=request.events,
            all_bookings=request.all_bookings,
            limit=request.limit,
        )

        # Extract weights used from first result's debug info
        weights_used = None
        if recommendations and "debug" in recommendations[0]:
            weights_used = recommendations[0]["debug"].get("weights")

        return RecommendResponse(
            recommendations=[
                RecommendationItem(
                    event_id=r["event_id"],
                    score=r["score"],
                    reason=r["reason"],
                    debug=r.get("debug"),
                )
                for r in recommendations
            ],
            total_events_scored=len(request.events),
            weights_used=weights_used,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")
