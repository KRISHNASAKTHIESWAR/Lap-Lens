"""
Data preprocessing utilities
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import logging
from typing import Tuple, List, Dict, Any

logger = logging.getLogger(__name__)


def handle_missing_values(df: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
    """
    Handle missing values in the dataframe.
    
    Args:
        df: Input dataframe
        strategy: Strategy for handling missing values ('mean', 'median', 'forward_fill')
    
    Returns:
        Dataframe with missing values handled
    """
    df_clean = df.copy()
    
    if strategy == 'mean':
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        df_clean[numeric_cols] = df_clean[numeric_cols].fillna(df_clean[numeric_cols].mean())
    elif strategy == 'median':
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        df_clean[numeric_cols] = df_clean[numeric_cols].fillna(df_clean[numeric_cols].median())
    elif strategy == 'forward_fill':
        df_clean = df_clean.fillna(method='ffill').fillna(method='bfill')
    
    logger.info(f"Missing values handled using '{strategy}' strategy")
    return df_clean


def scale_features(X: pd.DataFrame, scaler: StandardScaler = None, fit: bool = False) -> Tuple[np.ndarray, StandardScaler]:
    """
    Scale features using StandardScaler.
    
    Args:
        X: Input features dataframe
        scaler: Existing scaler object (if fit=False)
        fit: Whether to fit the scaler on the data
    
    Returns:
        Tuple of (scaled features, scaler object)
    """
    if fit:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        logger.info(f"Scaler fitted on {X.shape[0]} samples, {X.shape[1]} features")
    else:
        if scaler is None:
            raise ValueError("Scaler object required when fit=False")
        X_scaled = scaler.transform(X)
        logger.info(f"Features scaled using existing scaler")
    
    return X_scaled, scaler


def remove_outliers(df: pd.DataFrame, z_threshold: float = 3.0) -> pd.DataFrame:
    """
    Remove outliers using z-score method.
    
    Args:
        df: Input dataframe
        z_threshold: Z-score threshold for outlier detection
    
    Returns:
        Dataframe with outliers removed
    """
    from scipy import stats
    
    df_clean = df.copy()
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    
    z_scores = np.abs(stats.zscore(df_clean[numeric_cols]))
    mask = (z_scores < z_threshold).all(axis=1)
    
    initial_rows = len(df_clean)
    df_clean = df_clean[mask]
    removed_rows = initial_rows - len(df_clean)
    
    logger.info(f"Removed {removed_rows} outliers ({removed_rows/initial_rows*100:.2f}%)")
    return df_clean


def select_features(df: pd.DataFrame, feature_list: List[str]) -> pd.DataFrame:
    """
    Select specific features from dataframe.
    
    Args:
        df: Input dataframe
        feature_list: List of features to select
    
    Returns:
        Dataframe with selected features
    """
    missing_features = set(feature_list) - set(df.columns)
    if missing_features:
        logger.warning(f"Missing features in dataframe: {missing_features}")
    
    available_features = [f for f in feature_list if f in df.columns]
    return df[available_features]


def validate_input_data(data: Dict[str, Any], required_fields: List[str]) -> Tuple[bool, str]:
    """
    Validate input data contains all required fields.
    
    Args:
        data: Input data dictionary
        required_fields: List of required field names
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    missing = set(required_fields) - set(data.keys())
    if missing:
        return False, f"Missing required fields: {missing}"
    
    # Check for NaN or None values
    for field in required_fields:
        if data[field] is None or (isinstance(data[field], float) and np.isnan(data[field])):
            return False, f"Field '{field}' contains invalid value"
    
    return True, ""


def normalize_categorical_values(value: str) -> str:
    """
    Normalize categorical values to standard format.
    
    Args:
        value: Input categorical value
    
    Returns:
        Normalized categorical value
    """
    return str(value).upper().strip()


def preprocess_input_dict(input_dict: Dict[str, Any], numeric_features: List[str]) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Preprocess input dictionary into scaled features.
    
    Args:
        input_dict: Input data dictionary
        numeric_features: List of numeric feature names
    
    Returns:
        Tuple of (preprocessed features array, metadata dict)
    """
    # Extract features in correct order
    feature_values = {}
    for feature in numeric_features:
        if feature in input_dict:
            feature_values[feature] = float(input_dict[feature])
        else:
            raise ValueError(f"Missing feature: {feature}")
    
    # Create feature array
    X = np.array([list(feature_values.values())])
    
    metadata = {
        'session_id': input_dict.get('session_id', 'unknown'),
        'vehicle_id': int(input_dict.get('vehicle_id', 0)),
        'lap': int(input_dict.get('lap', 0))
    }
    
    return X, metadata
