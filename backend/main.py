import sys
import os
import types

# Dynamic package alias registration
# If 'backend' is not in search path (e.g. running from /backend directly), register the current folder modules as 'backend.*'
try:
    import backend.config
except ModuleNotFoundError:
    backend_mod = types.ModuleType('backend')
    sys.modules['backend'] = backend_mod
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
        
    try:
        import config as config_module
        sys.modules['backend.config'] = config_module
        backend_mod.config = config_module
        
        import collector as collector_module
        sys.modules['backend.collector'] = collector_module
        backend_mod.collector = collector_module
        
        import processor as processor_module
        sys.modules['backend.processor'] = processor_module
        backend_mod.processor = processor_module
        
        import analyzer as analyzer_module
        sys.modules['backend.analyzer'] = analyzer_module
        backend_mod.analyzer = analyzer_module
        
        import reporter as reporter_module
        sys.modules['backend.reporter'] = reporter_module
        backend_mod.reporter = reporter_module
        
        import database as database_module
        sys.modules['backend.database'] = database_module
        backend_mod.database = database_module
    except Exception as e:
        print(f"Failed to bootstrap package layout mapping: {e}", file=sys.stderr)

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

from backend.database import (
    is_db_configured,
    init_db,
    db_load_runs_history,
    db_save_run_entry,
    db_save_run_details,
    db_load_run_details,
    db_load_latest_data
)

# Initialize database schema if configured
try:
    init_db()
except Exception as dbe:
    logger.error(f"Database initialization error during start: {dbe}")

def load_runs_history() -> list:
    if is_db_configured():
        return db_load_runs_history()
    history_file = os.path.join(get_processed_dir(), "runs.json")
    if not os.path.exists(history_file):
        return []
    try:
        with open(history_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_run_entry(run_entry: dict):
    if is_db_configured():
        db_save_run_entry(run_entry)
        return
    history_file = os.path.join(get_processed_dir(), "runs.json")
    history = load_runs_history()
    history.insert(0, run_entry)  # Insert newest first
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

def save_run_details(run_id: str, details: dict):
    if is_db_configured():
        db_save_run_details(run_id, details)
        return
    file_path = os.path.join(get_processed_dir(), f"run_{run_id}_details.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(details, f, indent=2, ensure_ascii=False)

def load_run_details(run_id: str) -> dict:
    if is_db_configured():
        details = db_load_run_details(run_id)
        if not details:
            raise HTTPException(status_code=404, detail=f"Run details for ID '{run_id}' not found.")
        return details
    file_path = os.path.join(get_processed_dir(), f"run_{run_id}_details.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Run details for ID '{run_id}' not found.")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

# Request Models
class ScrapeRequest(BaseModel):
    app_id_or_url: str
    count: int = 100

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "message": "Blinkit Insight AI API is running. Check health at /api/health"
    }

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

@app.get("/api/analysis/latest")
def get_latest_analysis():
    """
    Returns the latest processed analysis results JSON.
    """
    if is_db_configured():
        latest = db_load_latest_data("analysis_results")
        if latest:
            return latest
    processed_dir = get_processed_dir()
    analysis_file = os.path.join(processed_dir, "analysis_results.json")
    if os.path.exists(analysis_file):
        try:
            with open(analysis_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading analysis_results.json: {e}")
    history = load_runs_history()
    if history:
        latest_run_id = history[0]["run_id"]
        return load_run_details(latest_run_id)
    raise HTTPException(status_code=404, detail="No analysis results available.")

@app.get("/api/reviews")
def get_processed_reviews():
    """
    Returns the list of processed & cleaned reviews.
    """
    if is_db_configured():
        reviews = db_load_latest_data("processed_reviews")
        if reviews is not None:
            return reviews
    processed_dir = get_processed_dir()
    reviews_file = os.path.join(processed_dir, "processed_reviews.json")
    if os.path.exists(reviews_file):
        try:
            with open(reviews_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading processed_reviews.json: {e}")
    return []

@app.get("/api/run/{run_id}")
def get_run(run_id: str):
    """
    Loads saved analysis run details for a given run ID.
    """
    return load_run_details(run_id)

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
