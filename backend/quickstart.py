#!/usr/bin/env python
"""
Quick start script - Run this to train models and start the server
"""
import sys
import subprocess
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

backend_path = Path(__file__).parent

def main():
    """Main entry point"""
    logger.info("F1 Telemetry Prediction System - Quick Start")
    logger.info("=" * 50)
    
    # Step 1: Train models
    logger.info("\nStep 1: Training models...")
    logger.info("-" * 50)
    
    try:
        train_result = subprocess.run(
            [sys.executable, str(backend_path / "train.py")],
            cwd=str(backend_path)
        )
        
        if train_result.returncode != 0:
            logger.error("Model training failed!")
            return False
        
        logger.info("Models trained successfully!")
        
    except Exception as e:
        logger.error(f"Error during training: {e}")
        return False
    
    # Step 2: Start server
    logger.info("\nStep 2: Starting API server...")
    logger.info("-" * 50)
    logger.info("Server will be available at http://localhost:8000")
    logger.info("API docs at http://localhost:8000/docs")
    logger.info("Press Ctrl+C to stop the server")
    logger.info("-" * 50)
    
    try:
        subprocess.run(
            [
                sys.executable, "-m", "uvicorn",
                "app.main:app",
                "--reload",
                "--host", "0.0.0.0",
                "--port", "8000"
            ],
            cwd=str(backend_path)
        )
        
    except KeyboardInterrupt:
        logger.info("\nServer stopped by user")
        return True
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
