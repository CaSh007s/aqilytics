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

const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 500,
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      // Don't retry client errors (4xx) except maybe 429?
      // For simplicity, let's say 404 is fatal, 5xx is retryable.
      if (response.status === 404) throw new Error("Resource not found");
      if (response.status < 500 && response.status !== 429) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = backoff * Math.pow(2, i);
      console.warn(`Fetch failed, retrying in ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
};

export const fetchAQI = async (city: string): Promise<AQIResponse> => {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/aqi/predict?city=${city}`,
    );
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
    const response = await fetchWithRetry(
      `${API_URL}/aqi/predict?lat=${lat}&lon=${lon}`,
    );
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
    const response = await fetchWithRetry(
      `${API_URL}/aqi/forecast?city=${city}`,
    );
    return await response.json();
  } catch (error) {
    console.error("Forecast API Failed:", error);
    throw error;
  }
};
