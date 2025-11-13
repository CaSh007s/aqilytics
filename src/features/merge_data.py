"""
Merge AQI and Weather data (current + mock historical).
Output: data/processed/delhi_merged.csv + delhi_features.csv
"""
import pandas as pd
import os
import logging
import ast

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_csv(filepath):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"{filepath} not found. Run fetch scripts first.")
    return pd.read_csv(filepath)

def merge_aqi_weather():
    # Load raw data
    aqi_current = load_csv("data/raw/delhi_current_aqi.csv")
    aqi_hist = load_csv("data/raw/delhi_historical_aqi.csv")
    weather_current = load_csv("data/raw/delhi_current_weather.csv")
    weather_hist = load_csv("data/raw/delhi_historical_weather.csv")

    # Combine current + historical
    aqi_df = pd.concat([aqi_current, aqi_hist], ignore_index=True)
    weather_df = pd.concat([weather_current, weather_hist], ignore_index=True)

    # Convert timestamp
    aqi_df['timestamp'] = pd.to_datetime(aqi_df['timestamp'])
    weather_df['timestamp'] = pd.to_datetime(weather_df['timestamp'])

    # === ROUND TO NEAREST HOUR (use 'h') ===
    aqi_df['hour_key'] = aqi_df['timestamp'].dt.floor('h')
    weather_df['hour_key'] = weather_df['timestamp'].dt.floor('h')

    # === MERGE ON HOUR + CITY ===
    merged = pd.merge(
        aqi_df,
        weather_df,
        on=['hour_key', 'city'],
        how='left',
        suffixes=('_aqi', '_weather')
    )

    # === RENAME timestamp_aqi → timestamp ===
    merged = merged.rename(columns={'timestamp_aqi': 'timestamp'})

    # === EXTRACT POLLUTANTS BEFORE DROPPING ===
    def extract_pollutant(pollutants_str, key):
        if pd.isna(pollutants_str):
            return None
        try:
            pollutants = ast.literal_eval(pollutants_str)
            return pollutants.get(key)
        except:
            return None

    # Extract only if column exists
    if 'pollutants' in merged.columns:
        merged['pm25'] = merged['pollutants'].apply(lambda x: extract_pollutant(x, 'pm25'))
        merged['pm10'] = merged['pollutants'].apply(lambda x: extract_pollutant(x, 'pm10'))
    else:
        merged['pm25'] = None
        merged['pm10'] = None

    # === CLEANUP: Drop raw columns ===
    drop_cols = ['pollutants', 'city_weather', 'timestamp_weather', 'hour_key']
    merged = merged.drop(columns=[col for col in drop_cols if col in merged.columns])

    # === FINAL COLUMNS ===
    final_cols = [
        'timestamp', 'city', 'aqi', 'pm25', 'pm10',
        'temp', 'humidity', 'wind_speed', 'pressure', 'rain_1h'
    ]
    # Ensure all columns exist
    for col in final_cols:
        if col not in merged.columns:
            merged[col] = None

    merged = merged[final_cols]

    # === FILL MISSING WEATHER (forward/backward fill) ===
    weather_cols = ['temp', 'humidity', 'wind_speed', 'pressure', 'rain_1h']
    merged[weather_cols] = merged[weather_cols].ffill().bfill()

    # === ADD FEATURES ===
    merged['timestamp'] = pd.to_datetime(merged['timestamp'])
    merged['hour'] = merged['timestamp'].dt.hour
    merged['is_night'] = merged['hour'].isin([22,23,0,1,2,3,4,5,6]).astype(int)
    merged['pm25_lag_1'] = merged['pm25'].shift(1)
    merged['temp_rolling_6h'] = merged['temp'].rolling(window=6, min_periods=1).mean()
    merged['wind_calms'] = (merged['wind_speed'] < 2).astype(int)

    # Save
    os.makedirs("data/processed", exist_ok=True)
    merged.to_csv("data/processed/delhi_merged.csv", index=False)
    merged.to_csv("data/processed/delhi_features.csv", index=False)
    logger.info(f"Merged {len(merged)} rows → data/processed/delhi_merged.csv")
    return merged

if __name__ == "__main__":
    df = merge_aqi_weather()
    print(df[['timestamp', 'city', 'aqi', 'pm25', 'temp', 'wind_speed', 'pm25_lag_1']].head())