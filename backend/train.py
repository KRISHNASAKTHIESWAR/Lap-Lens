#!/usr/bin/env python
"""
Training script - Run this to train all models
"""
import sys
import logging
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from app.services.train_model import train_models_cli

if __name__ == "__main__":
    train_models_cli()
