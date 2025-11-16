# app.py
import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime

# Page config
st.set_page_config(
    page_title="AQILytics",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("AQILytics — Real-Time Air Quality Monitor")

# City selector
city = st.selectbox(
    "Select City",
    ["mumbai", "delhi", "bangalore", "kolkata", "bhopal"]
).lower()

# Load data
try:
    current = pd.read_csv(f"data/processed/{city}_features.csv")
    forecast = pd.read_csv(f"data/processed/{city}_forecast.csv")
except Exception as e:
    st.error("Data not available. Workflow is running...")
    st.stop()

# Current values
aqi = int(current['aqi'].iloc[-1])
pm25 = current['pm25'].iloc[-1] if 'pm25' in current.columns else 50.0
pm10 = current['pm10'].iloc[-1] if 'pm10' in current.columns else 100.0
no2 = current['no2'].iloc[-1] if 'no2' in current.columns else 20.0

# AQI Banner
if aqi > 300:
    st.error(f"**{city.title()}: AQI {aqi} — HAZARDOUS! Stay Indoors!**")
elif aqi > 200:
    st.warning(f"**{city.title()}: AQI {aqi} — Very Poor**")
else:
    st.success(f"**{city.title()}: AQI {aqi}**")

# Metrics
col1, col2, col3, col4, col5 = st.columns(5)
col1.metric("AQI", aqi)
col2.metric("PM2.5", f"{pm25:.1f} µg/m³")
col3.metric("PM10", f"{pm10:.1f} µg/m³")
col4.metric("NO2", f"{no2:.1f} µg/m³")
col5.metric("Next Hour Forecast", f"{int(forecast['aqi_forecast'].iloc[-1])}")

# Pollutants Bar Chart
st.subheader("Current Pollutants")
pollutants = pd.DataFrame({
    "Pollutant": ["PM2.5", "PM10", "NO2"],
    "Value": [pm25, pm10, no2]
})
fig_poll = px.bar(
    pollutants,
    x="Pollutant",
    y="Value",
    color="Pollutant",
    color_discrete_map={
        "PM2.5": "#FF6B6B",
        "PM10": "#4ECDC4",
        "NO2": "#45B7D1"
    },
    title="Pollutants (µg/m³)"
)
st.plotly_chart(fig_poll, use_container_width=True)

# 7-Day Trend
st.subheader("7-Day AQI Trend")
data_trend = current.tail(168) if len(current) >= 168 else current
fig1 = px.line(
    data_trend,
    x='timestamp',
    y='aqi',
    title="AQI Over Time",
    markers=True
)
fig1.update_xaxes(title="Time")
fig1.update_yaxes(title="AQI")
st.plotly_chart(fig1, use_container_width=True)

# PM2.5 vs Humidity
st.subheader("PM2.5 vs Humidity")
data_scatter = current.tail(168) if len(current) >= 168 else current
fig2 = px.scatter(
    data_scatter,
    x='humidity',
    y='pm25',
    color='aqi',
    title="PM2.5 vs Humidity",
    hover_data=['timestamp']
)
fig2.update_xaxes(title="Humidity (%)")
fig2.update_yaxes(title="PM2.5 (µg/m³)")
st.plotly_chart(fig2, use_container_width=True)

# 24-Hour Forecast
st.subheader("24-Hour AQI Forecast")
if len(forecast) > 1:
    fig3 = px.line(
        forecast,
        x='timestamp',
        y='aqi_forecast',
        title="Predicted AQI",
        markers=True
    )
    fig3.add_hline(y=300, line_dash="dash", line_color="red", annotation_text="Hazardous")
    fig3.update_xaxes(title="Time")
    fig3.update_yaxes(title="AQI")
    st.plotly_chart(fig3, use_container_width=True)
else:
    st.warning("Forecast not available yet. Model training in progress...")

# Footer
st.markdown("---")
st.caption(f"Last updated: {datetime.now().strftime('%I:%M %p IST')} | Data: WAQI + OpenWeather")