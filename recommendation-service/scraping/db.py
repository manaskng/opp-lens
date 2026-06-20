from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient | None = None
    db = None

    @classmethod
    async def connect(cls):
        if cls.client is None:
            cls.client = AsyncIOMotorClient(settings.mongodb_uri)
            cls.db = cls.client[settings.mongodb_db_name]
            logger.info("Connected to MongoDB")

    @classmethod
    async def disconnect(cls):
        if cls.client is not None:
            cls.client.close()
            logger.info("Disconnected from MongoDB")

    @classmethod
    def get_opportunities_collection(cls):
        return cls.db["opportunities"]

    @classmethod
    def get_dedup_log_collection(cls):
        return cls.db["dedup_log"]

    @classmethod
    def get_scrape_runs_collection(cls):
        return cls.db["scrape_runs"]
