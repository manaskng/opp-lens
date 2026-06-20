"""
EventSync ML Recommendation Microservice
FastAPI app serving hybrid recommendations via REST API.

The service is STATELESS — it does NOT connect to MongoDB.
The Node.js backend sends all necessary data in each request.
"""
import time
import sys
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Fix for Playwright subprocess NotImplementedError on Windows
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from recommender import recommend
from scraping.db import Database
from scraping.scheduler import start_scheduler, run_scraping_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# App Setup & Lifespan
# ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FastAPI service...")
    await Database.connect()
    start_scheduler()
    yield
    # Shutdown
    logger.info("Shutting down FastAPI service...")
    await Database.disconnect()

app = FastAPI(
    title="OppHub Recommendation & Scraping Engine",
    description="ML-powered event recommendations and distributed scraping pipeline",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock down in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Timing Middleware (Telemetry for Resume)
# ─────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Ms"] = str(round(process_time * 1000, 2))
    return response

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

class RecommendRequest(BaseModel):
    user_profile: UserProfile
    events: list[dict]
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
        "service": "OppHub Recommendation & Scraping Engine",
        "status": "running",
        "version": "2.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/recommend", response_model=RecommendResponse)
async def get_recommendations(request: RecommendRequest):
    """
    Generate ML-powered event recommendations.
    """
    try:
        user_dict = request.user_profile.model_dump()

        recommendations = recommend(
            user_profile=user_dict,
            events=request.events,
            all_bookings=request.all_bookings,
            limit=request.limit,
        )

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

# ─────────────────────────────────────────────
# Phase 5: Vector Search Recommendation API
# ─────────────────────────────────────────────

class OppRecommendRequest(BaseModel):
    user_profile: UserProfile
    limit: int = 10

@app.post("/recommend/opportunities", response_model=RecommendResponse)
async def get_opportunity_recommendations(request: OppRecommendRequest):
    """
    Generate recommendations using MongoDB Atlas Vector Search.
    Does NOT require sending all events from frontend.
    """
    try:
        from scraping.pipeline.embeddings import EmbeddingEngine
        
        user = request.user_profile
        
        # 1. Build user text profile
        user_text_parts = []
        if user.interests:
            user_text_parts.extend(user.interests)
        if user.preferredCategories:
            user_text_parts.extend(user.preferredCategories)
        if user.bio:
            user_text_parts.append(user.bio)
            
        user_text = " ".join(user_text_parts) if user_text_parts else "technology programming hackathon"
        
        # 2. Embed user profile
        user_embedding = EmbeddingEngine.generate_text_embedding(user_text)
        
        # 3. Query MongoDB Vector Search
        opportunities_collection = Database.get_opportunities_collection()
        
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": user_embedding,
                    "numCandidates": 100,
                    "limit": request.limit * 2 # Fetch more for re-ranking
                }
            },
            {
                "$match": {
                    "is_canonical": True
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "category": 1,
                    "scraped_at": 1,
                    "popularity_score": 1,
                    "vector_score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        try:
            results = await opportunities_collection.aggregate(pipeline).to_list(length=request.limit * 2)
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            results = [] # Fallback if index fails
            
        # 4. Re-rank results (combining vector semantic similarity + popularity + recency)
        now = datetime.utcnow()
        ranked_results = []
        for opp in results:
            v_score = opp.get("vector_score", 0.0)
            
            # Recency boost
            scraped_at = opp.get("scraped_at", now)
            days_old = (now - scraped_at).days
            recency_boost = max(0, (30 - days_old) / 30.0) * 0.2
            
            # Popularity boost
            pop = opp.get("popularity_score", 0)
            pop_boost = min(pop / 1000.0, 0.2)
            
            final_score = v_score + recency_boost + pop_boost
            
            ranked_results.append({
                "event_id": str(opp["_id"]),
                "score": final_score,
                "reason": "AI Semantic Match" if v_score > 0.7 else "Related to your interests",
                "debug": {
                    "vector_score": v_score,
                    "recency_boost": recency_boost,
                    "popularity_boost": pop_boost
                }
            })
            
        ranked_results.sort(key=lambda x: x["score"], reverse=True)
        final_recommendations = ranked_results[:request.limit]
        
        return RecommendResponse(
            recommendations=[RecommendationItem(**r) for r in final_recommendations],
            total_events_scored=100, # Approx numCandidates
            weights_used={"vector": 1.0, "recency": 0.2, "popularity": 0.2}
        )
        
    except Exception as e:
        logger.error(f"Vector Recommendation Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# Scraping API (New)
# ─────────────────────────────────────────────

@app.post("/scrape/run")
async def trigger_scrape(background_tasks: BackgroundTasks):
    """Manually trigger the scraping pipeline."""
    background_tasks.add_task(run_scraping_pipeline)
    return {"status": "Scraping pipeline triggered in background"}

@app.get("/opportunities/stats")
async def get_scrape_stats():
    """Get statistics for resume telemetry."""
    runs_collection = Database.get_scrape_runs_collection()
    opportunities_collection = Database.get_opportunities_collection()
    dedup_log = Database.get_dedup_log_collection()
    
    total_opportunities = await opportunities_collection.count_documents({})
    total_dedup_merges = await dedup_log.count_documents({"decision": "merged"})
    
    last_run = await runs_collection.find_one(sort=[("timestamp", -1)])
    
    return {
        "total_opportunities_canonical": total_opportunities,
        "total_duplicates_merged": total_dedup_merges,
        "last_run": last_run.get("timestamp") if last_run else None,
        "last_run_duration_seconds": last_run.get("duration_seconds") if last_run else None,
        "last_run_scraped": last_run.get("total_scraped") if last_run else None,
        "last_run_status": last_run.get("status") if last_run else None
    }
