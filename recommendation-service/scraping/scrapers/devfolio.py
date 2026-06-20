import logging
import asyncio
from typing import List
from datetime import datetime
from playwright.async_api import async_playwright

from .base import BaseScraper
from ..models import OpportunityRaw

logger = logging.getLogger(__name__)

class DevfolioScraper(BaseScraper):
    source_name = "devfolio"
    base_url = "https://devfolio.co/hackathons"

    async def scrape(self) -> List[OpportunityRaw]:
        opportunities = []
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
                page = await browser.new_page()
                
                logger.info(f"Navigating to {self.base_url}")
                await page.goto(self.base_url, wait_until="domcontentloaded")
                
                await asyncio.sleep(4)
                
                # Devfolio hackathon cards
                items = await page.query_selector_all('a[href*=".devfolio.co"]')
                
                processed_urls = set()
                
                for item in items[:20]:
                    try:
                        href = await item.get_attribute("href")
                        if not href or href in processed_urls or "devfolio.co/hackathons" in href:
                            continue
                            
                        processed_urls.add(href)
                        
                        text_content = await item.inner_text()
                        lines = [line.strip() for line in text_content.split('\n') if line.strip()]
                        
                        if len(lines) < 1:
                            continue
                            
                        title = lines[0]
                        org = "Devfolio Community"
                        
                        img_el = await item.query_selector("img")
                        img_url = await img_el.get_attribute("src") if img_el else None
                        
                        opp = OpportunityRaw(
                            title=title,
                            description=f"Hackathon on Devfolio: {title}",
                            organizer=org,
                            source_platform="devfolio",
                            source_url=href,
                            category="hackathon",
                            tags=["hackathon", "devfolio"],
                            deadline=None,
                            start_date=None,
                            location=None,
                            is_remote=True,
                            prize_info=None,
                            eligibility=None,
                            image_url=img_url
                        )
                        opportunities.append(opp)
                    except Exception as e:
                        logger.warning(f"Error parsing devfolio item: {e}")
                        
                await browser.close()
        except Exception as e:
            logger.error(f"Devfolio playwright error: {e}")
            
        return opportunities
