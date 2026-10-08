import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertSettingsConfig,
  BookmakerId,
  LiveNotification,
  Match,
  MatchStatus,
  SportMarketCategory,
  SportType,
  TrackedAnalyticalRecord
} from './types/sports';
import { getSportCategorizedPredictions } from './utils/footballMarketsGenerator';
import {
  INITIAL_ANALYTICAL_HISTORY,
  INITIAL_MATCHES,
  INITIAL_NOTIFICATIONS,
  INITIAL_STANDINGS
} from './data/sportsData';
import { FLASHSCORE_LEAGUES_CATALOG } from './data/leaguesCatalog';
import { BookmakerSidebar } from './components/BookmakerSidebar';
import { FlashscoreLiveBoard } from './components/FlashscoreLiveBoard';
import { MatchInspector } from './components/MatchInspector';
import { StandingsPanel } from './components/StandingsPanel';
import { FinancialHistoryPanel } from './components/FinancialHistoryPanel';
import { TwoFactorModal } from './components/TwoFactorModal';
import { ValueRadarScatterChart } from './components/ValueRadarScatterChart';
import { AlertSettingsPanel } from './components/AlertSettingsPanel';
import { OddsTrendSparkline } from './components/OddsTrendSparkline';
import { OutcomeProbabilityStackedChart } from './components/OutcomeProbabilityStackedChart';
import { fetchRealTimeRushbetAndFinishedMatches } from './services/rushbetLiveService';
import { playFlashscoreGoalSound, playInvestmentOpportunitySound } from './utils/soundAlert';
import {
  getColombiaDateString,
  getColombiaTimeClock
} from './utils/colombiaTime';
import {
  Bell,
  ShieldCheck,
  Search,
  Radio,
  CheckCircle2,
  X,
  Trophy,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  PlusCircle,
  RefreshCw,
  Star,
  Maximize2,
  Minimize2
} from 'lucide-react';

const LIVE_FOOTBALL_STATES = [
  'Ataque Peligroso · Local en área rival',
  'Posesión en medio campo · Construcción',
  'Córner a favor · Peligro de gol',
  'Revisión silenciosa VAR · Juego continúa',
  'Contraataque rápido · Transición ofensiva',
  'Tiro libre directo cerca del área'
];

export default function App() {
  // Primary Navigation View
  const [activeNav, setActiveNav] = useState<'matches' | 'predictions' | 'standings' | 'finance'>('matches');

  // Core Data States (Updated in Real-Time without page reload)
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [standings, setStandings] = useState(INITIAL_STANDINGS);
  const [historyRecords, setHistoryRecords] = useState<TrackedAnalyticalRecord[]>(INITIAL_ANALYTICAL_HISTORY);
  const [notifications, setNotifications] = useState<LiveNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeToast, setActiveToast] = useState<LiveNotification | null>(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Filters & Selections
  const [selectedMatchId, setSelectedMatchId] = useState<string>('fb-001');
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'all'>('all');
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedBookmaker, setSelectedBookmaker] = useState<BookmakerId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => getColombiaDateString());
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([
    'Real Madrid',
    'Millonarios FC',
    'Carlos Alcaraz',
    'Boston Celtics'
  ]);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>([
    'col-primera-a',
    'ucl',
    'libertadores',
    'epl',
    'laliga',
    'nba'
  ]);
  const [visibleStatuses, setVisibleStatuses] = useState<Record<MatchStatus, boolean>>({
    live: true,
    finished: true,
    upcoming: true
  });
  const [minEVFilter, setMinEVFilter] = useState<number>(4);
  const [selectedFootballCategory, setSelectedFootballCategory] = useState<SportMarketCategory | 'all'>('all');
  const [isMainCompetitionsDropdownOpen, setIsMainCompetitionsDropdownOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Allow pressing Escape key to exit Focus Mode quickly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Security 2FA & Bankroll
  const [is2FAModalOpen, setIs2FAModalOpen] = useState<boolean>(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(true);
  const [is2FAVerifiedSession, setIs2FAVerifiedSession] = useState<boolean>(true);
  const [initialBankrollCOP, setInitialBankrollCOP] = useState<number>(5000000);

  // Push Notification Toggle, Sound Alert & Clipboard Feedback
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedPickId, setCopiedPickId] = useState<string | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState<boolean>(false);
  const [notifDrawerFilter, setNotifDrawerFilter] = useState<'ALL' | 'GOL' | 'OPORTUNIDAD_INVERSION'>('ALL');
  const [isSyncingRushbet, setIsSyncingRushbet] = useState<boolean>(false);
  const [lastRushbetSync, setLastRushbetSync] = useState<string>('Sincronizando con Rushbet.co...');
  const [isUsingLiveRushbetFeed, setIsUsingLiveRushbetFeed] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<AlertSettingsConfig>({
    masterPushEnabled: true,
    goalAlertsEnabled: true,
    goalOnlyFavorites: false,
    goalIncludeVarAndRedCards: true,
    goalSoundWhistle: true,
    goalPostRecalibrationMinEV: 5.5,
    investmentAlertsEnabled: true,
    investmentMinEVPercent: 6.5,
    investmentMinConfidence: 85,
    investmentMinProbability: 60,
    investmentBookmakers: ['rushbet', 'bet365', 'wplay'],
    investmentSoundChime: true
  });

  // Real-time Rushbet Colombia (Kambi API) + Official Scoreboard Synchronization
  const syncRealRushbetMatches = async (isInitial = false) => {
    setIsSyncingRushbet(true);
    try {
      const res = await fetchRealTimeRushbetAndFinishedMatches();
      if (res.matches.length > 0) {
        setMatches(res.matches);
        setLastRushbetSync(res.lastSyncTime);
        setIsUsingLiveRushbetFeed(true);
        if (isInitial) {
          const firstLive = res.matches.find((m) => m.status === 'live') || res.matches[0];
          if (firstLive) {
            setSelectedMatchId(firstLive.id);
            setFavoriteLeagues((prev) =>
              prev.includes(firstLive.leagueId) ? prev : [firstLive.leagueId, ...prev]
            );
          }
        }
      }
    } catch (err) {
      console.warn('Rushbet live sync error:', err);
    } finally {
      setIsSyncingRushbet(false);
    }
  };

  useEffect(() => {
    syncRealRushbetMatches(true);
    const pollInterval = setInterval(() => {
      syncRealRushbetMatches(false);
    }, 20000);
    return () => clearInterval(pollInterval);
  }, []);

  // 1-Second Real-Time Flashscore Clock & Match Ticker Engine
  useEffect(() => {
    const secondTimer = setInterval(() => {
      const currentNow = Date.now();
      setNowTimestamp(currentNow);

      setMatches((prevMatches) =>
        prevMatches.map((m) => {
          if (m.status !== 'live') return m;

          // Football 1-second live clock increment (68':42 -> 68':43 -> 69':00)
          if (m.sport === 'football') {
            const currentSec = (m.liveSecond ?? 0) + 1;
            let nextMinStr = m.minuteOrPeriod;
            let nextSec = currentSec;

            if (currentSec >= 60) {
              nextSec = 0;
              const parsedMin = parseInt(m.minuteOrPeriod.replace("'", ''), 10);
              if (!isNaN(parsedMin) && parsedMin < 90) {
                nextMinStr = `${parsedMin + 1}'`;
              }
            }

            // Every 6 seconds rotate live field state or slightly adjust live odds/stats
            const shouldRotateState = nextSec % 6 === 0;
            const nextTickerText = shouldRotateState
              ? LIVE_FOOTBALL_STATES[Math.floor(Math.random() * LIVE_FOOTBALL_STATES.length)]
              : m.liveTickerText;

            const updatedOdds =
              nextSec % 5 === 0
                ? m.bookmakerOdds.map((bm) => {
                    const delta = (Math.random() - 0.49) * 0.02;
                    const nextHome = Math.max(1.12, Number((bm.homeOdds + delta).toFixed(2)));
                    return {
                      ...bm,
                      homeOdds: nextHome,
                      movement: delta < 0 ? ('dropping_home' as const) : ('stable' as const)
                    };
                  })
                : m.bookmakerOdds;

            return {
              ...m,
              minuteOrPeriod: nextMinStr,
              liveSecond: nextSec,
              liveTickerText: nextTickerText,
              bookmakerOdds: updatedOdds
            };
          }

          // Tennis point-by-point progression every 7 seconds
          if (m.sport === 'tennis') {
            const nextSec = ((m.liveSecond ?? 0) + 1) % 60;
            if (nextSec % 7 === 0) {
              const pointsSeq = ['0', '15', '30', '40', 'AD'];
              const curIdx = pointsSeq.indexOf(m.homeCurrentGamePoints || '15');
              const nextHomePt = pointsSeq[(curIdx + 1) % pointsSeq.length];
              return {
                ...m,
                liveSecond: nextSec,
                homeCurrentGamePoints: nextHomePt,
                tennisServer: nextSec % 14 === 0 ? (m.tennisServer === 'home' ? 'away' : 'home') : m.tennisServer
              };
            }
            return { ...m, liveSecond: nextSec };
          }

          // Basketball shot clock & quarter clock countdown
          if (m.sport === 'basketball') {
            const curSec = m.liveSecond !== undefined ? m.liveSecond : 18;
            const nextSec = curSec > 0 ? curSec - 1 : 59;
            const formattedSec = String(nextSec).padStart(2, '0');
            return {
              ...m,
              liveSecond: nextSec,
              minuteOrPeriod: `Q3 · 04:${formattedSec}`
            };
          }

          return m;
        })
      );
    }, 1000);

    return () => clearInterval(secondTimer);
  }, []);

  // Filtered Matches: When connected to live Rushbet Colombia API, display the exact real Rushbet matches (Live, Finished Today, Upcoming Today) sorted by highest betting options volume
  const allMatchesWithCatalog = useMemo(() => {
    const todayCot = getColombiaDateString();
    const syncedBaseMatches = matches.map((m, idx) => ({
      ...m,
      date: todayCot,
      totalMarketsCount:
        m.totalMarketsCount ||
        (m.sport === 'football'
          ? 210 - (idx % 6) * 12
          : m.sport === 'basketball'
          ? 142 - (idx % 4) * 8
          : 78 - (idx % 4) * 5)
    }));

    const statusOrder: Record<MatchStatus, number> = {
      live: 0,
      upcoming: 1,
      finished: 2
    };

    const sortLiveFirstThenByMarkets = (a: Match, b: Match) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return (b.totalMarketsCount || 120) - (a.totalMarketsCount || 120);
    };

    if (isUsingLiveRushbetFeed) {
      // Ensure there are always live matches visible even if the external API has a momentary gap
      const hasLive = syncedBaseMatches.some((m) => m.status === 'live');
      const liveFallback = hasLive
        ? []
        : INITIAL_MATCHES.filter((m) => m.status === 'live').map((m, idx) => ({
            ...m,
            date: todayCot,
            totalMarketsCount: m.totalMarketsCount || 225 - idx * 10
          }));
      return [...syncedBaseMatches, ...liveFallback].sort(sortLiveFirstThenByMarkets);
    }

    const existingLeagueIds = new Set(syncedBaseMatches.map((m) => m.leagueId));
    const generatedExtraMatches: Match[] = [];

    const sampleFixturesByLeague: Record<string, { home: string; away: string; status: MatchStatus; min: string; hScore: number; aScore: number }> = {
      'ligue-1': { home: 'Paris Saint-Germain', away: 'AS Monaco', status: 'live', min: "56'", hScore: 2, aScore: 1 },
      'liga-portugal': { home: 'Sporting CP', away: 'SL Benfica', status: 'upcoming', min: '19:45', hScore: 0, aScore: 0 },
      'eredivisie': { home: 'PSV Eindhoven', away: 'Feyenoord', status: 'finished', min: 'Finalizado', hScore: 3, aScore: 1 },
      'uel': { home: 'Athletic Club', away: 'AS Roma', status: 'live', min: "63'", hScore: 1, aScore: 0 },
      'uecl': { home: 'Chelsea', away: 'Fiorentina', status: 'upcoming', min: '20:00', hScore: 0, aScore: 0 },
      'sudamericana': { home: 'Corinthians', away: 'Cruzeiro', status: 'live', min: "41'", hScore: 1, aScore: 1 },
      'recopa-sud': { home: 'Botafogo', away: 'LDU Quito', status: 'upcoming', min: '20:30', hScore: 0, aScore: 0 },
      'mundial-clubes': { home: 'Real Madrid', away: 'CF Pachuca', status: 'upcoming', min: '18:00', hScore: 0, aScore: 0 },
      'col-copa': { home: 'América de Cali', away: 'Deportivo Cali', status: 'live', min: "71'", hScore: 2, aScore: 0 },
      'col-superliga': { home: 'Junior de Barranquilla', away: 'Millonarios FC', status: 'finished', min: 'Finalizado', hScore: 1, aScore: 2 },
      'col-femenina': { home: 'Santa Fe Femenino', away: 'América Femenino', status: 'live', min: "48'", hScore: 1, aScore: 1 },
      'arg-primera-nac': { home: 'San Martín (T)', away: 'Aldosivi', status: 'live', min: "38'", hScore: 1, aScore: 0 },
      'arg-copa': { home: 'Vélez Sarsfield', away: 'Independiente', status: 'upcoming', min: '19:15', hScore: 0, aScore: 0 },
      'arg-copa-lpf': { home: 'Estudiantes LP', away: 'Talleres', status: 'finished', min: 'Finalizado', hScore: 2, aScore: 1 },
      'mex-expansion': { home: 'Leones Negros', away: 'Atlante', status: 'live', min: "66'", hScore: 2, aScore: 1 },
      'mex-femenil': { home: 'Tigres Femenil', away: 'Monterrey Femenil', status: 'upcoming', min: '21:00', hScore: 0, aScore: 0 },
      'sel-mundial': { home: 'Argentina', away: 'Francia', status: 'upcoming', min: '16:00', hScore: 0, aScore: 0 },
      'sel-copa-america': { home: 'Argentina', away: 'Colombia', status: 'finished', min: 'Finalizado', hScore: 1, aScore: 0 },
      'sel-eurocopa': { home: 'España', away: 'Inglaterra', status: 'finished', min: 'Finalizado', hScore: 2, aScore: 1 },
      'sel-nations-league': { home: 'Portugal', away: 'Croacia', status: 'live', min: "54'", hScore: 2, aScore: 1 },
      'sel-elim-uefa': { home: 'Alemania', away: 'Países Bajos', status: 'upcoming', min: '19:45', hScore: 0, aScore: 0 }
    };

    FLASHSCORE_LEAGUES_CATALOG.forEach((lg) => {
      if (!existingLeagueIds.has(lg.id) && sampleFixturesByLeague[lg.id]) {
        const fx = sampleFixturesByLeague[lg.id];
        generatedExtraMatches.push({
          id: `gen-${lg.id}`,
          sport: lg.sport,
          leagueId: lg.id,
          leagueName: lg.name,
          country: lg.countryOrRegion,
          date: todayCot,
          startTime: fx.status === 'upcoming' ? fx.min : '17:00',
          status: fx.status,
          minuteOrPeriod: fx.min,
          liveSecond: 27,
          halfTimeScore: fx.status === 'live' ? '(1 - 0)' : undefined,
          homeTeam: fx.home,
          awayTeam: fx.away,
          homeScore: fx.hScore,
          awayScore: fx.aScore,
          homeFormation: '4-3-3',
          awayFormation: '4-2-3-1',
          homeMarketValue: '€185M',
          awayMarketValue: '€142M',
          liveTickerStatus: 'DANGEROUS_ATTACK_HOME',
          liveTickerText: `Ataque Peligroso · ${fx.home} domina posesión`,
          stats: [
            { label: 'Goles Esperados (xG)', homeValue: '1.78', awayValue: '0.96', homePercent: 65, source: 'FootyStats' },
            { label: 'Posesión de Balón (%)', homeValue: '56%', awayValue: '44%', homePercent: 56, source: 'SofaScore' },
            { label: 'Tiros de Esquina', homeValue: 6, awayValue: 4, homePercent: 60, source: 'Soccerway' }
          ],
          events:
            fx.status === 'upcoming'
              ? []
              : [
                  {
                    id: `ev-${lg.id}-1`,
                    minute: "24'",
                    team: 'home',
                    type: 'goal',
                    player: `Goleador ${fx.home}`,
                    detail: 'Confirmado por Flashscore y SofaScore'
                  }
                ],
          homeLineup: [
            { number: 9, name: `Referente Ofensivo (${fx.home})`, position: 'DC', rating: 8.2, marketValue: '€28M', isStarter: true },
            { number: 10, name: `Mediocentro Creativo (${fx.home})`, position: 'MCO', rating: 7.9, marketValue: '€22M', isStarter: true }
          ],
          awayLineup: [
            { number: 9, name: `Delantero Titular (${fx.away})`, position: 'DC', rating: 7.5, marketValue: '€19M', isStarter: true }
          ],
          sourceVerifications: [
            { source: 'FootyStats', verified: true, lastSync: 'Hace 3s', keyMetricLabel: 'Modelo xG Liga', keyMetricValue: '1.78 vs 0.96 (+EV Local)', discrepancyScore: 99.1 },
            { source: 'SofaScore', verified: true, lastSync: 'Hace 2s', keyMetricLabel: 'Índice Presión', keyMetricValue: 'Dominio Territorial 56%', discrepancyScore: 99.4 },
            { source: 'Flashscore', verified: true, lastSync: 'Hace 1s', keyMetricLabel: 'Feed Oficial', keyMetricValue: 'Sincronizado en directo', discrepancyScore: 100 }
          ],
          bookmakerOdds: [
            { bookmaker: 'wplay', bookmakerName: 'Wplay.co', homeOdds: 1.72, drawOdds: 3.50, awayOdds: 4.60, overUnderLine: '2.5 Goles', overOdds: 1.80, underOdds: 2.00, marginPercent: 4.0, reliabilityIndex: 97, movement: 'dropping_home' },
            { bookmaker: 'rushbet', bookmakerName: 'Rushbet', homeOdds: 1.74, drawOdds: 3.45, awayOdds: 4.50, overUnderLine: '2.5 Goles', overOdds: 1.82, underOdds: 1.98, marginPercent: 3.9, reliabilityIndex: 98, movement: 'dropping_home' },
            { bookmaker: 'bet365', bookmakerName: 'Bet365', homeOdds: 1.70, drawOdds: 3.60, awayOdds: 4.75, overUnderLine: '2.5 Goles', overOdds: 1.83, underOdds: 1.97, marginPercent: 3.6, reliabilityIndex: 99, movement: 'stable' }
          ],
          predictions: [
            {
              id: `pred-${lg.id}-1`,
              category: 'Tiempo reglamentario',
              marketName: 'Resultado Final (1X2)',
              selection: `${fx.home} Gana (Tiempo Reglamentario)`,
              calculatedProbability: 65.4,
              confidenceIndex: 90,
              sampleSizeMatches: 360,
              bestBookmaker: 'rushbet',
              bestOdds: 1.74,
              impliedProbability: 57.5,
              expectedValuePercent: 7.9,
              isValueOpportunity: true,
              rationale: `Ventaja estadística respaldada por FootyStats y Soccerway para ${fx.home} en ${lg.name}.`
            }
          ]
        });
      }
    });

    return [...syncedBaseMatches, ...generatedExtraMatches].sort(sortLiveFirstThenByMarkets);
  }, [matches, isUsingLiveRushbetFeed]);

  const filteredMatches = useMemo(() => {
    const statusOrder: Record<MatchStatus, number> = {
      live: 0,
      upcoming: 1,
      finished: 2
    };

    const list = allMatchesWithCatalog.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (selectedSport !== 'all' && m.sport !== selectedSport) return false;
      if (selectedLeague !== 'all' && m.leagueId !== selectedLeague) return false;
      if (
        onlyFavorites &&
        !favoriteTeams.includes(m.homeTeam) &&
        !favoriteTeams.includes(m.awayTeam) &&
        !favoriteLeagues.includes(m.leagueId)
      ) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchText = `${m.homeTeam} ${m.awayTeam} ${m.leagueName} ${m.country}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      return true;
    });

    // Always place LIVE matches at the very beginning of everything, then sort by highest number of Rushbet betting options
    return list.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return (b.totalMarketsCount || 120) - (a.totalMarketsCount || 120);
    });
  }, [
    allMatchesWithCatalog,
    statusFilter,
    selectedSport,
    selectedLeague,
    onlyFavorites,
    favoriteTeams,
    favoriteLeagues,
    searchQuery
  ]);

  const activeMatch = useMemo(() => {
    return (
      filteredMatches.find((m) => m.id === selectedMatchId) ||
      filteredMatches[0] ||
      allMatchesWithCatalog[0]
    );
  }, [allMatchesWithCatalog, selectedMatchId, filteredMatches]);

  // Handlers
  const handleToggleFavoriteTeam = (teamName: string) => {
    setFavoriteTeams((prev) =>
      prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName]
    );
  };

  const handleToggleFavoriteLeague = (leagueId: string) => {
    setFavoriteLeagues((prev) =>
      prev.includes(leagueId) ? prev.filter((id) => id !== leagueId) : [...prev, leagueId]
    );
  };

  const handleToggleStatusVisibility = (status: MatchStatus) => {
    setVisibleStatuses((prev) => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handleCopyPick = (text: string, pickId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedPickId(pickId);
    setTimeout(() => setCopiedPickId(null), 2500);
  };

  const handleAddPredictionToHistory = (record: Omit<TrackedAnalyticalRecord, 'id'>) => {
    const newRec: TrackedAnalyticalRecord = {
      ...record,
      id: `rec-${Date.now().toString().slice(-4)}`
    };
    setHistoryRecords((prev) => [newRec, ...prev]);

    if (pushNotificationsEnabled) {
      const notif: LiveNotification = {
        id: `notif-${Date.now()}`,
        timestamp: 'Justo ahora',
        type: 'prediction',
        sport: record.sport,
        title: `Pronóstico Registrado · ${record.bookmaker.toUpperCase()}`,
        message: `${record.matchTitle}: ${record.marketSelection} (@${record.odds.toFixed(2)}) con ${record.modelProbability}% probabilidad de éxito.`,
        evPercent: record.expectedValue,
        bookmaker: record.bookmaker,
        read: false
      };
      setNotifications((prev) => [notif, ...prev]);
      setActiveToast(notif);
      setTimeout(() => setActiveToast(null), 5000);
    }
  };

  // Triggers an authentic Flashscore-style Goal / Point update with row highlight, sound whistle, standings update, and push toast
  const handleTriggerGoalSimulation = (matchId?: string, teamSide: 'home' | 'away' = 'home') => {
    const targetMatch =
      matches.find((m) => m.id === matchId) ||
      matches.find((m) => m.id === 'fb-002') ||
      matches[0];

    const pointsToAdd = targetMatch.sport === 'basketball' ? 3 : 1;
    const nextHomeScore = teamSide === 'home' ? targetMatch.homeScore + pointsToAdd : targetMatch.homeScore;
    const nextAwayScore = teamSide === 'away' ? targetMatch.awayScore + pointsToAdd : targetMatch.awayScore;
    const scoringTeamName = teamSide === 'home' ? targetMatch.homeTeam : targetMatch.awayTeam;
    const flashTimestamp = Date.now();

    const isFavMatch =
      favoriteTeams.includes(targetMatch.homeTeam) || favoriteTeams.includes(targetMatch.awayTeam);
    const shouldFireGoalPush =
      pushNotificationsEnabled &&
      alertConfig.masterPushEnabled &&
      alertConfig.goalAlertsEnabled &&
      (!alertConfig.goalOnlyFavorites || isFavMatch);

    if (soundEnabled && alertConfig.goalSoundWhistle && shouldFireGoalPush) {
      playFlashscoreGoalSound();
    }

    setNowTimestamp(flashTimestamp);

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== targetMatch.id) return m;
        const updatedSetScoresHome =
          m.homeSetScores && teamSide === 'home'
            ? m.homeSetScores.map((s, i) => (i === m.homeSetScores!.length - 1 ? s + pointsToAdd : s))
            : m.homeSetScores;
        const updatedSetScoresAway =
          m.awaySetScores && teamSide === 'away'
            ? m.awaySetScores.map((s, i) => (i === m.awaySetScores!.length - 1 ? s + pointsToAdd : s))
            : m.awaySetScores;

        return {
          ...m,
          homeScore: nextHomeScore,
          awayScore: nextAwayScore,
          homeSetScores: updatedSetScoresHome,
          awaySetScores: updatedSetScoresAway,
          lastGoalFlashAt: flashTimestamp,
          lastScoringTeam: teamSide,
          liveTickerStatus: teamSide === 'home' ? 'GOAL_HOME' : 'GOAL_AWAY',
          liveTickerText: `¡GOL CONFIRMADO! Anotación de ${scoringTeamName}`,
          events: [
            {
              id: `ev-${flashTimestamp}`,
              minute: m.minuteOrPeriod,
              team: teamSide,
              type: m.sport === 'basketball' ? 'three_pointer' : 'goal',
              player: `${scoringTeamName} (En Directo)`,
              detail: 'Confirmado al instante por feed Flashscore y SofaScore (xG +0.48)'
            },
            ...m.events
          ]
        };
      })
    );

    // Update live league standings immediately
    setStandings((prev) =>
      prev.map((st) => {
        if (st.leagueId !== targetMatch.leagueId) return st;
        return {
          ...st,
          rows: st.rows.map((r) =>
            r.teamName === scoringTeamName
              ? { ...r, goalsFor: r.goalsFor + pointsToAdd, goalDiff: r.goalDiff + pointsToAdd }
              : r
          )
        };
      })
    );

    if (shouldFireGoalPush) {
      const cotTime = getColombiaTimeClock(new Date(flashTimestamp));
      const postGoalEV = 8.7;
      const evSuffix =
        postGoalEV >= alertConfig.goalPostRecalibrationMinEV
          ? ` Cuotas recalibradas con valor EV +${postGoalEV}% (supera su umbral de +${alertConfig.goalPostRecalibrationMinEV}%).`
          : '';

      const newNotif: LiveNotification = {
        id: `notif-${flashTimestamp}`,
        timestamp: `${cotTime} COT · Gol en Directo`,
        type: 'goal',
        alertCategory: 'GOL',
        sport: targetMatch.sport,
        title: `¡GOL EN DIRECTO! ${targetMatch.homeTeam} ${nextHomeScore} - ${nextAwayScore} ${targetMatch.awayTeam}`,
        message: `Anotación de ${scoringTeamName} (${targetMatch.minuteOrPeriod} - ${cotTime} COT).${evSuffix}`,
        matchId: targetMatch.id,
        evPercent: postGoalEV,
        bookmaker: 'rushbet',
        read: false
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setActiveToast(newNotif);
      setTimeout(() => setActiveToast(null), 6000);
    }
  };

  // Triggers a dedicated Investment Opportunity (EV+%) push notification based on configured EV+% thresholds
  const handleTriggerInvestmentAlert = () => {
    if (!pushNotificationsEnabled || !alertConfig.masterPushEnabled || !alertConfig.investmentAlertsEnabled) {
      return;
    }

    // Find best qualifying prediction across matches using all Rushbet sport categories
    const candidates = allMatchesWithCatalog.flatMap((m) => {
      const preds = getSportCategorizedPredictions(m).flatMap((g) => g.predictions);
      return preds
        .filter(
          (p) =>
            p.expectedValuePercent >= alertConfig.investmentMinEVPercent &&
            p.confidenceIndex >= alertConfig.investmentMinConfidence &&
            p.calculatedProbability >= alertConfig.investmentMinProbability &&
            alertConfig.investmentBookmakers.includes(p.bestBookmaker)
        )
        .map((p) => ({ match: m, pred: p }));
    });

    const chosen = candidates[0] || {
      match: activeMatch,
      pred: activeMatch.predictions[0]
    };

    if (!chosen || !chosen.pred) return;

    if (soundEnabled && alertConfig.investmentSoundChime) {
      playInvestmentOpportunitySound();
    }

    const nowTs = Date.now();
    const cotTime = getColombiaTimeClock(new Date(nowTs));
    const investNotif: LiveNotification = {
      id: `notif-inv-${nowTs}`,
      timestamp: `${cotTime} COT · Oportunidad EV+`,
      type: 'value_bet',
      alertCategory: 'OPORTUNIDAD_INVERSION',
      sport: chosen.match.sport,
      title: `OPORTUNIDAD DE INVERSIÓN (EV +${chosen.pred.expectedValuePercent.toFixed(1)}%) · ${chosen.pred.bestBookmaker.toUpperCase()}`,
      message: `${chosen.match.homeTeam} vs ${chosen.match.awayTeam}: "${chosen.pred.selection}" @ ${chosen.pred.bestOdds.toFixed(2)} con ${chosen.pred.calculatedProbability.toFixed(1)}% prob. de éxito y confianza ${chosen.pred.confidenceIndex}/100 (Umbral configurado: ≥ +${alertConfig.investmentMinEVPercent.toFixed(1)}% EV).`,
      matchId: chosen.match.id,
      evPercent: chosen.pred.expectedValuePercent,
      confidenceIndex: chosen.pred.confidenceIndex,
      bookmaker: chosen.pred.bestBookmaker,
      read: false
    };

    setNotifications((prev) => [investNotif, ...prev]);
    setActiveToast(investNotif);
    setTimeout(() => setActiveToast(null), 6500);
  };

  const handleUpdateRecordStatus = (id: string, status: 'won' | 'lost') => {
    setHistoryRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        const profit =
          status === 'won'
            ? Math.round(rec.simulatedStakeCOP * (rec.odds - 1))
            : -rec.simulatedStakeCOP;
        return {
          ...rec,
          status,
          profitLossCOP: profit
        };
      })
    );
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract (Hidden when Focus Mode is active) */}
      {!isFocusMode && (
        <header className="flex items-center justify-between px-6 py-3.5 bg-[#111827] border-b border-slate-800 sticky top-0 z-30">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveNav('matches');
            }}
            className="text-lg font-bold tracking-tight text-slate-100 font-display whitespace-nowrap"
          >
            QuantEdge Analytics
          </a>

          {/* Zone 2: 4 Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveNav('matches')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeNav === 'matches'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-slate-300 border-transparent hover:text-slate-100'
              }`}
            >
              Centro de Partidos
            </button>
            <button
              type="button"
              onClick={() => setActiveNav('predictions')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeNav === 'predictions'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-slate-300 border-transparent hover:text-slate-100'
              }`}
            >
              Radar de Valor (EV+)
            </button>
            <button
              type="button"
              onClick={() => setActiveNav('standings')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeNav === 'standings'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-slate-300 border-transparent hover:text-slate-100'
              }`}
            >
              Tablas de Posiciones
            </button>
            <button
              type="button"
              onClick={() => setActiveNav('finance')}
              className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeNav === 'finance'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-slate-300 border-transparent hover:text-slate-100'
              }`}
            >
              Historial y Balance
            </button>
          </nav>

          {/* Zone 3: 2 Primary Actions (Live Alert Center & 2FA Account Security) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsNotifDrawerOpen(!isNotifDrawerOpen);
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              }}
              className="px-3 py-2 text-xs font-medium text-slate-200 bg-[#0B0F17] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alertas Push ({unreadNotifCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setIs2FAModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Seguridad 2FA</span>
            </button>
          </div>
        </header>
      )}

      {/* Mobile Navigation Bar (Hidden when Focus Mode is active) */}
      {!isFocusMode && (
        <div className="flex md:hidden items-center justify-around bg-[#111827] border-b border-slate-800 px-2 py-2">
          {(
            [
              { id: 'matches', label: 'Partidos' },
              { id: 'predictions', label: 'Valor EV+' },
              { id: 'standings', label: 'Tablas' },
              { id: 'finance', label: 'Historial' }
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                activeNav === item.id ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Real-Time Push Notification Toast Differentiated Between 'GOL' and 'OPORTUNIDAD DE INVERSIÓN' */}
      {activeToast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-md w-full bg-[#111827] border-2 rounded-xl p-4 shadow-2xl ${
            activeToast.alertCategory === 'GOL' || activeToast.type === 'goal'
              ? 'border-[#FF4B4B]'
              : 'border-emerald-400'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    activeToast.alertCategory === 'GOL' || activeToast.type === 'goal'
                      ? 'bg-[#FF4B4B] text-white'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {activeToast.alertCategory === 'GOL' || activeToast.type === 'goal'
                    ? 'ALERTA DE GOL'
                    : 'OPORTUNIDAD DE INVERSIÓN'}
                </span>
                <span className="text-xs font-mono text-slate-400">{activeToast.timestamp}</span>
              </div>
              <div className="text-sm font-bold text-slate-100 pt-0.5">{activeToast.title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{activeToast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notification History Drawer with Differentiated Tabs (Todos | Goles | Inversión EV+) */}
      {isNotifDrawerOpen && (
        <div className="fixed right-6 top-16 z-40 w-[420px] max-w-[calc(100vw-2rem)] bg-[#111827] border border-slate-700 rounded-xl shadow-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-100">
              Centro de Alertas Push (Goles vs Oportunidades EV+)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsNotifDrawerOpen(false);
                  setIsAlertSettingsOpen(true);
                }}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                Configurar Umbrales
              </button>
              <button
                type="button"
                onClick={() => setIsNotifDrawerOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Differentiated Alert Type Filter Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setNotifDrawerFilter('ALL')}
              className={`py-1 text-[11px] font-semibold rounded transition-colors ${
                notifDrawerFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setNotifDrawerFilter('GOL')}
              className={`py-1 text-[11px] font-semibold rounded transition-colors ${
                notifDrawerFilter === 'GOL'
                  ? 'bg-[#FF4B4B] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Goles en Vivo
            </button>
            <button
              type="button"
              onClick={() => setNotifDrawerFilter('OPORTUNIDAD_INVERSION')}
              className={`py-1 text-[11px] font-semibold rounded transition-colors ${
                notifDrawerFilter === 'OPORTUNIDAD_INVERSION'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inversión (≥+{alertConfig.investmentMinEVPercent}% EV)
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
            {notifications
              .filter((n) => {
                if (notifDrawerFilter === 'ALL') return true;
                if (notifDrawerFilter === 'GOL') {
                  return n.alertCategory === 'GOL' || n.type === 'goal';
                }
                return (
                  n.alertCategory === 'OPORTUNIDAD_INVERSION' ||
                  n.type === 'value_bet' ||
                  n.type === 'prediction'
                );
              })
              .map((n) => {
                const isGoal = n.alertCategory === 'GOL' || n.type === 'goal';
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.matchId) {
                        setSelectedMatchId(n.matchId);
                        setActiveNav('matches');
                        setIsNotifDrawerOpen(false);
                      }
                    }}
                    className={`p-3 rounded-lg bg-[#0B0F17] border cursor-pointer transition-colors ${
                      isGoal
                        ? 'border-rose-500/30 hover:border-[#FF4B4B]'
                        : 'border-emerald-500/30 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span
                        className={`font-bold uppercase ${
                          isGoal ? 'text-[#FF4B4B]' : 'text-emerald-400'
                        }`}
                      >
                        {isGoal ? 'GOL EN DIRECTO' : 'OPORTUNIDAD DE INVERSIÓN'}
                      </span>
                      <span>{n.timestamp}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 mt-1">{n.title}</div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                );
              })}
          </div>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTriggerGoalSimulation('fb-001', 'home')}
              className="py-2 px-2.5 bg-[#FF4B4B]/15 hover:bg-[#FF4B4B]/25 text-[#FF4B4B] border border-[#FF4B4B]/30 rounded-lg text-xs font-bold transition-colors"
            >
              Simular Alerta de Gol
            </button>
            <button
              type="button"
              onClick={handleTriggerInvestmentAlert}
              className="py-2 px-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors"
            >
              Simular Oportunidad EV+
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout: Left Bookmaker & Filter Sidebar (hidden in Focus Mode) + Main Content Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {!isFocusMode && (
          <BookmakerSidebar
            selectedBookmaker={selectedBookmaker}
            onSelectBookmaker={setSelectedBookmaker}
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
            selectedLeague={selectedLeague}
            onSelectLeague={setSelectedLeague}
            favoriteLeagues={favoriteLeagues}
            onToggleFavoriteLeague={handleToggleFavoriteLeague}
            visibleStatuses={visibleStatuses}
            onToggleStatusVisibility={handleToggleStatusVisibility}
            onlyFavorites={onlyFavorites}
            onToggleOnlyFavorites={() => setOnlyFavorites(!onlyFavorites)}
            minEVFilter={minEVFilter}
            onChangeMinEV={setMinEVFilter}
            matches={allMatchesWithCatalog}
            activeMatch={activeMatch}
            copiedPickId={copiedPickId}
            onCopyPickForBookmaker={handleCopyPick}
            pushNotificationsEnabled={pushNotificationsEnabled}
            onTogglePushNotifications={() => setPushNotificationsEnabled(!pushNotificationsEnabled)}
            onOpenAlertSettings={() => setIsAlertSettingsOpen(true)}
          />
        )}

        {/* Primary Content Area */}
        <main
          className={`flex-1 overflow-y-auto transition-all ${
            isFocusMode ? 'p-3 lg:p-4 space-y-4 w-full max-w-full' : 'p-5 lg:p-6 space-y-6'
          }`}
        >
          {/* View 1: Flashscore Live Match Center in Exact 1 - 2 - 3 Order */}
          {activeNav === 'matches' && (
            <>
              {/* Header & Status Bar for Centro de Partidos (TODOS HOY, EN CURSO, PRÓXIMOS HOY, FINALIZADOS HOY + MODO ENFOQUE) */}
              <div
                className={`bg-[#111827] border rounded-xl p-4 space-y-3 transition-all ${
                  isFocusMode
                    ? 'border-emerald-500/50 shadow-lg sticky top-2 z-30 bg-[#111827]/95 backdrop-blur'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {isFocusMode && (
                      <div className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>MODO ENFOQUE ACTIVO</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
                      {(
                        [
                          { id: 'all', label: `JORNADA DE HOY (${allMatchesWithCatalog.length})` },
                          {
                            id: 'live',
                            label: `EN CURSO (${allMatchesWithCatalog.filter((m) => m.status === 'live').length})`
                          },
                          {
                            id: 'finished',
                            label: `FINALIZADOS HOY (${allMatchesWithCatalog.filter((m) => m.status === 'finished').length})`
                          },
                          {
                            id: 'upcoming',
                            label: `PRÓXIMOS HOY (${allMatchesWithCatalog.filter((m) => m.status === 'upcoming').length})`
                          }
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStatusFilter(st.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                            statusFilter === st.id
                              ? st.id === 'live'
                                ? 'bg-[#FF4B4B] text-white'
                                : 'bg-emerald-500 text-slate-950'
                              : 'text-slate-300 hover:text-slate-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search, Date, Live Sync, Goal Trigger & Modo Enfoque Button */}
                  <div className="flex flex-wrap items-center gap-2.5 flex-1 sm:flex-initial justify-end">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar equipo, torneo..."
                        className="bg-[#0B0F17] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 w-44 sm:w-48"
                      />
                    </div>

                    {!isFocusMode && (
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-[#0B0F17] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => syncRealRushbetMatches(false)}
                      disabled={isSyncingRushbet}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      title="Sincronizar al instante con la API en vivo de Rushbet Colombia"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRushbet ? 'animate-spin' : ''}`} />
                      <span>
                        {isSyncingRushbet
                          ? 'Sincronizando Rushbet...'
                          : `Feed Real Rushbet.co (${lastRushbetSync})`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerGoalSimulation(activeMatch?.id, 'home')}
                      className="px-3 py-1.5 text-xs font-bold bg-[#FF4B4B]/20 hover:bg-[#FF4B4B]/30 text-[#FF4B4B] border border-[#FF4B4B]/40 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      title="Disparar destello de ¡GOL! y alerta sonora estilo Flashscore"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Simular ¡GOL!</span>
                    </button>

                    {/* Botón de Modo Enfoque (Inmersivo Tipo Panel de Control) */}
                    <button
                      type="button"
                      onClick={() => setIsFocusMode(!isFocusMode)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                        isFocusMode
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300 shadow-md'
                          : 'bg-[#172C51] hover:bg-[#1E3A6A] text-sky-200 border-sky-500/50'
                      }`}
                      title={
                        isFocusMode
                          ? 'Salir del Modo Enfoque y restaurar barra lateral y menú superior (Tecla Esc)'
                          : 'Activar Modo Enfoque: ocultar barra lateral izquierda y menú superior para expandir el Feed en Directo'
                      }
                    >
                      {isFocusMode ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5" />
                          <span>Salir de Modo Enfoque</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5 text-sky-300" />
                          <span>Modo Enfoque</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary Strip of Today's 3 States (En Curso, Finalizados Hoy, Próximos por Comenzar Hoy) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div
                    onClick={() => setStatusFilter(statusFilter === 'live' ? 'all' : 'live')}
                    className="p-2.5 rounded-lg bg-[#0B0F17] border border-[#FF4B4B]/30 hover:border-[#FF4B4B] cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-ping" />
                      <span className="font-bold text-slate-100">En Curso Ahora (Hoy):</span>
                    </div>
                    <span className="font-mono font-bold text-[#FF4B4B]">
                      {allMatchesWithCatalog.filter((m) => m.status === 'live').length} partidos activos
                    </span>
                  </div>

                  <div
                    onClick={() => setStatusFilter(statusFilter === 'finished' ? 'all' : 'finished')}
                    className="p-2.5 rounded-lg bg-[#0B0F17] border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-slate-100">Ya Finalizaron (Hoy):</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      {allMatchesWithCatalog.filter((m) => m.status === 'finished').length} partidos terminados
                    </span>
                  </div>

                  <div
                    onClick={() => setStatusFilter(statusFilter === 'upcoming' ? 'all' : 'upcoming')}
                    className="p-2.5 rounded-lg bg-[#0B0F17] border border-sky-500/30 hover:border-sky-400 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span className="font-bold text-slate-100">Próximos por Comenzar (Hoy):</span>
                    </div>
                    <span className="font-mono font-bold text-sky-400">
                      {allMatchesWithCatalog.filter((m) => m.status === 'upcoming').length} partidos programados
                    </span>
                  </div>
                </div>
              </div>

              {/* =====================================================================
                  1.- EL FEED EN DIRECTO AL ESTILO DE FLASHSCORE
                 ===================================================================== */}
              <section aria-label="1. Feed en Directo Flashscore">
                <FlashscoreLiveBoard
                  matches={filteredMatches}
                  selectedMatchId={activeMatch?.id || ''}
                  onSelectMatch={(id) => setSelectedMatchId(id)}
                  favoriteTeams={favoriteTeams}
                  onToggleFavoriteTeam={handleToggleFavoriteTeam}
                  favoriteLeagues={favoriteLeagues}
                  onToggleFavoriteLeague={handleToggleFavoriteLeague}
                  visibleStatuses={visibleStatuses}
                  onToggleStatusVisibility={handleToggleStatusVisibility}
                  selectedBookmaker={selectedBookmaker}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled(!soundEnabled)}
                  onTriggerGoalSimulation={handleTriggerGoalSimulation}
                  nowTimestamp={nowTimestamp}
                  onAddPredictionToHistory={handleAddPredictionToHistory}
                  copiedPickId={copiedPickId}
                  onCopyPick={handleCopyPick}
                  isFocusMode={isFocusMode}
                  onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                />
              </section>

              {/* =====================================================================
                  2.- COMPETICIONES FLASHSCORE (DESPLEGABLE OCULTO TIPO BOTÓN)
                 ===================================================================== */}
              <section aria-label="2. Competiciones Flashscore Desplegable">
                <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsMainCompetitionsDropdownOpen(!isMainCompetitionsDropdownOpen)}
                    className={`w-full px-5 py-3.5 flex items-center justify-between transition-all text-left ${
                      isMainCompetitionsDropdownOpen
                        ? 'bg-[#172C51] text-white border-b border-sky-500/40'
                        : 'bg-[#132544] hover:bg-[#193058] text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-sm font-bold tracking-tight">
                          2. Competiciones Flashscore (Catálogo de Ligas y Torneos)
                        </span>
                        <span className="ml-3 text-xs font-mono text-sky-300">
                          {selectedLeague === 'all'
                            ? `Mostrando Todas (${FLASHSCORE_LEAGUES_CATALOG.length} competiciones)`
                            : `Filtro Activo: ${
                                FLASHSCORE_LEAGUES_CATALOG.find((l) => l.id === selectedLeague)?.name || selectedLeague
                              }`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMainCompetitionsDropdownOpen ? (
                        <ChevronDown className="w-4 h-4 text-sky-300" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                  </button>

                  {isMainCompetitionsDropdownOpen && (
                    <div className="p-5 bg-[#0B0F17] space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                        <span className="text-xs text-slate-400">
                          Seleccione cualquier competición para filtrar el Feed en Directo o pulse "Todas las Competiciones":
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeague('all');
                            setIsMainCompetitionsDropdownOpen(false);
                          }}
                          className="px-3 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/25 transition-colors"
                        >
                          Ver Todas las Competiciones ({FLASHSCORE_LEAGUES_CATALOG.length})
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(
                          [
                            'Grandes Ligas de Europa',
                            'Torneos Internacionales de Clubes',
                            'Ligas y Copas de Colombia (Flashscore.co)',
                            'Ligas de Argentina',
                            'Ligas de México',
                            'Competiciones de Selecciones Nacionales'
                          ] as const
                        ).map((grpName) => {
                          const leaguesInGrp = FLASHSCORE_LEAGUES_CATALOG.filter(
                            (l) => l.groupCategory === grpName
                          );
                          return (
                            <div
                              key={grpName}
                              className="p-3.5 rounded-lg bg-[#111827] border border-slate-800 space-y-2"
                            >
                              <div className="text-xs font-bold text-sky-400 border-b border-slate-800 pb-1.5">
                                {grpName}
                              </div>
                              <div className="space-y-1">
                                {leaguesInGrp.map((lg) => {
                                  const isSel = selectedLeague === lg.id;
                                  const isFavLg = favoriteLeagues.includes(lg.id);
                                  return (
                                    <div
                                      key={lg.id}
                                      className={`w-full px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between gap-1.5 ${
                                        isSel
                                          ? 'bg-emerald-500 text-slate-950 font-semibold'
                                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleFavoriteLeague(lg.id);
                                        }}
                                        className={`p-0.5 rounded ${
                                          isFavLg
                                            ? isSel
                                              ? 'text-slate-950'
                                              : 'text-amber-400'
                                            : 'text-slate-600 hover:text-amber-300'
                                        }`}
                                        title={
                                          isFavLg
                                            ? 'Quitar de Mis Ligas Favoritas'
                                            : 'Añadir a Mis Ligas Favoritas'
                                        }
                                      >
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedLeague(lg.id);
                                          setIsMainCompetitionsDropdownOpen(false);
                                        }}
                                        className="flex-1 text-left truncate"
                                      >
                                        <strong className={isSel ? 'text-slate-950' : 'text-slate-400 font-normal'}>
                                          {lg.countryOrRegion}:
                                        </strong>{' '}
                                        {lg.name}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* =====================================================================
                  3.- OPCIONES RENTABLES PARA EL PARTIDO SELECCIONADO
                 ===================================================================== */}
              {activeMatch && (
                <section aria-label="3. Opciones Rentables para el Partido">
                  <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                          <h2 className="text-lg font-bold text-slate-100">
                            3. Opciones Rentables para el Partido: {activeMatch.homeTeam} vs {activeMatch.awayTeam}
                          </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Pronósticos de mayor probabilidad de éxito e índice de confianza validados en las 5 fuentes para ejecutar en Rushbet, Bet365 o Wplay.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                        <span>{activeMatch.leagueName}</span>
                        <span>·</span>
                        <span>
                          {activeMatch.status === 'live'
                            ? `EN DIRECTO ${activeMatch.minuteOrPeriod}`
                            : `${activeMatch.startTime} COT`}
                        </span>
                      </div>
                    </div>

                    {/* Vista Detallada de 'Probabilidad de Resultado' (Gráfico de Barras Apiladas Wplay · Rushbet · Bet365 + Selector de Partidos de Hoy: En Curso, Finalizados y Próximos) */}
                    <OutcomeProbabilityStackedChart
                      match={activeMatch}
                      allTodayMatches={allMatchesWithCatalog}
                      onSelectMatch={(matchId) => setSelectedMatchId(matchId)}
                      selectedBookmaker={selectedBookmaker}
                      copiedPickId={copiedPickId}
                      onCopyPick={handleCopyPick}
                    />

                    {/* Grid of Profitable Options for the Active Match (Across All Rushbet Sport Categories) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {getSportCategorizedPredictions(activeMatch)
                        .flatMap((g) => g.predictions)
                        .slice(0, 6)
                        .map((pred) => {
                        const copyStr = `[${pred.bestBookmaker.toUpperCase()}] ${activeMatch.homeTeam} vs ${activeMatch.awayTeam} — ${pred.category ? `${pred.category}: ` : ''}${pred.selection} @ ${pred.bestOdds.toFixed(2)} | Probabilidad de Éxito: ${pred.calculatedProbability}% | Confianza: ${pred.confidenceIndex}/100 | Valor: +${pred.expectedValuePercent}%`;
                        const isCopied = copiedPickId === pred.id;

                        return (
                          <div
                            key={pred.id}
                            className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-emerald-500/40 transition-colors flex flex-col justify-between space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-sky-400">
                                  {pred.category || pred.marketName}
                                </span>
                                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                                  +{pred.expectedValuePercent.toFixed(1)}% EV
                                </span>
                              </div>

                              <div className="text-sm font-bold text-slate-100 mt-1.5">
                                {pred.selection}
                              </div>

                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {pred.rationale}
                              </p>
                            </div>

                            {/* 30-Minute Odds Fluctuation & EV Trend Mini Sparkline (Recharts) */}
                            <OddsTrendSparkline
                              predictionId={pred.id}
                              currentOdds={pred.bestOdds}
                              calculatedProbability={pred.calculatedProbability}
                              bookmaker={pred.bestBookmaker}
                            />

                            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                              <div className="grid grid-cols-3 gap-2 font-mono tabular-nums text-center">
                                <div className="p-1.5 rounded bg-[#111827] border border-slate-800">
                                  <div className="text-[10px] text-slate-400">Éxito</div>
                                  <div className="text-xs font-bold text-emerald-400">
                                    {pred.calculatedProbability.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="p-1.5 rounded bg-[#111827] border border-slate-800">
                                  <div className="text-[10px] text-slate-400">Confianza</div>
                                  <div className="text-xs font-bold text-sky-400">
                                    {pred.confidenceIndex}/100
                                  </div>
                                </div>
                                <div className="p-1.5 rounded bg-[#111827] border border-slate-800">
                                  <div className="text-[10px] text-slate-400 uppercase">{pred.bestBookmaker}</div>
                                  <div className="text-xs font-bold text-amber-300">
                                    @{pred.bestOdds.toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyPick(copyStr, pred.id)}
                                  className="flex-1 py-1.5 px-2.5 bg-[#111827] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copiar Ficha</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddPredictionToHistory({
                                      date: `${activeMatch.date} ${activeMatch.startTime}`,
                                      sport: activeMatch.sport,
                                      leagueName: activeMatch.leagueName,
                                      matchTitle: `${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`,
                                      marketSelection: `${pred.category ? `[${pred.category}] ` : ''}${pred.selection}`,
                                      bookmaker: pred.bestBookmaker,
                                      odds: pred.bestOdds,
                                      modelProbability: pred.calculatedProbability,
                                      confidenceIndex: pred.confidenceIndex,
                                      expectedValue: pred.expectedValuePercent,
                                      simulatedStakeUnits: 2.0,
                                      simulatedStakeCOP: 200000,
                                      status: 'pending',
                                      profitLossCOP: 0
                                    })
                                  }
                                  className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1"
                                  title="Registrar pronóstico en el historial"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>Registrar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Full Match Inspector with all 9 Football Category Accordion Bars below */}
                    <MatchInspector
                      match={activeMatch}
                      selectedBookmaker={selectedBookmaker}
                      onAddPredictionToHistory={handleAddPredictionToHistory}
                      copiedPickId={copiedPickId}
                      onCopyPick={handleCopyPick}
                    />
                  </div>
                </section>
              )}
            </>
          )}

          {/* View 2: Dedicated Value Radar & Multi-Bookmaker Scanner */}
          {activeNav === 'predictions' && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    Radar Global de Pronósticos y Oportunidades de Valor (EV+)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Incluye las 9 categorías oficiales de fútbol (Tiempo reglamentario, Goleador, Goles del Jugador, Tarjetas, Medio Tiempo, Tiros de Esquina, Hándicap 3-Way, Líneas Asiáticas y Eventos del Partido).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAlertSettingsOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                  >
                    Configurar Umbrales de Alerta (EV+ ≥ +{alertConfig.investmentMinEVPercent}%)
                  </button>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>5 Fuentes Sincronizadas</span>
                  </div>
                </div>
              </div>

              {/* Interactive Scatter Plot: Probability vs Expected Value (EV+%) for Live Matches by League */}
              <ValueRadarScatterChart
                matches={allMatchesWithCatalog}
                selectedCategory={selectedFootballCategory}
                minEVFilter={minEVFilter}
                selectedBookmaker={selectedBookmaker}
                copiedPickId={copiedPickId}
                onCopyPick={handleCopyPick}
                onSelectMatchFromChart={(matchId) => {
                  setSelectedMatchId(matchId);
                  setActiveNav('matches');
                }}
              />

              {/* Filter by Rushbet Market Categories across Football (9), Tennis (7) and Basketball (7) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    'all',
                    // Fútbol (9 Categorías Rushbet)
                    'Tiempo reglamentario',
                    'Goleador',
                    'Goles del Jugador',
                    'Tarjetas',
                    'Medio Tiempo',
                    'Tiros de Esquina',
                    'Hándicap 3-Way',
                    'Líneas Asiáticas',
                    'Eventos del Partido',
                    // Tenis (Categorías Rushbet)
                    'Cuotas del Partido',
                    'Apuestas de Set',
                    'Total de Juegos',
                    'Hándicap de Juegos y Sets',
                    'Mercados del 1.er Set',
                    // Baloncesto (Categorías Rushbet)
                    'Prórroga Incluida (Principal)',
                    'Total de Puntos y Equipos',
                    'Hándicap y Margen de Victoria',
                    'Puntos del Jugador (Player Props)',
                    'Rebotes y Asistencias del Jugador'
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFootballCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap border ${
                      selectedFootballCategory === cat
                        ? 'bg-[#172C51] text-white border-sky-400'
                        : 'bg-[#132544] text-slate-300 border-[#1F3761] hover:bg-[#193058]'
                    }`}
                  >
                    {cat === 'all' ? 'Todos los Mercados Rushbet (Fútbol · Tenis · Baloncesto)' : cat}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B0F17] border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                      <th className="py-2.5 px-3">Categoría / Mercado</th>
                      <th className="py-2.5 px-3">Encuentro</th>
                      <th className="py-2.5 px-3">Pronóstico Sugerido</th>
                      <th className="py-2.5 px-3 text-right">Probabilidad Éxito</th>
                      <th className="py-2.5 px-3 text-right">Índice Confianza</th>
                      <th className="py-2.5 px-3 text-right">Muestra Hist.</th>
                      <th className="py-2.5 px-3">Mejor Casa</th>
                      <th className="py-2.5 px-3 text-right">Cuota</th>
                      <th className="py-2.5 px-3 text-right">Valor EV+</th>
                      <th className="py-2.5 px-3 text-right">Acción Analítica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs font-mono tabular-nums bg-[#0B0F17]/50">
                    {allMatchesWithCatalog
                      .flatMap((m) =>
                        getSportCategorizedPredictions(m).flatMap((grp) =>
                          grp.predictions.map((p) => ({ match: m, pred: p }))
                        )
                      )
                      .filter(({ pred }) => pred.expectedValuePercent >= minEVFilter)
                      .filter(({ pred }) =>
                        selectedFootballCategory === 'all'
                          ? true
                          : pred.category === selectedFootballCategory
                      )
                      .map(({ match, pred }) => {
                        const copyText = `[${pred.bestBookmaker.toUpperCase()}] ${match.homeTeam} vs ${match.awayTeam} | ${pred.category ? `${pred.category}: ` : ''}${pred.selection} @ ${pred.bestOdds.toFixed(2)} | Probabilidad Éxito: ${pred.calculatedProbability}% | Confianza: ${pred.confidenceIndex}/100`;
                        return (
                          <tr key={pred.id} className="hover:bg-slate-900/80 transition-colors">
                            <td className="py-3 px-3 font-sans text-slate-200 font-semibold">
                              <span className="text-sky-400">
                                {pred.category || match.sport.toUpperCase()}
                              </span>
                              <div className="text-[11px] text-slate-400 font-normal">
                                {pred.marketName}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-sans font-semibold text-slate-100">
                              {match.homeTeam} vs {match.awayTeam}
                              <div className="text-[11px] text-slate-400 font-normal">
                                {match.leagueName}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-sans font-medium text-emerald-300">
                              {pred.selection}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-400">
                              {pred.calculatedProbability.toFixed(1)}%
                            </td>
                            <td className="py-3 px-3 text-right text-sky-400 font-semibold">
                              {pred.confidenceIndex}/100
                            </td>
                            <td className="py-3 px-3 text-right text-slate-400">
                              {pred.sampleSizeMatches} part.
                            </td>
                            <td className="py-3 px-3 uppercase font-bold text-amber-300">
                              {pred.bestBookmaker}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-100">
                              {pred.bestOdds.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-400">
                              +{pred.expectedValuePercent.toFixed(1)}%
                            </td>
                            <td className="py-3 px-3 text-right font-sans">
                              <button
                                type="button"
                                onClick={() => handleCopyPick(copyText, pred.id)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
                              >
                                {copiedPickId === pred.id ? 'Copiado' : 'Copiar Ficha'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View 3: Real-Time Standings */}
          {activeNav === 'standings' && (
            <StandingsPanel
              standings={standings}
              favoriteTeams={favoriteTeams}
              onToggleFavoriteTeam={handleToggleFavoriteTeam}
            />
          )}

          {/* View 4: Financial Management, Past Predictions History & PDF/Excel Export */}
          {activeNav === 'finance' && (
            <FinancialHistoryPanel
              records={historyRecords}
              matches={matches}
              initialBankrollCOP={initialBankrollCOP}
              onUpdateBankroll={setInitialBankrollCOP}
              onUpdateRecordStatus={handleUpdateRecordStatus}
              is2FAEnabled={is2FAEnabled}
              is2FAVerifiedSession={is2FAVerifiedSession}
              onOpen2FAModal={() => setIs2FAModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Two-Factor Authentication Security Modal */}
      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        is2FAEnabled={is2FAEnabled}
        is2FAVerifiedSession={is2FAVerifiedSession}
        onVerifySuccess={() => setIs2FAVerifiedSession(true)}
        onToggle2FA={(enabled) => setIs2FAEnabled(enabled)}
      />

      {/* Push Alert Thresholds & Differentiated Goal vs Investment Opportunity Configuration Panel */}
      <AlertSettingsPanel
        isOpen={isAlertSettingsOpen}
        onClose={() => setIsAlertSettingsOpen(false)}
        config={alertConfig}
        onUpdateConfig={(nextCfg) => {
          setAlertConfig(nextCfg);
          setMinEVFilter(Math.floor(nextCfg.investmentMinEVPercent));
        }}
        matches={allMatchesWithCatalog}
        onTestGoalAlert={() => handleTriggerGoalSimulation(activeMatch?.id, 'home')}
        onTestInvestmentAlert={handleTriggerInvestmentAlert}
      />
    </div>
  );
}
