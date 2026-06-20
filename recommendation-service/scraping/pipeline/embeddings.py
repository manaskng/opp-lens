import logging
from typing import List
from sentence_transformers import SentenceTransformer
from ..models import OpportunityRaw, OpportunityWithEmbedding
from ..config import settings

logger = logging.getLogger(__name__)

class EmbeddingEngine:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            logger.info(f"Loading embedding model {settings.embedding_model}...")
            cls._model = SentenceTransformer(settings.embedding_model)
        return cls._model

    @classmethod
    def generate_embeddings(cls, opps: List[OpportunityRaw]) -> List[OpportunityWithEmbedding]:
        if not opps:
            return []
            
        model = cls.get_model()
        
        texts_to_embed = []
        for opp in opps:
            # Combine fields to give semantic meaning
            text = f"{opp.title}. {opp.organizer}. {opp.description[:500]}"
            texts_to_embed.append(text)
            
        logger.info(f"Generating embeddings for {len(opps)} opportunities...")
        
        embeddings_array = model.encode(texts_to_embed)
        
        results = []
        for opp, emb in zip(opps, embeddings_array):
            opp_dict = opp.model_dump()
            opp_dict["embedding"] = emb.tolist()
            results.append(OpportunityWithEmbedding(**opp_dict))
            
        return results

    @classmethod
    def generate_text_embedding(cls, text: str) -> List[float]:
        """Generate embedding for a single text string (like user profile)."""
        model = cls.get_model()
        return model.encode([text])[0].tolist()

