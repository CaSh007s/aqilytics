const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface WeatherData {
  temp: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
}

export interface AQIResponse {
  city: string;
  current_aqi: number;
  aqi_category: string;
  weather: WeatherData;
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
