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
