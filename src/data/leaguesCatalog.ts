import { SportType } from '../types/sports';

export interface FlashscoreLeagueDef {
  id: string;
  name: string;
  countryOrRegion: string;
  groupCategory:
    | 'Grandes Ligas de Europa'
    | 'Torneos Internacionales de Clubes'
    | 'Ligas y Copas de Colombia (Flashscore.co)'
    | 'Ligas de Argentina'
    | 'Ligas de México'
    | 'Competiciones de Selecciones Nacionales'
    | 'Tenis y Básquetbol Global';
  sport: SportType;
  isPinnedDefault?: boolean;
}

export const FLASHSCORE_LEAGUES_CATALOG: FlashscoreLeagueDef[] = [
  // 🌍 Grandes Ligas de Europa
  {
    id: 'epl',
    name: 'Premier League',
    countryOrRegion: 'Inglaterra',
    groupCategory: 'Grandes Ligas de Europa',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'laliga',
    name: 'LaLiga EA Sports',
    countryOrRegion: 'España',
    groupCategory: 'Grandes Ligas de Europa',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    countryOrRegion: 'Italia',
    groupCategory: 'Grandes Ligas de Europa',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    countryOrRegion: 'Alemania',
    groupCategory: 'Grandes Ligas de Europa',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1',
    countryOrRegion: 'Francia',
    groupCategory: 'Grandes Ligas de Europa',
    sport: 'football'
  },
  {
    id: 'liga-portugal',
    name: 'Liga Portugal',
    countryOrRegion: 'Portugal',
    groupCategory: 'Grandes Ligas de Europa',
    sport: 'football'
  },
  {
    id: 'eredivisie',
    name: 'Eredivisie',
    countryOrRegion: 'Países Bajos',
    groupCategory: 'Grandes Ligas de Europa',
    sport: 'football'
  },

  // 🏆 Torneos Internacionales de Clubes
  {
    id: 'ucl',
    name: 'UEFA Champions League',
    countryOrRegion: 'Europa',
    groupCategory: 'Torneos Internacionales de Clubes',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'uel',
    name: 'UEFA Europa League',
    countryOrRegion: 'Europa',
    groupCategory: 'Torneos Internacionales de Clubes',
    sport: 'football'
  },
  {
    id: 'uecl',
    name: 'UEFA Conference League',
    countryOrRegion: 'Europa',
    groupCategory: 'Torneos Internacionales de Clubes',
    sport: 'football'
  },
  {
    id: 'libertadores',
    name: 'Copa Libertadores',
    countryOrRegion: 'Sudamérica',
    groupCategory: 'Torneos Internacionales de Clubes',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'sudamericana',
    name: 'Copa Sudamericana',
    countryOrRegion: 'Sudamérica',
    groupCategory: 'Torneos Internacionales de Clubes',
    sport: 'football'
  },
  {
    id: 'recopa-sud',
    name: 'Recopa Sudamericana',
    countryOrRegion: 'Sudamérica',
    groupCategory: 'Torneos Internacionales de Clubes',
    sport: 'football'
  },
  {
    id: 'mundial-clubes',
    name: 'Mundial de Clubes',
    countryOrRegion: 'Mundial',
    groupCategory: 'Torneos Internacionales de Clubes',
    sport: 'football'
  },

  // 🇨🇴 Ligas y Copas de Colombia (Flashscore.co)
  {
    id: 'col-primera-a',
    name: 'Primera A (Liga BetPlay)',
    countryOrRegion: 'Colombia',
    groupCategory: 'Ligas y Copas de Colombia (Flashscore.co)',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'col-primera-b',
    name: 'Primera B (Torneo BetPlay)',
    countryOrRegion: 'Colombia',
    groupCategory: 'Ligas y Copas de Colombia (Flashscore.co)',
    sport: 'football'
  },
  {
    id: 'col-copa',
    name: 'Copa Colombia',
    countryOrRegion: 'Colombia',
    groupCategory: 'Ligas y Copas de Colombia (Flashscore.co)',
    sport: 'football'
  },
  {
    id: 'col-superliga',
    name: 'Superliga',
    countryOrRegion: 'Colombia',
    groupCategory: 'Ligas y Copas de Colombia (Flashscore.co)',
    sport: 'football'
  },
  {
    id: 'col-femenina',
    name: 'Liga Femenina',
    countryOrRegion: 'Colombia',
    groupCategory: 'Ligas y Copas de Colombia (Flashscore.co)',
    sport: 'football'
  },

  // 🇦🇷 Ligas de Argentina (Flashscore.es / Flashscore.co)
  {
    id: 'arg-lpf',
    name: 'Liga Profesional',
    countryOrRegion: 'Argentina',
    groupCategory: 'Ligas de Argentina',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'arg-primera-nac',
    name: 'Primera Nacional',
    countryOrRegion: 'Argentina',
    groupCategory: 'Ligas de Argentina',
    sport: 'football'
  },
  {
    id: 'arg-copa',
    name: 'Copa Argentina',
    countryOrRegion: 'Argentina',
    groupCategory: 'Ligas de Argentina',
    sport: 'football'
  },
  {
    id: 'arg-copa-lpf',
    name: 'Copa de la Liga Profesional',
    countryOrRegion: 'Argentina',
    groupCategory: 'Ligas de Argentina',
    sport: 'football'
  },

  // 🇲🇽 Ligas de México
  {
    id: 'mex-ligamx',
    name: 'Liga MX (Apertura / Clausura)',
    countryOrRegion: 'México',
    groupCategory: 'Ligas de México',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'mex-expansion',
    name: 'Liga de Expansión MX',
    countryOrRegion: 'México',
    groupCategory: 'Ligas de México',
    sport: 'football'
  },
  {
    id: 'mex-femenil',
    name: 'Liga MX Femenil',
    countryOrRegion: 'México',
    groupCategory: 'Ligas de México',
    sport: 'football'
  },

  // 🇺🇳 Competiciones de Selecciones Nacionales
  {
    id: 'sel-mundial',
    name: 'Copa Mundial de Fútbol',
    countryOrRegion: 'Mundial',
    groupCategory: 'Competiciones de Selecciones Nacionales',
    sport: 'football'
  },
  {
    id: 'sel-copa-america',
    name: 'Copa América',
    countryOrRegion: 'América',
    groupCategory: 'Competiciones de Selecciones Nacionales',
    sport: 'football'
  },
  {
    id: 'sel-eurocopa',
    name: 'Eurocopa',
    countryOrRegion: 'Europa',
    groupCategory: 'Competiciones de Selecciones Nacionales',
    sport: 'football'
  },
  {
    id: 'sel-nations-league',
    name: 'UEFA Nations League',
    countryOrRegion: 'Europa',
    groupCategory: 'Competiciones de Selecciones Nacionales',
    sport: 'football'
  },
  {
    id: 'sel-elim-conmebol',
    name: 'Clasificación Mundial (Sudamérica)',
    countryOrRegion: 'Sudamérica',
    groupCategory: 'Competiciones de Selecciones Nacionales',
    sport: 'football',
    isPinnedDefault: true
  },
  {
    id: 'sel-elim-uefa',
    name: 'Clasificación Mundial (Europa)',
    countryOrRegion: 'Europa',
    groupCategory: 'Competiciones de Selecciones Nacionales',
    sport: 'football'
  },

  // Tenis & Básquetbol
  {
    id: 'atp-masters',
    name: 'ATP Masters 1000 Shanghai',
    countryOrRegion: 'Internacional',
    groupCategory: 'Tenis y Básquetbol Global',
    sport: 'tennis'
  },
  {
    id: 'nba',
    name: 'NBA Regular Season',
    countryOrRegion: 'EE. UU.',
    groupCategory: 'Tenis y Básquetbol Global',
    sport: 'basketball'
  }
];
