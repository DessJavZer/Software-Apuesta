import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import { BookmakerId, Match, SportMarketCategory } from '../types/sports';
import { getSportCategorizedPredictions } from '../utils/footballMarketsGenerator';
import { Crosshair, Filter, Copy, Check, Radio } from 'lucide-react';

interface ValueRadarScatterChartProps {
  matches: Match[];
  selectedCategory: SportMarketCategory | 'all';
  minEVFilter: number;
  selectedBookmaker: BookmakerId | 'all';
  copiedPickId: string | null;
  onCopyPick: (text: string, pickId: string) => void;
  onSelectMatchFromChart?: (matchId: string) => void;
}

interface ScatterDataPoint {
  id: string;
  matchId: string;
  matchTitle: string;
  leagueId: string;
  leagueName: string;
  country: string;
  minuteOrPeriod: string;
  category: string;
  marketName: string;
  selection: string;
  probability: number; // X-axis
  evPercent: number; // Y-axis
  confidence: number; // Z-axis (bubble size)
  bestBookmaker: BookmakerId;
  bestOdds: number;
  sampleSize: number;
}

const BOOKMAKER_COLORS: Record<BookmakerId, string> = {
  rushbet: '#10B981', // Emerald
  bet365: '#38BDF8', // Sky
  wplay: '#F59E0B' // Amber
};

export const ValueRadarScatterChart: React.FC<ValueRadarScatterChartProps> = ({
  matches,
  selectedCategory,
  minEVFilter,
  selectedBookmaker,
  copiedPickId,
  onCopyPick,
  onSelectMatchFromChart
}) => {
  const [chartLeagueFilter, setChartLeagueFilter] = useState<string>('all');
  const [onlyLiveFilter, setOnlyLiveFilter] = useState<boolean>(true);
  const [selectedPoint, setSelectedPoint] = useState<ScatterDataPoint | null>(null);

  // Extract available leagues among matches
  const availableLeagues = useMemo(() => {
    const map = new Map<string, string>();
    matches.forEach((m) => {
      if (!onlyLiveFilter || m.status === 'live') {
        map.set(m.leagueId, `${m.country}: ${m.leagueName}`);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [matches, onlyLiveFilter]);

  // Build scatter points from live (or all) matches
  const scatterData = useMemo<ScatterDataPoint[]>(() => {
    return matches
      .filter((m) => (onlyLiveFilter ? m.status === 'live' : true))
      .filter((m) => (chartLeagueFilter === 'all' ? true : m.leagueId === chartLeagueFilter))
      .flatMap((m) => {
        const preds = getSportCategorizedPredictions(m).flatMap((grp) => grp.predictions);

        return preds
          .filter((p) => p.expectedValuePercent >= minEVFilter)
          .filter((p) =>
            selectedCategory === 'all' ? true : p.category === selectedCategory
          )
          .filter((p) =>
            selectedBookmaker === 'all' ? true : p.bestBookmaker === selectedBookmaker
          )
          .map((p) => ({
            id: p.id,
            matchId: m.id,
            matchTitle: `${m.homeTeam} vs ${m.awayTeam}`,
            leagueId: m.leagueId,
            leagueName: m.leagueName,
            country: m.country,
            minuteOrPeriod: m.minuteOrPeriod,
            category: p.category || m.sport.toUpperCase(),
            marketName: p.marketName,
            selection: p.selection,
            probability: Number(p.calculatedProbability.toFixed(1)),
            evPercent: Number(p.expectedValuePercent.toFixed(1)),
            confidence: p.confidenceIndex,
            bestBookmaker: p.bestBookmaker,
            bestOdds: p.bestOdds,
            sampleSize: p.sampleSizeMatches
          }));
      });
  }, [matches, onlyLiveFilter, chartLeagueFilter, minEVFilter, selectedCategory, selectedBookmaker]);

  const activePoint = selectedPoint || scatterData[0] || null;

  return (
    <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-4">
      {/* Header & League Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/90">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Mapa de Dispersión en Directo: Probabilidad de Éxito (%) vs Margen de Valor (EV+%)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cada punto representa una oportunidad estadística activa. El tamaño refleja el Índice de Confianza y el color la mejor casa de apuestas.
          </p>
        </div>

        {/* Interactive League & Live Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#111827] border border-slate-700 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-xs text-slate-400">Filtrar por Liga:</span>
            <select
              value={chartLeagueFilter}
              onChange={(e) => {
                setChartLeagueFilter(e.target.value);
                setSelectedPoint(null);
              }}
              className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111827] text-slate-100">
                Todas las Ligas ({availableLeagues.length})
              </option>
              {availableLeagues.map((lg) => (
                <option key={lg.id} value={lg.id} className="bg-[#111827] text-slate-100">
                  {lg.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setOnlyLiveFilter(!onlyLiveFilter);
              setChartLeagueFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              onlyLiveFilter
                ? 'bg-[#FF4B4B]/20 text-[#FF4B4B] border-[#FF4B4B]/40'
                : 'bg-[#111827] text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${onlyLiveFilter ? 'animate-pulse' : ''}`} />
            <span>{onlyLiveFilter ? 'Solo Partidos en Directo' : 'Todos los Partidos'}</span>
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <strong className="text-slate-200">Rushbet.co</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <strong className="text-slate-200">Bet365</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <strong className="text-slate-200">Wplay.co</strong>
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-400 tabular-nums">
          Mostrando <strong className="text-emerald-400">{scatterData.length}</strong> mercados con valor matemático positivo
        </div>
      </div>

      {/* Main Chart + Selected Point Inspector Grid */}
      {scatterData.length === 0 ? (
        <div className="h-72 flex items-center justify-center border border-slate-800/80 rounded-lg bg-[#111827]/40 text-xs text-slate-400">
          No hay mercados en directo que cumplan con los filtros actuales. Reduzca el filtro EV+ o cambie de liga.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Recharts ScatterChart Canvas */}
          <div className="lg:col-span-8 h-80 w-full bg-[#111827]/60 border border-slate-800/90 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  type="number"
                  dataKey="probability"
                  name="Probabilidad de Éxito"
                  unit="%"
                  domain={['dataMin - 4', 'dataMax + 4']}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  stroke="#334155"
                  label={{
                    value: 'Probabilidad de Éxito Calculada (%)',
                    position: 'insideBottom',
                    offset: -8,
                    fill: '#94A3B8',
                    fontSize: 11
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="evPercent"
                  name="Margen de Valor (EV+)"
                  unit="%"
                  domain={[0, 'dataMax + 2']}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  stroke="#334155"
                  label={{
                    value: 'Valor Esperado EV+ (%)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#94A3B8',
                    fontSize: 11
                  }}
                />
                <ZAxis
                  type="number"
                  dataKey="confidence"
                  range={[65, 240]}
                  name="Índice de Confianza"
                />
                <ReferenceLine
                  x={65}
                  stroke="#38BDF8"
                  strokeDasharray="4 4"
                  strokeOpacity={0.45}
                />
                <ReferenceLine
                  y={7.5}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.45}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#64748B' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const pt = payload[0].payload as ScatterDataPoint;
                    return (
                      <div className="p-3 rounded-lg bg-[#0B0F17] border border-emerald-500/60 shadow-2xl text-xs space-y-1.5 max-w-xs">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                          <span className="truncate text-sky-400">{pt.leagueName}</span>
                          <span className="text-[#FF4B4B] font-bold shrink-0">{pt.minuteOrPeriod}</span>
                        </div>
                        <div className="font-bold text-slate-100">{pt.matchTitle}</div>
                        <div className="text-emerald-300 font-semibold">
                          [{pt.category}] {pt.selection}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800 font-mono tabular-nums text-[11px]">
                          <div>
                            <span className="text-slate-400">Prob. Éxito: </span>
                            <strong className="text-emerald-400">{pt.probability}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Margen EV: </span>
                            <strong className="text-emerald-400">+{pt.evPercent}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Confianza: </span>
                            <strong className="text-sky-400">{pt.confidence}/100</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase">{pt.bestBookmaker}: </span>
                            <strong className="text-amber-300">@{pt.bestOdds.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  name="Oportunidades en Directo"
                  data={scatterData}
                  onClick={(data) => {
                    if (data && data.payload) {
                      setSelectedPoint(data.payload as ScatterDataPoint);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {scatterData.map((entry) => {
                    const isSelected = activePoint?.id === entry.id;
                    return (
                      <Cell
                        key={entry.id}
                        fill={BOOKMAKER_COLORS[entry.bestBookmaker] || '#10B981'}
                        stroke={isSelected ? '#FFFFFF' : '#0B0F17'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        fillOpacity={isSelected ? 1 : 0.85}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Selected Point Detail Card */}
          <div className="lg:col-span-4 h-full">
            {activePoint && (
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-sky-400 uppercase">
                      Punto Seleccionado en Gráfico
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FF4B4B]">
                      {activePoint.minuteOrPeriod}
                    </span>
                  </div>

                  <div className="text-base font-bold text-slate-100">
                    {activePoint.matchTitle}
                  </div>
                  <div className="text-xs text-slate-400">
                    {activePoint.country} · {activePoint.leagueName}
                  </div>

                  <div className="p-3 rounded-lg bg-[#0B0F17] border border-slate-800/90 mt-2">
                    <div className="text-[11px] text-sky-400 font-semibold">
                      {activePoint.category} · {activePoint.marketName}
                    </div>
                    <div className="text-sm font-bold text-emerald-300 mt-0.5">
                      {activePoint.selection}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono tabular-nums">
                    <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                      <div className="text-[10px] text-slate-400">Probabilidad Éxito</div>
                      <div className="text-base font-bold text-emerald-400">
                        {activePoint.probability}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                      <div className="text-[10px] text-slate-400">Margen Valor (EV+)</div>
                      <div className="text-base font-bold text-emerald-400">
                        +{activePoint.evPercent}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                      <div className="text-[10px] text-slate-400">Índice Confianza</div>
                      <div className="text-sm font-bold text-sky-400">
                        {activePoint.confidence}/100 ({activePoint.sampleSize}p)
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                      <div className="text-[10px] text-slate-400">Mejor Casa</div>
                      <div className="text-sm font-bold text-amber-300 uppercase">
                        {activePoint.bestBookmaker} @{activePoint.bestOdds.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const copyText = `[${activePoint.bestBookmaker.toUpperCase()}] ${activePoint.matchTitle} | ${activePoint.category}: ${activePoint.selection} @ ${activePoint.bestOdds.toFixed(2)} | Probabilidad Éxito: ${activePoint.probability}% | EV: +${activePoint.evPercent}%`;
                      onCopyPick(copyText, activePoint.id);
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedPickId === activePoint.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Ficha Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar para {activePoint.bestBookmaker.toUpperCase()}</span>
                      </>
                    )}
                  </button>

                  {onSelectMatchFromChart && (
                    <button
                      type="button"
                      onClick={() => onSelectMatchFromChart(activePoint.matchId)}
                      className="py-2 px-3 bg-[#0B0F17] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      Ver Partido
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
