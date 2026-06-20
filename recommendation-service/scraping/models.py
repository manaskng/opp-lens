from datetime import datetime
from pydantic import BaseModel, Field

class OpportunityRaw(BaseModel):
    """Output of every scraper — one canonical shape."""
    title: str
    description: str
    organizer: str
    source_platform: str
    source_url: str
    category: str = "hackathon"
    tags: list[str] = []
    deadline: datetime | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    location: str | None = None
    is_remote: bool = False
    prize_info: str | None = None
    eligibility: str | None = None
    image_url: str | None = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)

class OpportunityWithEmbedding(OpportunityRaw):
    embedding: list[float]

class DedupDecision(BaseModel):
    """Log for precision/recall review."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    new_opp_title: str
    new_opp_source: str
    new_opp_url: str
    decision: str               # "merged" | "new_canonical"
    canonical_id: str | None    # If merged, the canonical it was merged into
    canonical_title: str | None
    similarity_score: float | None     # Cosine sim to closest existing opp
    merge_details: str | None   # What metadata was enriched
