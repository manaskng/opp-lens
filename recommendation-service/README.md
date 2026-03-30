# EventSync ML Recommendation Service

A FastAPI microservice providing ML-powered event recommendations using TF-IDF + Cosine Similarity, Feature-Based Scoring, and Collaborative Filtering.

## Local Development

### Prerequisites
- Python 3.9+

### Setup
```bash
cd recommendation-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

### Test the API
```bash
# Health check
curl http://localhost:8000/health

# Test recommendation (see test payload below)
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d @test_payload.json
```

## Deploy to Render

1. Push this directory to a **separate Git repo** (or subdirectory of your EventSync repo)
2. On Render dashboard → New → **Web Service**
3. Connect your repo
4. Settings:
   - **Runtime**: Docker
   - **Build Command**: (auto-detected from Dockerfile)
   - **Start Command**: (auto-detected from Dockerfile)
   - **Plan**: Free (sufficient for this service)
5. Deploy!
6. Copy the Render URL (e.g., `https://eventsync-recommendations.onrender.com`)
7. Set `RECOMMENDATION_SERVICE_URL` in your Next.js `.env.local`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/health` | Health check |
| POST | `/recommend` | Get ML recommendations |

## Architecture

```
Node.js Backend                    Python Microservice
─────────────────                  ────────────────────
1. Fetch user profile from DB
2. Fetch all upcoming events       
3. Fetch all bookings              
4. POST /recommend                 
   { user_profile, events,    →    5. TF-IDF vectorize
     all_bookings, limit }         6. Cosine similarity
                                   7. Feature scoring
                                   8. Collaborative filtering
                              ←    9. Return ranked results
10. Map event IDs to full objects
11. Send to frontend
```
