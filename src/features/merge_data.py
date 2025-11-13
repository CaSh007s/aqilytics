"""
Merge AQI + Weather for any city.
Usage: python src/features/merge_data.py delhi
"""
import pandas as pd
import os
import logging
import ast
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_csv(filepath):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"{filepath} not found.")
    return pd.read_csv(filepath)

def merge_aqi_weather(city):
    city = city.lower()
    aqi_current = load_csv(f"data/raw/{city}_current_aqi.csv")
    aqi_hist = load_csv(f"data/raw/{city}_historical_aqi.csv")
    weather_current = load_csv(f"data/raw/{city}_current_weather.csv")
    weather_hist = load_csv(f"data/raw/{city}_historical_weather.csv")

    aqi_df = pd.concat([aqi_current, aqi_hist], ignore_index=True)
    weather_df = pd.concat([weather_current, weather_hist], ignore_index=True)

    aqi_df['timestamp'] = pd.to_datetime(aqi_df['timestamp'])
    weather_df['timestamp'] = pd.to_datetime(weather_df['timestamp'])

    aqi_df['hour_key'] = aqi_df['timestamp'].dt.floor('h')
    weather_df['hour_key'] = weather_df['timestamp'].dt.floor('h')

    merged = pd.merge(
        aqi_df,
        weather_df,
        on=['hour_key', 'city'],
        how='left',
        suffixes=('_aqi', '_weather')
    )

    merged = merged.rename(columns={'timestamp_aqi': 'timestamp'})
    merged = merged.drop(columns=['pollutants', 'city_weather', 'timestamp_weather', 'hour_key'], errors='ignore')

    def extract_pollutant(pollutants_str, key):
        if pd.isna(pollutants_str):
            return None
        try:
            pollutants = ast.literal_eval(pollutants_str)
            return pollutants.get(key)
        except:
            return None

    if 'pollutants' in merged.columns:
        merged['pm25'] = merged['pollutants'].apply(lambda x: extract_pollutant(x, 'pm25'))
        merged['pm10'] = merged['pollutants'].apply(lambda x: extract_pollutant(x, 'pm10'))
    else:
        merged['pm25'] = None
        merged['pm10'] = None

    final_cols = [
        'timestamp', 'city', 'aqi', 'pm25', 'pm10',
        'temp', 'humidity', 'wind_speed', 'pressure', 'rain_1h'
    ]
    for col in final_cols:
        if col not in merged.columns:
            merged[col] = None
    merged = merged[final_cols]

    weather_cols = ['temp', 'humidity', 'wind_speed', 'pressure', 'rain_1h']
    merged[weather_cols] = merged[weather_cols].ffill().bfill()

    merged['timestamp'] = pd.to_datetime(merged['timestamp'])
    merged['hour'] = merged['timestamp'].dt.hour
    merged['is_night'] = merged['hour'].isin([22,23,0,1,2,3,4,5,6]).astype(int)
    merged['pm25_lag_1'] = merged['pm25'].shift(1)
    merged['temp_rolling_6h'] = merged['temp'].rolling(window=6, min_periods=1).mean()
    merged['wind_calms'] = (merged['wind_speed'] < 2).astype(int)

    os.makedirs("data/processed", exist_ok=True)
    merged.to_csv(f"data/processed/{city}_features.csv", index=False)
    logger.info(f"Saved → data/processed/{city}_features.csv")
    return merged

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/features/merge_data.py <city>")
        sys.exit(1)
    city = sys.argv[1]
    merge_aqi_weather(city)