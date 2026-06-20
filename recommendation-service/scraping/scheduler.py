import logging
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime

from .config import settings
from .scrapers.mlh import MLHScraper
from .scrapers.hackerearth import HackerEarthScraper
from .scrapers.unstop import UnstopScraper
from .scrapers.devfolio import DevfolioScraper
from .scrapers.hackerrank import HackerRankScraper
from .pipeline.embeddings import EmbeddingEngine
from .pipeline.deduplication import DeduplicationEngine
from .db import Database

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def run_scraping_pipeline():
    """End-to-end pipeline: Scrape -> Embed -> Dedup -> Store"""
    logger.info("Starting scheduled scraping pipeline...")
    start_time = datetime.utcnow()
    runs_collection = Database.get_scrape_runs_collection()
    
    scrapers = [
        MLHScraper(),
        HackerEarthScraper(),
        UnstopScraper(),
        DevfolioScraper(),
        HackerRankScraper()
    ]
    
    total_scraped = 0
    all_raw_opps = []
    
    # 1. Scrape all sources
    for scraper in scrapers:
        try:
            opps = await scraper.run()
            all_raw_opps.extend(opps)
            total_scraped += len(opps)
        except Exception as e:
            logger.error(f"Error in {scraper.source_name}: {e}")
            
    if not all_raw_opps:
        logger.warning("No opportunities scraped. Pipeline aborting.")
        return
        
    try:
        # 2. Embed
        logger.info(f"Generating embeddings for {len(all_raw_opps)} opportunities...")
        embedded_opps = EmbeddingEngine.generate_embeddings(all_raw_opps)
        
        # 3. Deduplicate and Store
        logger.info("Deduplicating and storing...")
        engine = DeduplicationEngine()
        new_inserted, merged = await engine.deduplicate_and_store(embedded_opps)
        
        duration = (datetime.utcnow() - start_time).total_seconds()
        
        # Log telemetry
        run_record = {
            "timestamp": datetime.utcnow(),
            "total_scraped": total_scraped,
            "new_inserted": new_inserted,
            "merged": merged,
            "duration_seconds": duration,
            "status": "success"
        }
        await runs_collection.insert_one(run_record)
        logger.info(f"Pipeline completed in {duration:.1f}s. New: {new_inserted}, Merged: {merged}")
        
    except Exception as e:
        logger.error(f"Pipeline failed during processing: {e}", exc_info=True)
        await runs_collection.insert_one({
            "timestamp": datetime.utcnow(),
            "status": "failed",
            "error": str(e)
        })

def start_scheduler():
    scheduler.add_job(
        run_scraping_pipeline, 
        'interval', 
        hours=settings.scrape_interval_hours,
        id='scrape_pipeline_job',
        replace_existing=True
    )
    scheduler.start()
    logger.info(f"Scheduler started. Next run in {settings.scrape_interval_hours} hours.")
