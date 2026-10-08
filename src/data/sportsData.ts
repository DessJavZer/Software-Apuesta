import { Match, LeagueStanding, TrackedAnalyticalRecord, LiveNotification } from '../types/sports';

export const INITIAL_MATCHES: Match[] = [
  // ==================== FOOTBALL ====================
  {
    id: 'fb-001',
    sport: 'football',
    leagueId: 'ucl',
    leagueName: 'UEFA Champions League',
    country: 'Europa',
    date: '2026-10-05',
    startTime: '14:00',
    status: 'live',
    minuteOrPeriod: "68'",
    liveSecond: 42,
    halfTimeScore: '(1 - 1)',
    homeTeam: 'Real Madrid',
    awayTeam: 'Bayern München',
    homeScore: 2,
    awayScore: 1,
    homeRedCards: 0,
    awayRedCards: 0,
    liveTickerStatus: 'DANGEROUS_ATTACK_HOME',
    liveTickerText: 'Ataque Peligroso · Real Madrid en área rival',
    homeFormation: '4-3-3',
    awayFormation: '4-2-3-1',
    homeMarketValue: '€1.36B',
    awayMarketValue: '€980M',
    stats: [
      { label: 'Goles Esperados (xG)', homeValue: '2.14', awayValue: '1.38', homePercent: 61, source: 'FootyStats' },
      { label: 'Posesión de Balón (%)', homeValue: '54%', awayValue: '46%', homePercent: 54, source: 'SofaScore' },
      { label: 'Remates Totales', homeValue: 15, awayValue: 11, homePercent: 58, source: 'Flashscore' },
      { label: 'Remates a Puerta', homeValue: 7, awayValue: 4, homePercent: 64, source: 'Flashscore' },
      { label: 'Ocasiones Claras Creadas', homeValue: 4, awayValue: 2, homePercent: 67, source: 'SofaScore' },
      { label: 'Córners a Favor', homeValue: 6, awayValue: 5, homePercent: 55, source: 'Soccerway' },
      { label: 'Pases Completados (%)', homeValue: '89%', awayValue: '86%', homePercent: 51, source: 'SofaScore' },
      { label: 'Probabilidad Ambos Anotan (BTTS Hist.)', homeValue: '76%', awayValue: '72%', homePercent: 51, source: 'FootyStats' }
    ],
    events: [
      { id: 'ev-1', minute: "14'", team: 'home', type: 'goal', player: 'Vinícius Júnior', detail: 'Asistencia: Jude Bellingham (xG: 0.42)' },
      { id: 'ev-2', minute: "31'", team: 'away', type: 'yellow_card', player: 'Joshua Kimmich', detail: 'Falta táctica en transición' },
      { id: 'ev-3', minute: "41'", team: 'away', type: 'goal', player: 'Harry Kane', detail: 'Remate cruzado dentro del área (xG: 0.35)' },
      { id: 'ev-4', minute: "58'", team: 'home', type: 'goal', player: 'Kylian Mbappé', detail: 'Contraataque rápido (xG: 0.61)' },
      { id: 'ev-5', minute: "64'", team: 'away', type: 'substitution', player: 'Leroy Sané entra por Serge Gnabry', detail: 'Cambio ofensivo' }
    ],
    homeLineup: [
      { number: 1, name: 'Thibaut Courtois', position: 'POR', rating: 7.4, marketValue: '€28M', isStarter: true },
      { number: 2, name: 'Dani Carvajal', position: 'LD', rating: 7.1, marketValue: '€12M', isStarter: true },
      { number: 22, name: 'Antonio Rüdiger', position: 'DFC', rating: 7.3, marketValue: '€25M', isStarter: true },
      { number: 3, name: 'Éder Militão', position: 'DFC', rating: 6.9, marketValue: '€60M', isStarter: true },
      { number: 23, name: 'Ferland Mendy', position: 'LI', rating: 6.8, marketValue: '€22M', isStarter: true },
      { number: 8, name: 'Federico Valverde', position: 'MC', rating: 7.8, marketValue: '€130M', isStarter: true },
      { number: 14, name: 'Aurélien Tchouaméni', position: 'MCD', rating: 7.2, marketValue: '€100M', isStarter: true },
      { number: 5, name: 'Jude Bellingham', position: 'MCO', rating: 8.3, marketValue: '€180M', isStarter: true },
      { number: 11, name: 'Rodrygo Goes', position: 'ED', rating: 7.1, marketValue: '€110M', isStarter: true },
      { number: 9, name: 'Kylian Mbappé', position: 'DC', rating: 8.6, marketValue: '€180M', isStarter: true },
      { number: 7, name: 'Vinícius Júnior', position: 'EI', rating: 8.8, marketValue: '€200M', isStarter: true }
    ],
    awayLineup: [
      { number: 1, name: 'Manuel Neuer', position: 'POR', rating: 6.7, marketValue: '€4M', isStarter: true },
      { number: 6, name: 'Joshua Kimmich', position: 'LD', rating: 6.8, marketValue: '€50M', isStarter: true },
      { number: 2, name: 'Dayot Upamecano', position: 'DFC', rating: 6.5, marketValue: '€45M', isStarter: true },
      { number: 3, name: 'Kim Min-jae', position: 'DFC', rating: 6.6, marketValue: '€45M', isStarter: true },
      { number: 19, name: 'Alphonso Davies', position: 'LI', rating: 7.0, marketValue: '€50M', isStarter: true },
      { number: 45, name: 'Aleksandar Pavlović', position: 'MCD', rating: 7.1, marketValue: '€50M', isStarter: true },
      { number: 42, name: 'Jamal Musiala', position: 'MCO', rating: 7.6, marketValue: '€140M', isStarter: true },
      { number: 17, name: 'Michael Olise', position: 'ED', rating: 7.2, marketValue: '€65M', isStarter: true },
      { number: 7, name: 'Serge Gnabry', position: 'EI', rating: 6.4, marketValue: '€40M', isStarter: true },
      { number: 9, name: 'Harry Kane', position: 'DC', rating: 7.9, marketValue: '€100M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'FootyStats', verified: true, lastSync: 'Hace 4s', keyMetricLabel: 'Promedio Goles/Partido', keyMetricValue: '3.42 Goles (Over 2.5: 78%)', discrepancyScore: 98.4 },
      { source: 'SofaScore', verified: true, lastSync: 'Hace 2s', keyMetricLabel: 'Momentum & Presión', keyMetricValue: '+38 Índice Dominio Local', discrepancyScore: 99.1 },
      { source: 'Soccerway', verified: true, lastSync: 'Hace 9s', keyMetricLabel: 'Forma H2H Últimos 5', keyMetricValue: '3V Real Madrid - 2E - 0V Bayern', discrepancyScore: 97.8 },
      { source: 'Transfermarkt', verified: true, lastSync: 'Hace 1m', keyMetricLabel: 'Diferencial Valor Plantilla', keyMetricValue: '+€380M Ventaja Local (Sin bajas clave)', discrepancyScore: 100 },
      { source: 'Flashscore', verified: true, lastSync: 'Hace 1s', keyMetricLabel: 'Feed de Eventos en Vivo', keyMetricValue: "68' 2-1 Confirmado VAR", discrepancyScore: 99.9 }
    ],
    bookmakerOdds: [
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.48, drawOdds: 4.50, awayOdds: 6.75, overUnderLine: '3.5 Goles', overOdds: 1.78, underOdds: 2.02, marginPercent: 4.1, reliabilityIndex: 96, movement: 'dropping_home' },
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.44, drawOdds: 4.60, awayOdds: 7.00, overUnderLine: '3.5 Goles', overOdds: 1.83, underOdds: 1.98, marginPercent: 3.6, reliabilityIndex: 98, movement: 'stable' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.50, drawOdds: 4.35, awayOdds: 6.50, overUnderLine: '3.5 Goles', overOdds: 1.75, underOdds: 2.05, marginPercent: 4.5, reliabilityIndex: 94, movement: 'dropping_home' }
    ],
    predictions: [
      {
        id: 'pred-001',
        marketName: 'Total de Goles Asiático (En Vivo)',
        selection: 'Más de 3.5 Goles en el Partido',
        calculatedProbability: 64.2,
        confidenceIndex: 91,
        sampleSizeMatches: 512,
        bestBookmaker: 'bet365',
        bestOdds: 1.83,
        impliedProbability: 54.6,
        expectedValuePercent: 9.6,
        isValueOpportunity: true,
        rationale: 'Con 3 goles al minuto 68 y un xG acumulado de 3.52 (FootyStats), el Bayern adelanta líneas dejando espacios para transiciones de Vinícius y Mbappé.'
      },
      {
        id: 'pred-002',
        marketName: 'Ganador del Partido (1X2 En Vivo)',
        selection: 'Real Madrid Gana (1)',
        calculatedProbability: 73.5,
        confidenceIndex: 94,
        sampleSizeMatches: 640,
        bestBookmaker: 'wplay',
        bestOdds: 1.50,
        impliedProbability: 66.7,
        expectedValuePercent: 6.8,
        isValueOpportunity: true,
        rationale: 'Real Madrid registra un 86% de victorias en el Bernabéu cuando lidera al minuto 65+ según histórico de Soccerway.'
      }
    ]
  },
  {
    id: 'fb-002',
    sport: 'football',
    leagueId: 'col-primera-a',
    leagueName: 'Primera A (Liga BetPlay)',
    country: 'Colombia',
    date: '2026-10-05',
    startTime: '18:10',
    status: 'live',
    minuteOrPeriod: "34'",
    liveSecond: 18,
    halfTimeScore: '(1 - 0)',
    homeTeam: 'Millonarios FC',
    awayTeam: 'Atlético Nacional',
    homeScore: 1,
    awayScore: 0,
    homeRedCards: 0,
    awayRedCards: 1,
    liveTickerStatus: 'DANGEROUS_ATTACK_HOME',
    liveTickerText: 'Tiro libre peligroso · Millonarios FC',
    homeFormation: '4-4-2',
    awayFormation: '4-3-3',
    homeMarketValue: '€24.8M',
    awayMarketValue: '€22.4M',
    stats: [
      { label: 'Goles Esperados (xG)', homeValue: '0.88', awayValue: '0.31', homePercent: 74, source: 'FootyStats' },
      { label: 'Posesión de Balón (%)', homeValue: '58%', awayValue: '42%', homePercent: 58, source: 'SofaScore' },
      { label: 'Remates Totales', homeValue: 8, awayValue: 3, homePercent: 73, source: 'Flashscore' },
      { label: 'Remates a Puerta', homeValue: 4, awayValue: 1, homePercent: 80, source: 'Flashscore' },
      { label: 'Córners a Favor', homeValue: 4, awayValue: 1, homePercent: 80, source: 'Soccerway' },
      { label: 'Tarjetas Amarillas', homeValue: 1, awayValue: 2, homePercent: 33, source: 'Flashscore' }
    ],
    events: [
      { id: 'ev-201', minute: "19'", team: 'home', type: 'goal', player: 'Leonardo Castro', detail: 'Asistencia: Mackalister Silva (Cabezazo en el área)' },
      { id: 'ev-202', minute: "27'", team: 'away', type: 'yellow_card', player: 'Edwin Cardona', detail: 'Reclamo arbitral' }
    ],
    homeLineup: [
      { number: 31, name: 'Álvaro Montero', position: 'POR', rating: 7.2, marketValue: '€2.2M', isStarter: true },
      { number: 4, name: 'Juan Pablo Vargas', position: 'DFC', rating: 7.5, marketValue: '€2.0M', isStarter: true },
      { number: 26, name: 'Andrés Llinás', position: 'DFC', rating: 7.1, marketValue: '€1.8M', isStarter: true },
      { number: 14, name: 'David Mackalister Silva', position: 'MCO', rating: 7.9, marketValue: '€400K', isStarter: true },
      { number: 23, name: 'Leonardo Castro', position: 'DC', rating: 8.1, marketValue: '€1.2M', isStarter: true }
    ],
    awayLineup: [
      { number: 1, name: 'David Ospina', position: 'POR', rating: 6.8, marketValue: '€1.5M', isStarter: true },
      { number: 3, name: 'Juan Felipe Aguirre', position: 'DFC', rating: 6.5, marketValue: '€1.1M', isStarter: true },
      { number: 10, name: 'Edwin Cardona', position: 'MCO', rating: 6.7, marketValue: '€900K', isStarter: true },
      { number: 9, name: 'Alfredo Morelos', position: 'DC', rating: 6.6, marketValue: '€3.5M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'FootyStats', verified: true, lastSync: 'Hace 3s', keyMetricLabel: 'Tendencia Córners Local', keyMetricValue: '6.8 Córners/Partido en Bogotá', discrepancyScore: 97.2 },
      { source: 'SofaScore', verified: true, lastSync: 'Hace 2s', keyMetricLabel: 'Precisión en Último Tercio', keyMetricValue: '81% Millonarios vs 64% Nacional', discrepancyScore: 98.5 },
      { source: 'Soccerway', verified: true, lastSync: 'Hace 6s', keyMetricLabel: 'Rendimiento en Altura (2600m)', keyMetricValue: '79% Puntos como Local', discrepancyScore: 99.0 },
      { source: 'Transfermarkt', verified: true, lastSync: 'Hace 2m', keyMetricLabel: 'Alineación Titular', keyMetricValue: '100% Titulares Disponibles', discrepancyScore: 100 },
      { source: 'Flashscore', verified: true, lastSync: 'Hace 1s', keyMetricLabel: 'Tiempo Efectivo', keyMetricValue: "34' 1T En Juego", discrepancyScore: 99.8 }
    ],
    bookmakerOdds: [
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.57, drawOdds: 3.65, awayOdds: 6.40, overUnderLine: '2.5 Goles', overOdds: 2.12, underOdds: 1.72, marginPercent: 4.0, reliabilityIndex: 97, movement: 'dropping_home' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.60, drawOdds: 3.55, awayOdds: 6.20, overUnderLine: '2.5 Goles', overOdds: 2.08, underOdds: 1.75, marginPercent: 4.2, reliabilityIndex: 96, movement: 'dropping_home' },
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.55, drawOdds: 3.75, awayOdds: 6.50, overUnderLine: '2.5 Goles', overOdds: 2.15, underOdds: 1.70, marginPercent: 3.8, reliabilityIndex: 98, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-003',
        marketName: 'Resultado Final (1X2)',
        selection: 'Millonarios FC Gana (1)',
        calculatedProbability: 69.8,
        confidenceIndex: 89,
        sampleSizeMatches: 340,
        bestBookmaker: 'wplay',
        bestOdds: 1.60,
        impliedProbability: 62.5,
        expectedValuePercent: 7.3,
        isValueOpportunity: true,
        rationale: 'Dominio territorial en El Campín (0.88 xG vs 0.31 xG en 34 minutos). Wplay ofrece cuota 1.60 con valor positivo de +7.3% frente a la probabilidad real.'
      },
      {
        id: 'pred-004',
        marketName: 'Ambos Equipos Anotan (BTTS)',
        selection: 'Ambos Equipos Anotan: Sí',
        calculatedProbability: 54.0,
        confidenceIndex: 76,
        sampleSizeMatches: 290,
        bestBookmaker: 'rushbet',
        bestOdds: 1.95,
        impliedProbability: 51.3,
        expectedValuePercent: 2.7,
        isValueOpportunity: false,
        rationale: 'Margen moderado (+2.7% EV). Nacional suele reaccionar en segundas mitades, pero la defensa local mantiene alta solidez.'
      }
    ]
  },
  {
    id: 'fb-003',
    sport: 'football',
    leagueId: 'epl',
    leagueName: 'Premier League',
    country: 'Inglaterra',
    date: '2026-10-05',
    startTime: '11:30',
    status: 'finished',
    minuteOrPeriod: 'Finalizado',
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    homeScore: 2,
    awayScore: 2,
    homeFormation: '4-3-3',
    awayFormation: '4-2-3-1',
    homeMarketValue: '€1.17B',
    awayMarketValue: '€965M',
    stats: [
      { label: 'Goles Esperados (xG)', homeValue: '1.92', awayValue: '1.85', homePercent: 51, source: 'FootyStats' },
      { label: 'Posesión de Balón (%)', homeValue: '49%', awayValue: '51%', homePercent: 49, source: 'SofaScore' },
      { label: 'Remates Totales', homeValue: 14, awayValue: 13, homePercent: 52, source: 'Flashscore' },
      { label: 'Remates a Puerta', homeValue: 6, awayValue: 6, homePercent: 50, source: 'Flashscore' },
      { label: 'Córners a Favor', homeValue: 7, awayValue: 5, homePercent: 58, source: 'Soccerway' }
    ],
    events: [
      { id: 'ev-301', minute: "9'", team: 'home', type: 'goal', player: 'Bukayo Saka', detail: 'Asistencia: Ben White' },
      { id: 'ev-302', minute: "18'", team: 'away', type: 'goal', player: 'Virgil van Dijk', detail: 'Cabezazo tras tiro de esquina' },
      { id: 'ev-303', minute: "43'", team: 'home', type: 'goal', player: 'Mikel Merino', detail: 'Tiro libre indirecto (VAR Confirmado)' },
      { id: 'ev-304', minute: "81'", team: 'away', type: 'goal', player: 'Mohamed Salah', detail: 'Asistencia: Darwin Núñez' }
    ],
    homeLineup: [
      { number: 22, name: 'David Raya', position: 'POR', rating: 7.0, marketValue: '€35M', isStarter: true },
      { number: 7, name: 'Bukayo Saka', position: 'ED', rating: 8.4, marketValue: '€140M', isStarter: true },
      { number: 41, name: 'Declan Rice', position: 'MC', rating: 7.8, marketValue: '€120M', isStarter: true },
      { number: 29, name: 'Kai Havertz', position: 'DC', rating: 7.1, marketValue: '€70M', isStarter: true }
    ],
    awayLineup: [
      { number: 62, name: 'Caoimhín Kelleher', position: 'POR', rating: 6.9, marketValue: '€20M', isStarter: true },
      { number: 4, name: 'Virgil van Dijk', position: 'DFC', rating: 7.9, marketValue: '€30M', isStarter: true },
      { number: 11, name: 'Mohamed Salah', position: 'ED', rating: 8.3, marketValue: '€55M', isStarter: true },
      { number: 7, name: 'Luis Díaz', position: 'EI', rating: 7.4, marketValue: '€80M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'FootyStats', verified: true, lastSync: 'Auditado', keyMetricLabel: 'xG Post-Partido', keyMetricValue: '1.92 vs 1.85 (Empate Justo)', discrepancyScore: 99.6 },
      { source: 'SofaScore', verified: true, lastSync: 'Auditado', keyMetricLabel: 'MVP del Encuentro', keyMetricValue: 'Bukayo Saka (8.4 Rating)', discrepancyScore: 100 },
      { source: 'Soccerway', verified: true, lastSync: 'Auditado', keyMetricLabel: 'Tendencia Over 2.5 H2H', keyMetricValue: '5 de últimos 6 cumplidos', discrepancyScore: 100 },
      { source: 'Transfermarkt', verified: true, lastSync: 'Auditado', keyMetricLabel: 'Desgaste Físico', keyMetricValue: 'Sin lesionados reportados', discrepancyScore: 100 },
      { source: 'Flashscore', verified: true, lastSync: 'Auditado', keyMetricLabel: 'Marcador Oficial', keyMetricValue: 'FT 2 - 2', discrepancyScore: 100 }
    ],
    bookmakerOdds: [
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 2.35, drawOdds: 3.30, awayOdds: 3.10, overUnderLine: '2.5 Goles', overOdds: 1.75, underOdds: 2.08, marginPercent: 3.4, reliabilityIndex: 99, movement: 'stable' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 2.32, drawOdds: 3.35, awayOdds: 3.05, overUnderLine: '2.5 Goles', overOdds: 1.78, underOdds: 2.04, marginPercent: 3.9, reliabilityIndex: 97, movement: 'stable' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 2.30, drawOdds: 3.25, awayOdds: 3.15, overUnderLine: '2.5 Goles', overOdds: 1.74, underOdds: 2.06, marginPercent: 4.3, reliabilityIndex: 96, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-005',
        marketName: 'Ambos Equipos Anotan + Más de 2.5 Goles',
        selection: 'Sí y Más de 2.5 Goles (ACERTADA)',
        calculatedProbability: 66.5,
        confidenceIndex: 92,
        sampleSizeMatches: 480,
        bestBookmaker: 'rushbet',
        bestOdds: 1.98,
        impliedProbability: 50.5,
        expectedValuePercent: 16.0,
        isValueOpportunity: true,
        rationale: 'Pronóstico pre-partido acertado en minuto 43. Ambos clubes superaban 1.85 xG a favor en sus últimos 10 duelos directos.'
      }
    ]
  },
  {
    id: 'fb-004',
    sport: 'football',
    leagueId: 'laliga',
    leagueName: 'LaLiga EA Sports',
    country: 'España',
    date: '2026-10-05',
    startTime: '20:30',
    status: 'upcoming',
    minuteOrPeriod: '20:30',
    homeTeam: 'FC Barcelona',
    awayTeam: 'Atlético de Madrid',
    homeScore: 0,
    awayScore: 0,
    homeFormation: '4-2-3-1',
    awayFormation: '5-3-2',
    homeMarketValue: '€940M',
    awayMarketValue: '€515M',
    stats: [
      { label: 'xG Promedio Temporada (Local/Vis.)', homeValue: '2.45', awayValue: '1.52', homePercent: 62, source: 'FootyStats' },
      { label: 'Posesión Media Temporada', homeValue: '64%', awayValue: '48%', homePercent: 57, source: 'SofaScore' },
      { label: 'Frecuencia Más de 2.5 Goles', homeValue: '78%', awayValue: '56%', homePercent: 58, source: 'FootyStats' },
      { label: 'Porterías a Cero (Clean Sheets)', homeValue: '44%', awayValue: '50%', homePercent: 47, source: 'Soccerway' }
    ],
    events: [],
    homeLineup: [
      { number: 13, name: 'Iñaki Peña', position: 'POR', rating: 7.0, marketValue: '€8M', isStarter: true },
      { number: 2, name: 'Pau Cubarsí', position: 'DFC', rating: 7.5, marketValue: '€40M', isStarter: true },
      { number: 8, name: 'Pedri González', position: 'MC', rating: 8.1, marketValue: '€80M', isStarter: true },
      { number: 19, name: 'Lamine Yamal', position: 'ED', rating: 8.5, marketValue: '€150M', isStarter: true },
      { number: 9, name: 'Robert Lewandowski', position: 'DC', rating: 8.2, marketValue: '€15M', isStarter: true }
    ],
    awayLineup: [
      { number: 13, name: 'Jan Oblak', position: 'POR', rating: 7.4, marketValue: '€28M', isStarter: true },
      { number: 2, name: 'José María Giménez', position: 'DFC', rating: 7.2, marketValue: '€22M', isStarter: true },
      { number: 7, name: 'Antoine Griezmann', position: 'DC', rating: 7.9, marketValue: '€25M', isStarter: true },
      { number: 19, name: 'Julián Álvarez', position: 'DC', rating: 7.7, marketValue: '€90M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'FootyStats', verified: true, lastSync: 'Hace 30s', keyMetricLabel: 'Modelo Poisson Pre-Partido', keyMetricValue: 'Barça 58.4% | Empate 23.1% | Atleti 18.5%', discrepancyScore: 98.9 },
      { source: 'SofaScore', verified: true, lastSync: 'Hace 45s', keyMetricLabel: 'Racha Reciente', keyMetricValue: 'Barcelona 5 victorias seguidas en casa', discrepancyScore: 99.4 },
      { source: 'Soccerway', verified: true, lastSync: 'Hace 1m', keyMetricLabel: 'Historial Directo H2H', keyMetricValue: 'Barça ganó los últimos 4 H2H sin recibir más de 1 gol', discrepancyScore: 100 },
      { source: 'Transfermarkt', verified: true, lastSync: 'Hace 2m', keyMetricLabel: 'Estado de Plantillas', keyMetricValue: 'Once de gala confirmado en ambos clubes', discrepancyScore: 99.2 },
      { source: 'Flashscore', verified: true, lastSync: 'Hace 15s', keyMetricLabel: 'Movimiento de Cuotas', keyMetricValue: 'Caída de cuota local de 1.85 a 1.76', discrepancyScore: 99.7 }
    ],
    bookmakerOdds: [
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.80, drawOdds: 3.75, awayOdds: 4.40, overUnderLine: '2.5 Goles', overOdds: 1.72, underOdds: 2.14, marginPercent: 3.8, reliabilityIndex: 97, movement: 'dropping_home' },
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.76, drawOdds: 3.80, awayOdds: 4.50, overUnderLine: '2.5 Goles', overOdds: 1.70, underOdds: 2.15, marginPercent: 3.5, reliabilityIndex: 99, movement: 'dropping_home' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.78, drawOdds: 3.70, awayOdds: 4.35, overUnderLine: '2.5 Goles', overOdds: 1.68, underOdds: 2.18, marginPercent: 4.2, reliabilityIndex: 95, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-006',
        marketName: 'Resultado Final (1X2)',
        selection: 'FC Barcelona Gana (1)',
        calculatedProbability: 62.4,
        confidenceIndex: 90,
        sampleSizeMatches: 410,
        bestBookmaker: 'rushbet',
        bestOdds: 1.80,
        impliedProbability: 55.6,
        expectedValuePercent: 6.8,
        isValueOpportunity: true,
        rationale: 'Rushbet mantiene cuota 1.80 (probabilidad implícita 55.6%) mientras que el consenso multi-fuente le otorga 62.4% por dominio en xG y racha de 4 victorias H2H seguidas.'
      },
      {
        id: 'pred-007',
        marketName: 'Córners del Equipo Local',
        selection: 'FC Barcelona Más de 5.5 Córners',
        calculatedProbability: 68.0,
        confidenceIndex: 87,
        sampleSizeMatches: 315,
        bestBookmaker: 'bet365',
        bestOdds: 1.72,
        impliedProbability: 58.1,
        expectedValuePercent: 9.9,
        isValueOpportunity: true,
        rationale: 'Con Lamine Yamal y Raphinha abiertos contra bloque bajo 5-3-2 del Atlético, Barcelona promedia 7.4 córners por partido como local.'
      }
    ]
  },
  {
    id: 'fb-005',
    sport: 'football',
    leagueId: 'serie-a',
    leagueName: 'Serie A',
    country: 'Italia',
    date: '2026-10-05',
    startTime: '15:45',
    status: 'live',
    minuteOrPeriod: "74'",
    liveSecond: 11,
    halfTimeScore: '(1 - 0)',
    homeTeam: 'Inter Milano',
    awayTeam: 'Juventus',
    homeScore: 2,
    awayScore: 1,
    homeFormation: '3-5-2',
    awayFormation: '4-2-3-1',
    homeMarketValue: '€675M',
    awayMarketValue: '€590M',
    liveTickerStatus: 'DANGEROUS_ATTACK_HOME',
    liveTickerText: 'Ataque Peligroso · Inter Milano por banda izquierda',
    stats: [
      { label: 'Goles Esperados (xG)', homeValue: '1.88', awayValue: '1.04', homePercent: 64, source: 'FootyStats' },
      { label: 'Posesión de Balón (%)', homeValue: '53%', awayValue: '47%', homePercent: 53, source: 'SofaScore' },
      { label: 'Remates a Puerta', homeValue: 6, awayValue: 3, homePercent: 67, source: 'Flashscore' }
    ],
    events: [
      { id: 'ev-501', minute: "28'", team: 'home', type: 'goal', player: 'Lautaro Martínez', detail: 'Asistencia: Nicolò Barella' },
      { id: 'ev-502', minute: "54'", team: 'away', type: 'goal', player: 'Dušan Vlahović', detail: 'Remate de primera en el área' },
      { id: 'ev-503', minute: "67'", team: 'home', type: 'goal', player: 'Marcus Thuram', detail: 'Cabezazo tras centro de Dimarco' }
    ],
    homeLineup: [
      { number: 1, name: 'Yann Sommer', position: 'POR', rating: 7.2, marketValue: '€5M', isStarter: true },
      { number: 23, name: 'Nicolò Barella', position: 'MC', rating: 8.1, marketValue: '€80M', isStarter: true },
      { number: 10, name: 'Lautaro Martínez', position: 'DC', rating: 8.5, marketValue: '€110M', isStarter: true }
    ],
    awayLineup: [
      { number: 29, name: 'Michele Di Gregorio', position: 'POR', rating: 6.8, marketValue: '€20M', isStarter: true },
      { number: 10, name: 'Kenan Yıldız', position: 'EI', rating: 7.3, marketValue: '€45M', isStarter: true },
      { number: 9, name: 'Dušan Vlahović', position: 'DC', rating: 7.6, marketValue: '€65M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'FootyStats', verified: true, lastSync: 'Hace 2s', keyMetricLabel: 'xG En Vivo', keyMetricValue: '1.88 vs 1.04', discrepancyScore: 99.1 },
      { source: 'Flashscore', verified: true, lastSync: 'Hace 1s', keyMetricLabel: 'Marcador Oficial', keyMetricValue: "74' 2-1 En Directo", discrepancyScore: 100 }
    ],
    bookmakerOdds: [
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.36, drawOdds: 4.50, awayOdds: 9.50, overUnderLine: '3.5 Goles', overOdds: 2.10, underOdds: 1.72, marginPercent: 3.6, reliabilityIndex: 98, movement: 'dropping_home' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.38, drawOdds: 4.40, awayOdds: 9.00, overUnderLine: '3.5 Goles', overOdds: 2.15, underOdds: 1.70, marginPercent: 3.9, reliabilityIndex: 97, movement: 'dropping_home' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.35, drawOdds: 4.60, awayOdds: 9.20, overUnderLine: '3.5 Goles', overOdds: 2.08, underOdds: 1.74, marginPercent: 4.1, reliabilityIndex: 96, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-501',
        category: 'Tiempo reglamentario',
        marketName: 'Resultado Final (1X2)',
        selection: 'Inter Milano Gana (1)',
        calculatedProbability: 79.4,
        confidenceIndex: 94,
        sampleSizeMatches: 490,
        bestBookmaker: 'rushbet',
        bestOdds: 1.38,
        impliedProbability: 72.5,
        expectedValuePercent: 6.9,
        isValueOpportunity: true,
        rationale: 'Inter controla el ritmo en San Siro con ventaja táctica 3-5-2 y 1.88 xG generado.'
      }
    ]
  },
  {
    id: 'fb-006',
    sport: 'football',
    leagueId: 'bundesliga',
    leagueName: 'Bundesliga',
    country: 'Alemania',
    date: '2026-10-05',
    startTime: '13:30',
    status: 'finished',
    minuteOrPeriod: 'Finalizado',
    homeTeam: 'Bayer Leverkusen',
    awayTeam: 'Borussia Dortmund',
    homeScore: 3,
    awayScore: 1,
    homeFormation: '3-4-2-1',
    awayFormation: '4-2-3-1',
    homeMarketValue: '€635M',
    awayMarketValue: '€475M',
    stats: [
      { label: 'Goles Esperados (xG)', homeValue: '2.64', awayValue: '1.12', homePercent: 70, source: 'FootyStats' },
      { label: 'Posesión de Balón (%)', homeValue: '61%', awayValue: '39%', homePercent: 61, source: 'SofaScore' }
    ],
    events: [
      { id: 'ev-601', minute: "17'", team: 'home', type: 'goal', player: 'Florian Wirtz', detail: 'Asistencia: Alejandro Grimaldo' },
      { id: 'ev-602', minute: "52'", team: 'home', type: 'goal', player: 'Victor Boniface', detail: 'Definición cruzada' }
    ],
    homeLineup: [
      { number: 10, name: 'Florian Wirtz', position: 'MCO', rating: 8.9, marketValue: '€130M', isStarter: true },
      { number: 22, name: 'Victor Boniface', position: 'DC', rating: 8.4, marketValue: '€45M', isStarter: true }
    ],
    awayLineup: [
      { number: 9, name: 'Serhou Guirassy', position: 'DC', rating: 7.4, marketValue: '€40M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'FootyStats', verified: true, lastSync: 'Auditado', keyMetricLabel: 'Over 2.5 Bundesliga', keyMetricValue: '84% Cumplimiento Leverkusen', discrepancyScore: 100 }
    ],
    bookmakerOdds: [
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.75, drawOdds: 3.90, awayOdds: 4.33, overUnderLine: '2.5 Goles', overOdds: 1.62, underOdds: 2.30, marginPercent: 3.5, reliabilityIndex: 99, movement: 'stable' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.78, drawOdds: 3.85, awayOdds: 4.25, overUnderLine: '2.5 Goles', overOdds: 1.65, underOdds: 2.25, marginPercent: 3.9, reliabilityIndex: 97, movement: 'stable' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.76, drawOdds: 3.80, awayOdds: 4.30, overUnderLine: '2.5 Goles', overOdds: 1.60, underOdds: 2.32, marginPercent: 4.2, reliabilityIndex: 96, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-601',
        category: 'Tiempo reglamentario',
        marketName: 'Ganador + Más de 2.5 Goles',
        selection: 'Bayer Leverkusen Gana y Más de 2.5 Goles',
        calculatedProbability: 66.2,
        confidenceIndex: 91,
        sampleSizeMatches: 410,
        bestBookmaker: 'rushbet',
        bestOdds: 1.78,
        impliedProbability: 56.2,
        expectedValuePercent: 10.0,
        isValueOpportunity: true,
        rationale: 'Leverkusen promedia 2.7 goles a favor en el BayArena con Florian Wirtz liderando ocasiones creadas.'
      }
    ]
  },
  {
    id: 'fb-007',
    sport: 'football',
    leagueId: 'libertadores',
    leagueName: 'Copa Libertadores',
    country: 'Sudamérica',
    date: '2026-10-05',
    startTime: '19:30',
    status: 'live',
    minuteOrPeriod: "51'",
    liveSecond: 9,
    halfTimeScore: '(1 - 0)',
    homeTeam: 'River Plate',
    awayTeam: 'Flamengo',
    homeScore: 1,
    awayScore: 1,
    homeFormation: '4-3-1-2',
    awayFormation: '4-2-3-1',
    homeMarketValue: '€114M',
    awayMarketValue: '€212M',
    liveTickerStatus: 'DANGEROUS_ATTACK_AWAY',
    liveTickerText: 'Córner a favor · Flamengo presiona en el Monumental',
    stats: [
      { label: 'Goles Esperados (xG)', homeValue: '1.32', awayValue: '1.19', homePercent: 53, source: 'FootyStats' },
      { label: 'Tiros de Esquina', homeValue: 6, awayValue: 5, homePercent: 55, source: 'Soccerway' }
    ],
    events: [
      { id: 'ev-701', minute: "22'", team: 'home', type: 'goal', player: 'Miguel Borja', detail: 'Definición en el área chica' },
      { id: 'ev-702', minute: "49'", team: 'away', type: 'goal', player: 'Giorgian De Arrascaeta', detail: 'Tiro libre directo al ángulo' }
    ],
    homeLineup: [
      { number: 9, name: 'Miguel Borja', position: 'DC', rating: 8.1, marketValue: '€4.5M', isStarter: true },
      { number: 30, name: 'Franco Mastantuono', position: 'MCO', rating: 7.7, marketValue: '€15M', isStarter: true }
    ],
    awayLineup: [
      { number: 14, name: 'Giorgian De Arrascaeta', position: 'MCO', rating: 8.3, marketValue: '€15M', isStarter: true },
      { number: 9, name: 'Pedro Guilherme', position: 'DC', rating: 7.5, marketValue: '€23M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'SofaScore', verified: true, lastSync: 'Hace 2s', keyMetricLabel: 'Intensidad CONMEBOL', keyMetricValue: '11 Córners en 51 minutos', discrepancyScore: 99.4 }
    ],
    bookmakerOdds: [
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 2.35, drawOdds: 2.95, awayOdds: 3.30, overUnderLine: '2.5 Goles', overOdds: 1.68, underOdds: 2.15, marginPercent: 4.0, reliabilityIndex: 97, movement: 'dropping_home' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 2.30, drawOdds: 3.00, awayOdds: 3.35, overUnderLine: '2.5 Goles', overOdds: 1.70, underOdds: 2.12, marginPercent: 3.9, reliabilityIndex: 98, movement: 'stable' },
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 2.28, drawOdds: 3.05, awayOdds: 3.40, overUnderLine: '2.5 Goles', overOdds: 1.72, underOdds: 2.10, marginPercent: 3.6, reliabilityIndex: 99, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-701',
        category: 'Tiros de Esquina',
        marketName: 'Total de Tiros de Esquina',
        selection: 'Más de 10.5 Tiros de Esquina Totales',
        calculatedProbability: 74.5,
        confidenceIndex: 93,
        sampleSizeMatches: 340,
        bestBookmaker: 'bet365',
        bestOdds: 1.72,
        impliedProbability: 58.1,
        expectedValuePercent: 16.4,
        isValueOpportunity: true,
        rationale: 'Ya suman 11 córners al minuto 51 con ida y vuelta constante en el Monumental.'
      }
    ]
  },
  {
    id: 'fb-008',
    sport: 'football',
    leagueId: 'col-primera-b',
    leagueName: 'Primera B (Torneo BetPlay)',
    country: 'Colombia',
    date: '2026-10-05',
    startTime: '16:00',
    status: 'live',
    minuteOrPeriod: "62'",
    liveSecond: 33,
    halfTimeScore: '(1 - 0)',
    homeTeam: 'Unión Magdalena',
    awayTeam: 'Real Cartagena',
    homeScore: 2,
    awayScore: 1,
    homeFormation: '4-2-3-1',
    awayFormation: '4-4-2',
    homeMarketValue: '€5.8M',
    awayMarketValue: '€6.1M',
    liveTickerStatus: 'DANGEROUS_ATTACK_AWAY',
    liveTickerText: 'Ataque Peligroso · Real Cartagena busca el empate',
    stats: [
      { label: 'Goles Esperados (xG)', homeValue: '1.74', awayValue: '1.21', homePercent: 59, source: 'FootyStats' },
      { label: 'Posesión de Balón (%)', homeValue: '51%', awayValue: '49%', homePercent: 51, source: 'SofaScore' }
    ],
    events: [
      { id: 'ev-801', minute: "39'", team: 'home', type: 'goal', player: 'Jannenson Sarmiento', detail: 'Tiro libre directo' },
      { id: 'ev-802', minute: "55'", team: 'away', type: 'goal', player: 'Teófilo Gutiérrez', detail: 'Definición sutil en el área' }
    ],
    homeLineup: [
      { number: 10, name: 'Jannenson Sarmiento', position: 'MCO', rating: 8.2, marketValue: '€650K', isStarter: true }
    ],
    awayLineup: [
      { number: 29, name: 'Teófilo Gutiérrez', position: 'DC', rating: 7.9, marketValue: '€300K', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'Flashscore', verified: true, lastSync: 'Hace 1s', keyMetricLabel: 'Clásico Costeño Torneo BetPlay', keyMetricValue: "62' 2-1 Confirmado", discrepancyScore: 100 }
    ],
    bookmakerOdds: [
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.52, drawOdds: 3.60, awayOdds: 6.10, overUnderLine: '3.5 Goles', overOdds: 1.95, underOdds: 1.82, marginPercent: 4.3, reliabilityIndex: 96, movement: 'dropping_home' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.50, drawOdds: 3.65, awayOdds: 6.25, overUnderLine: '3.5 Goles', overOdds: 1.98, underOdds: 1.80, marginPercent: 4.1, reliabilityIndex: 97, movement: 'stable' },
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.48, drawOdds: 3.75, awayOdds: 6.50, overUnderLine: '3.5 Goles', overOdds: 2.00, underOdds: 1.78, marginPercent: 3.8, reliabilityIndex: 98, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-801',
        category: 'Tiempo reglamentario',
        marketName: 'Resultado Final (1X2)',
        selection: 'Unión Magdalena Gana (1)',
        calculatedProbability: 71.2,
        confidenceIndex: 88,
        sampleSizeMatches: 260,
        bestBookmaker: 'wplay',
        bestOdds: 1.52,
        impliedProbability: 65.8,
        expectedValuePercent: 5.4,
        isValueOpportunity: true,
        rationale: 'Fuerte localía en el Sierra Nevada de Santa Marta con 78% de puntos obtenidos en casa.'
      }
    ]
  },
  {
    id: 'fb-009',
    sport: 'football',
    leagueId: 'arg-lpf',
    leagueName: 'Liga Profesional',
    country: 'Argentina',
    date: '2026-10-05',
    startTime: '20:00',
    status: 'upcoming',
    minuteOrPeriod: '20:00',
    homeTeam: 'Boca Juniors',
    awayTeam: 'Racing Club',
    homeScore: 0,
    awayScore: 0,
    homeFormation: '4-4-2',
    awayFormation: '3-4-3',
    homeMarketValue: '€89M',
    awayMarketValue: '€64M',
    stats: [
      { label: 'xG Promedio Liga Profesional', homeValue: '1.68', awayValue: '1.59', homePercent: 51, source: 'FootyStats' },
      { label: 'Promedio Tarjetas Clásicos', homeValue: '3.2', awayValue: '3.5', homePercent: 48, source: 'Soccerway' }
    ],
    events: [],
    homeLineup: [
      { number: 10, name: 'Edinson Cavani', position: 'DC', rating: 7.8, marketValue: '€1.5M', isStarter: true },
      { number: 16, name: 'Miguel Merentiel', position: 'DC', rating: 7.7, marketValue: '€7M', isStarter: true }
    ],
    awayLineup: [
      { number: 10, name: 'Juan Fernando Quintero', position: 'MCO', rating: 8.1, marketValue: '€2.5M', isStarter: true },
      { number: 9, name: 'Adrián Martínez', position: 'DC', rating: 7.9, marketValue: '€6M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'Soccerway', verified: true, lastSync: 'Hace 20s', keyMetricLabel: 'Historial En La Bombonera', keyMetricValue: 'Boca invicto en últimos 12 de Liga', discrepancyScore: 99.2 }
    ],
    bookmakerOdds: [
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 2.15, drawOdds: 3.10, awayOdds: 3.65, overUnderLine: '2.5 Goles', overOdds: 2.25, underOdds: 1.64, marginPercent: 3.9, reliabilityIndex: 97, movement: 'dropping_home' },
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 2.10, drawOdds: 3.15, awayOdds: 3.70, overUnderLine: '2.5 Goles', overOdds: 2.28, underOdds: 1.62, marginPercent: 3.6, reliabilityIndex: 98, movement: 'stable' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 2.12, drawOdds: 3.05, awayOdds: 3.60, overUnderLine: '2.5 Goles', overOdds: 2.20, underOdds: 1.66, marginPercent: 4.2, reliabilityIndex: 96, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-901',
        category: 'Tarjetas',
        marketName: 'Total de Tarjetas en el Partido',
        selection: 'Más de 5.5 Tarjetas Totales',
        calculatedProbability: 67.5,
        confidenceIndex: 91,
        sampleSizeMatches: 310,
        bestBookmaker: 'wplay',
        bestOdds: 1.78,
        impliedProbability: 56.2,
        expectedValuePercent: 11.3,
        isValueOpportunity: true,
        rationale: 'Los últimos 6 duelos entre Boca y Racing superaron las 6 tarjetas amarillas según registros de Soccerway.'
      }
    ]
  },
  {
    id: 'fb-010',
    sport: 'football',
    leagueId: 'mex-ligamx',
    leagueName: 'Liga MX (Apertura / Clausura)',
    country: 'México',
    date: '2026-10-05',
    startTime: '21:05',
    status: 'upcoming',
    minuteOrPeriod: '21:05',
    homeTeam: 'Club América',
    awayTeam: 'Cruz Azul',
    homeScore: 0,
    awayScore: 0,
    homeFormation: '4-2-3-1',
    awayFormation: '3-4-2-1',
    homeMarketValue: '€97M',
    awayMarketValue: '€82M',
    stats: [
      { label: 'xG Promedio Apertura Liga MX', homeValue: '2.05', awayValue: '2.18', homePercent: 48, source: 'FootyStats' },
      { label: 'Frecuencia Ambos Anotan (BTTS)', homeValue: '71%', awayValue: '74%', homePercent: 49, source: 'FootyStats' }
    ],
    events: [],
    homeLineup: [
      { number: 21, name: 'Henry Martín', position: 'DC', rating: 8.0, marketValue: '€5M', isStarter: true },
      { number: 8, name: 'Álvaro Fidalgo', position: 'MC', rating: 7.8, marketValue: '€8M', isStarter: true }
    ],
    awayLineup: [
      { number: 9, name: 'Giorgos Giakoumakis', position: 'DC', rating: 8.1, marketValue: '€9M', isStarter: true },
      { number: 19, name: 'Carlos Rodríguez', position: 'MC', rating: 7.7, marketValue: '€6M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'FootyStats', verified: true, lastSync: 'Hace 15s', keyMetricLabel: 'Clásico Joven BTTS', keyMetricValue: '73% Probabilidad Ambos Anotan', discrepancyScore: 99.0 }
    ],
    bookmakerOdds: [
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 2.40, drawOdds: 3.30, awayOdds: 2.90, overUnderLine: '2.5 Goles', overOdds: 1.72, underOdds: 2.10, marginPercent: 3.6, reliabilityIndex: 99, movement: 'stable' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 2.45, drawOdds: 3.25, awayOdds: 2.85, overUnderLine: '2.5 Goles', overOdds: 1.75, underOdds: 2.06, marginPercent: 3.9, reliabilityIndex: 97, movement: 'stable' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 2.38, drawOdds: 3.25, awayOdds: 2.95, overUnderLine: '2.5 Goles', overOdds: 1.70, underOdds: 2.12, marginPercent: 4.1, reliabilityIndex: 96, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-1001',
        category: 'Tiempo reglamentario',
        marketName: 'Ambos Equipos Anotan (BTTS)',
        selection: 'Ambos Equipos Anotan: Sí',
        calculatedProbability: 71.5,
        confidenceIndex: 92,
        sampleSizeMatches: 390,
        bestBookmaker: 'rushbet',
        bestOdds: 1.75,
        impliedProbability: 57.1,
        expectedValuePercent: 14.4,
        isValueOpportunity: true,
        rationale: 'Tanto América como Cruz Azul superan 2.0 goles esperados por partido en el Torneo Apertura.'
      }
    ]
  },
  {
    id: 'fb-011',
    sport: 'football',
    leagueId: 'sel-elim-conmebol',
    leagueName: 'Clasificación Mundial (Sudamérica)',
    country: 'Sudamérica',
    date: '2026-10-05',
    startTime: '15:30',
    status: 'upcoming',
    minuteOrPeriod: '15:30',
    homeTeam: 'Colombia',
    awayTeam: 'Brasil',
    homeScore: 0,
    awayScore: 0,
    homeFormation: '4-3-3',
    awayFormation: '4-2-3-1',
    homeMarketValue: '€315M',
    awayMarketValue: '€940M',
    stats: [
      { label: 'Rendimiento en Barranquilla (xG)', homeValue: '2.12', awayValue: '1.15', homePercent: 65, source: 'FootyStats' },
      { label: 'Posesión Media Eliminatorias', homeValue: '54%', awayValue: '58%', homePercent: 48, source: 'SofaScore' }
    ],
    events: [],
    homeLineup: [
      { number: 10, name: 'James Rodríguez', position: 'MCO', rating: 8.6, marketValue: '€5M', isStarter: true },
      { number: 7, name: 'Luis Díaz', position: 'EI', rating: 8.4, marketValue: '€80M', isStarter: true }
    ],
    awayLineup: [
      { number: 7, name: 'Vinícius Júnior', position: 'EI', rating: 8.5, marketValue: '€200M', isStarter: true },
      { number: 11, name: 'Raphinha', position: 'ED', rating: 8.3, marketValue: '€60M', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'Soccerway', verified: true, lastSync: 'Hace 10s', keyMetricLabel: 'Fortaleza Metropolitano', keyMetricValue: 'Colombia 85% efectividad como local', discrepancyScore: 99.6 }
    ],
    bookmakerOdds: [
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 2.65, drawOdds: 3.10, awayOdds: 2.80, overUnderLine: '2.5 Goles', overOdds: 2.05, underOdds: 1.76, marginPercent: 3.9, reliabilityIndex: 98, movement: 'dropping_home' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 2.60, drawOdds: 3.15, awayOdds: 2.85, overUnderLine: '2.5 Goles', overOdds: 2.08, underOdds: 1.74, marginPercent: 3.9, reliabilityIndex: 98, movement: 'dropping_home' },
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 2.55, drawOdds: 3.20, awayOdds: 2.88, overUnderLine: '2.5 Goles', overOdds: 2.10, underOdds: 1.72, marginPercent: 3.6, reliabilityIndex: 99, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-1101',
        category: 'Líneas Asiáticas',
        marketName: 'Hándicap Asiático 0.0 (Sin Empate)',
        selection: 'Colombia Hándicap Asiático 0.0 (DNB)',
        calculatedProbability: 61.8,
        confidenceIndex: 90,
        sampleSizeMatches: 280,
        bestBookmaker: 'wplay',
        bestOdds: 1.85,
        impliedProbability: 54.1,
        expectedValuePercent: 7.7,
        isValueOpportunity: true,
        rationale: 'En Barranquilla, Colombia registra superioridad física y de balón parado con James Rodríguez y Luis Díaz.'
      }
    ]
  },

  // ==================== TENNIS ====================
  {
    id: 'tn-001',
    sport: 'tennis',
    leagueId: 'atp-masters',
    leagueName: 'ATP Masters 1000 Shanghai',
    country: 'Internacional',
    date: '2026-10-05',
    startTime: '15:30',
    status: 'live',
    minuteOrPeriod: 'Set 2',
    tennisServer: 'home',
    homeSetScores: [6, 3],
    awaySetScores: [4, 2],
    homeCurrentGamePoints: '40',
    awayCurrentGamePoints: '15',
    liveTickerStatus: 'BREAK_POINT',
    liveTickerText: 'Saque a 209 km/h · Punto de Juego Alcaraz',
    homeTeam: 'Carlos Alcaraz',
    awayTeam: 'Jannik Sinner',
    homeScore: 1,
    awayScore: 0,
    homeSubScores: '6 | 3 (40)',
    awaySubScores: '4 | 2 (15)',
    homeMarketValue: 'Ranking #2 ATP',
    awayMarketValue: 'Ranking #1 ATP',
    stats: [
      { label: 'Puntos Ganados con 1er Servicio (%)', homeValue: '79%', awayValue: '73%', homePercent: 52, source: 'SofaScore' },
      { label: 'Aces Conectados', homeValue: 7, awayValue: 9, homePercent: 44, source: 'Flashscore' },
      { label: 'Break Points Salvados', homeValue: '3/3 (100%)', awayValue: '2/4 (50%)', homePercent: 67, source: 'SofaScore' },
      { label: 'Tiros Ganadores (Winners)', homeValue: 24, awayValue: 19, homePercent: 56, source: 'Flashscore' },
      { label: 'Errores No Forzados', homeValue: 11, awayValue: 15, homePercent: 42, source: 'SofaScore' }
    ],
    events: [
      { id: 'ev-tn1', minute: 'Set 1 (5-4)', team: 'home', type: 'break_point', player: 'Carlos Alcaraz', detail: 'Quiebre en blanco con passing shot de derecha' },
      { id: 'ev-tn2', minute: 'Set 1 (6-4)', team: 'home', type: 'set_won', player: 'Carlos Alcaraz', detail: 'Cierra el primer set en 46 minutos' },
      { id: 'ev-tn3', minute: 'Set 2 (2-1)', team: 'home', type: 'break_point', player: 'Carlos Alcaraz', detail: 'Oportunidad de quiebre generada en deuce' }
    ],
    homeLineup: [
      { number: 2, name: 'Carlos Alcaraz (ESP)', position: 'Diestro · Revés a 2 manos', rating: 8.7, marketValue: '84.5% Win Rate 2026', isStarter: true }
    ],
    awayLineup: [
      { number: 1, name: 'Jannik Sinner (ITA)', position: 'Diestro · Revés a 2 manos', rating: 8.1, marketValue: '88.2% Win Rate 2026', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'SofaScore', verified: true, lastSync: 'Hace 1s', keyMetricLabel: 'Índice de Dominio al Resto', keyMetricValue: 'Alcaraz gana 41% puntos al resto', discrepancyScore: 99.5 },
      { source: 'Flashscore', verified: true, lastSync: 'Hace 1s', keyMetricLabel: 'Velocidad Media 1er Saque', keyMetricValue: '208 km/h Alcaraz vs 211 km/h Sinner', discrepancyScore: 100 },
      { source: 'FootyStats', verified: true, lastSync: 'Hace 12s', keyMetricLabel: 'Modelado Markov Punto a Punto', keyMetricValue: 'Alcaraz 71.4% Probabilidad Victoria', discrepancyScore: 98.2 }
    ],
    bookmakerOdds: [
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.48, awayOdds: 2.65, overUnderLine: '22.5 Juegos', overOdds: 1.90, underOdds: 1.90, marginPercent: 3.7, reliabilityIndex: 99, movement: 'dropping_home' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.52, awayOdds: 2.55, overUnderLine: '22.5 Juegos', overOdds: 1.88, underOdds: 1.92, marginPercent: 4.1, reliabilityIndex: 97, movement: 'dropping_home' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.50, awayOdds: 2.60, overUnderLine: '22.5 Juegos', overOdds: 1.85, underOdds: 1.95, marginPercent: 4.2, reliabilityIndex: 96, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-tn1',
        marketName: 'Ganador del Partido (En Vivo)',
        selection: 'Carlos Alcaraz Gana el Partido',
        calculatedProbability: 72.8,
        confidenceIndex: 93,
        sampleSizeMatches: 215,
        bestBookmaker: 'rushbet',
        bestOdds: 1.52,
        impliedProbability: 65.8,
        expectedValuePercent: 7.0,
        isValueOpportunity: true,
        rationale: 'Alcaraz ganó el Set 1 y mantiene un 100% de break points salvados con 79% de efectividad en primer saque. Rushbet paga 1.52 (+7.0% EV).'
      }
    ]
  },

  // ==================== BASKETBALL ====================
  {
    id: 'bk-001',
    sport: 'basketball',
    leagueId: 'nba',
    leagueName: 'NBA Regular Season',
    country: 'EE. UU.',
    date: '2026-10-05',
    startTime: '19:00',
    status: 'live',
    minuteOrPeriod: 'Q3 · 04:18',
    liveSecond: 18,
    homeSetScores: [31, 28, 27],
    awaySetScores: [26, 29, 24],
    liveTickerStatus: 'DANGEROUS_ATTACK_HOME',
    liveTickerText: 'Posesión Boston Celtics · Racha 8-0',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Denver Nuggets',
    homeScore: 86,
    awayScore: 79,
    homeSubScores: '31 | 28 | 27',
    awaySubScores: '26 | 29 | 24',
    homeMarketValue: 'Pace: 99.4 | OffRtg: 121.8',
    awayMarketValue: 'Pace: 97.8 | OffRtg: 118.5',
    stats: [
      { label: 'Porcentaje Tiros de Campo (FG%)', homeValue: '51.2%', awayValue: '47.6%', homePercent: 52, source: 'SofaScore' },
      { label: 'Triples Anotados (3P%)', homeValue: '14/32 (43.8%)', awayValue: '9/25 (36.0%)', homePercent: 61, source: 'Flashscore' },
      { label: 'Rebotes Totales (Ofensivos)', homeValue: '34 (9)', awayValue: '31 (8)', homePercent: 52, source: 'SofaScore' },
      { label: 'Asistencias / Pérdidas', homeValue: '22 / 7', awayValue: '24 / 11', homePercent: 58, source: 'Flashscore' }
    ],
    events: [
      { id: 'ev-bk1', minute: 'Q1 00:00', team: 'home', type: 'quarter_end', player: 'Fin del Q1: Celtics 31 - 26 Nuggets', detail: 'Jayson Tatum 12 pts' },
      { id: 'ev-bk2', minute: 'Q2 00:00', team: 'away', type: 'quarter_end', player: 'Descanso: Celtics 59 - 55 Nuggets', detail: 'Nikola Jokić 18 pts, 8 reb' },
      { id: 'ev-bk3', minute: 'Q3 05:12', team: 'home', type: 'three_pointer', player: 'Jaylen Brown', detail: 'Racha 8-0 para Boston obliga tiempo muerto' }
    ],
    homeLineup: [
      { number: 0, name: 'Jayson Tatum', position: 'SF/PF', rating: 8.6, marketValue: '26 Pts · 7 Reb · 5 Ast', isStarter: true },
      { number: 7, name: 'Jaylen Brown', position: 'SG/SF', rating: 8.2, marketValue: '21 Pts · 4 Reb · 3 Ast', isStarter: true },
      { number: 9, name: 'Derrick White', position: 'PG/SG', rating: 7.9, marketValue: '15 Pts · 4/7 3PT', isStarter: true }
    ],
    awayLineup: [
      { number: 15, name: 'Nikola Jokić', position: 'C', rating: 8.8, marketValue: '27 Pts · 12 Reb · 9 Ast', isStarter: true },
      { number: 27, name: 'Jamal Murray', position: 'PG', rating: 7.4, marketValue: '18 Pts · 5 Ast', isStarter: true },
      { number: 50, name: 'Aaron Gordon', position: 'PF', rating: 7.1, marketValue: '12 Pts · 6 Reb', isStarter: true }
    ],
    sourceVerifications: [
      { source: 'SofaScore', verified: true, lastSync: 'Hace 2s', keyMetricLabel: 'True Shooting % (TS%)', keyMetricValue: 'Boston 63.4% vs Denver 57.1%', discrepancyScore: 99.3 },
      { source: 'Flashscore', verified: true, lastSync: 'Hace 1s', keyMetricLabel: 'Ritmo Proyectado Puntos', keyMetricValue: 'Proyección Final: 229.5 Puntos', discrepancyScore: 99.8 }
    ],
    bookmakerOdds: [
      { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.36, awayOdds: 3.25, overUnderLine: '226.5 Puntos', overOdds: 1.91, underOdds: 1.91, marginPercent: 3.9, reliabilityIndex: 98, movement: 'dropping_home' },
      { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.38, awayOdds: 3.15, overUnderLine: '226.5 Puntos', overOdds: 1.94, underOdds: 1.87, marginPercent: 4.1, reliabilityIndex: 96, movement: 'stable' },
      { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.35, awayOdds: 3.20, overUnderLine: '226.5 Puntos', overOdds: 1.88, underOdds: 1.92, marginPercent: 4.3, reliabilityIndex: 95, movement: 'stable' }
    ],
    predictions: [
      {
        id: 'pred-bk1',
        marketName: 'Total de Puntos (Over/Under En Vivo)',
        selection: 'Más de 226.5 Puntos Totales',
        calculatedProbability: 61.5,
        confidenceIndex: 88,
        sampleSizeMatches: 410,
        bestBookmaker: 'rushbet',
        bestOdds: 1.94,
        impliedProbability: 51.5,
        expectedValuePercent: 10.0,
        isValueOpportunity: true,
        rationale: 'El ritmo actual proyecta 230.2 puntos totales con un 43.8% de efectividad en triples de Boston. Rushbet ofrece cuota 1.94 (+10.0% EV).'
      },
      {
        id: 'pred-bk2',
        marketName: 'Hándicap Asiático (Spread)',
        selection: 'Boston Celtics -5.5 Puntos',
        calculatedProbability: 58.2,
        confidenceIndex: 85,
        sampleSizeMatches: 390,
        bestBookmaker: 'bet365',
        bestOdds: 1.87,
        impliedProbability: 53.5,
        expectedValuePercent: 4.7,
        isValueOpportunity: true,
        rationale: 'Boston registra un diferencial Net Rating de +11.4 en el TD Garden y domina la rotación de segunda unidad.'
      }
    ]
  }
];

export const INITIAL_STANDINGS: LeagueStanding[] = [
  {
    leagueId: 'ucl',
    leagueName: 'UEFA Champions League — Fase de Liga',
    sport: 'football',
    country: 'Europa',
    lastUpdated: 'En vivo (Actualizado al instante)',
    source: 'Soccerway',
    rows: [
      { position: 1, teamName: 'Real Madrid', played: 6, won: 5, drawn: 0, lost: 1, goalsFor: 16, goalsAgainst: 6, goalDiff: 10, points: 15, xGPerMatch: 2.38, form: ['W', 'W', 'W', 'L', 'W'], marketValue: '€1.36B' },
      { position: 2, teamName: 'Liverpool', played: 6, won: 5, drawn: 0, lost: 1, goalsFor: 14, goalsAgainst: 5, goalDiff: 9, points: 15, xGPerMatch: 2.15, form: ['W', 'W', 'W', 'W', 'L'], marketValue: '€965M' },
      { position: 3, teamName: 'FC Barcelona', played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 17, goalsAgainst: 5, goalDiff: 12, points: 12, xGPerMatch: 2.61, form: ['W', 'W', 'W', 'W', 'L'], marketValue: '€940M' },
      { position: 4, teamName: 'Arsenal', played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 11, goalsAgainst: 4, goalDiff: 7, points: 13, xGPerMatch: 1.94, form: ['D', 'W', 'W', 'L', 'W'], marketValue: '€1.17B' },
      { position: 5, teamName: 'Bayern München', played: 6, won: 3, drawn: 1, lost: 2, goalsFor: 13, goalsAgainst: 8, goalDiff: 5, points: 10, xGPerMatch: 2.21, form: ['L', 'W', 'W', 'L', 'W'], marketValue: '€980M' },
      { position: 6, teamName: 'Inter Milano', played: 5, won: 4, drawn: 1, lost: 0, goalsFor: 8, goalsAgainst: 1, goalDiff: 7, points: 13, xGPerMatch: 1.78, form: ['W', 'W', 'W', 'W', 'D'], marketValue: '€675M' }
    ]
  },
  {
    leagueId: 'col-primera-a',
    leagueName: 'Colombia: Primera A (Liga BetPlay)',
    sport: 'football',
    country: 'Colombia',
    lastUpdated: 'En vivo (Actualizado al instante)',
    source: 'Flashscore',
    rows: [
      { position: 1, teamName: 'Millonarios FC', played: 14, won: 9, drawn: 3, lost: 2, goalsFor: 24, goalsAgainst: 10, goalDiff: 14, points: 30, xGPerMatch: 1.82, form: ['W', 'W', 'D', 'W', 'W'], marketValue: '€24.8M' },
      { position: 2, teamName: 'América de Cali', played: 13, won: 9, drawn: 2, lost: 2, goalsFor: 21, goalsAgainst: 9, goalDiff: 12, points: 29, xGPerMatch: 1.69, form: ['W', 'W', 'W', 'D', 'L'], marketValue: '€19.5M' },
      { position: 3, teamName: 'Independiente Santa Fe', played: 13, won: 8, drawn: 4, lost: 1, goalsFor: 19, goalsAgainst: 8, goalDiff: 11, points: 28, xGPerMatch: 1.58, form: ['D', 'W', 'W', 'D', 'W'], marketValue: '€16.2M' },
      { position: 4, teamName: 'Atlético Nacional', played: 14, won: 8, drawn: 2, lost: 4, goalsFor: 22, goalsAgainst: 15, goalDiff: 7, points: 26, xGPerMatch: 1.64, form: ['L', 'W', 'W', 'L', 'W'], marketValue: '€22.4M' },
      { position: 5, teamName: 'Junior de Barranquilla', played: 13, won: 6, drawn: 4, lost: 3, goalsFor: 18, goalsAgainst: 13, goalDiff: 5, points: 22, xGPerMatch: 1.51, form: ['W', 'D', 'L', 'W', 'D'], marketValue: '€21.0M' },
      { position: 6, teamName: 'Deportes Tolima', played: 13, won: 6, drawn: 3, lost: 4, goalsFor: 17, goalsAgainst: 12, goalDiff: 5, points: 21, xGPerMatch: 1.49, form: ['W', 'L', 'W', 'D', 'L'], marketValue: '€15.8M' }
    ]
  },
  {
    leagueId: 'arg-lpf',
    leagueName: 'Argentina: Liga Profesional',
    sport: 'football',
    country: 'Argentina',
    lastUpdated: 'En vivo (Actualizado al instante)',
    source: 'Soccerway',
    rows: [
      { position: 1, teamName: 'Vélez Sarsfield', played: 16, won: 10, drawn: 3, lost: 3, goalsFor: 28, goalsAgainst: 11, goalDiff: 17, points: 33, xGPerMatch: 1.79, form: ['W', 'W', 'W', 'D', 'W'], marketValue: '€48.5M' },
      { position: 2, teamName: 'River Plate', played: 16, won: 8, drawn: 5, lost: 3, goalsFor: 24, goalsAgainst: 13, goalDiff: 11, points: 29, xGPerMatch: 1.85, form: ['W', 'D', 'W', 'W', 'D'], marketValue: '€114.0M' },
      { position: 3, teamName: 'Racing Club', played: 16, won: 8, drawn: 4, lost: 4, goalsFor: 25, goalsAgainst: 15, goalDiff: 10, points: 28, xGPerMatch: 1.66, form: ['W', 'L', 'W', 'D', 'W'], marketValue: '€64.0M' },
      { position: 4, teamName: 'Boca Juniors', played: 16, won: 7, drawn: 6, lost: 3, goalsFor: 21, goalsAgainst: 14, goalDiff: 7, points: 27, xGPerMatch: 1.61, form: ['W', 'W', 'L', 'D', 'W'], marketValue: '€89.0M' }
    ]
  },
  {
    leagueId: 'mex-ligamx',
    leagueName: 'México: Liga MX (Apertura)',
    sport: 'football',
    country: 'México',
    lastUpdated: 'En vivo (Actualizado al instante)',
    source: 'FootyStats',
    rows: [
      { position: 1, teamName: 'Cruz Azul', played: 12, won: 10, drawn: 1, lost: 1, goalsFor: 29, goalsAgainst: 9, goalDiff: 20, points: 31, xGPerMatch: 2.18, form: ['W', 'W', 'W', 'W', 'D'], marketValue: '€82.0M' },
      { position: 2, teamName: 'Toluca', played: 12, won: 8, drawn: 3, lost: 1, goalsFor: 26, goalsAgainst: 11, goalDiff: 15, points: 27, xGPerMatch: 1.92, form: ['W', 'D', 'W', 'W', 'W'], marketValue: '€71.5M' },
      { position: 3, teamName: 'Tigres UANL', played: 12, won: 7, drawn: 3, lost: 2, goalsFor: 20, goalsAgainst: 11, goalDiff: 9, points: 24, xGPerMatch: 1.76, form: ['W', 'W', 'D', 'L', 'W'], marketValue: '€68.0M' },
      { position: 4, teamName: 'Club América', played: 12, won: 6, drawn: 3, lost: 3, goalsFor: 19, goalsAgainst: 13, goalDiff: 6, points: 21, xGPerMatch: 2.05, form: ['W', 'D', 'W', 'W', 'L'], marketValue: '€97.0M' }
    ]
  },
  {
    leagueId: 'nba',
    leagueName: 'NBA — Conferencia Este / Oeste Top',
    sport: 'basketball',
    country: 'EE. UU.',
    lastUpdated: 'En vivo (Actualizado al instante)',
    source: 'SofaScore',
    rows: [
      { position: 1, teamName: 'Boston Celtics', played: 18, won: 15, drawn: 0, lost: 3, goalsFor: 2178, goalsAgainst: 1980, goalDiff: 198, points: 30, xGPerMatch: 121.0, form: ['W', 'W', 'W', 'W', 'L'], marketValue: 'OffRtg 121.8' },
      { position: 2, teamName: 'Oklahoma City Thunder', played: 18, won: 14, drawn: 0, lost: 4, goalsFor: 2124, goalsAgainst: 1955, goalDiff: 169, points: 28, xGPerMatch: 118.0, form: ['W', 'W', 'L', 'W', 'W'], marketValue: 'OffRtg 119.4' },
      { position: 3, teamName: 'Denver Nuggets', played: 18, won: 12, drawn: 0, lost: 6, goalsFor: 2095, goalsAgainst: 2010, goalDiff: 85, points: 24, xGPerMatch: 116.4, form: ['L', 'W', 'W', 'W', 'L'], marketValue: 'OffRtg 118.5' },
      { position: 4, teamName: 'New York Knicks', played: 17, won: 11, drawn: 0, lost: 6, goalsFor: 1998, goalsAgainst: 1932, goalDiff: 66, points: 22, xGPerMatch: 117.5, form: ['W', 'L', 'W', 'W', 'L'], marketValue: 'OffRtg 117.9' }
    ]
  }
];

export const INITIAL_ANALYTICAL_HISTORY: TrackedAnalyticalRecord[] = [
  {
    id: 'rec-101',
    date: '2026-10-05 11:30',
    sport: 'football',
    leagueName: 'Premier League',
    matchTitle: 'Arsenal vs Liverpool',
    marketSelection: 'Ambos Anotan + Más de 2.5 Goles',
    bookmaker: 'rushbet',
    odds: 1.98,
    modelProbability: 66.5,
    confidenceIndex: 92,
    expectedValue: 16.0,
    simulatedStakeUnits: 2.5,
    simulatedStakeCOP: 250000,
    status: 'won',
    profitLossCOP: 245000
  },
  {
    id: 'rec-102',
    date: '2026-10-04 19:45',
    sport: 'football',
    leagueName: 'Serie A Italia',
    matchTitle: 'Inter Milano vs Torino',
    marketSelection: 'Inter Milano Hándicap Asiático -1.5',
    bookmaker: 'bet365',
    odds: 1.85,
    modelProbability: 63.2,
    confidenceIndex: 89,
    expectedValue: 9.1,
    simulatedStakeUnits: 2.0,
    simulatedStakeCOP: 200000,
    status: 'won',
    profitLossCOP: 170000
  },
  {
    id: 'rec-103',
    date: '2026-10-04 16:00',
    sport: 'tennis',
    leagueName: 'ATP Shanghai',
    matchTitle: 'Novak Djokovic vs Taylor Fritz',
    marketSelection: 'Más de 21.5 Juegos Totales',
    bookmaker: 'wplay',
    odds: 1.92,
    modelProbability: 61.0,
    confidenceIndex: 86,
    expectedValue: 8.9,
    simulatedStakeUnits: 1.5,
    simulatedStakeCOP: 150000,
    status: 'won',
    profitLossCOP: 138000
  },
  {
    id: 'rec-104',
    date: '2026-10-03 20:15',
    sport: 'football',
    leagueName: 'Liga BetPlay Dimayor',
    matchTitle: 'América de Cali vs Junior',
    marketSelection: 'América de Cali Gana (1)',
    bookmaker: 'wplay',
    odds: 1.75,
    modelProbability: 64.8,
    confidenceIndex: 90,
    expectedValue: 7.7,
    simulatedStakeUnits: 2.0,
    simulatedStakeCOP: 200000,
    status: 'won',
    profitLossCOP: 150000
  },
  {
    id: 'rec-105',
    date: '2026-10-03 18:00',
    sport: 'basketball',
    leagueName: 'NBA Preseason / Regular',
    matchTitle: 'Phoenix Suns vs LA Lakers',
    marketSelection: 'Menos de 231.5 Puntos',
    bookmaker: 'rushbet',
    odds: 1.91,
    modelProbability: 58.5,
    confidenceIndex: 82,
    expectedValue: 6.1,
    simulatedStakeUnits: 1.5,
    simulatedStakeCOP: 150000,
    status: 'lost',
    profitLossCOP: -150000
  },
  {
    id: 'rec-106',
    date: '2026-10-02 14:00',
    sport: 'football',
    leagueName: 'UEFA Champions League',
    matchTitle: 'Bayer Leverkusen vs AC Milan',
    marketSelection: 'Más de 9.5 Córners Asiáticos',
    bookmaker: 'bet365',
    odds: 1.88,
    modelProbability: 65.4,
    confidenceIndex: 91,
    expectedValue: 12.2,
    simulatedStakeUnits: 3.0,
    simulatedStakeCOP: 300000,
    status: 'won',
    profitLossCOP: 264000
  },
  {
    id: 'rec-107',
    date: '2026-10-05 14:00',
    sport: 'football',
    leagueName: 'UEFA Champions League',
    matchTitle: 'Real Madrid vs Bayern München',
    marketSelection: 'Más de 3.5 Goles en el Partido',
    bookmaker: 'bet365',
    odds: 1.83,
    modelProbability: 64.2,
    confidenceIndex: 91,
    expectedValue: 9.6,
    simulatedStakeUnits: 2.0,
    simulatedStakeCOP: 200000,
    status: 'pending',
    profitLossCOP: 0
  }
];

export const INITIAL_NOTIFICATIONS: LiveNotification[] = [
  {
    id: 'notif-1',
    timestamp: 'Hace 1 min',
    type: 'value_bet',
    sport: 'basketball',
    title: 'Alerta de Valor Estadístico (EV +10.0%)',
    message: 'Boston Celtics vs Denver Nuggets: Más de 226.5 Puntos con 61.5% prob. real y cuota 1.94 en Rushbet.',
    matchId: 'bk-001',
    evPercent: 10.0,
    bookmaker: 'rushbet',
    read: false
  },
  {
    id: 'notif-2',
    timestamp: 'Hace 4 min',
    type: 'goal',
    sport: 'football',
    title: 'GOL EN VIVO · Real Madrid 2 - 1 Bayern München',
    message: "Minuto 58': Kylian Mbappé anota en transición rápida (xG de jugada: 0.61). Confirmado por Flashscore y SofaScore.",
    matchId: 'fb-001',
    read: false
  },
  {
    id: 'notif-3',
    timestamp: 'Hace 8 min',
    type: 'prediction',
    sport: 'football',
    title: 'Nueva Predicción de Alta Confianza (90/100)',
    message: 'FC Barcelona vs Atlético de Madrid: Barça Gana (1) a cuota 1.80 en Rushbet (Probabilidad calculada: 62.4%).',
    matchId: 'fb-004',
    evPercent: 6.8,
    bookmaker: 'rushbet',
    read: false
  }
];
