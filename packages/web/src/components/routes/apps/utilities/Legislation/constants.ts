import { Country } from './types';

export const COUNTRIES: Country[] = [
  {
    name: 'United States',
    flag: '🇺🇸',
    chambers: {
      Senate: {
        name: 'Senate',
        totalSeats: 100,
        parties: [
          {
            name: 'Republican',
            abbreviation: 'R',
            color: '#ef4444',
            seats: 53,
          },
          { name: 'Democrat', abbreviation: 'D', color: '#3b82f6', seats: 45 },
          {
            name: 'Independent',
            abbreviation: 'I',
            color: '#8b5cf6',
            seats: 2,
          },
        ],
      },
      'House of Representatives': {
        name: 'House of Representatives',
        totalSeats: 435,
        parties: [
          {
            name: 'Republican',
            abbreviation: 'R',
            color: '#ef4444',
            seats: 220,
          },
          { name: 'Democrat', abbreviation: 'D', color: '#3b82f6', seats: 213 },
          {
            name: 'Independent',
            abbreviation: 'I',
            color: '#8b5cf6',
            seats: 2,
          },
        ],
      },
    },
  },
  {
    name: 'United Kingdom',
    flag: '🇬🇧',
    chambers: {
      'House of Commons': {
        name: 'House of Commons',
        totalSeats: 650,
        parties: [
          { name: 'Labour', abbreviation: 'Lab', color: '#ef4444', seats: 412 },
          {
            name: 'Conservative',
            abbreviation: 'Con',
            color: '#3b82f6',
            seats: 121,
          },
          {
            name: 'Liberal Democrats',
            abbreviation: 'LD',
            color: '#f59e0b',
            seats: 72,
          },
          {
            name: 'Scottish National',
            abbreviation: 'SNP',
            color: '#eab308',
            seats: 9,
          },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 36 },
        ],
      },
      'House of Lords': {
        name: 'House of Lords',
        totalSeats: 784,
        parties: [
          {
            name: 'Conservative',
            abbreviation: 'Con',
            color: '#3b82f6',
            seats: 273,
          },
          { name: 'Labour', abbreviation: 'Lab', color: '#ef4444', seats: 170 },
          {
            name: 'Crossbenchers',
            abbreviation: 'CB',
            color: '#6b7280',
            seats: 180,
          },
          { name: 'Lib Dems', abbreviation: 'LD', color: '#f59e0b', seats: 82 },
          { name: 'Others', abbreviation: 'Oth', color: '#94a3b8', seats: 79 },
        ],
      },
    },
  },
  {
    name: 'Germany',
    flag: '🇩🇪',
    chambers: {
      Bundestag: {
        name: 'Bundestag',
        totalSeats: 736,
        parties: [
          { name: 'SPD', abbreviation: 'SPD', color: '#ef4444', seats: 206 },
          {
            name: 'CDU/CSU',
            abbreviation: 'CDU',
            color: '#1e293b',
            seats: 197,
          },
          {
            name: 'Greens',
            abbreviation: 'Grüne',
            color: '#22c55e',
            seats: 118,
          },
          { name: 'FDP', abbreviation: 'FDP', color: '#eab308', seats: 91 },
          { name: 'AfD', abbreviation: 'AfD', color: '#3b82f6', seats: 77 },
          { name: 'Left', abbreviation: 'Linke', color: '#7c3aed', seats: 28 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 19 },
        ],
      },
      Bundesrat: {
        name: 'Bundesrat',
        totalSeats: 69,
        parties: [
          {
            name: 'SPD-led states',
            abbreviation: 'SPD',
            color: '#ef4444',
            seats: 24,
          },
          {
            name: 'CDU/CSU-led states',
            abbreviation: 'CDU',
            color: '#1e293b',
            seats: 21,
          },
          {
            name: 'Coalition states',
            abbreviation: 'Mix',
            color: '#8b5cf6',
            seats: 24,
          },
        ],
      },
    },
  },
  {
    name: 'France',
    flag: '🇫🇷',
    chambers: {
      'Assemblée Nationale': {
        name: 'Assemblée Nationale',
        totalSeats: 577,
        parties: [
          { name: 'RN', abbreviation: 'RN', color: '#1e40af', seats: 143 },
          {
            name: 'NFP (Left)',
            abbreviation: 'NFP',
            color: '#ef4444',
            seats: 193,
          },
          {
            name: 'Renaissance',
            abbreviation: 'Ren',
            color: '#f59e0b',
            seats: 99,
          },
          { name: 'UDR', abbreviation: 'UDR', color: '#3b82f6', seats: 16 },
          { name: 'MoDem', abbreviation: 'MoDem', color: '#eab308', seats: 36 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 90 },
        ],
      },
      Sénat: {
        name: 'Sénat',
        totalSeats: 348,
        parties: [
          { name: 'LR', abbreviation: 'LR', color: '#3b82f6', seats: 133 },
          { name: 'PS', abbreviation: 'PS', color: '#ef4444', seats: 64 },
          { name: 'RDPI', abbreviation: 'RDPI', color: '#f59e0b', seats: 21 },
          { name: 'UC', abbreviation: 'UC', color: '#8b5cf6', seats: 50 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 80 },
        ],
      },
    },
  },
  {
    name: 'Japan',
    flag: '🇯🇵',
    chambers: {
      'House of Representatives': {
        name: 'House of Representatives',
        totalSeats: 465,
        parties: [
          { name: 'LDP', abbreviation: 'LDP', color: '#3b82f6', seats: 191 },
          {
            name: 'Komeito',
            abbreviation: 'Kome',
            color: '#f59e0b',
            seats: 24,
          },
          { name: 'CDP', abbreviation: 'CDP', color: '#ef4444', seats: 98 },
          { name: 'Nippon', abbreviation: 'Nipp', color: '#8b5cf6', seats: 38 },
          { name: 'Ishin', abbreviation: 'Ish', color: '#f97316', seats: 38 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 76 },
        ],
      },
      'House of Councillors': {
        name: 'House of Councillors',
        totalSeats: 248,
        parties: [
          { name: 'LDP', abbreviation: 'LDP', color: '#3b82f6', seats: 107 },
          {
            name: 'Komeito',
            abbreviation: 'Kome',
            color: '#f59e0b',
            seats: 27,
          },
          { name: 'CDP', abbreviation: 'CDP', color: '#ef4444', seats: 40 },
          { name: 'Ishin', abbreviation: 'Ish', color: '#f97316', seats: 21 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 53 },
        ],
      },
    },
  },
  {
    name: 'Canada',
    flag: '🇨🇦',
    chambers: {
      'House of Commons': {
        name: 'House of Commons',
        totalSeats: 338,
        parties: [
          {
            name: 'Liberal',
            abbreviation: 'Lib',
            color: '#ef4444',
            seats: 153,
          },
          {
            name: 'Conservative',
            abbreviation: 'Con',
            color: '#3b82f6',
            seats: 120,
          },
          { name: 'NDP', abbreviation: 'NDP', color: '#f97316', seats: 25 },
          {
            name: 'Bloc Québécois',
            abbreviation: 'BQ',
            color: '#3b82f6',
            seats: 33,
          },
          { name: 'Green', abbreviation: 'Grn', color: '#22c55e', seats: 2 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 5 },
        ],
      },
      Senate: {
        name: 'Senate',
        totalSeats: 105,
        parties: [
          {
            name: 'ISG (Independent)',
            abbreviation: 'ISG',
            color: '#8b5cf6',
            seats: 39,
          },
          { name: 'CSG', abbreviation: 'CSG', color: '#3b82f6', seats: 17 },
          { name: 'PSG', abbreviation: 'PSG', color: '#ef4444', seats: 21 },
          {
            name: 'Non-affiliated',
            abbreviation: 'NA',
            color: '#6b7280',
            seats: 15,
          },
          { name: 'Others', abbreviation: 'Oth', color: '#94a3b8', seats: 13 },
        ],
      },
    },
  },
  {
    name: 'Australia',
    flag: '🇦🇺',
    chambers: {
      'House of Representatives': {
        name: 'House of Representatives',
        totalSeats: 151,
        parties: [
          { name: 'Labor', abbreviation: 'ALP', color: '#ef4444', seats: 78 },
          {
            name: 'Coalition',
            abbreviation: 'LNP',
            color: '#3b82f6',
            seats: 58,
          },
          { name: 'Greens', abbreviation: 'Grn', color: '#22c55e', seats: 4 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 11 },
        ],
      },
      Senate: {
        name: 'Senate',
        totalSeats: 76,
        parties: [
          { name: 'Labor', abbreviation: 'ALP', color: '#ef4444', seats: 26 },
          {
            name: 'Coalition',
            abbreviation: 'LNP',
            color: '#3b82f6',
            seats: 30,
          },
          { name: 'Greens', abbreviation: 'Grn', color: '#22c55e', seats: 11 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 9 },
        ],
      },
    },
  },
  {
    name: 'India',
    flag: '🇮🇳',
    chambers: {
      'Lok Sabha': {
        name: 'Lok Sabha',
        totalSeats: 543,
        parties: [
          { name: 'BJP', abbreviation: 'BJP', color: '#f97316', seats: 240 },
          { name: 'INC', abbreviation: 'INC', color: '#3b82f6', seats: 99 },
          { name: 'SP', abbreviation: 'SP', color: '#ef4444', seats: 37 },
          { name: 'AITC', abbreviation: 'TMC', color: '#22c55e', seats: 29 },
          { name: 'DMK', abbreviation: 'DMK', color: '#ef4444', seats: 22 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 116 },
        ],
      },
      'Rajya Sabha': {
        name: 'Rajya Sabha',
        totalSeats: 245,
        parties: [
          { name: 'BJP', abbreviation: 'BJP', color: '#f97316', seats: 93 },
          { name: 'INC', abbreviation: 'INC', color: '#3b82f6', seats: 26 },
          { name: 'AITC', abbreviation: 'TMC', color: '#22c55e', seats: 13 },
          { name: 'Others', abbreviation: 'Oth', color: '#6b7280', seats: 113 },
        ],
      },
    },
  },
];
