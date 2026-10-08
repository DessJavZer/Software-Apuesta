export type SportType = 'football' | 'tennis' | 'basketball';

export type MatchStatus = 'finished' | 'live' | 'upcoming';

export type DataSource = 'FootyStats' | 'SofaScore' | 'Soccerway' | 'Transfermarkt' | 'Flashscore';

export type BookmakerId = 'rushbet' | 'bet365' | 'wplay';

export interface SourceVerification {
  source: DataSource;
  verified: boolean;
  lastSync: string;
  keyMetricLabel: string;
  keyMetricValue: string;
  discrepancyScore: number; // 0 to 100% agreement
}

export interface MatchEvent {
  id: string;
  minute: string;
  team: 'home' | 'away';
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'set_won' | 'quarter_end' | 'three_pointer' | 'break_point';
  player: string;
  detail?: string;
}

export interface PlayerLineup {
  number: number;
  name: string;
  position: string;
  rating: number; // SofaScore rating
  marketValue?: string; // Transfermarkt value
  isStarter: boolean;
}

export interface MatchStatItem {
  label: string;
  homeValue: number | string;
  awayValue: number | string;
  homePercent: number;
  source: DataSource;
}

export interface BookmakerMarketOdds {
  bookmaker: BookmakerId;
  bookmakerName: string;
  homeOdds: number;
  drawOdds?: number;
  awayOdds: number;
  overUnderLine: string;
  overOdds: number;
  underOdds: number;
  marginPercent: number; // Vig / Overround
  reliabilityIndex: number; // 1-100 reliability of the line stability
  movement: 'dropping_home' | 'dropping_away' | 'stable' | 'volatile';
}

export type FootballPredictionCategory =
  | 'Tiempo reglamentario'
  | 'Goleador'
  | 'Goles del Jugador'
  | 'Tarjetas'
  | 'Medio Tiempo'
  | 'Tiros de Esquina'
  | 'Hándicap 3-Way'
  | 'Líneas Asiáticas'
  | 'Eventos del Partido';

export type TennisPredictionCategory =
  | 'Cuotas del Partido'
  | 'Apuestas de Set'
  | 'Total de Juegos'
  | 'Hándicap de Juegos y Sets'
  | 'Mercados del 1.er Set'
  | 'Tiebreaks y Puntos de Break'
  | 'Especiales de Servicio del Jugador';

export type BasketballPredictionCategory =
  | 'Prórroga Incluida (Principal)'
  | 'Total de Puntos y Equipos'
  | 'Hándicap y Margen de Victoria'
  | '1.ª Parte y Mercados por Cuarto'
  | 'Puntos del Jugador (Player Props)'
  | 'Rebotes y Asistencias del Jugador'
  | 'Triples y Carreras a Puntos';

export type SportMarketCategory =
  | FootballPredictionCategory
  | TennisPredictionCategory
  | BasketballPredictionCategory
  | string;

export interface PredictionOption {
  id: string;
  category?: FootballPredictionCategory | string;
  marketName: string; // e.g. "Resultado Final (1X2)", "Más de 2.5 Goles (BTTS)", "Hándicap Asiático -1.5"
  selection: string; // e.g. "Real Madrid Gana", "Más de 2.5 Goles"
  calculatedProbability: number; // e.g. 68.4%
  confidenceIndex: number; // 1-100 based on historical dataset sample size & multi-source consensus
  sampleSizeMatches: number; // e.g. 420 matches analyzed
  bestBookmaker: BookmakerId;
  bestOdds: number;
  impliedProbability: number; // 1 / bestOdds * 100
  expectedValuePercent: number; // EV+ percentage
  isValueOpportunity: boolean;
  rationale: string;
}

export interface Match {
  id: string;
  rushbetEventId?: number;
  totalMarketsCount?: number; // Number of betting markets/options generated on Rushbet (e.g., 145, 324, 88)
  sport: SportType;
  leagueId: string;
  leagueName: string;
  country: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  status: MatchStatus;
  minuteOrPeriod: string;
  liveSecond?: number; // 0-59 for real-time Flashscore clock ticking
  halfTimeScore?: string; // e.g. "(1 - 1)"
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeRedCards?: number;
  awayRedCards?: number;
  tennisServer?: 'home' | 'away';
  homeSetScores?: number[]; // e.g. [6, 4] or Q1, Q2, Q3, Q4 for basketball
  awaySetScores?: number[];
  homeCurrentGamePoints?: string; // e.g. "40" or "AD"
  awayCurrentGamePoints?: string; // e.g. "15"
  liveTickerStatus?: 'GOAL_HOME' | 'GOAL_AWAY' | 'VAR_CHECK' | 'DANGEROUS_ATTACK_HOME' | 'DANGEROUS_ATTACK_AWAY' | 'PENALTY' | 'BREAK_POINT' | 'NORMAL';
  liveTickerText?: string; // e.g. "Ataque Peligroso - Real Madrid", "¡GOL! Revisión VAR completada"
  lastGoalFlashAt?: number; // timestamp for Flashscore yellow/red row highlight
  lastScoringTeam?: 'home' | 'away';
  homeSubScores?: string; // e.g. Tennis sets "6 4 5" or Basketball quarters
  awaySubScores?: string;
  homeFormation?: string;
  awayFormation?: string;
  homeMarketValue?: string; // Transfermarkt
  awayMarketValue?: string;
  stats: MatchStatItem[];
  events: MatchEvent[];
  homeLineup: PlayerLineup[];
  awayLineup: PlayerLineup[];
  sourceVerifications: SourceVerification[];
  bookmakerOdds: BookmakerMarketOdds[];
  predictions: PredictionOption[];
}

export interface StandingRow {
  position: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  xGPerMatch?: number; // FootyStats metric
  form: ('W' | 'D' | 'L')[];
  marketValue: string; // Transfermarkt
}

export interface LeagueStanding {
  leagueId: string;
  leagueName: string;
  sport: SportType;
  country: string;
  lastUpdated: string;
  source: DataSource;
  rows: StandingRow[];
}

export interface TrackedAnalyticalRecord {
  id: string;
  date: string;
  sport: SportType;
  leagueName: string;
  matchTitle: string;
  marketSelection: string;
  bookmaker: BookmakerId;
  odds: number;
  modelProbability: number;
  confidenceIndex: number;
  expectedValue: number;
  simulatedStakeUnits: number;
  simulatedStakeCOP: number;
  status: 'won' | 'lost' | 'pending' | 'void';
  profitLossCOP: number;
}

export interface AlertSettingsConfig {
  masterPushEnabled: boolean;
  // Goal Alerts Configuration
  goalAlertsEnabled: boolean;
  goalOnlyFavorites: boolean;
  goalIncludeVarAndRedCards: boolean;
  goalSoundWhistle: boolean;
  goalPostRecalibrationMinEV: number; // EV+% threshold to attach a live post-goal value recommendation
  // Investment Opportunity (EV+) Alerts Configuration
  investmentAlertsEnabled: boolean;
  investmentMinEVPercent: number; // e.g., +6.5% EV minimum to fire push
  investmentMinConfidence: number; // e.g., 85/100 confidence minimum
  investmentMinProbability: number; // e.g., 60% success probability minimum
  investmentBookmakers: BookmakerId[]; // e.g. ['rushbet', 'bet365', 'wplay']
  investmentSoundChime: boolean;
}

export interface LiveNotification {
  id: string;
  timestamp: string;
  type: 'goal' | 'value_bet' | 'prediction' | 'result';
  alertCategory?: 'GOL' | 'OPORTUNIDAD_INVERSION';
  sport: SportType;
  title: string;
  message: string;
  matchId?: string;
  evPercent?: number;
  confidenceIndex?: number;
  bookmaker?: BookmakerId;
  read: boolean;
}
