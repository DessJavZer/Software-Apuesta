import React, { useState, useMemo } from 'react';
import { BookmakerId, Match, MatchStatus, SportType } from '../types/sports';
import { FLASHSCORE_LEAGUES_CATALOG } from '../data/leaguesCatalog';
import {
  Check,
  Copy,
  SlidersHorizontal,
  TrendingUp,
  Database,
  BellRing,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Trophy,
  Sparkles,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';

interface BookmakerSidebarProps {
  selectedBookmaker: BookmakerId | 'all';
  onSelectBookmaker: (bm: BookmakerId | 'all') => void;
  selectedSport: SportType | 'all';
  onSelectSport: (sp: SportType | 'all') => void;
  selectedLeague: string;
  onSelectLeague: (lg: string) => void;
  favoriteLeagues: string[];
  onToggleFavoriteLeague: (leagueId: string) => void;
  visibleStatuses: Record<MatchStatus, boolean>;
  onToggleStatusVisibility: (status: MatchStatus) => void;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  minEVFilter: number;
  onChangeMinEV: (val: number) => void;
  matches: Match[];
  activeMatch: Match;
  copiedPickId: string | null;
  onCopyPickForBookmaker: (text: string, pickId: string) => void;
  pushNotificationsEnabled: boolean;
  onTogglePushNotifications: () => void;
  onOpenAlertSettings: () => void;
}

const LEAGUE_GROUPS_ORDER = [
  'Grandes Ligas de Europa',
  'Torneos Internacionales de Clubes',
  'Ligas y Copas de Colombia (Flashscore.co)',
  'Ligas de Argentina',
  'Ligas de México',
  'Competiciones de Selecciones Nacionales',
  'Tenis y Básquetbol Global'
] as const;

export const BookmakerSidebar: React.FC<BookmakerSidebarProps> = ({
  selectedBookmaker,
  onSelectBookmaker,
  selectedSport,
  onSelectSport,
  selectedLeague,
  onSelectLeague,
  favoriteLeagues,
  onToggleFavoriteLeague,
  visibleStatuses,
  onToggleStatusVisibility,
  onlyFavorites,
  onToggleOnlyFavorites,
  minEVFilter,
  onChangeMinEV,
  matches,
  activeMatch,
  copiedPickId,
  onCopyPickForBookmaker,
  pushNotificationsEnabled,
  onTogglePushNotifications,
  onOpenAlertSettings
}) => {
  // Hidden by default so user can toggle it open/closed like a button at any time
  const [isCompetitionsOpen, setIsCompetitionsOpen] = useState<boolean>(false);
  // Dedicated Favorite Leagues & Status Visibility Menu (Open by default for quick access)
  const [isFavLeaguesMenuOpen, setIsFavLeaguesMenuOpen] = useState<boolean>(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'Grandes Ligas de Europa',
    'Torneos Internacionales de Clubes',
    'Ligas y Copas de Colombia (Flashscore.co)'
  ]);

  const toggleGroup = (grp: string) => {
    setExpandedGroups((prev) =>
      prev.includes(grp) ? prev.filter((g) => g !== grp) : [...prev, grp]
    );
  };

  // Build unified list of all available leagues (from catalog + dynamic live Rushbet leagues)
  const allAvailableLeagues = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; countryOrRegion: string; sport: SportType; count: number }
    >();

    FLASHSCORE_LEAGUES_CATALOG.forEach((lg) => {
      map.set(lg.id, {
        id: lg.id,
        name: lg.name,
        countryOrRegion: lg.countryOrRegion,
        sport: lg.sport,
        count: 0
      });
    });

    matches.forEach((m) => {
      const existing = map.get(m.leagueId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(m.leagueId, {
          id: m.leagueId,
          name: m.leagueName,
          countryOrRegion: m.country,
          sport: m.sport,
          count: 1
        });
      }
    });

    return Array.from(map.values());
  }, [matches]);

  const favoriteLeagueObjects = useMemo(() => {
    return allAvailableLeagues.filter((lg) => favoriteLeagues.includes(lg.id));
  }, [allAvailableLeagues, favoriteLeagues]);

  const selectedLeagueObj = allAvailableLeagues.find((l) => l.id === selectedLeague);

  const statusCounts = useMemo(() => {
    return {
      live: matches.filter((m) => m.status === 'live').length,
      finished: matches.filter((m) => m.status === 'finished').length,
      upcoming: matches.filter((m) => m.status === 'upcoming').length
    };
  }, [matches]);

  // Gather profitable options specifically for the active/selected match first, then global EV+
  const activeMatchOpportunities = activeMatch.predictions
    .filter((p) => p.expectedValuePercent >= minEVFilter)
    .map((p) => ({
      match: activeMatch,
      prediction: p,
      isCurrentMatch: true
    }));

  const otherValueOpportunities = matches
    .filter((m) => m.id !== activeMatch.id)
    .flatMap((m) =>
      m.predictions
        .filter((p) => p.expectedValuePercent >= minEVFilter)
        .map((p) => ({
          match: m,
          prediction: p,
          isCurrentMatch: false
        }))
    )
    .filter((item) =>
      selectedBookmaker === 'all' ? true : item.prediction.bestBookmaker === selectedBookmaker
    )
    .slice(0, 3);

  const combinedOpportunities = [...activeMatchOpportunities, ...otherValueOpportunities];

  const bookmakers: { id: BookmakerId | 'all'; label: string; region: string; avgMargin: string }[] = [
    { id: 'all', label: 'Consenso 3 Casas', region: 'Mejor Cuota', avgMargin: '3.7%' },
    { id: 'rushbet', label: 'Rushbet.co', region: 'Colombia · Kambi', avgMargin: '4.0%' },
    { id: 'bet365', label: 'Bet365', region: 'Global · Sharp', avgMargin: '3.6%' },
    { id: 'wplay', label: 'Wplay.co', region: 'Colombia · Oficial', avgMargin: '4.2%' }
  ];

  const dataSources = [
    { name: 'FootyStats', role: 'Modelos xG, BTTS y Over/Under' },
    { name: 'SofaScore', role: 'Ratings, Momentum y Mapas de Ataque' },
    { name: 'Soccerway', role: 'Tablas, Forma H2H y Rachas' },
    { name: 'Transfermarkt', role: 'Valor de Mercado y Bajas Titulares' },
    { name: 'Flashscore', role: 'Feed de Eventos y Goles al Segundo' }
  ];

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-[#111827] border-b lg:border-b-0 lg:border-r border-slate-800/90 flex flex-col justify-between">
      <div className="p-4 space-y-5">
        {/* Notice Banner: Strictly Analytical Data */}
        <div className="p-3 rounded-lg bg-[#0B0F17] border border-emerald-500/25">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Modo Analítico Exclusivo</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Pronósticos estadísticos verificados para ejecutar en{' '}
            <span className="text-slate-200 font-medium">Rushbet, Bet365 o Wplay</span>.
          </p>
        </div>

        {/* Section 1: Bookmaker Quick-Access Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-slate-200 tracking-wide">
              Casas de Apuesta (Rushbet · Bet365 · Wplay)
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {bookmakers.map((bm) => {
              const active = selectedBookmaker === bm.id;
              return (
                <button
                  key={bm.id}
                  onClick={() => onSelectBookmaker(bm.id)}
                  className={`p-2 rounded-lg text-left transition-colors border ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-slate-100'
                      : 'bg-[#0B0F17] border-slate-800/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold whitespace-nowrap truncate">{bm.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between font-mono tabular-nums">
                    <span className="truncate">{bm.region}</span>
                    <span className="text-emerald-400/90">Vig {bm.avgMargin}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* NEW MENU: Mis Ligas Favoritas + Desplegar/Ocultar Estados (En Curso, Finalizados, Próximos) */}
        <div className="rounded-xl bg-[#0B0F17] border border-amber-500/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsFavLeaguesMenuOpen(!isFavLeaguesMenuOpen)}
            className="w-full px-3.5 py-2.5 bg-[#162238] hover:bg-[#1C2C48] transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-100">
                  Menú Mis Ligas Favoritas y Estados
                </div>
                <div className="text-[10px] text-amber-300 font-mono">
                  {favoriteLeagueObjects.length} ligas fijadas · Control de despliegue
                </div>
              </div>
            </div>
            {isFavLeaguesMenuOpen ? (
              <ChevronDown className="w-4 h-4 text-amber-300 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {isFavLeaguesMenuOpen && (
            <div className="p-3 space-y-3">
              {/* Part A: Toggle Visibility of Match Statuses Across All Leagues */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-300">
                  Desplegar / Ocultar Partidos en Todas las Ligas:
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleStatusVisibility('live')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-between ${
                      visibleStatuses.live
                        ? 'bg-[#FF4B4B]/15 border-[#FF4B4B]/50 text-slate-100'
                        : 'bg-[#111827] border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {visibleStatuses.live ? (
                        <Eye className="w-3.5 h-3.5 text-[#FF4B4B]" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>Partidos En Curso</span>
                    </span>
                    <span className="font-mono text-[11px] text-[#FF4B4B] font-bold">
                      {visibleStatuses.live ? `Desplegado (${statusCounts.live})` : `Oculto (${statusCounts.live})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleStatusVisibility('finished')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-between ${
                      visibleStatuses.finished
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-slate-100'
                        : 'bg-[#111827] border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {visibleStatuses.finished ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>Partidos Finalizados</span>
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400 font-bold">
                      {visibleStatuses.finished
                        ? `Desplegado (${statusCounts.finished})`
                        : `Oculto (${statusCounts.finished})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleStatusVisibility('upcoming')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-between ${
                      visibleStatuses.upcoming
                        ? 'bg-sky-500/15 border-sky-500/50 text-slate-100'
                        : 'bg-[#111827] border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {visibleStatuses.upcoming ? (
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>Próximos Partidos</span>
                    </span>
                    <span className="font-mono text-[11px] text-sky-400 font-bold">
                      {visibleStatuses.upcoming
                        ? `Desplegado (${statusCounts.upcoming})`
                        : `Oculto (${statusCounts.upcoming})`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Part B: Pinned Favorite Leagues List */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-amber-300">
                    Mis Ligas Favoritas ({favoriteLeagueObjects.length})
                  </span>
                  {selectedLeague !== 'all' && (
                    <button
                      type="button"
                      onClick={() => onSelectLeague('all')}
                      className="text-[10px] text-emerald-400 hover:underline font-mono"
                    >
                      Ver Todas
                    </button>
                  )}
                </div>

                {favoriteLeagueObjects.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-1">
                    Pulse la estrella (★) en cualquier liga del tablero o del catálogo para fijarla aquí.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {favoriteLeagueObjects.map((lg) => {
                      const isSel = selectedLeague === lg.id;
                      return (
                        <div
                          key={lg.id}
                          className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-1.5 border transition-colors ${
                            isSel
                              ? 'bg-emerald-500 text-slate-950 font-semibold border-emerald-400'
                              : 'bg-[#111827] text-slate-200 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectLeague(isSel ? 'all' : lg.id)}
                            className="flex-1 text-left truncate"
                          >
                            <span className={isSel ? 'text-slate-950' : 'text-amber-300 font-medium'}>
                              {lg.countryOrRegion}:
                            </span>{' '}
                            <span>{lg.name}</span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            {lg.count > 0 && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                  isSel ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-emerald-400'
                                }`}
                              >
                                {lg.count}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onToggleFavoriteLeague(lg.id)}
                              className={`p-0.5 rounded ${
                                isSel ? 'text-slate-950' : 'text-amber-400 hover:text-amber-200'
                              }`}
                              title="Quitar de Mis Ligas Favoritas"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Toggleable Button for "Competiciones Flashscore" (Catalog to add/remove Favorite Leagues) */}
        <div>
          <button
            type="button"
            onClick={() => setIsCompetitionsOpen(!isCompetitionsOpen)}
            className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-between transition-all border ${
              isCompetitionsOpen
                ? 'bg-[#172C51] text-white border-sky-400 shadow-md'
                : 'bg-[#132544] hover:bg-[#193058] text-slate-100 border-[#1F3761]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left truncate">
                <div>Catálogo de Ligas (Fijar ★)</div>
                <div className="text-[10px] font-normal text-sky-300 truncate">
                  {selectedLeague === 'all'
                    ? `Todas las Ligas (${allAvailableLeagues.length})`
                    : `${selectedLeagueObj?.countryOrRegion}: ${selectedLeagueObj?.name}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {isCompetitionsOpen ? (
                <ChevronDown className="w-4 h-4 text-sky-300" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-300" />
              )}
            </div>
          </button>

          {/* Collapsible Drawer when user clicks the Competiciones Flashscore button */}
          {isCompetitionsOpen && (
            <div className="mt-2 p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-2.5">
              {/* Sport Filter */}
              <div className="grid grid-cols-4 gap-1 bg-[#111827] p-1 rounded-lg border border-slate-800">
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'football', label: 'Fútbol' },
                    { id: 'tennis', label: 'Tenis' },
                    { id: 'basketball', label: 'NBA' }
                  ] as const
                ).map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => onSelectSport(sp.id)}
                    className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                      selectedSport === sp.id
                        ? 'bg-emerald-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectLeague('all');
                    setIsCompetitionsOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors flex items-center justify-between border ${
                    selectedLeague === 'all'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#111827] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>Todas las Ligas y Torneos</span>
                  <span className="font-mono text-[11px] tabular-nums">{allAvailableLeagues.length}</span>
                </button>

                {LEAGUE_GROUPS_ORDER.map((groupTitle) => {
                  const groupLeagues = FLASHSCORE_LEAGUES_CATALOG.filter(
                    (l) => l.groupCategory === groupTitle
                  );
                  const isOpen = expandedGroups.includes(groupTitle);

                  return (
                    <div
                      key={groupTitle}
                      className="rounded-lg bg-[#111827] border border-slate-800/90 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupTitle)}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{groupTitle}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {groupLeagues.length}
                          </span>
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-2 pb-2 pt-0.5 space-y-0.5 border-t border-slate-800/60">
                          {groupLeagues.map((lg) => {
                            const isSelected = selectedLeague === lg.id;
                            const isFav = favoriteLeagues.includes(lg.id);
                            const activeMatchCount = matches.filter((m) => m.leagueId === lg.id).length;

                            return (
                              <div
                                key={lg.id}
                                className={`w-full px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between gap-1 ${
                                  isSelected
                                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavoriteLeague(lg.id);
                                  }}
                                  className={`p-0.5 rounded ${
                                    isFav
                                      ? isSelected
                                        ? 'text-slate-950'
                                        : 'text-amber-400'
                                      : 'text-slate-600 hover:text-amber-300'
                                  }`}
                                  title={isFav ? 'Quitar de Ligas Favoritas' : 'Añadir a Ligas Favoritas'}
                                >
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectLeague(lg.id);
                                    setIsCompetitionsOpen(false);
                                  }}
                                  className="flex-1 text-left truncate pr-1"
                                >
                                  <span className={isSelected ? 'text-slate-950' : 'text-slate-400'}>
                                    {lg.countryOrRegion}:{' '}
                                  </span>
                                  <span>{lg.name}</span>
                                </button>

                                {activeMatchCount > 0 && (
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded tabular-nums ${
                                      isSelected
                                        ? 'bg-slate-950/20 text-slate-950 font-bold'
                                        : 'bg-slate-800 text-emerald-400'
                                    }`}
                                  >
                                    {activeMatchCount}
                                  </span>
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
            </div>
          )}

          {/* Favorites & Push Alerts Controls */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              type="button"
              onClick={onToggleOnlyFavorites}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                onlyFavorites
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="truncate">★ Favoritos</span>
              <span className="font-mono text-[10px]">{onlyFavorites ? 'ON' : 'TODOS'}</span>
            </button>

            <button
              type="button"
              onClick={onTogglePushNotifications}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                pushNotificationsEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-[#0B0F17] border-slate-800 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1 truncate">
                <BellRing className="w-3 h-3 shrink-0" />
                <span className="truncate">Push</span>
              </span>
              <span className="font-mono text-[10px]">{pushNotificationsEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAlertSettings}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-[#0B0F17] hover:bg-slate-800 text-xs font-semibold text-emerald-400 border border-emerald-500/30 transition-colors flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5 truncate">
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Configurar Alertas (Gol vs EV+%)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-300">Umbrales</span>
          </button>
        </div>

        {/* Section 3: Profitable Options for Selected Match & Market */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Opciones Rentables del Partido</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              ≥ +{minEVFilter}% EV
            </span>
          </div>

          <div className="mb-2.5">
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={minEVFilter}
              onChange={(e) => onChangeMinEV(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            {combinedOpportunities.map(({ match, prediction, isCurrentMatch }) => {
              const copyString = `[${prediction.bestBookmaker.toUpperCase()}] ${match.homeTeam} vs ${match.awayTeam} | Mercado: ${prediction.selection} | Cuota: ${prediction.bestOdds.toFixed(2)} | Probabilidad Real: ${prediction.calculatedProbability}% | Confianza: ${prediction.confidenceIndex}/100 | Valor Esperado: +${prediction.expectedValuePercent}%`;
              const isCopied = copiedPickId === prediction.id;

              return (
                <div
                  key={prediction.id}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isCurrentMatch
                      ? 'bg-[#0B0F17] border-emerald-500/50'
                      : 'bg-[#0B0F17]/70 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate font-medium text-slate-200">
                      {isCurrentMatch ? '★ ' : ''}
                      {match.homeTeam} vs {match.awayTeam}
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold tabular-nums shrink-0 ml-1">
                      +{prediction.expectedValuePercent.toFixed(1)}% EV
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100 mt-0.5 truncate">
                    {prediction.selection}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/80 text-[11px] font-mono tabular-nums">
                    <span className="text-slate-400">
                      {prediction.bestBookmaker.toUpperCase()} @{' '}
                      <strong className="text-slate-100">{prediction.bestOdds.toFixed(2)}</strong> ·{' '}
                      <span className="text-sky-400">{prediction.calculatedProbability}%</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopyPickForBookmaker(copyString, prediction.id)}
                      className="flex items-center gap-1 text-xs font-sans font-medium text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: 5 Data Sources Sync Status */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Motores de Extracción (5/5)</span>
            </h2>
            <span className="text-[11px] text-emerald-400 font-mono">Tiempo Real</span>
          </div>
          <div className="space-y-1">
            {dataSources.map((src) => (
              <div
                key={src.name}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#0B0F17] border border-slate-800/60"
              >
                <div className="truncate">
                  <span className="font-medium text-slate-200">{src.name}</span>
                  <span className="text-slate-500 mx-1">·</span>
                  <span className="text-[11px] text-slate-400">{src.role}</span>
                </div>
                <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
