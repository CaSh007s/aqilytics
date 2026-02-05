import pandas as pd
import numpy as np
from datetime import datetime

class AQIFeatureEngineer:
    def __init__(self):
        self.target_col = 'AQI'
        # Features available in historical data AND fetchable from OpenWeatherMap
        self.base_features = [
            'PM2.5', 'PM10', 'NO2', 'NH3', 'SO2', 'CO', 'Ozone',  # Pollutants
            # If your dataset lacks explicit weather cols, we rely on pollutants + time
            # We will add placeholders for weather if missing in CSV
        ]
    
    def preprocess_date(self, df: pd.DataFrame, date_col='Date') -> pd.DataFrame:
        """Converts date column to datetime objects."""
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(by=date_col)
        return df

    def create_time_features(self, df: pd.DataFrame, date_col='Date') -> pd.DataFrame:
        """Extracts Month, Day, Weekday, Season from Date."""
        df = df.copy()
        df['month'] = df[date_col].dt.month
        df['day_of_week'] = df[date_col].dt.dayofweek
        df['day_of_year'] = df[date_col].dt.dayofyear
        
        # Simple season mapping (approximate for India)
        # Winter: 1, Summer: 2, Monsoon: 3, Post-Monsoon: 4
        df['season'] = df['month'].apply(lambda x: 1 if x in [12, 1, 2] else (2 if x in [3, 4, 5] else (3 if x in [6, 7, 8, 9] else 4)))
        return df

    def create_lag_features(self, df: pd.DataFrame, lags=[1, 3, 7]) -> pd.DataFrame:
        """
        Creates 'Lag' features: What was the AQI yesterday? 3 days ago?
        Crucial for time-series forecasting.
        """
        df = df.copy()
        for lag in lags:
            df[f'AQI_lag_{lag}'] = df[self.target_col].shift(lag)
        return df

    def create_rolling_features(self, df: pd.DataFrame, windows=[3, 7]) -> pd.DataFrame:
        """Creates Rolling Mean features."""
        df = df.copy()
        for window in windows:
            df[f'AQI_rolling_mean_{window}'] = df[self.target_col].rolling(window=window).mean()
        return df

    def prepare_training_data(self, filepath: str) -> pd.DataFrame:
        """Full pipeline to read CSV and output clean ML-ready dataframe."""
        df = pd.read_csv(filepath)
        # Assuming standard dataset cols: Date, PM2.5, PM10, NO2, NH3, SO2, CO, Ozone, AQI
        
        df = self.preprocess_date(df)
        df = self.create_time_features(df)
        df = self.create_lag_features(df)
        df = self.create_rolling_features(df)
        
        # Drop rows with NaN created by lags/rolling (first few days)
        df = df.dropna()
        
        return df