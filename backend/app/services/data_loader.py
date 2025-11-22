"""
Data loading utilities
"""
import pandas as pd
import numpy as np
import logging
from pathlib import Path
from typing import Tuple, Optional

logger = logging.getLogger(__name__)


class DataLoader:
    """Handles loading and preparing telemetry data"""
    
    def __init__(self, data_dir: Path):
        """
        Initialize DataLoader.
        
        Args:
            data_dir: Path to data directory
        """
        self.data_dir = Path(data_dir)
        self.processed_dir = self.data_dir / "processed"
        self.raw_dir = self.data_dir / "raw" / "Race1"
        
        if not self.processed_dir.exists():
            logger.warning(f"Processed data directory does not exist: {self.processed_dir}")
        if not self.raw_dir.exists():
            logger.warning(f"Raw data directory does not exist: {self.raw_dir}")
    
    def load_processed_telemetry(self) -> pd.DataFrame:
        """
        Load processed telemetry data.
        
        Returns:
            DataFrame with processed telemetry data
        """
        telemetry_path = self.processed_dir / "telemetry_pivot.csv"
        
        if not telemetry_path.exists():
            raise FileNotFoundError(f"Telemetry data not found: {telemetry_path}")
        
        try:
            df = pd.read_csv(telemetry_path)
            logger.info(f"Loaded telemetry data: {df.shape[0]} rows, {df.shape[1]} columns")
            return df
        except Exception as e:
            logger.error(f"Error loading telemetry data: {e}")
            raise
    
    def load_processed_features(self) -> pd.DataFrame:
        """
        Load processed features with weather data.
        
        Returns:
            DataFrame with features and weather
        """
        features_path = self.processed_dir / "df_master_features_with_weather.csv"
        
        if not features_path.exists():
            raise FileNotFoundError(f"Features data not found: {features_path}")
        
        try:
            df = pd.read_csv(features_path)
            logger.info(f"Loaded features data: {df.shape[0]} rows, {df.shape[1]} columns")
            return df
        except Exception as e:
            logger.error(f"Error loading features data: {e}")
            raise
    
    def load_raw_telemetry(self) -> pd.DataFrame:
        """
        Load raw telemetry data from Race1.
        
        Returns:
            DataFrame with raw telemetry data
        """
        raw_telemetry_path = self.raw_dir / "raw_telemetry.csv"
        
        if not raw_telemetry_path.exists():
            raise FileNotFoundError(f"Raw telemetry not found: {raw_telemetry_path}")
        
        try:
            df = pd.read_csv(raw_telemetry_path)
            logger.info(f"Loaded raw telemetry: {df.shape[0]} rows, {df.shape[1]} columns")
            return df
        except Exception as e:
            logger.error(f"Error loading raw telemetry: {e}")
            raise
    
    def load_combined_data(self) -> pd.DataFrame:
        """
        Load and combine processed features and telemetry.
        
        Returns:
            Combined DataFrame with all features
        """
        try:
            features = self.load_processed_features()
            logger.info("Successfully loaded combined dataset")
            return features
        except FileNotFoundError:
            logger.info("Features file not found, attempting alternative load")
            return self.load_processed_telemetry()
    
    def validate_data_columns(self, df: pd.DataFrame, required_columns: list) -> Tuple[bool, list]:
        """
        Validate that dataframe contains required columns.
        
        Args:
            df: DataFrame to validate
            required_columns: List of required column names
        
        Returns:
            Tuple of (is_valid, missing_columns)
        """
        missing = set(required_columns) - set(df.columns)
        is_valid = len(missing) == 0
        
        if not is_valid:
            logger.warning(f"Missing columns: {missing}")
        
        return is_valid, list(missing)
    
    def get_data_info(self) -> dict:
        """
        Get information about available data files.
        
        Returns:
            Dictionary with data file information
        """
        info = {
            'processed_files': [],
            'raw_files': []
        }
        
        if self.processed_dir.exists():
            info['processed_files'] = [f.name for f in self.processed_dir.glob('*.csv')]
        
        if self.raw_dir.exists():
            info['raw_files'] = [f.name for f in self.raw_dir.glob('*.csv')]
        
        logger.info(f"Data info: {info}")
        return info
