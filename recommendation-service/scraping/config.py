import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    mongodb_db_name: str = os.getenv("MONGODB_DB_NAME", "opphub")
    scrape_interval_hours: int = 6
    dedup_similarity_threshold: float = 0.85
    embedding_model: str = "all-MiniLM-L6-v2"
    
    # Per-source rate limits (seconds between requests)
    rate_limit_mlh: float = 2.0
    rate_limit_hackerearth: float = 2.0
    rate_limit_unstop: float = 3.0
    rate_limit_devfolio: float = 3.0
    rate_limit_hackerrank: float = 3.0

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
