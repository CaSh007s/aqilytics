# app.py
import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime
import os

st.set_page_config(page_title="AQILytics", layout="wide", initial_sidebar_state="expanded")
st.title("AQILytics — Real-Time Air Quality Monitor")

city = st.selectbox("Select City", ["mumbai", "delhi", "bangalore", "kolkata", "bhopal"]).lower()

# === SAFE DATA LOADING (CLOUD + LOCAL) ===
current_path = f"data/processed/{city}_features.csv"
forecast_path = f"data/processed/{city}_forecast.csv"

if not os.path.exists(current_path) or not os.path.exists(forecast_path):
    st.warning("Data not ready yet. GitHub Action is updating hourly...")
    st.info("Refresh in a few minutes.")
    st.stop()

try:
    current = pd.read_csv(current_path)
    forecast = pd.read_csv(forecast_path)
except Exception as e:
    st.error("Failed to load data. Auto-refreshing soon...")
    st.stop()

# === EXTRACT VALUES SAFELY ===
aqi = int(current['aqi'].iloc[-1])

pm25 = current['pm25'].iloc[-1] if 'pm25' in current.columns and pd.notna(current['pm25'].iloc[-1]) else 0
pm10 = current['pm10'].iloc[-1] if 'pm10' in current.columns and pd.notna(current['pm10'].iloc[-1]) else 0

no2_raw = current['no2'].iloc[-1] if 'no2' in current.columns else None
no2 = no2_raw if pd.notna(no2_raw) else "N/A"
no2_val = no2_raw if pd.notna(no2_raw) else 0

# === AQI BANNER ===
if aqi > 300:
    st.error(f"**{city.title()}: AQI {aqi} — HAZARDOUS!**")
elif aqi > 200:
    st.warning(f"**{city.title()}: AQI {aqi} — Very Poor**")
elif aqi > 100:
    st.info(f"**{city.title()}: AQI {aqi} — Moderate**")
else:
    st.success(f"**{city.title()}: AQI {aqi} — Good**")

# === METRICS ===
c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("AQI", aqi)
c2.metric("PM2.5", f"{pm25:.1f} µg/m³" if pm25 > 0 else "—")
c3.metric("PM10", f"{pm10:.1f} µg/m³" if pm10 > 0 else "—")
c4.metric("NO₂", f"{no2} µg/m³" if no2 != "N/A" else "N/A")
c5.metric("Next Hour", int(forecast['aqi_forecast'].iloc[-1]))

# === POLLUTANTS BAR ===
st.subheader("Current Pollutants")
poll = pd.DataFrame({
    "Pollutant": ["PM2.5", "PM10", "NO₂"],
    "Value": [pm25 if pm25 > 0 else 0, pm10 if pm10 > 0 else 0, no2_val]
})
fig_bar = px.bar(poll, x="Pollutant", y="Value", color="Pollutant",
                 color_discrete_map={"PM2.5":"#FF6B6B", "PM10":"#4ECDC4", "NO₂":"#45B7D1"})
st.plotly_chart(fig_bar, use_container_width=True)

# === GRAPHS ===
st.subheader("7-Day AQI Trend")
fig1 = px.line(current, x="timestamp", y="aqi", markers=True, title="AQI Over Time")
st.plotly_chart(fig1, use_container_width=True)

st.subheader("PM2.5 vs Humidity")
fig2 = px.scatter(current, x="humidity", y="pm25", color="aqi", hover_data=["timestamp"])
st.plotly_chart(fig2, use_container_width=True)

st.subheader("24-Hour AQI Forecast")
fig3 = px.line(forecast, x="timestamp", y="aqi_forecast", markers=True, title="Predicted AQI")
fig3.add_hline(y=300, line_dash="dash", line_color="red", annotation_text="Hazardous")
st.plotly_chart(fig3, use_container_width=True)

st.caption(f"Last updated: {datetime.now().strftime('%I:%M %p IST')} | Auto-updated hourly")