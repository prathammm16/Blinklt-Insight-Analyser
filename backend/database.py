import os
import json
import logging

logger = logging.getLogger("Database")

DATABASE_URL = os.getenv("DATABASE_URL", "")

def is_db_configured() -> bool:
    """Returns True if a database URL is configured in the environment."""
    return bool(DATABASE_URL.strip())

def get_connection():
    """Returns a connection to the configured database (PostgreSQL or SQLite)."""
    db_url = DATABASE_URL.strip()
    if not db_url:
        return None

    # Replace postgres:// with postgresql:// if needed for SQLAlchemy/psycopg2
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    if db_url.startswith("postgresql://"):
        try:
            import psycopg2
            return psycopg2.connect(db_url)
        except ImportError:
            logger.error("psycopg2-binary package is missing! Ensure it is installed for PostgreSQL support.")
            raise
        except Exception as e:
            logger.error(f"Error connecting to PostgreSQL database: {e}")
            raise
    else:
        # Fallback to local SQLite if DATABASE_URL is custom or a sqlite:// connection string
        import sqlite3
        # Extract file path if connection string is formatted like sqlite:///runs.db
        path = db_url.replace("sqlite:///", "").replace("sqlite://", "")
        if not path:
            path = "runs.db"
        try:
            return sqlite3.connect(path)
        except Exception as e:
            logger.error(f"Error connecting to SQLite database at {path}: {e}")
            raise

def init_db():
    """Initializes the database schema if configured."""
    if not is_db_configured():
        return
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Create runs table (handles history + run details)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS runs (
                run_id VARCHAR(100) PRIMARY KEY,
                timestamp VARCHAR(100),
                source VARCHAR(100),
                status VARCHAR(100),
                review_count INTEGER,
                rating_breakdown TEXT,
                top_themes TEXT,
                run_details TEXT
            )
        """)
        
        # Create latest_data table (handles processed_reviews, analysis_results key-value)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS latest_data (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT
            )
        """)
        
        conn.commit()
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database schema: {e}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def db_load_runs_history() -> list:
    """Loads run history from database."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return []
        cursor = conn.cursor()
        cursor.execute("SELECT run_id, timestamp, source, status, review_count, rating_breakdown, top_themes FROM runs ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        
        history = []
        for row in rows:
            history.append({
                "run_id": row[0],
                "timestamp": row[1],
                "source": row[2],
                "status": row[3],
                "review_count": row[4],
                "rating_breakdown": json.loads(row[5]) if row[5] else {},
                "top_themes": json.loads(row[6]) if row[6] else []
            })
        return history
    except Exception as e:
        logger.error(f"Error loading runs history from database: {e}")
        return []
    finally:
        if conn:
            conn.close()

def db_save_run_entry(run_entry: dict):
    """Saves or updates a run entry in the runs table."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return
        cursor = conn.cursor()
        
        is_postgres = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")
        placeholder = "%s" if is_postgres else "?"
        
        sql = f"""
            INSERT INTO runs (run_id, timestamp, source, status, review_count, rating_breakdown, top_themes)
            VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
            ON CONFLICT (run_id)
            DO UPDATE SET
                timestamp = EXCLUDED.timestamp,
                source = EXCLUDED.source,
                status = EXCLUDED.status,
                review_count = EXCLUDED.review_count,
                rating_breakdown = EXCLUDED.rating_breakdown,
                top_themes = EXCLUDED.top_themes
        """
        
        cursor.execute(sql, (
            run_entry["run_id"],
            run_entry["timestamp"],
            run_entry["source"],
            run_entry["status"],
            run_entry["review_count"],
            json.dumps(run_entry.get("rating_breakdown", {})),
            json.dumps(run_entry.get("top_themes", []))
        ))
        conn.commit()
    except Exception as e:
        logger.error(f"Error saving run entry to database: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

def db_save_run_details(run_id: str, details: dict):
    """Saves or updates detailed run data in the runs table."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return
        cursor = conn.cursor()
        
        is_postgres = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")
        placeholder = "%s" if is_postgres else "?"
        
        cursor.execute(f"SELECT run_id FROM runs WHERE run_id = {placeholder}", (run_id,))
        exists = cursor.fetchone()
        
        if exists:
            cursor.execute(
                f"UPDATE runs SET run_details = {placeholder} WHERE run_id = {placeholder}",
                (json.dumps(details, ensure_ascii=False), run_id)
            )
        else:
            # Insert a skeletal run entry if it doesn't exist yet
            cursor.execute(
                f"""
                INSERT INTO runs (run_id, timestamp, source, status, review_count, rating_breakdown, top_themes, run_details)
                VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
                """,
                (
                    run_id,
                    details.get("timestamp", ""),
                    details.get("source", ""),
                    "completed",
                    details.get("summary", {}).get("total_reviews", 0),
                    json.dumps(details.get("summary", {}).get("sentiment_distribution", {})),
                    json.dumps(details.get("themes", [])),
                    json.dumps(details, ensure_ascii=False)
                )
            )
        conn.commit()
    except Exception as e:
        logger.error(f"Error saving run details to database: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

def db_load_run_details(run_id: str) -> dict:
    """Loads detailed run data from database."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return {}
        cursor = conn.cursor()
        
        is_postgres = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")
        placeholder = "%s" if is_postgres else "?"
        
        cursor.execute(f"SELECT run_details FROM runs WHERE run_id = {placeholder}", (run_id,))
        row = cursor.fetchone()
        if row and row[0]:
            return json.loads(row[0])
        return {}
    except Exception as e:
        logger.error(f"Error loading run details from database: {e}")
        return {}
    finally:
        if conn:
            conn.close()

def db_save_latest_data(key: str, data: any):
    """Saves latest reviews or latest analysis results to key-value table."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return
        cursor = conn.cursor()
        
        is_postgres = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")
        placeholder = "%s" if is_postgres else "?"
        
        sql = f"""
            INSERT INTO latest_data (key, value)
            VALUES ({placeholder}, {placeholder})
            ON CONFLICT (key)
            DO UPDATE SET value = EXCLUDED.value
        """
        
        cursor.execute(sql, (key, json.dumps(data, ensure_ascii=False)))
        conn.commit()
    except Exception as e:
        logger.error(f"Error saving latest data for key '{key}' to database: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

def db_load_latest_data(key: str) -> any:
    """Loads latest reviews or latest analysis results from key-value table."""
    conn = None
    try:
        conn = get_connection()
        if not conn:
            return None
        cursor = conn.cursor()
        
        is_postgres = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")
        placeholder = "%s" if is_postgres else "?"
        
        cursor.execute(f"SELECT value FROM latest_data WHERE key = {placeholder}", (key,))
        row = cursor.fetchone()
        if row and row[0]:
            return json.loads(row[0])
        return None
    except Exception as e:
        logger.error(f"Error loading latest data for key '{key}' from database: {e}")
        return None
    finally:
        if conn:
            conn.close()
