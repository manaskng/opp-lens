import logging
from bs4 import BeautifulSoup
from typing import List
from datetime import datetime
from .base import BaseScraper
from ..models import OpportunityRaw
from ..config import settings

logger = logging.getLogger(__name__)

class MLHScraper(BaseScraper):
    source_name = "mlh"
    rate_limit_seconds = settings.rate_limit_mlh

    async def scrape(self) -> List[OpportunityRaw]:
        opportunities = []
        
        # MLH uses /seasons/{year}/events. 
        # Seasons overlap years, so check current and next year.
        current_year = datetime.now().year
        urls_to_check = [
            f"https://mlh.io/seasons/{current_year}/events",
            f"https://mlh.io/seasons/{current_year+1}/events"
        ]
        
        for url in urls_to_check:
            try:
                html = await self.fetch_with_retry(url)
                if not html:
                    continue

                soup = BeautifulSoup(html, "lxml")
                event_cards = soup.find_all("div", class_="event-wrapper")

                for wrapper in event_cards:
                    try:
                        card = wrapper.find("div", class_="event")
                        if not card: continue

                        title_elem = card.find("h3", class_="event-name")
                        if not title_elem:
                            continue
                        title = title_elem.text.strip()
                        
                        link_elem = card.find("a", class_="event-link")
                        source_url = link_elem["href"] if link_elem else url

                        date_elem = card.find("p", class_="event-date")
                        date_str = date_elem.text.strip() if date_elem else ""

                        location_elem = card.find("div", class_="event-location")
                        location_text = location_elem.text.strip() if location_elem else ""
                        
                        is_remote = "Digital" in location_text or "Hybrid" in location_text
                        
                        logo_elem = card.find("div", class_="event-logo")
                        image_url = None
                        if logo_elem and logo_elem.find("img"):
                            image_url = logo_elem.find("img")["src"]

                        opp = OpportunityRaw(
                            title=title,
                            description=f"MLH Hackathon: {title}. Date: {date_str}. Location: {location_text}.",
                            organizer="Major League Hacking",
                            source_platform=self.source_name,
                            source_url=source_url,
                            category="hackathon",
                            tags=["hackathon"],
                            location=location_text,
                            is_remote=is_remote,
                            image_url=image_url
                        )
                        opportunities.append(opp)
                    except Exception as e:
                        logger.warning(f"Failed to parse an MLH event card: {e}")
            except Exception as e:
                logger.warning(f"MLH Scrape failed for {url}: {e}")
                
        return opportunities
