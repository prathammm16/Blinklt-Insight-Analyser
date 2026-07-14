import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        
        # Parse allowed origins for CORS
        allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
        self.allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]
        
        # Port for FastAPI
        self.port = int(os.getenv("PORT", "8000"))

settings = Settings()
