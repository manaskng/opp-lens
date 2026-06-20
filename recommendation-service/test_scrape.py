import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from scraping.db import Database
from scraping.scheduler import run_scraping_pipeline

async def main():
    await Database.connect()
    await run_scraping_pipeline()
    await Database.close()

if __name__ == "__main__":
    asyncio.run(main())
