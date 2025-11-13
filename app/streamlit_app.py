import streamlit as st
import pandas as pd
import plotly.express as px

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