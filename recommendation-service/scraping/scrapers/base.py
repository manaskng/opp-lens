import abc
import asyncio
import logging
from typing import List, Optional
import httpx
from fake_useragent import UserAgent
from ..models import OpportunityRaw
from ..config import settings
from datetime import datetime

logger = logging.getLogger(__name__)
ua = UserAgent()

class BaseScraper(abc.ABC):
    source_name: str
    base_url: str
    rate_limit_seconds: float = 2.0
    max_retries: int = 3

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
        self._last_request_time = 0.0

    async def _wait_rate_limit(self):
        now = asyncio.get_event_loop().time()
        elapsed = now - self._last_request_time
        if elapsed < self.rate_limit_seconds:
            await asyncio.sleep(self.rate_limit_seconds - elapsed)
        self._last_request_time = asyncio.get_event_loop().time()

    async def fetch_with_retry(self, url: str) -> Optional[str]:
        for attempt in range(self.max_retries):
            await self._wait_rate_limit()
            headers = {"User-Agent": ua.random}
            try:
                response = await self.client.get(url, headers=headers)
                response.raise_for_status()
                return response.text
            except httpx.HTTPError as e:
                wait_time = 2 ** (attempt + 1)
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}. Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
            except Exception as e:
                logger.error(f"Unexpected error fetching {url}: {e}")
                break
        logger.error(f"Failed to fetch {url} after {self.max_retries} retries.")
        return None

    @abc.abstractmethod
    async def scrape(self) -> List[OpportunityRaw]:
        """Implement source-specific scraping logic here."""
        pass

    async def run(self) -> List[OpportunityRaw]:
        start_time = datetime.utcnow()
        logger.info(f"Starting {self.source_name} scraper...")
        try:
            results = await self.scrape()
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.info(f"{self.source_name} scraped {len(results)} opportunities in {duration:.1f}s")
            return results
        except Exception as e:
            logger.error(f"{self.source_name} scraper failed: {e}", exc_info=True)
            return []
        finally:
            await self.client.aclose()
