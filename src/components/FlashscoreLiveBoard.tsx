import React, { useState, useEffect, useMemo } from 'react';
import { BookmakerId, Match, MatchStatus, TrackedAnalyticalRecord } from '../types/sports';
import {
  getColombiaFullDateTimeLabel,
  getColombiaMatchCountdown
} from '../utils/colombiaTime';
import { MatchInspector } from './MatchInspector';
import {
  Star,
  Volume2,
  VolumeX,
  ArrowUp,
  ArrowDown,
  Activity,
  ChevronRight,
  ChevronDown,
  Radio,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronsDownUp,
  ChevronsUpDown,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface FlashscoreLiveBoardProps {
  matches: Match[];
  selectedMatchId: string;
  onSelectMatch: (matchId: string) => void;
  favoriteTeams: string[];
  onToggleFavoriteTeam: (teamName: string) => void;
  favoriteLeagues: string[];
  onToggleFavoriteLeague: (leagueId: string) => void;
  visibleStatuses: Record<MatchStatus, boolean>;
  onToggleStatusVisibility: (status: MatchStatus) => void;
  selectedBookmaker: BookmakerId | 'all';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerGoalSimulation: (matchId: string, scoringTeam: 'home' | 'away') => void;
  nowTimestamp: number;
  onAddPredictionToHistory: (record: Omit<TrackedAnalyticalRecord, 'id'>) => void;
  copiedPickId: string | null;
  onCopyPick: (text: string, id: string) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

interface LeagueGroupBucket {
  leagueId: string;
  leagueHeader: string;
  leagueName: string;
  country: string;
  isFavoriteLeague: boolean;
  matches: Match[];
  liveCount: number;
  finishedCount: number;
  upcomingCount: number;
  totalMarketsInLeague: number;
  maxMatchMarkets: number;
}

export const FlashscoreLiveBoard: React.FC<FlashscoreLiveBoardProps> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
  favoriteTeams,
  onToggleFavoriteTeam,
  favoriteLeagues,
  onToggleFavoriteLeague,
  visibleStatuses,
  onToggleStatusVisibility,
  selectedBookmaker,
  soundEnabled,
  onToggleSound,
  onTriggerGoalSimulation,
  nowTimestamp,
  onAddPredictionToHistory,
  copiedPickId,
  onCopyPick,
  isFocusMode = false,
  onToggleFocusMode
}) => {
  // Controls whether an individual match's inline dropdown menu is currently open
  const [expandedMatchIds, setExpandedMatchIds] = useState<string[]>([]);
  // Controls which league headers are collapsed (by default all leagues are expanded)
  const [collapsedLeagueIds, setCollapsedLeagueIds] = useState<string[]>([]);
  // Filter to show ONLY favorite leagues if toggled inside board
  const [onlyFavLeaguesFilter, setOnlyFavLeaguesFilter] = useState<boolean>(false);

  const handleRowClick = (matchId: string) => {
    onSelectMatch(matchId);
    setExpandedMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };

  const toggleLeagueAccordion = (leagueId: string) => {
    setCollapsedLeagueIds((prev) =>
      prev.includes(leagueId) ? prev.filter((id) => id !== leagueId) : [...prev, leagueId]
    );
  };

  // Group matches by League, filter by visibleStatuses (live / finished / upcoming), and sort Favorite Leagues to the top
  const leagueGroups = useMemo<LeagueGroupBucket[]>(() => {
    const map = new Map<string, LeagueGroupBucket>();

    matches.forEach((m) => {
      // Check if this match status is toggled on
      if (!visibleStatuses[m.status]) return;
      const isFavLg = favoriteLeagues.includes(m.leagueId);
      if (onlyFavLeaguesFilter && !isFavLg) return;

      const key = m.leagueId || `${m.country}-${m.leagueName}`;
      if (!map.has(key)) {
        map.set(key, {
          leagueId: m.leagueId,
          leagueHeader: `${m.country.toUpperCase()}: ${m.leagueName}`,
          leagueName: m.leagueName,
          country: m.country,
          isFavoriteLeague: isFavLg,
          matches: [],
          liveCount: 0,
          finishedCount: 0,
          upcomingCount: 0,
          totalMarketsInLeague: 0,
          maxMatchMarkets: 0
        });
      }

      const bucket = map.get(key)!;
      const mMarkets = m.totalMarketsCount || (m.sport === 'football' ? 145 : m.sport === 'basketball' ? 115 : 64);
      bucket.matches.push(m);
      bucket.totalMarketsInLeague += mMarkets;
      if (mMarkets > bucket.maxMatchMarkets) {
        bucket.maxMatchMarkets = mMarkets;
      }
      if (m.status === 'live') bucket.liveCount++;
      if (m.status === 'finished') bucket.finishedCount++;
      if (m.status === 'upcoming') bucket.upcomingCount++;
    });

    const list = Array.from(map.values());

    // Sort matches inside every league so LIVE matches ALWAYS appear first, followed by Upcoming and Finished, and within each status sorted by highest betting options volume
    const statusPriority: Record<MatchStatus, number> = { live: 0, upcoming: 1, finished: 2 };
    list.forEach((bucket) => {
      bucket.matches.sort((a, b) => {
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status];
        }
        const mktA = a.totalMarketsCount || 110;
        const mktB = b.totalMarketsCount || 110;
        return mktB - mktA;
      });
    });

    // Sort leagues:
    // 1. Leagues that have LIVE matches ALWAYS come first at the very top of the board!
    // 2. Within live leagues (or non-live leagues), favorite leagues and highest betting options volume come first
    list.sort((a, b) => {
      const aHasLive = a.liveCount > 0;
      const bHasLive = b.liveCount > 0;
      if (aHasLive && !bHasLive) return -1;
      if (!aHasLive && bHasLive) return 1;

      if (a.isFavoriteLeague && !b.isFavoriteLeague) return -1;
      if (!a.isFavoriteLeague && b.isFavoriteLeague) return 1;

      if (aHasLive && bHasLive && b.liveCount !== a.liveCount) {
        return b.liveCount - a.liveCount;
      }

      if (b.maxMatchMarkets !== a.maxMatchMarkets) {
        return b.maxMatchMarkets - a.maxMatchMarkets;
      }
      return b.totalMarketsInLeague - a.totalMarketsInLeague;
    });

    return list;
  }, [matches, visibleStatuses, favoriteLeagues, onlyFavLeaguesFilter]);

  // Dedicated list of all visible LIVE matches across all leagues to pin at the very top of the board
  const pinnedLiveMatches = useMemo(() => {
    if (!visibleStatuses.live) return [];
    return matches
      .filter((m) => {
        if (m.status !== 'live') return false;
        if (onlyFavLeaguesFilter && !favoriteLeagues.includes(m.leagueId)) return false;
        return true;
      })
      .sort((a, b) => (b.totalMarketsCount || 120) - (a.totalMarketsCount || 120));
  }, [matches, visibleStatuses.live, onlyFavLeaguesFilter, favoriteLeagues]);

  // Keep track of total counts across all matches regardless of visibility toggle
  const statusTotals = useMemo(() => {
    return {
      live: matches.filter((m) => m.status === 'live').length,
      finished: matches.filter((m) => m.status === 'finished').length,
      upcoming: matches.filter((m) => m.status === 'upcoming').length
    };
  }, [matches]);

  const expandAllLeagues = () => {
    setCollapsedLeagueIds([]);
  };

  const collapseAllLeagues = () => {
    setCollapsedLeagueIds(leagueGroups.map((g) => g.leagueId));
  };

  // Ensure if a user collapses only non-favorites or expands by status
  useEffect(() => {
    // Keep favorite leagues open when toggled
    setCollapsedLeagueIds((prev) => prev.filter((id) => !favoriteLeagues.includes(id)));
  }, [favoriteLeagues]);

  const formatMinuteWithBlinkingApostrophe = (match: Match) => {
    if (match.status === 'finished') {
      return <span className="text-emerald-400 font-semibold">Finalizado</span>;
    }
    if (match.status === 'upcoming') {
      const countdown = getColombiaMatchCountdown(match.startTime, new Date(nowTimestamp));
      return (
        <div className="font-mono tabular-nums">
          <div className="text-slate-200 font-bold">
            {match.startTime} <span className="text-[10px] text-sky-400 font-normal">COT</span>
          </div>
          <div className="text-[10px] text-slate-400">{countdown}</div>
        </div>
      );
    }

    // Live status (Flashscore crimson/red-orange or emerald live clock)
    if (match.sport === 'football') {
      const cleanMin = match.minuteOrPeriod.replace("'", '');
      const sec = match.liveSecond !== undefined ? String(match.liveSecond).padStart(2, '0') : '00';
      return (
        <div className="flex items-center gap-1 text-[#FF4B4B] font-mono font-bold tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping shrink-0" />
          <span>
            {cleanMin}
            <span className="animate-pulse">'</span>
          </span>
          <span className="text-[10px] text-rose-400/80 font-normal">:{sec}</span>
        </div>
      );
    }

    if (match.sport === 'tennis') {
      return (
        <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>{match.minuteOrPeriod}</span>
        </div>
      );
    }

    // Basketball
    return (
      <div className="flex items-center gap-1 text-amber-400 font-mono font-bold tabular-nums">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
        <span>{match.minuteOrPeriod}</span>
      </div>
    );
  };

  return (
    <div
      className={`bg-[#111827] border rounded-xl overflow-hidden transition-all ${
        isFocusMode ? 'border-emerald-500/50 shadow-2xl' : 'border-slate-800'
      }`}
    >
      {/* Flashscore Top Feed Bar */}
      <div className="px-4 py-3 bg-[#0B0F17] border-b border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Radio className="w-4 h-4 text-[#FF4B4B] animate-pulse" />
            <span className="font-bold text-slate-100 tracking-wide">
              {isFocusMode
                ? 'PANEL DE CONTROL INMERSIVO (MODO ENFOQUE) · FEED EN DIRECTO RUSHBET.CO'
                : 'FEED EN DIRECTO · ESTILO FLASHSCORE + RUSHBET.CO'}
            </span>
            <span className="text-slate-500 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline">
              Fije sus ligas favoritas (★) y pulse sobre el nombre de la liga para expandir o contraer
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-2.5 py-1 rounded bg-[#111827] border border-slate-800 flex items-center gap-1.5 text-xs font-mono text-emerald-400 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Colombia: {getColombiaFullDateTimeLabel(new Date(nowTimestamp))}</span>
            </div>

            <button
              type="button"
              onClick={onToggleSound}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Activar/Desactivar pitido sonoro de GOL estilo Flashscore"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Sonido Gol: {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {onToggleFocusMode && (
              <button
                type="button"
                onClick={onToggleFocusMode}
                className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  isFocusMode
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-[#172C51] hover:bg-[#1E3A6A] text-sky-200 border-sky-500/40'
                }`}
                title={
                  isFocusMode
                    ? 'Salir del Modo Enfoque y restaurar paneles (Esc)'
                    : 'Expandir Feed en Directo en Modo Enfoque (ocultar barra lateral y menú superior)'
                }
              >
                {isFocusMode ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Restaurar Vista</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Modo Enfoque</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Interactive Control Bar: Toggle Visibility of Live / Finished / Upcoming across ALL Leagues + Expand/Collapse Leagues */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Multi-Status Visibility Toggles (Desplegar / Ocultar En Curso, Finalizados, Próximos de todas las ligas) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">
              Desplegar / Mostrar en Ligas:
            </span>

            {/* Toggle Live Matches */}
            <button
              type="button"
              onClick={() => onToggleStatusVisibility('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                visibleStatuses.live
                  ? 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-white shadow-sm'
                  : 'bg-[#111827] border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Desplegar u ocultar los partidos EN CURSO de todas las ligas"
            >
              {visibleStatuses.live ? (
                <Eye className="w-3.5 h-3.5 text-[#FF4B4B]" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>En Curso ({statusTotals.live})</span>
            </button>

            {/* Toggle Finished Matches */}
            <button
              type="button"
              onClick={() => onToggleStatusVisibility('finished')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                visibleStatuses.finished
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                  : 'bg-[#111827] border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Desplegar u ocultar los partidos FINALIZADOS de todas las ligas"
            >
              {visibleStatuses.finished ? (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Finalizados ({statusTotals.finished})</span>
            </button>

            {/* Toggle Upcoming Matches */}
            <button
              type="button"
              onClick={() => onToggleStatusVisibility('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                visibleStatuses.upcoming
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                  : 'bg-[#111827] border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Desplegar u ocultar los PRÓXIMOS partidos de todas las ligas"
            >
              {visibleStatuses.upcoming ? (
                <Eye className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Próximos ({statusTotals.upcoming})</span>
            </button>
          </div>

          {/* Right: Favorite Leagues Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFavLeaguesFilter(!onlyFavLeaguesFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                onlyFavLeaguesFilter
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-[#111827] text-amber-300 border-amber-500/40 hover:bg-amber-500/15'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>
                {onlyFavLeaguesFilter
                  ? `Viendo Solo Mis Ligas Favoritas (${favoriteLeagues.length})`
                  : `Mis Ligas Favoritas (${favoriteLeagues.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Grouped League Tables */}
      {leagueGroups.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <div className="text-xs text-slate-400">
            No hay partidos visibles con los estados o filtros seleccionados.
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            {!visibleStatuses.live && (
              <button
                type="button"
                onClick={() => onToggleStatusVisibility('live')}
                className="px-3 py-1 rounded bg-[#FF4B4B]/20 text-[#FF4B4B] border border-[#FF4B4B]/40 text-xs font-semibold"
              >
                Mostrar En Curso ({statusTotals.live})
              </button>
            )}
            {!visibleStatuses.finished && (
              <button
                type="button"
                onClick={() => onToggleStatusVisibility('finished')}
                className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
              >
                Mostrar Finalizados ({statusTotals.finished})
              </button>
            )}
            {!visibleStatuses.upcoming && (
              <button
                type="button"
                onClick={() => onToggleStatusVisibility('upcoming')}
                className="px-3 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-semibold"
              >
                Mostrar Próximos ({statusTotals.upcoming})
              </button>
            )}
            {onlyFavLeaguesFilter && (
              <button
                type="button"
                onClick={() => setOnlyFavLeaguesFilter(false)}
                className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold"
              >
                Ver Todas las Ligas
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {/* PINNED TOP SECTION: ALL LIVE MATCHES AT THE VERY BEGINNING OF EVERYTHING */}
          {pinnedLiveMatches.length > 0 && (
            <div className="bg-[#121826] border-b-2 border-[#FF4B4B]/50">
              <div
                onClick={() => toggleLeagueAccordion('__pinned_live_all__')}
                className="px-4 py-2.5 bg-gradient-to-r from-[#FF4B4B]/20 via-[#192236] to-[#161F30] border-b border-[#FF4B4B]/30 flex flex-wrap items-center justify-between gap-2 text-xs cursor-pointer select-none border-l-4 border-l-[#FF4B4B]"
                title="Haga clic sobre el encabezado para expandir o contraer los partidos en vivo"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {collapsedLeagueIds.includes('__pinned_live_all__') ? (
                    <ChevronRight className="w-4 h-4 text-[#FF4B4B] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#FF4B4B] shrink-0" />
                  )}
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B] animate-ping shrink-0" />
                  <span className="font-extrabold text-white tracking-wide uppercase">
                    PARTIDOS EN VIVO AHORA — AL PRINCIPIO DE TODAS LAS LIGAS ({pinnedLiveMatches.length})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FF4B4B] text-white font-mono text-[10px] font-bold">
                    EN DIRECTO · RUSHBET CO
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-rose-200/90">
                  <span>Prioridad Tiempo Real</span>
                  <span>
                    {pinnedLiveMatches.length} {pinnedLiveMatches.length === 1 ? 'partido en curso' : 'partidos en curso'}
                  </span>
                </div>
              </div>

              {!collapsedLeagueIds.includes('__pinned_live_all__') && (
                <div className="divide-y divide-slate-800/80">
                  {pinnedLiveMatches.map((m) => {
                    const isExpanded = expandedMatchIds.includes(m.id);
                    const isFav =
                      favoriteTeams.includes(m.homeTeam) || favoriteTeams.includes(m.awayTeam);
                    const isGoalFlashing =
                      m.lastGoalFlashAt && nowTimestamp - m.lastGoalFlashAt < 9000;
                    const topPred = m.predictions[0];
                    const activeBookie =
                      m.bookmakerOdds.find((b) =>
                        selectedBookmaker === 'all'
                          ? b.bookmaker === topPred?.bestBookmaker
                          : b.bookmaker === selectedBookmaker
                      ) || m.bookmakerOdds[0];

                    return (
                      <div key={`pinned-live-${m.id}`} className="transition-colors">
                        <div
                          onClick={() => handleRowClick(m.id)}
                          className={`px-4 py-2.5 transition-colors cursor-pointer grid grid-cols-12 items-center gap-2 ${
                            isGoalFlashing
                              ? 'bg-amber-500/20 border-l-4 border-l-amber-400'
                              : isExpanded
                              ? 'bg-[#152238] border-l-4 border-l-emerald-400'
                              : 'bg-[#0F1624] hover:bg-[#172236] border-l-4 border-l-[#FF4B4B]/70'
                          }`}
                        >
                          {/* Col 1-2: Star + Live Minute + League Badge */}
                          <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavoriteTeam(m.homeTeam);
                              }}
                              className={`p-1 rounded transition-colors ${
                                isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                              }`}
                              title="Fijar en Mis Equipos Favoritos"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>

                            <div className="text-xs leading-tight min-w-0">
                              {formatMinuteWithBlinkingApostrophe(m)}
                              <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                                {m.leagueName}
                              </div>
                            </div>
                          </div>

                          {/* Col 3-6: Home & Away Teams + Live Scores */}
                          <div className="col-span-6 sm:col-span-4 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-100 truncate">
                                {m.homeTeam}
                              </span>
                              <span className="font-mono text-xs font-extrabold text-[#FF4B4B] tabular-nums">
                                {m.homeScore}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-100 truncate">
                                {m.awayTeam}
                              </span>
                              <span className="font-mono text-xs font-extrabold text-[#FF4B4B] tabular-nums">
                                {m.awayScore}
                              </span>
                            </div>
                          </div>

                          {/* Col 7-8: Live Ticker */}
                          <div className="hidden sm:flex sm:col-span-2 flex-col justify-center">
                            <span className="text-[11px] font-mono text-rose-300 truncate">
                              {m.liveTickerText || 'En Juego · Rushbet Live'}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400">
                              EV +{topPred?.expectedValuePercent.toFixed(1)}% · {topPred?.selection}
                            </span>
                          </div>

                          {/* Col 9-10: Live 1X2 Odds */}
                          <div className="hidden sm:flex sm:col-span-2 items-center justify-center gap-1 font-mono text-xs tabular-nums">
                            {activeBookie && (
                              <>
                                <span className="px-1.5 py-1 rounded bg-[#161F30] border border-slate-700 text-slate-200">
                                  {activeBookie.homeOdds.toFixed(2)}
                                </span>
                                {activeBookie.drawOdds && (
                                  <span className="px-1.5 py-1 rounded bg-[#161F30] border border-slate-700 text-slate-300">
                                    {activeBookie.drawOdds.toFixed(2)}
                                  </span>
                                )}
                                <span className="px-1.5 py-1 rounded bg-[#161F30] border border-slate-700 text-slate-200">
                                  {activeBookie.awayOdds.toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Col 11-12: Markets Count */}
                          <div className="col-span-3 sm:col-span-2 flex items-center justify-end">
                            <span className="px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                              +{m.totalMarketsCount || 148} Mercados
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {leagueGroups.map((group) => {
            const isLeagueCollapsed = collapsedLeagueIds.includes(group.leagueId);

            return (
              <div key={group.leagueHeader}>
                {/* League Competition Header Bar: Click directly on the league name/header to expand or collapse */}
                <div
                  onClick={() => toggleLeagueAccordion(group.leagueId)}
                  className={`px-4 py-2.5 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors cursor-pointer select-none ${
                    group.isFavoriteLeague
                      ? 'bg-[#192841] hover:bg-[#1F3252] border-l-4 border-l-amber-400'
                      : 'bg-[#161F30] hover:bg-[#1C283D]'
                  }`}
                  title="Haga clic sobre el nombre de la liga para expandir o contraer sus partidos"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Star Button to Pin/Unpin League in Favorites */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavoriteLeague(group.leagueId);
                      }}
                      className={`p-1 rounded transition-colors flex items-center gap-1 ${
                        group.isFavoriteLeague
                          ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                          : 'text-slate-400 hover:text-amber-300 bg-[#0B0F17]/60 border border-slate-700'
                      }`}
                      title={
                        group.isFavoriteLeague
                          ? 'Quitar liga de Mis Ligas Favoritas'
                          : 'Añadir liga a Mis Ligas Favoritas'
                      }
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <div className="flex items-center gap-2 text-left min-w-0">
                      {isLeagueCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}

                      <span className="font-bold text-slate-100 hover:text-emerald-300 transition-colors tracking-wide truncate">
                        {group.leagueHeader}
                      </span>

                      {/* Status Count Badges inside this League */}
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        {group.liveCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-[#FF4B4B]/20 text-[#FF4B4B] border border-[#FF4B4B]/40 font-bold">
                            {group.liveCount} En Vivo
                          </span>
                        )}
                        {group.finishedCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                            {group.finishedCount} Fin.
                          </span>
                        )}
                        {group.upcomingCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                            {group.upcomingCount} Próx.
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                          Hasta +{group.maxMatchMarkets} Mercados Rushbet
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Columns Legend Only (No Desplegar/Ocultar button) */}
                  <div className="hidden lg:flex items-center gap-6 text-[11px] font-mono text-slate-400">
                    <span>Volumen Opciones Rushbet</span>
                    <span className="w-28 text-center">
                      Cuotas ({selectedBookmaker === 'all' ? 'Rushbet / Mejor' : selectedBookmaker.toUpperCase()})
                    </span>
                    <span className="w-28 text-right">
                      {group.matches.length} {group.matches.length === 1 ? 'partido' : 'partidos'}
                    </span>
                  </div>
                </div>

                {/* Match Rows inside League (Shown when League is not collapsed) */}
                {!isLeagueCollapsed && (
                  <div className="divide-y divide-slate-800/70">
                    {group.matches.map((m) => {
                      const isExpanded = expandedMatchIds.includes(m.id);
                      const isFav =
                        favoriteTeams.includes(m.homeTeam) || favoriteTeams.includes(m.awayTeam);
                      const isGoalFlashing =
                        m.lastGoalFlashAt && nowTimestamp - m.lastGoalFlashAt < 9000;
                      const topPred = m.predictions[0];
                      const activeBookie =
                        m.bookmakerOdds.find((b) =>
                          selectedBookmaker === 'all'
                            ? b.bookmaker === topPred?.bestBookmaker
                            : b.bookmaker === selectedBookmaker
                        ) || m.bookmakerOdds[0];

                      return (
                        <div key={m.id} className="transition-colors">
                          {/* Clickable Match Header Row */}
                          <div
                            onClick={() => handleRowClick(m.id)}
                            className={`px-4 py-2.5 transition-colors cursor-pointer grid grid-cols-12 items-center gap-2 ${
                              isGoalFlashing
                                ? 'bg-amber-500/20 border-l-4 border-l-amber-400'
                                : isExpanded
                                ? 'bg-[#152238] border-l-4 border-l-emerald-400'
                                : 'bg-[#0B0F17]/75 hover:bg-[#151D2E]'
                            }`}
                          >
                            {/* Col 1-2: Star + Live Minute / Clock */}
                            <div className="col-span-3 sm:col-span-2 flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavoriteTeam(m.homeTeam);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                                }`}
                                title="Fijar en Mis Equipos Favoritos"
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>

                              <div className="text-xs leading-tight">
                                {formatMinuteWithBlinkingApostrophe(m)}
                                {m.halfTimeScore && m.status === 'live' && (
                                  <div className="text-[10px] font-mono text-slate-500 tabular-nums mt-0.5">
                                    MT {m.halfTimeScore}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Col 3-6: Home & Away Teams + Red Cards + Server Indicator + Flashscore GOAL badge */}
                            <div className="col-span-6 sm:col-span-4 space-y-1">
                              {/* Home Team Line */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`text-xs truncate ${
                                      isGoalFlashing && m.lastScoringTeam === 'home'
                                        ? 'font-bold text-amber-300'
                                        : m.homeScore > m.awayScore && m.status !== 'upcoming'
                                        ? 'font-bold text-slate-100'
                                        : 'font-medium text-slate-200'
                                    }`}
                                  >
                                    {m.homeTeam}
                                  </span>

                                  {(m.homeRedCards || 0) > 0 && (
                                    <span
                                      className="inline-block w-2.5 h-3.5 bg-rose-600 rounded-[2px] shrink-0"
                                      title={`${m.homeRedCards} Tarjeta(s) Roja(s)`}
                                    />
                                  )}

                                  {m.sport === 'tennis' && m.tennisServer === 'home' && m.status === 'live' && (
                                    <span
                                      className="inline-block w-2 h-2 rounded-full bg-lime-400 shrink-0"
                                      title="Servicio activo"
                                    />
                                  )}

                                  {isGoalFlashing && m.lastScoringTeam === 'home' && (
                                    <span className="px-1.5 py-0.2 bg-[#FF4B4B] text-white font-mono text-[10px] font-bold rounded animate-bounce">
                                      {m.sport === 'football' ? '¡GOL!' : '+PTS'}
                                    </span>
                                  )}
                                </div>

                                {/* Score Column + Set/Quarter Sub-scores */}
                                <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                                  {m.homeSetScores && (
                                    <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400">
                                      {m.homeSetScores.map((s, idx) => (
                                        <span key={idx} className="w-4 text-right">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {m.sport === 'tennis' && m.homeCurrentGamePoints && (
                                    <span className="text-[11px] text-amber-300 w-5 text-right">
                                      {m.homeCurrentGamePoints}
                                    </span>
                                  )}
                                  <span
                                    className={`text-sm font-bold w-6 text-right ${
                                      isGoalFlashing && m.lastScoringTeam === 'home'
                                        ? 'text-amber-300 scale-110'
                                        : m.status === 'live'
                                        ? 'text-[#FF4B4B]'
                                        : 'text-slate-100'
                                    }`}
                                  >
                                    {m.status === 'upcoming' ? '-' : m.homeScore}
                                  </span>
                                </div>
                              </div>

                              {/* Away Team Line */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`text-xs truncate ${
                                      isGoalFlashing && m.lastScoringTeam === 'away'
                                        ? 'font-bold text-amber-300'
                                        : m.awayScore > m.homeScore && m.status !== 'upcoming'
                                        ? 'font-bold text-slate-100'
                                        : 'font-medium text-slate-200'
                                    }`}
                                  >
                                    {m.awayTeam}
                                  </span>

                                  {(m.awayRedCards || 0) > 0 && (
                                    <span
                                      className="inline-block w-2.5 h-3.5 bg-rose-600 rounded-[2px] shrink-0"
                                      title={`${m.awayRedCards} Tarjeta(s) Roja(s)`}
                                    />
                                  )}

                                  {m.sport === 'tennis' && m.tennisServer === 'away' && m.status === 'live' && (
                                    <span
                                      className="inline-block w-2 h-2 rounded-full bg-lime-400 shrink-0"
                                      title="Servicio activo"
                                    />
                                  )}

                                  {isGoalFlashing && m.lastScoringTeam === 'away' && (
                                    <span className="px-1.5 py-0.2 bg-[#FF4B4B] text-white font-mono text-[10px] font-bold rounded animate-bounce">
                                      {m.sport === 'football' ? '¡GOL!' : '+PTS'}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                                  {m.awaySetScores && (
                                    <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400">
                                      {m.awaySetScores.map((s, idx) => (
                                        <span key={idx} className="w-4 text-right">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {m.sport === 'tennis' && m.awayCurrentGamePoints && (
                                    <span className="text-[11px] text-amber-300 w-5 text-right">
                                      {m.awayCurrentGamePoints}
                                    </span>
                                  )}
                                  <span
                                    className={`text-sm font-bold w-6 text-right ${
                                      isGoalFlashing && m.lastScoringTeam === 'away'
                                        ? 'text-amber-300 scale-110'
                                        : m.status === 'live'
                                        ? 'text-[#FF4B4B]'
                                        : 'text-slate-100'
                                    }`}
                                  >
                                    {m.status === 'upcoming' ? '-' : m.awayScore}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Col 7-8: Live Match State Ticker */}
                            <div className="hidden sm:flex sm:col-span-2 flex-col justify-center px-2">
                              {m.status === 'live' ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 truncate">
                                    <Activity className="w-3 h-3 shrink-0" />
                                    <span className="truncate">
                                      {m.liveTickerText || 'En juego · Medio campo'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTriggerGoalSimulation(m.id, 'home');
                                      }}
                                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors"
                                    >
                                      +Gol Local
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTriggerGoalSimulation(m.id, 'away');
                                      }}
                                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 transition-colors"
                                    >
                                      +Gol Vis.
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  {m.status === 'finished' ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <span>Finalizado Hoy · Auditado</span>
                                    </>
                                  ) : (
                                    <span>Cuotas Rushbet Abiertas</span>
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Col 9-10: Flashscore Live Odds with Up/Down Movement Arrows */}
                            <div className="hidden sm:flex sm:col-span-2 items-center justify-center gap-1.5 font-mono text-xs tabular-nums">
                              {activeBookie && (
                                <>
                                  <div className="px-2 py-1 rounded bg-[#111827] border border-slate-800 flex items-center gap-0.5">
                                    <span className="text-slate-200 font-semibold">
                                      {activeBookie.homeOdds.toFixed(2)}
                                    </span>
                                    {activeBookie.movement === 'dropping_home' ? (
                                      <ArrowDown className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <ArrowUp className="w-3 h-3 text-rose-400" />
                                    )}
                                  </div>

                                  {activeBookie.drawOdds && (
                                    <div className="px-2 py-1 rounded bg-[#111827] border border-slate-800 text-slate-400">
                                      {activeBookie.drawOdds.toFixed(2)}
                                    </div>
                                  )}

                                  <div className="px-2 py-1 rounded bg-[#111827] border border-slate-800 flex items-center gap-0.5">
                                    <span className="text-slate-300">
                                      {activeBookie.awayOdds.toFixed(2)}
                                    </span>
                                    {activeBookie.movement === 'dropping_home' ? (
                                      <ArrowUp className="w-3 h-3 text-rose-400" />
                                    ) : (
                                      <ArrowDown className="w-3 h-3 text-emerald-400" />
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Col 11-12: Rushbet Market Count Badge + Expandable Options Trigger */}
                            <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(m.id);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap border ${
                                  isExpanded
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'bg-[#132544] hover:bg-[#193058] text-slate-100 border-[#1F3761]'
                                }`}
                                title="Ver todas las categorías y opciones de apuesta de Rushbet para este partido"
                              >
                                <span className="font-mono font-bold text-amber-300">
                                  +{m.totalMarketsCount || (m.sport === 'football' ? 148 : m.sport === 'basketball' ? 118 : 64)}
                                </span>
                                <span>{isExpanded ? 'Ocultar' : 'Mercados'}</span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Inline Expandable Dropdown Drawer directly below the selected Match Row */}
                          {isExpanded && (
                            <div className="p-3 sm:p-5 bg-[#080C14] border-t border-b-2 border-emerald-500/40">
                              <MatchInspector
                                match={m}
                                selectedBookmaker={selectedBookmaker}
                                onAddPredictionToHistory={onAddPredictionToHistory}
                                copiedPickId={copiedPickId}
                                onCopyPick={onCopyPick}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
