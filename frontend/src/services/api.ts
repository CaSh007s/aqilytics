const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface WeatherData {
  temp: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
}

export interface AQIResponse {
  city: string;
  country: string;
  current_aqi: number;
  aqi_category: string;
  weather: WeatherData;
  pollutants: {
    "PM2.5": number;
    PM10: number;
    NO2: number;
    Ozone: number;
    SO2: number;
    CO: number;
    NH3: number;
  };
}

export interface ForecastPoint {
  time: number;
  aqi: number;
  pollutants: {
    "PM2.5": number;
    PM10: number;
    NO2: number;
    Ozone: number;
    SO2: number;
  };
}

export interface ForecastResponse {
  forecast: ForecastPoint[];
}

export interface Analysis {
  id: string;
  city: string;
  current_aqi: number;
  aqi_category: string;
  created_at: string;
}

export const fetchAQI = async (city: string): Promise<AQIResponse> => {
  try {
    const response = await fetch(`${API_URL}/aqi/predict?city=${city}`);

    if (!response.ok) {
      throw new Error("City not found or server error");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchAQIByCoords = async (
  lat: number,
  lon: number,
): Promise<AQIResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/aqi/predict?lat=${lat}&lon=${lon}`,
    );

    if (!response.ok) {
      throw new Error("Location not found or server error");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchForecast = async (
  city: string,
): Promise<ForecastResponse> => {
  try {
    const response = await fetch(`${API_URL}/aqi/forecast?city=${city}`);
    if (!response.ok) throw new Error("Forecast unavailable");
    return await response.json();
  } catch (error) {
    console.error("Forecast API Failed:", error);
    throw error;
  }
};

export const fetchHistory = async (): Promise<Analysis[]> => {
  try {
    // History is disabled for open access, returning empty array
    // const response = await fetch(`${API_URL}/aqi/history`);
    // if (!response.ok) throw new Error("Failed to fetch history");
    // return await response.json();
    return [];
  } catch (error) {
    console.error("History API Failed:", error);
    return [];
  }
};
