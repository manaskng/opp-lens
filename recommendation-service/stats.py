import asyncio
from scraping.db import Database

async def test():
    await Database.connect()
    opps = Database.get_opportunities_collection()
    cursor = opps.aggregate([{"$group": {"_id": "$source_platform", "count": {"$sum": 1}}}])
    async for doc in cursor:
        print(doc)
    await Database.close()

if __name__ == "__main__":
    asyncio.run(test())
