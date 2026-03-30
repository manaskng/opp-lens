"""
Data Migration Script: Auto-assign categories and difficulty to existing events.

Run this once to backfill existing events in MongoDB with the new
'category' and 'difficulty' fields used by the ML recommendation engine.

Usage:
    Set MONGODB_URI environment variable, then:
    python seed_categories.py

    Or pass it inline:
    MONGODB_URI="mongodb+srv://..." python seed_categories.py
"""

import os
import sys
from pymongo import MongoClient

# ─────────────────────────────────────────────
# TAG → CATEGORY MAPPING
# ─────────────────────────────────────────────

TAG_TO_CATEGORY = {
    # Frontend
    "react": "frontend", "next.js": "frontend", "nextjs": "frontend",
    "vue": "frontend", "angular": "frontend", "svelte": "frontend",
    "css": "frontend", "tailwind": "frontend", "html": "frontend",
    "javascript": "frontend", "typescript": "frontend", "frontend": "frontend",
    "ui": "frontend", "ux": "frontend", "web": "frontend",
    "jsx": "frontend", "redux": "frontend", "webpack": "frontend",
    
    # Backend
    "node.js": "backend", "nodejs": "backend", "express": "backend",
    "django": "backend", "flask": "backend", "fastapi": "backend",
    "spring": "backend", "java": "backend", "python": "backend",
    "go": "backend", "golang": "backend", "rust": "backend",
    "api": "backend", "rest": "backend", "graphql": "backend",
    "backend": "backend", "microservices": "backend",
    
    # DevOps
    "docker": "devops", "kubernetes": "devops", "k8s": "devops",
    "ci/cd": "devops", "jenkins": "devops", "terraform": "devops",
    "ansible": "devops", "devops": "devops", "linux": "devops",
    "monitoring": "devops", "infrastructure": "devops",
    
    # AI / ML
    "ai": "ai-ml", "ml": "ai-ml", "machine-learning": "ai-ml",
    "deep-learning": "ai-ml", "tensorflow": "ai-ml", "pytorch": "ai-ml",
    "nlp": "ai-ml", "gpt": "ai-ml", "llm": "ai-ml", "chatgpt": "ai-ml",
    "data-science": "ai-ml", "neural": "ai-ml", "computer-vision": "ai-ml",
    "generative-ai": "ai-ml", "artificial-intelligence": "ai-ml",
    
    # Mobile
    "react-native": "mobile", "flutter": "mobile", "swift": "mobile",
    "kotlin": "mobile", "ios": "mobile", "android": "mobile",
    "mobile": "mobile",
    
    # Blockchain
    "blockchain": "blockchain", "web3": "blockchain", "ethereum": "blockchain",
    "solidity": "blockchain", "crypto": "blockchain", "nft": "blockchain",
    "defi": "blockchain", "smart-contracts": "blockchain",
    
    # Cloud
    "aws": "cloud", "azure": "cloud", "gcp": "cloud",
    "cloud": "cloud", "serverless": "cloud", "lambda": "cloud",
    "firebase": "cloud", "vercel": "cloud",
    
    # Security
    "security": "security", "cybersecurity": "security",
    "penetration-testing": "security", "encryption": "security",
    "oauth": "security", "authentication": "security",
    
    # Data
    "database": "data", "sql": "data", "nosql": "data",
    "mongodb": "data", "postgresql": "data", "redis": "data",
    "elasticsearch": "data", "big-data": "data", "analytics": "data",
    "data-engineering": "data",
    
    # Design
    "design": "design", "figma": "design", "ui-design": "design",
    "ux-design": "design", "prototyping": "design",
}

# Tag-based difficulty hints
ADVANCED_TAGS = {
    "architecture", "system-design", "distributed", "performance",
    "scaling", "advanced", "expert", "deep-dive", "internals",
    "low-level", "compiler", "kernel",
}

BEGINNER_TAGS = {
    "beginner", "introduction", "intro", "getting-started", "basics",
    "101", "fundamentals", "tutorial", "workshop", "hands-on",
    "first-steps", "bootcamp",
}


def infer_category(tags: list[str]) -> str:
    """Infer a category from event tags using the mapping."""
    category_votes: dict[str, int] = {}
    
    for tag in tags:
        tag_lower = tag.lower().strip()
        cat = TAG_TO_CATEGORY.get(tag_lower)
        if cat:
            category_votes[cat] = category_votes.get(cat, 0) + 1
    
    if not category_votes:
        return "general"
    
    # Return the category with most votes
    return max(category_votes, key=category_votes.get)


def infer_difficulty(tags: list[str], title: str) -> str:
    """Infer difficulty from tags and title keywords."""
    all_text = set(t.lower().strip() for t in tags)
    all_text.update(title.lower().split())
    
    if all_text & ADVANCED_TAGS:
        return "advanced"
    if all_text & BEGINNER_TAGS:
        return "beginner"
    return "intermediate"


def main():
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        print("❌ ERROR: Set the MONGODB_URI environment variable.")
        print("   Example: MONGODB_URI='mongodb+srv://...' python seed_categories.py")
        sys.exit(1)

    client = MongoClient(uri)
    
    # Auto-detect database name from the URI
    db_name = uri.split("/")[-1].split("?")[0] if "/" in uri else "test"
    db = client[db_name]
    events_collection = db["events"]

    # Find all events
    events = list(events_collection.find({}))
    print(f"📊 Found {len(events)} events in database '{db_name}'")

    updated = 0
    skipped = 0

    for event in events:
        tags = event.get("tags", [])
        title = event.get("title", "")
        
        # Only update if category or difficulty is missing/default
        needs_update = {}
        
        current_cat = event.get("category", "")
        if not current_cat or current_cat == "general":
            inferred_cat = infer_category(tags)
            if inferred_cat != "general":
                needs_update["category"] = inferred_cat

        current_diff = event.get("difficulty", "")
        if not current_diff:
            needs_update["difficulty"] = infer_difficulty(tags, title)

        # Initialize viewCount if missing
        if "viewCount" not in event:
            needs_update["viewCount"] = 0

        if needs_update:
            events_collection.update_one(
                {"_id": event["_id"]},
                {"$set": needs_update}
            )
            updated += 1
            print(f"  ✅ Updated: \"{title[:50]}\" → {needs_update}")
        else:
            skipped += 1

    print(f"\n🎯 Done! Updated: {updated}, Skipped (already set): {skipped}")
    client.close()


if __name__ == "__main__":
    main()
