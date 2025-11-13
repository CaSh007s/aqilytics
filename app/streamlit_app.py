import streamlit as st
import pandas as pd
import plotly.express as px
from joblib import load
import numpy as np

# Load model
model = load("models/xgb_model.pkl")

st.set_page_config(page_title="AQILytics", layout="wide")
st.title("AQILytics – Delhi Air Quality Monitor")

@st.cache_data
def load_data():
    df = pd.read_csv("data/processed/delhi_features.csv")
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    return df.sort_values('timestamp')

df = load_data()
latest = df.iloc[-1]

col1, col2, col3 = st.columns(3)
col1.metric("Current AQI", int(latest['aqi']), "Hazardous")
col2.metric("PM2.5", f"{latest['pm25']:.0f} µg/m³")
col3.metric("Wind Speed", f"{latest['wind_speed']:.1f} m/s")

st.plotly_chart(px.line(df, x='timestamp', y='aqi', title='7-Day AQI Trend'), use_container_width=True)

st.plotly_chart(px.scatter(df, x='humidity', y='pm25', size='aqi', color='wind_speed',
                          title='PM2.5 vs. Humidity'), use_container_width=True)

st.subheader("6-Hour AQI Forecast")
forecast = pd.read_csv("data/processed/forecast.csv")
forecast['timestamp'] = pd.to_datetime(forecast['timestamp'])

fig = px.line(forecast, x='timestamp', y='aqi_forecast', 
              title="Next 6 Hours AQI Prediction",
              markers=True)
fig.add_vline(x=latest['timestamp'], line_dash="dot", line_color="gray")
fig.add_hline(y=latest['aqi'], line_dash="dash", line_color="red", annotation_text="Now")
st.plotly_chart(fig, use_container_width=True)

# Health alert
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