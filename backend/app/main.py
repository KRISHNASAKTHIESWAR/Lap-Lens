"""
Main FastAPI application
"""
import logging
import logging.config
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()


from app.core.config import API_TITLE, API_VERSION, API_DESCRIPTION, LOGGING_LEVEL
from app.api import routes

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOGGING_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager for application lifecycle events.
    
    Startup: Initialize models
    Shutdown: Clean up resources
    """
    logger.info("Application startup")
    yield
    logger.info("Application shutdown")


# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(routes.router, prefix="/api", tags=["predictions"])


@app.get("/", tags=["health"])
async def root():
    """Root endpoint"""
    return {
        "message": "F1 Telemetry Prediction API",
        "version": API_VERSION,
        "docs": "/docs"
    }


@app.get("/health", tags=["health"])
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "F1 Telemetry API"}


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting F1 Telemetry Prediction API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
