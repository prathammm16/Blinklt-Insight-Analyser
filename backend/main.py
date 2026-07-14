from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import datetime
import uuid
import logging
from backend.config import settings
from backend.collector import scrape_play_store, scrape_app_store, parse_csv_reviews
from backend.processor import preprocess_reviews
from backend.analyzer import analyze_reviews, classify_sentiments
from backend.reporter import compile_markdown_report

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MainAPI")

app = FastAPI(
    title="Blinkit Insight AI API",
    description="Multi-Source AI Discovery Engine backend for Blinkit customer reviews.",
    version="0.1.0"
)

# Configure CORS using settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helpers for runs history management
def get_processed_dir() -> str:
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    processed_dir = os.path.join(project_root, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)
    return processed_dir

def load_runs_history() -> list:
    history_file = os.path.join(get_processed_dir(), "runs.json")
    if not os.path.exists(history_file):
        return []
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_run_entry(run_entry: dict):
    history_file = os.path.join(get_processed_dir(), "runs.json")
    history = load_runs_history()
    history.insert(0, run_entry)  # Insert newest first
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

def save_run_details(run_id: str, details: dict):
    file_path = os.path.join(get_processed_dir(), f"run_{run_id}_details.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(details, f, indent=2, ensure_ascii=False)

def load_run_details(run_id: str) -> dict:
    file_path = os.path.join(get_processed_dir(), f"run_{run_id}_details.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Run details for ID '{run_id}' not found.")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

# Request Models
class ScrapeRequest(BaseModel):
    app_id_or_url: str
    count: int = 100

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Blinkit Insight AI API",
        "version": "0.1.0"
    }

@app.get("/api/history")
def get_history():
    """
    Returns historical ingestion and analysis execution logs.
    """
    return load_runs_history()

@app.get("/api/report/{run_id}")
def get_report(run_id: str):
    """
    Loads saved analysis run details and compiles them into a markdown PM Research Report.
    """
    details = load_run_details(run_id)
    report_md = compile_markdown_report(details)
    
    # Save the markdown report to Docs directory as a persistent export
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    docs_dir = os.path.join(project_root, "Docs")
    os.makedirs(docs_dir, exist_ok=True)
    
    report_path = os.path.join(docs_dir, "productResearchReport.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_md)
        
    return {
        "run_id": run_id,
        "markdown": report_md,
        "saved_path": report_path
    }

def run_ingestion_pipeline(raw_reviews: list[dict], source_name: str, app_id: str) -> dict:
    """
    Orchestrates the common ingestion, preprocessing, and Gemini analysis flow.
    """
    if not raw_reviews:
        raise HTTPException(status_code=400, detail="No reviews were fetched from the specified target.")
        
    # Count sources
    source_counts = {"play_store": 0, "app_store": 0, "csv_upload": 0}
    for r in raw_reviews:
        src = r.get("source", "csv_upload")
        if src in source_counts:
            source_counts[src] += 1
            
    # 1. Preprocessing (Cleaning, Deduplication, Lang Check)
    clean_reviews, stats = preprocess_reviews(raw_reviews)
    if not clean_reviews:
        raise HTTPException(
            status_code=400, 
            detail="All reviews were filtered out as spam, duplicates, or non-English."
        )
        
    # 2. Sentiment Classification
    clean_reviews = classify_sentiments(clean_reviews)
    
    # Calculate sentiment distribution metrics
    sentiments = {"positive": 0, "neutral": 0, "negative": 0}
    for r in clean_reviews:
        sent = r.get("sentiment", "neutral").lower()
        if sent in sentiments:
            sentiments[sent] += 1
            
    # 3. AI PM Synthesis
    try:
        analysis_result = analyze_reviews(clean_reviews)
    except Exception as e:
        logger.error(f"Gemini analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI synthesis failed: {str(e)}")
        
    # 4. Generate unique run ID and history entry
    run_id = f"run_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:4]}"
    run_entry = {
        "run_id": run_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "source": source_name,
        "app_id": app_id,
        "total_reviews": len(raw_reviews),
        "cleaned_reviews": len(clean_reviews),
        "status": "COMPLETED"
    }
    
    # Save historical index and granular analysis details
    save_run_entry(run_entry)
    
    run_details = {
        "run_id": run_id,
        "timestamp": run_entry["timestamp"],
        "source": source_name,
        "app_id": app_id,
        "stats": stats,
        "source_counts": source_counts,
        "sentiments": sentiments,
        **analysis_result
    }
    save_run_details(run_id, run_details)
    
    return run_details

@app.post("/api/analyze/scrape/play-store")
def analyze_play_store(request: ScrapeRequest):
    """
    Scrapes reviews from Google Play Store, cleans them, classifies sentiment, and clusters themes.
    """
    logger.info(f"Triggering Google Play analysis for: {request.app_id_or_url}")
    try:
        raw_reviews = scrape_play_store(request.app_id_or_url, count=request.count)
        return run_ingestion_pipeline(raw_reviews, "Google Play Store", request.app_id_or_url)
    except Exception as e:
        logger.error(f"Failed Play Store analysis: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze/scrape/app-store")
def analyze_app_store(request: ScrapeRequest):
    """
    Scrapes reviews from Apple App Store, cleans them, classifies sentiment, and clusters themes.
    """
    logger.info(f"Triggering App Store analysis for: {request.app_id_or_url}")
    try:
        raw_reviews = scrape_app_store(request.app_id_or_url, count=request.count)
        return run_ingestion_pipeline(raw_reviews, "Apple App Store", request.app_id_or_url)
    except Exception as e:
        logger.error(f"Failed App Store analysis: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze/upload")
def analyze_csv_upload(file: UploadFile = File(...), count: int = Form(100)):
    """
    Accepts raw CSV upload reviews sheet, parses, preprocesses, and conducts LLM synthesis.
    """
    logger.info(f"Triggering CSV upload analysis for: {file.filename}")
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV reviews sheets are supported.")
        
    try:
        file_bytes = file.file.read()
        raw_reviews = parse_csv_reviews(file_bytes)
        # Limit to the requested count if needed
        if len(raw_reviews) > count:
            raw_reviews = raw_reviews[:count]
        return run_ingestion_pipeline(raw_reviews, "CSV Upload", file.filename)
    except Exception as e:
        logger.error(f"Failed CSV upload analysis: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=settings.port, reload=True)
