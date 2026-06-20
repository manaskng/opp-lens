import logging
from bs4 import BeautifulSoup
from typing import List
from .base import BaseScraper
from ..models import OpportunityRaw
from ..config import settings

logger = logging.getLogger(__name__)

class HackerEarthScraper(BaseScraper):
    source_name = "hackerearth"
    base_url = "https://www.hackerearth.com/chrome-extension/events/"
    rate_limit_seconds = settings.rate_limit_hackerearth

    async def scrape(self) -> List[OpportunityRaw]:
        opportunities = []
        try:
            await self._wait_rate_limit()
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = await self.client.get(self.base_url, headers=headers)
            if response.status_code != 200:
                logger.warning(f"HackerEarth API returned {response.status_code}")
                return opportunities
            
            data = response.json()
            events = data.get("response", [])
            
            for event in events:
                title = event.get("title", "HackerEarth Event")
                url = event.get("url", "")
                desc = event.get("description", title)
                image = event.get("cover_image") or event.get("thumbnail")
                
                opp = OpportunityRaw(
                    title=title,
                    description=desc,
                    organizer="HackerEarth",
                    source_platform=self.source_name,
                    source_url=url,
                    category=event.get("challenge_type", "competition").lower(),
                    tags=["competition", "coding"],
                    is_remote=True,
                    image_url=image
                )
                opportunities.append(opp)
        except Exception as e:
            logger.error(f"Error scraping HackerEarth API: {e}", exc_info=True)

        return opportunities
