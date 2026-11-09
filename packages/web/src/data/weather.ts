export interface WeatherData {
  temperature_2m: number;
  weather_code: number;
}

export const weatherCodeToText = (code: number): string => {
  const map: Record<number, string> = {
    0: '☀️ Clear sky',
    1: '🌤️ Mainly clear',
    2: '⛅ Partly cloudy',
    3: '☁️ Overcast',
    45: '🌫️ Fog',
    48: '🌫️ Rime fog',
    51: '🌦️ Light drizzle',
    53: '🌦️ Drizzle',
    55: '🌧️ Dense drizzle',
    61: '🌧️ Light rain',
    63: '🌧️ Moderate rain',
    65: '🌧️ Heavy rain',
    71: '❄️ Light snow',
    73: '❄️ Moderate snow',
    75: '❄️ Heavy snow',
    80: '🌧️ Light showers',
    81: '🌧️ Showers',
    82: '🌧️ Heavy showers',
    95: '⛈️ Thunderstorm',
    96: '⛈️ Storm w/ hail',
    99: '🌩️ Heavy storm',
  };
  return map[code] ?? '❓ Unknown';
};
