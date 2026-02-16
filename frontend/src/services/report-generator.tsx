import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { AQIResponse, ForecastResponse } from "./api";

// Register custom fonts (optional, using standard fonts for now)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#020617", // slate-950
    color: "white",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "heavy",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#94a3b8", // slate-400
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mainMetric: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#38bdf8", // sky-400
    textAlign: "center",
    marginVertical: 10,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#e2e8f0",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    flex: 1,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 4,
    minWidth: "30%",
  },
  cardLabel: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#64748b",
  },
});

interface ReportProps {
  city: string;
  data: AQIResponse;
  forecast: ForecastResponse | null;
  date: string;
}

const AQIReportPDF = ({ city, data, forecast, date }: ReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{city}</Text>
          <Text style={styles.subtitle}>
            Daily Atmospheric Intelligence Report
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 10, color: "#94a3b8" }}>{date}</Text>
        </View>
      </View>

      {/* Main AQI Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <Text style={styles.mainMetric}>{data.current_aqi}</Text>
        <Text style={styles.metricLabel}>{data.aqi_category}</Text>
      </View>

      {/* Pollutants Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pollutant Breakdown</Text>
        <View style={styles.grid}>
          {Object.entries(data.pollutants).map(([key, value]) => (
            <View key={key} style={styles.card}>
              <Text style={styles.cardLabel}>{key}</Text>
              <Text style={styles.cardValue}>{value.toFixed(1)} µg/m³</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weather Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meteorological Conditions</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Temperature</Text>
            <Text style={styles.cardValue}>{data.weather.temp}°C</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Humidity</Text>
            <Text style={styles.cardValue}>{data.weather.humidity}%</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Wind Speed</Text>
            <Text style={styles.cardValue}>{data.weather.wind_speed} km/h</Text>
          </View>
        </View>
      </View>

      {/* Forecast Preview (Text based for now as charts in PDF are complex) */}
      {forecast && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>24-Hour Forecast Highlights</Text>
          <View style={{ gap: 4 }}>
            {forecast.forecast.slice(0, 4).map(
              (
                point,
                i, // Show next 4 intervals (e.g., 4-6 hours)
              ) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 2,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Text style={{ fontSize: 10, color: "#cbd5e1" }}>
                    {new Date(point.time * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                    AQI: {point.aqi}
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        Generated by AQILYTICS automated delivery engine. Do not reply to this
        email.
      </Text>
    </Page>
  </Document>
);

export const generateReportPDF = async (
  city: string,
  data: AQIResponse,
  forecast: ForecastResponse | null,
): Promise<Buffer> => {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const buffer = await renderToBuffer(
    <AQIReportPDF city={city} data={data} forecast={forecast} date={date} />,
  );

  return buffer;
};
