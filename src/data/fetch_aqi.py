
import requests
import pandas as pd
import os
import logging
from datetime import datetime, timedelta
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load token
from dotenv import load_dotenv
load_dotenv()
WAQI_TOKEN = os.getenv("WAQI_TOKEN")
if not WAQI_TOKEN:
    raise ValueError("WAQI_TOKEN not found in .env")

def fetch_current_aqi(city):
    print(f"Fetching current AQI for {city}...")
    url = f"https://api.waqi.info/feed/{city}/?token={WAQI_TOKEN}"
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return pd.DataFrame()
    data = response.json()
    if data.get("status") != "ok":
        print(f"API Error: {data}")
        return pd.DataFrame()
    
    aqi = data['data']['aqi']
    pollutants = data['data'].get('iaqi', {})
    timestamp = data['data']['time']['s']
    
    record = {
        'city': city,
        'timestamp': timestamp,
        'aqi': aqi,
        'pollutants': str({
            k: v['v'] for k, v in pollutants.items()
            if 'v' in v
        })
    }
    df = pd.DataFrame([record])
    filepath = f"data/raw/{city}_current_aqi.csv"
    os.makedirs("data/raw", exist_ok=True)
    df.to_csv(filepath, index=False)
    logger.info(f"Saved 1 record → {filepath}")
    return df

def fetch_historical_aqi(city):
    print(f"Fetching historical AQI for {city} (mock)...")
    # WAQI free tier has no historical API → mock 7 days
    current = datetime.now()
    records = []
    for i in range(7):
        d = current - timedelta(days=i)
        records.append({
            'city': city,
            'timestamp': d.strftime("%Y-%m-%d %H:00:00"),
            'aqi': 200 + i * 10,  # mock
            'pollutants': "{}"
        })
    df = pd.DataFrame(records)
    filepath = f"data/raw/{city}_historical_aqi.csv"
    df.to_csv(filepath, index=False)
    logger.info(f"Saved 7 mock records → {filepath}")
    return df

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/data/fetch_aqi.py <city>")
        sys.exit(1)
    city = sys.argv[1].lower()
    fetch_current_aqi(city)
    fetch_historical_aqi(city)