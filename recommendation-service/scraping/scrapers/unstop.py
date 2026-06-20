import logging
import asyncio
from typing import List
from datetime import datetime
from playwright.async_api import async_playwright

from .base import BaseScraper
from ..models import OpportunityRaw

logger = logging.getLogger(__name__)

class UnstopScraper(BaseScraper):
    source_name = "unstop"
    base_url = "https://unstop.com/hackathons"

    async def scrape(self) -> List[OpportunityRaw]:
        opportunities = []
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
                page = await browser.new_page()
                
                logger.info(f"Navigating to {self.base_url}")
                await page.goto(self.base_url, wait_until="domcontentloaded")
                
                # We'll wait a bit for React to render
                await asyncio.sleep(5)
                
                # Unstop uses 'app-competition-listing' or similar classes
                # This is a generalized fallback query to find the cards
                items = await page.query_selector_all("a[href*='/hackathons/']")
                
                processed_urls = set()
                
                for item in items[:20]: # Limit for demo so it doesn't take forever
                    try:
                        href = await item.get_attribute("href")
                        if not href or href in processed_urls:
                            continue
                            
                        processed_urls.add(href)
                        full_url = f"https://unstop.com{href}" if href.startswith("/") else href
                        
                        # Try to get text inside the card
                        text_content = await item.inner_text()
                        lines = [line.strip() for line in text_content.split('\n') if line.strip()]
                        
                        if len(lines) < 2:
                            continue
                            
                        title = lines[0]
                        org = lines[1] if len(lines) > 1 else "Unstop"
                        
                        img_el = await item.query_selector("img")
                        img_url = await img_el.get_attribute("src") if img_el else None
                        
                        opp = OpportunityRaw(
                            title=title,
                            description=f"Hackathon hosted by {org} on Unstop.",
                            organizer=org,
                            source_platform="unstop",
                            source_url=full_url,
                            category="hackathon",
                            tags=["hackathon", "unstop"],
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
                        logger.warning(f"Error parsing unstop item: {e}")
                        
                await browser.close()
        except Exception as e:
            logger.error(f"Unstop playwright error: {e}")
            
        return opportunities
