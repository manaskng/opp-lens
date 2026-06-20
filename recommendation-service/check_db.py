import asyncio
import json
from bson import json_util
from scraping.db import Database

async def test():
    await Database.connect()
    opps = Database.get_opportunities_collection()
    count = await opps.count_documents({})
    print(f"COUNT IN DB: {count}")
    doc = await opps.find_one({})
    if doc and "embedding" in doc:
        doc["embedding"] = f"List of {len(doc['embedding'])} floats"
    print(json.dumps(doc, default=json_util.default, indent=2))
    await Database.close()

if __name__ == "__main__":
    asyncio.run(test())
