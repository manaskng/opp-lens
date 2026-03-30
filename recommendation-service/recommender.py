"""
Hybrid ML Recommendation Engine for EventSync
Combines: TF-IDF Content Similarity + Feature Scoring + Collaborative Filtering
"""

import math
from datetime import datetime, date
from typing import Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ─────────────────────────────────────────────
# 1. CONTENT-BASED FILTERING (TF-IDF)
# ─────────────────────────────────────────────

def compute_content_scores(user_profile: dict, events: list[dict]) -> dict[str, float]:
    """
    Uses TF-IDF + Cosine Similarity to score events against user interests.
    
    - Builds a text representation of the user from interests and preferred categories
    - Builds a text representation of each event from title, tags, description, category
    - Vectorizes all text using TF-IDF
    - Computes cosine similarity between user vector and each event vector
    
    Returns: { event_id: similarity_score (0.0 - 1.0) }
    """
    if not events:
        return {}

    # Build user profile text from all available signals
    user_text_parts = []
    if user_profile.get("interests"):
        user_text_parts.extend(user_profile["interests"])
    if user_profile.get("preferredCategories"):
        user_text_parts.extend(user_profile["preferredCategories"])
    if user_profile.get("bio"):
        user_text_parts.append(user_profile["bio"])

    user_text = " ".join(user_text_parts) if user_text_parts else "technology"

    # Build event text representations
    event_texts = []
    event_ids = []
    for event in events:
        parts = [
            event.get("title", ""),
            " ".join(event.get("tags", [])),
            event.get("description", ""),
            event.get("overview", ""),
            event.get("category", ""),
            event.get("audience", ""),
        ]
        event_texts.append(" ".join(parts))
        event_ids.append(event["_id"])

    # TF-IDF Vectorization
    all_texts = [user_text] + event_texts
    
    try:
        tfidf = TfidfVectorizer(
            stop_words="english",
            max_features=5000,
            ngram_range=(1, 2),  # Capture bigrams like "machine learning"
            min_df=1,
            max_df=0.95,
        )
        matrix = tfidf.fit_transform(all_texts)

        # Cosine similarity: user (row 0) vs all events (rows 1..N)
        similarities = cosine_similarity(matrix[0:1], matrix[1:])[0]

        return {eid: float(sim) for eid, sim in zip(event_ids, similarities)}
    except ValueError:
        # Edge case: empty vocabulary (no valid words after stop word removal)
        return {eid: 0.0 for eid in event_ids}


# ─────────────────────────────────────────────
# 2. FEATURE-BASED SCORING
# ─────────────────────────────────────────────

DIFFICULTY_ORDER = {"beginner": 0, "intermediate": 1, "advanced": 2}


def compute_feature_score(user_profile: dict, event: dict, today: date) -> float:
    """
    Computes a heuristic score based on multiple signals:
    - Tag overlap
    - Category match
    - Mode preference
    - Difficulty match
    - Temporal recency
    - Popularity
    - Availability
    
    Returns: raw score (0.0 - ~12.0)
    """
    score = 0.0
    
    # 1. Tag Overlap
    user_interests = set(i.lower() for i in (user_profile.get("interests") or []))
    event_tags = set(t.lower() for t in (event.get("tags") or []))
    
    if event_tags:
        common = user_interests & event_tags
        tag_score = len(common) / len(event_tags)
        score += tag_score * 3.0

    # 2. Category Match
    preferred_cats = set(c.lower() for c in (user_profile.get("preferredCategories") or []))
    event_category = (event.get("category") or "").lower()
    if event_category and event_category in preferred_cats:
        score += 2.0

    # 3. Mode Preference
    preferred_mode = (user_profile.get("preferredMode") or "any").lower()
    event_mode = (event.get("mode") or "").lower()
    if preferred_mode == "any" or preferred_mode == event_mode:
        score += 1.0
    elif preferred_mode == "hybrid":
        score += 0.5  # Hybrid users are flexible

    # 4. Difficulty Match
    user_level = (user_profile.get("skillLevel") or "intermediate").lower()
    event_diff = (event.get("difficulty") or "intermediate").lower()
    
    user_ord = DIFFICULTY_ORDER.get(user_level, 1)
    event_ord = DIFFICULTY_ORDER.get(event_diff, 1)
    diff_gap = abs(user_ord - event_ord)
    
    if diff_gap == 0:
        score += 1.5
    elif diff_gap == 1:
        score += 0.5

    # 5. Recency Boost
    try:
        event_date_str = event.get("date", "")
        if event_date_str:
            event_date = datetime.fromisoformat(event_date_str.split("T")[0]).date()
            days_away = (event_date - today).days
            
            if days_away < 0:
                score -= 2.0  # Past events penalized
            elif days_away <= 7:
                score += 3.0
            elif days_away <= 30:
                score += 1.5
            elif days_away <= 90:
                score += 0.5
    except (ValueError, TypeError):
        pass

    # 6. Popularity
    seats_taken = event.get("seatsTaken", 0) or 0
    score += math.log(seats_taken + 1) * 0.5

    # 7. Availability Penalty
    capacity = event.get("capacity", 50) or 50
    if seats_taken >= capacity:
        score -= 5.0

    return max(score, 0.0)


def normalize_feature_scores(scores: dict[str, float]) -> dict[str, float]:
    """Normalize feature scores to 0.0 - 1.0 range."""
    if not scores:
        return {}
    
    values = list(scores.values())
    min_val = min(values)
    max_val = max(values)
    
    if max_val == min_val:
        return {k: 0.5 for k in scores}
    
    return {
        k: (v - min_val) / (max_val - min_val)
        for k, v in scores.items()
    }


# ─────────────────────────────────────────────
# 3. COLLABORATIVE FILTERING
# ─────────────────────────────────────────────

def compute_collaborative_scores(
    user_email: str,
    events: list[dict],
    all_bookings: list[dict],
    min_overlap: int = 1,
) -> dict[str, float]:
    """
    User-User Collaborative Filtering based on booking co-occurrence.
    
    1. Find events the target user has booked
    2. Find other users who booked the same events (similar users)
    3. See what other events those similar users booked
    4. Boost events that more similar users attended
    
    Returns: { event_id: collaborative_score (0.0 - 1.0) }
    """
    if not all_bookings:
        return {e["_id"]: 0.0 for e in events}

    # Group bookings by user
    user_bookings: dict[str, set[str]] = {}
    for booking in all_bookings:
        email = booking.get("email", "")
        event_id = booking.get("eventId", "")
        if email and event_id:
            if email not in user_bookings:
                user_bookings[email] = set()
            user_bookings[email].add(event_id)

    # Get target user's booked events
    my_events = user_bookings.get(user_email, set())
    
    if not my_events:
        return {e["_id"]: 0.0 for e in events}

    # Find similar users
    similar_users = []
    for other_email, other_events in user_bookings.items():
        if other_email == user_email:
            continue
        overlap = len(my_events & other_events)
        if overlap >= min_overlap:
            similar_users.append((other_email, other_events, overlap))

    if not similar_users:
        return {e["_id"]: 0.0 for e in events}

    # Score events based on how many similar users booked them
    scores = {}
    for event in events:
        eid = event["_id"]
        if eid in my_events:
            # User already booked this → don't recommend
            scores[eid] = 0.0
            continue
        
        # Weighted count: users with more overlap contribute more
        weighted_count = sum(
            overlap_count for (_, events_set, overlap_count) in similar_users
            if eid in events_set
        )
        scores[eid] = weighted_count

    # Normalize to 0.0 - 1.0
    max_score = max(scores.values()) if scores else 1.0
    if max_score > 0:
        scores = {k: v / max_score for k, v in scores.items()}

    return scores


# ─────────────────────────────────────────────
# 4. HYBRID RECOMMENDER
# ─────────────────────────────────────────────

def generate_reason(
    user_profile: dict,
    event: dict,
    content_score: float,
    feature_score: float,
    collab_score: float,
    today: date,
) -> str:
    """Generate a human-readable reason for why this event was recommended."""
    reasons = []
    
    # Content match
    user_interests = set(i.lower() for i in (user_profile.get("interests") or []))
    event_tags = set(t.lower() for t in (event.get("tags") or []))
    common = user_interests & event_tags
    
    if common:
        top_matches = list(common)[:3]
        reasons.append(f"Matches your interest in {', '.join(top_matches)}")
    elif content_score > 0.3:
        reasons.append("Related to your interests")

    # Category match
    preferred_cats = set(c.lower() for c in (user_profile.get("preferredCategories") or []))
    event_cat = (event.get("category") or "").lower()
    if event_cat and event_cat in preferred_cats:
        reasons.append(f"{event_cat.replace('-', ' ').title()} event")

    # Recency
    try:
        event_date_str = event.get("date", "")
        if event_date_str:
            event_date = datetime.fromisoformat(event_date_str.split("T")[0]).date()
            days = (event_date - today).days
            if 0 <= days <= 7:
                reasons.append("Happening soon")
    except (ValueError, TypeError):
        pass

    # Popularity
    seats = event.get("seatsTaken", 0) or 0
    capacity = event.get("capacity", 50) or 50
    if capacity > 0 and seats / capacity > 0.6:
        reasons.append("Popular")

    # Collaborative
    if collab_score > 0.2:
        reasons.append("Attended by similar users")

    return " · ".join(reasons[:3]) if reasons else "Recommended for you"


def recommend(
    user_profile: dict,
    events: list[dict],
    all_bookings: list[dict],
    limit: int = 6,
) -> list[dict]:
    """
    Main hybrid recommendation function.
    
    Combines:
    - Content-based (TF-IDF + Cosine Similarity)
    - Feature-based (weighted heuristics)
    - Collaborative (user-user co-occurrence)
    
    With dynamic weight adjustment based on data availability.
    
    Returns: [{ event_id, score, reason }, ...]
    """
    if not events:
        return []

    today = date.today()
    user_email = user_profile.get("email", "")

    # --- Compute individual scores ---
    content_scores = compute_content_scores(user_profile, events)
    
    raw_feature_scores = {}
    for event in events:
        raw_feature_scores[event["_id"]] = compute_feature_score(user_profile, event, today)
    feature_scores = normalize_feature_scores(raw_feature_scores)
    
    collab_scores = compute_collaborative_scores(user_email, events, all_bookings)

    # --- Dynamic weights based on data availability ---
    total_bookings = len(all_bookings)
    user_has_bookings = bool(
        any(b.get("email") == user_email for b in all_bookings)
    )
    user_has_interests = bool(user_profile.get("interests"))

    if not user_has_interests and not user_has_bookings:
        # Completely cold user: popularity + recency only
        weights = {"content": 0.1, "feature": 0.9, "collab": 0.0}
    elif total_bookings < 10:
        weights = {"content": 0.55, "feature": 0.45, "collab": 0.0}
    elif total_bookings < 50:
        weights = {"content": 0.50, "feature": 0.35, "collab": 0.15}
    else:
        weights = {"content": 0.45, "feature": 0.30, "collab": 0.25}

    # --- Combine scores ---
    results = []
    for event in events:
        eid = event["_id"]
        
        c_score = content_scores.get(eid, 0.0)
        f_score = feature_scores.get(eid, 0.0)
        co_score = collab_scores.get(eid, 0.0)
        
        final_score = (
            weights["content"] * c_score
            + weights["feature"] * f_score
            + weights["collab"] * co_score
        )

        reason = generate_reason(
            user_profile, event, c_score, f_score, co_score, today
        )

        results.append({
            "event_id": eid,
            "score": round(final_score, 4),
            "reason": reason,
            "debug": {
                "content": round(c_score, 4),
                "feature": round(f_score, 4),
                "collaborative": round(co_score, 4),
                "weights": weights,
            },
        })

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)

    # Filter out events the user already booked
    user_booked_ids = set(
        b.get("eventId") for b in all_bookings
        if b.get("email") == user_email
    )
    results = [r for r in results if r["event_id"] not in user_booked_ids]

    return results[:limit]
