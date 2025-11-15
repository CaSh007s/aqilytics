"""
Fetch REAL PM2.5 from CPCB (India Only)
"""
import requests
import pandas as pd
import os
from datetime import datetime

CPCB_KEY = os.getenv("CPCB_KEY")

CITY_TO_STATE = {
    "mumbai": "Maharashtra",
    "delhi": "Delhi",
    "bangalore": "Karnataka",
    "kolkata": "West Bengal",
    "bhopal": "Madhya Pradesh"
}

def fetch_cpcb_pm25(city):
    state = CITY_TO_STATE.get(city.lower())
    if not state or not CPCB_KEY:
        return None

    url = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
    params = {
        "api-key": CPCB_KEY,
        "format": "json",
        "limit": 1,
        "filters[state]": state
    }
    try:
        data = requests.get(url, params=params, timeout=10).json()
        records = data.get('records', [])
        if records and 'pm2_5' in records[0]:
            pm25 = float(records[0]['pm2_5'])
            return pm25
    except Exception as e:
        print(f"CPCB Error: {e}")
    return None

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python fetch_cpcb.py <city>")
        sys.exit(1)
    city = sys.argv[1].lower()
    pm25 = fetch_cpcb_pm25(city)
    if pm25 is not None:
        df = pd.DataFrame([{
            "city": city,
            "pm25": pm25,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:00:00")
        }])
        os.makedirs("data/raw", exist_ok=True)
        df.to_csv(f"data/raw/{city}_cpcb_pm25.csv", index=False)
        print(f"PM2.5 for {city}: {pm25} µg/m³")
    else:
        print(f"No PM2.5 data for {city}")
