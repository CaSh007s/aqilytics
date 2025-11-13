import streamlit as st
import pandas as pd
import plotly.express as px
from joblib import load
import time
import subprocess

# === CONFIG ===
st.set_page_config(page_title="AQILytics", layout="wide")
st.title("AQILytics – Air Quality Monitor")

# === CITY SELECTOR ===
city = st.selectbox("Select City", ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Bhopal"])
city_lower = city.lower()

# === AUTO REFRESH (15 min) ===
if 'last_update' not in st.session_state:
    st.session_state.last_update = 0

if time.time() - st.session_state.last_update > 900:
    st.session_state.last_update = time.time()
    st.rerun()

# === REFRESH BUTTON ===
if st.button("Refresh Forecast", key="refresh"):
    with st.spinner(f"Updating forecast for {city}..."):
        subprocess.run(["python", "src/models/train.py", city_lower])
    st.success("Forecast updated!")
    st.rerun()

# === LAST UPDATE ===
last_update = pd.Timestamp.now().strftime("%I:%M %p")
st.caption(f"Last updated: {last_update}")

# === LOAD MODEL ===
model_path = f"models/xgb_model_{city_lower}.pkl"
if not st.session_state.get("model_loaded", False):
    try:
        model = load(model_path)
        st.session_state.model = model
        st.session_state.model_loaded = True
    except:
        st.error(f"Model not found for {city}. Run training first.")
        st.stop()

model = st.session_state.model

# === LOAD DATA ===
@st.cache_data
def load_data():
    df = pd.read_csv(f"data/processed/{city_lower}_features.csv")
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    return df.sort_values('timestamp')

df = load_data()
latest = df.iloc[-1]

# === METRICS ===
col1, col2, col3 = st.columns(3)
col1.metric("Current AQI", int(latest['aqi']), "Hazardous" if latest['aqi'] > 300 else "Unhealthy" if latest['aqi'] > 150 else "Moderate")
col2.metric("PM2.5", f"{latest['pm25']:.0f} µg/m³")
col3.metric("Wind Speed", f"{latest['wind_speed']:.1f} m/s")

# === PLOTS ===
st.plotly_chart(px.line(df, x='timestamp', y='aqi', title=f'7-Day AQI Trend – {city}'), use_container_width=True)
st.plotly_chart(px.scatter(df, x='humidity', y='pm25', size='aqi', color='wind_speed',
                          title='PM2.5 vs. Humidity'), use_container_width=True)

# === FORECAST ===
st.subheader("6-Hour AQI Forecast")
try:
    forecast = pd.read_csv(f"data/processed/{city_lower}_forecast.csv")
    forecast['timestamp'] = pd.to_datetime(forecast['timestamp'])

    fig = px.line(forecast, x='timestamp', y='aqi_forecast', 
                  title=f"Next 6 Hours AQI Prediction – {city}", markers=True)
    fig.add_vline(x=latest['timestamp'], line_dash="dot", line_color="gray")
    fig.add_hline(y=latest['aqi'], line_dash="dash", line_color="red", annotation_text="Now")
    st.plotly_chart(fig, use_container_width=True)

    next_aqi = forecast['aqi_forecast'].iloc[0]
    if pd.isna(next_aqi):
        st.warning("Forecast not available")
    else:
        if next_aqi > 300:
            st.error(f"AQI will be {next_aqi:.0f} in 1 hour — Hazardous!")
        elif next_aqi > 150:
            st.warning(f"AQI will be {next_aqi:.0f} — Unhealthy")
        else:
            st.success("Air quality improving")
except:
    st.warning("No forecast available. Click 'Refresh Forecast' to generate.")