import logging
from typing import List
from ..models import OpportunityWithEmbedding, DedupDecision
from ..config import settings
from ..db import Database
import numpy as np

logger = logging.getLogger(__name__)

class DeduplicationEngine:
    def __init__(self):
        self.threshold = settings.dedup_similarity_threshold

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        a = np.array(v1)
        b = np.array(v2)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    async def _find_closest_match_in_memory(self, new_opp: OpportunityWithEmbedding):
        """Fallback deduplication using in-memory cosine similarity."""
        opportunities_collection = Database.get_opportunities_collection()
        best_match = None
        best_score = -1.0
        
        cursor = opportunities_collection.find({}, {"_id": 1, "title": 1, "embedding": 1})
        async for existing in cursor:
            if "embedding" not in existing or not existing["embedding"]:
                continue
            
            score = self._cosine_similarity(new_opp.embedding, existing["embedding"])
            if score > best_score:
                best_score = score
                best_match = existing
                
        if best_score >= self.threshold:
            return best_match, best_score
        return None, best_score

    async def _find_closest_match_vector_search(self, new_opp: OpportunityWithEmbedding):
        """Use Atlas Vector Search if the index 'vector_index' is set up."""
        opportunities_collection = Database.get_opportunities_collection()
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": new_opp.embedding,
                    "numCandidates": 50,
                    "limit": 1
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        try:
            results = await opportunities_collection.aggregate(pipeline).to_list(length=1)
            if results:
                best = results[0]
                if best.get("score", 0) >= self.threshold:
                    return best, best["score"]
                return None, best.get("score", 0)
        except Exception as e:
            # Fallback if the Atlas index hasn't been created yet or isn't supported
            return await self._find_closest_match_in_memory(new_opp)
            
        return await self._find_closest_match_in_memory(new_opp)

    async def deduplicate_and_store(self, new_opps: List[OpportunityWithEmbedding]):
        opportunities_collection = Database.get_opportunities_collection()
        dedup_log = Database.get_dedup_log_collection()
        
        new_inserted = 0
        merged = 0
        
        for opp in new_opps:
            # Exact match by URL check
            existing_exact = await opportunities_collection.find_one({"source_url": opp.source_url})
            if existing_exact:
                await opportunities_collection.update_one(
                    {"_id": existing_exact["_id"]},
                    {"$set": {"scraped_at": opp.scraped_at}}
                )
                continue
                
            # Semantic search
            match, score = await self._find_closest_match_vector_search(opp)
            
            if match:
                decision = DedupDecision(
                    new_opp_title=opp.title,
                    new_opp_source=opp.source_platform,
                    new_opp_url=opp.source_url,
                    decision="merged",
                    canonical_id=str(match["_id"]),
                    canonical_title=match["title"],
                    similarity_score=score,
                    merge_details=f"Merged into {match['title']} ({score:.3f})"
                )
                
                await opportunities_collection.update_one(
                    {"_id": match["_id"]},
                    {
                        "$addToSet": {
                            "alternate_sources": {
                                "platform": opp.source_platform,
                                "url": opp.source_url
                            }
                        },
                        "$set": {"scraped_at": opp.scraped_at}
                    }
                )
                merged += 1
            else:
                decision = DedupDecision(
                    new_opp_title=opp.title,
                    new_opp_source=opp.source_platform,
                    new_opp_url=opp.source_url,
                    decision="new_canonical",
                    canonical_id=None,
                    canonical_title=None,
                    similarity_score=score if score > -1.0 else None,
                    merge_details="No close match found"
                )
                
                opp_dict = opp.model_dump()
                opp_dict["alternate_sources"] = []
                opp_dict["popularity_score"] = 0
                opp_dict["is_canonical"] = True
                await opportunities_collection.insert_one(opp_dict)
                new_inserted += 1
                
            await dedup_log.insert_one(decision.model_dump())
            
        logger.info(f"Dedup complete: {new_inserted} new canonicals, {merged} merged.")
        return new_inserted, merged
