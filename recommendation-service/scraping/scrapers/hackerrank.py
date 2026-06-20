import logging
import asyncio
from typing import List
from datetime import datetime
from playwright.async_api import async_playwright

from .base import BaseScraper
from ..models import OpportunityRaw

logger = logging.getLogger(__name__)

class HackerRankScraper(BaseScraper):
    source_name = "hackerrank"
    base_url = "https://www.hackerrank.com/contests"

    async def scrape(self) -> List[OpportunityRaw]:
        opportunities = []
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
                page = await browser.new_page()
                
                logger.info(f"Navigating to {self.base_url}")
                await page.goto(self.base_url, wait_until="domcontentloaded")
                
                await asyncio.sleep(3)
                
                # Active contests list
                items = await page.query_selector_all('.contest-list .active_contest')
                
                for item in items[:15]:
                    try:
                        title_el = await item.query_selector('.contest-name')
                        title = await title_el.inner_text() if title_el else "HackerRank Contest"
                        
                        url_el = await item.query_selector('a.text-link')
                        href = await url_el.get_attribute("href") if url_el else ""
                        full_url = f"https://www.hackerrank.com{href}" if href.startswith("/") else href
                        
                        opp = OpportunityRaw(
                            title=title.strip(),
                            description=f"Coding contest on HackerRank: {title.strip()}",
                            organizer="HackerRank",
                            source_platform="hackerrank",
                            source_url=full_url,
                            category="competition",
                            tags=["coding", "competitive-programming", "hackerrank"],
                            deadline=None,
                            start_date=None,
                            location=None,
                            is_remote=True,
                            prize_info=None,
                            eligibility=None,
                            image_url=None
                        )
                        opportunities.append(opp)
                    except Exception as e:
                        logger.warning(f"Error parsing hackerrank item: {e}")
                        
                await browser.close()
        except Exception as e:
            logger.warning(f"HackerRank playwright error: {e}")
            
        return opportunities
