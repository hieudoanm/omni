export interface TimeZone {
  label: string;
  country: string;
  tz: string;
  lat: number;
  lon: number;
  favorite: boolean;
}

export const timezones: TimeZone[] = [
  {
    label: 'Los Angeles',
    country: 'United States',
    tz: 'America/Los_Angeles',
    lat: 34.0522,
    lon: -118.2437,
    favorite: false,
  },
  {
    label: 'Dallas',
    country: 'United States',
    tz: 'America/Chicago',
    lat: 32.7767,
    lon: -96.797,
    favorite: true,
  },
  {
    label: 'New York',
    country: 'United States',
    tz: 'America/New_York',
    lat: 40.7128,
    lon: -74.006,
    favorite: false,
  },
  {
    label: 'London',
    country: 'United Kingdom',
    tz: 'Europe/London',
    lat: 51.5072,
    lon: -0.1276,
    favorite: false,
  },
  {
    label: 'Frankfurt',
    country: 'Germany',
    tz: 'Europe/Berlin',
    lat: 50.1109,
    lon: 8.6821,
    favorite: false,
  },
  {
    label: 'Paris',
    country: 'France',
    tz: 'Europe/Paris',
    lat: 48.8566,
    lon: 2.3522,
    favorite: false,
  },
  {
    label: 'Helsinki',
    country: 'Finland',
    tz: 'Europe/Helsinki',
    lat: 60.1695,
    lon: 24.9354,
    favorite: false,
  },
  {
    label: 'Dubai',
    country: 'United Arab Emirates',
    tz: 'Asia/Dubai',
    lat: 25.2048,
    lon: 55.2708,
    favorite: false,
  },
  {
    label: 'Bangkok',
    country: 'Thailand',
    tz: 'Asia/Bangkok',
    lat: 13.7563,
    lon: 100.5018,
    favorite: false,
  },
  {
    label: 'Ho Chi Minh City',
    country: 'Vietnam',
    tz: 'Asia/Ho_Chi_Minh',
    lat: 10.8231,
    lon: 106.6297,
    favorite: true,
  },
  {
    label: 'Singapore',
    country: 'Singapore',
    tz: 'Asia/Singapore',
    lat: 1.3521,
    lon: 103.8198,
    favorite: false,
  },
  {
    label: 'Tokyo',
    country: 'Japan',
    tz: 'Asia/Tokyo',
    lat: 35.6895,
    lon: 139.6917,
    favorite: false,
  },
  {
    label: 'Sydney',
    country: 'Australia',
    tz: 'Australia/Sydney',
    lat: -33.8688,
    lon: 151.2093,
    favorite: false,
  },
  {
    label: 'Melbourne',
    country: 'Australia',
    tz: 'Australia/Melbourne',
    lat: -37.8136,
    lon: 144.9631,
    favorite: true,
  },
];

export const getTimeInZone = (tz: string): string =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(new Date());
