"""
Fetch AQI data from WAQI.info API.
Supports: city name (e.g., "Delhi"), station ID (@H3715), robust timestamp parsing.
Saves raw JSON/CSV to data/raw/.
"""
import os
import requests
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
import yaml
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def load_config():
    """Load config.yaml."""
    with open("config/config.yaml", "r") as f:
        return yaml.safe_load(f)

def fetch_current_aqi(city_config):
    """Fetch latest AQI for city."""
    token = os.getenv(f"{city_config['name'].upper()}_WAQI_TOKEN", city_config.get("waqi_token"))
    if token.startswith("@"):
        token = os.getenv(token[1:], "")
    if not token:
        raise ValueError(f"Missing WAQI token for {city_config['name']}")
    
    base_url = city_config.get('apis', {}).get('waqi_base', 'https://api.waqi.info/feed')
    city_name = city_config['waqi_token']  # e.g., "Delhi" or "@H3715"
    url = f"{base_url}/{city_name}/?token={token}"
    
    response = requests.get(url)
    response.raise_for_status()
    
    data = response.json()
    if data["status"] != "ok":
        raise ValueError(f"API error: {data.get('data', 'Unknown')}")
    
    aqi_data = data["data"]
    
    # === ROBUST TIMESTAMP PARSING ===
    time_str = aqi_data["time"]["s"]
    try:
        # Case 1: ISO string like "2025-11-12 12:00:00"
        if isinstance(time_str, str) and " " in time_str:
            timestamp = datetime.strptime(time_str.strip(), "%Y-%m-%d %H:%M:%S")
        # Case 2: Unix timestamp as string or int
        else:
            time_s = int(time_str) if isinstance(time_str, str) else time_str
            timestamp = datetime.fromtimestamp(time_s / 1000)  # Convert ms to seconds
    except Exception as e:
        logger.warning(f"Timestamp parsing failed: {e}. Using now() as fallback.")
        timestamp = datetime.utcnow()
    # === END ===
    
    aqi = aqi_data.get("aqi", None)
    
    # Extract pollutants safely
    pollutants = {}
    iaqi = aqi_data.get("iaqi", {})
    for key, val in iaqi.items():
        if isinstance(val, dict) and "v" in val:
            pollutants[key] = val["v"]
    
    result = {
        "timestamp": timestamp.isoformat(),
        "city": city_config["name"],
        "aqi": aqi,
        "pollutants": pollutants,
        "lat": city_config["lat"],
        "lon": city_config["lon"]
    }
    logger.info(f"Fetched current AQI for {city_config['name']}: {aqi}")
    return result

def fetch_historical_aqi(city_config, days_back=30):
    """
    WAQI free tier: No true historical API.
    This is a placeholder using current data.
    For real history: Use Kaggle or paid API.
    """
    logger.warning("WAQI free tier has no historical API. Using current data as mock.")
    current = fetch_current_aqi(city_config)
    historical = []
    base_time = datetime.fromisoformat(current["timestamp"].replace("Z", "+00:00"))
    
    for i in range(days_back):
        mock_time = base_time - timedelta(days=i)
        mock_entry = current.copy()
        mock_entry["timestamp"] = mock_time.isoformat()
        mock_entry["aqi"] = max(50, mock_entry["aqi"] + (i % 15) - 7)  # Mock variation
        historical.append(mock_entry)
    
    return historical

def save_to_csv(data_list, filepath):
    """Save list of dicts to CSV."""
    if not data_list:
        logger.warning(f"No data to save: {filepath}")
        return
    df = pd.DataFrame(data_list)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    logger.info(f"Saved {len(data_list)} records to {filepath}")

if __name__ == "__main__":
    config = load_config()
    delhi = next(c for c in config["cities"] if c["name"] == "Delhi")
    delhi["apis"] = config["apis"]
    
    # Fetch current
    current = fetch_current_aqi(delhi)
    save_to_csv([current], "data/raw/delhi_current_aqi.csv")
    
    # Fetch mock historical
    historical = fetch_historical_aqi(delhi, days_back=7)
    save_to_csv(historical, "data/raw/delhi_historical_aqi.csv")