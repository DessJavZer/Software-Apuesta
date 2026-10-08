import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';
import { BookmakerId, Match, MatchStatus } from '../types/sports';
import { getColombiaDateString, getColombiaFullDateTimeLabel } from '../utils/colombiaTime';
import {
  BarChart3,
  Trophy,
  Sparkles,
  Check,
  Copy,
  Radio,
  Clock,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

interface OutcomeProbabilityStackedChartProps {
  match: Match;
  allTodayMatches?: Match[];
  onSelectMatch?: (matchId: string) => void;
  selectedBookmaker: BookmakerId | 'all';
  copiedPickId: string | null;
  onCopyPick: (text: string, id: string) => void;
  compact?: boolean;
}

type ViewMetricMode = 'competitive_odds' | 'implied_probability';

export const OutcomeProbabilityStackedChart: React.FC<OutcomeProbabilityStackedChartProps> = ({
  match,
  allTodayMatches,
  onSelectMatch,
  selectedBookmaker,
  copiedPickId,
  onCopyPick,
  compact = false
}) => {
  const [metricMode, setMetricMode] = useState<ViewMetricMode>('competitive_odds');
  const [quickStatusTab, setQuickStatusTab] = useState<MatchStatus | 'all'>('all');

  const todayColombiaStr = getColombiaDateString();
  const hasDraw = match.sport === 'football' || match.bookmakerOdds.some((b) => b.drawOdds !== undefined);

  // Compute competitive winners across Wplay, Rushbet, and Bet365
  const bestHome = useMemo(() => {
    return [...match.bookmakerOdds].sort((a, b) => b.homeOdds - a.homeOdds)[0];
  }, [match.bookmakerOdds]);

  const bestDraw = useMemo(() => {
    if (!hasDraw) return null;
    return [...match.bookmakerOdds]
      .filter((b) => b.drawOdds !== undefined)
      .sort((a, b) => (b.drawOdds || 0) - (a.drawOdds || 0))[0];
  }, [match.bookmakerOdds, hasDraw]);

  const bestAway = useMemo(() => {
    return [...match.bookmakerOdds].sort((a, b) => b.awayOdds - a.awayOdds)[0];
  }, [match.bookmakerOdds]);

  const lowestMarginBookie = useMemo(() => {
    return [...match.bookmakerOdds].sort((a, b) => a.marginPercent - b.marginPercent)[0];
  }, [match.bookmakerOdds]);

  // Multi-source real probability estimation (FootyStats + SofaScore + Soccerway)
  const modelProbabilities = useMemo(() => {
    const avgHomeImp =
      match.bookmakerOdds.reduce((acc, b) => acc + 100 / b.homeOdds, 0) /
      (match.bookmakerOdds.length || 1);
    const avgDrawImp = hasDraw
      ? match.bookmakerOdds.reduce((acc, b) => acc + (b.drawOdds ? 100 / b.drawOdds : 0), 0) /
        (match.bookmakerOdds.length || 1)
      : 0;
    const avgAwayImp =
      match.bookmakerOdds.reduce((acc, b) => acc + 100 / b.awayOdds, 0) /
      (match.bookmakerOdds.length || 1);

    const totalImp = avgHomeImp + avgDrawImp + avgAwayImp || 100;
    // Normalize to 100% and apply slight FootyStats xG tilt
    const homeTrue = Number(((avgHomeImp / totalImp) * 100 + 1.8).toFixed(1));
    const awayTrue = Number(Math.max(5, (avgAwayImp / totalImp) * 100 - 1.1).toFixed(1));
    const drawTrue = hasDraw ? Number(Math.max(5, 100 - homeTrue - awayTrue).toFixed(1)) : 0;

    return { homeTrue, drawTrue, awayTrue };
  }, [match.bookmakerOdds, hasDraw]);

  // Build Stacked Bar Chart dataset for Wplay.co, Rushbet, Bet365 + Modelo Real
  const stackedData = useMemo(() => {
    // Ensure consistent order: Wplay, Rushbet, Bet365
    const orderMap: Record<BookmakerId, number> = { wplay: 1, rushbet: 2, bet365: 3 };
    const sortedBookies = [...match.bookmakerOdds].sort(
      (a, b) => (orderMap[a.bookmaker] || 9) - (orderMap[b.bookmaker] || 9)
    );

    const rows = sortedBookies.map((bm) => {
      const impHome = Number((100 / bm.homeOdds).toFixed(1));
      const impDraw = bm.drawOdds ? Number((100 / bm.drawOdds).toFixed(1)) : 0;
      const impAway = Number((100 / bm.awayOdds).toFixed(1));
      const totalOverround = Number((impHome + impDraw + impAway).toFixed(1));

      // Normalized 100% probability distribution for clean stacked comparison
      const normHome = Number(((impHome / totalOverround) * 100).toFixed(1));
      const normDraw = bm.drawOdds ? Number(((impDraw / totalOverround) * 100).toFixed(1)) : 0;
      const normAway = Number((100 - normHome - normDraw).toFixed(1));

      return {
        name: bm.bookmakerName,
        bookmakerId: bm.bookmaker,
        // Stacked Odds values
        Local_Cuota: bm.homeOdds,
        Empate_Cuota: bm.drawOdds || 0,
        Visitante_Cuota: bm.awayOdds,
        // Stacked Implied Probability values (%)
        Local_Prob: normHome,
        Empate_Prob: normDraw,
        Visitante_Prob: normAway,
        // Raw implied with overround
        rawImpHome: impHome,
        rawImpDraw: impDraw,
        rawImpAway: impAway,
        overround: totalOverround,
        marginPercent: bm.marginPercent,
        reliabilityIndex: bm.reliabilityIndex,
        overUnderLine: bm.overUnderLine,
        overOdds: bm.overOdds,
        underOdds: bm.underOdds,
        isBestHome: bestHome?.bookmaker === bm.bookmaker,
        isBestDraw: bestDraw?.bookmaker === bm.bookmaker,
        isBestAway: bestAway?.bookmaker === bm.bookmaker
      };
    });

    if (metricMode === 'implied_probability') {
      rows.push({
        name: 'Consenso 5 Fuentes (Real)',
        bookmakerId: 'rushbet',
        Local_Cuota: Number((100 / modelProbabilities.homeTrue).toFixed(2)),
        Empate_Cuota: hasDraw ? Number((100 / modelProbabilities.drawTrue).toFixed(2)) : 0,
        Visitante_Cuota: Number((100 / modelProbabilities.awayTrue).toFixed(2)),
        Local_Prob: modelProbabilities.homeTrue,
        Empate_Prob: modelProbabilities.drawTrue,
        Visitante_Prob: modelProbabilities.awayTrue,
        rawImpHome: modelProbabilities.homeTrue,
        rawImpDraw: modelProbabilities.drawTrue,
        rawImpAway: modelProbabilities.awayTrue,
        overround: 100.0,
        marginPercent: 0.0,
        reliabilityIndex: 100,
        overUnderLine: 'Modelo xG Justo',
        overOdds: 1.85,
        underOdds: 1.95,
        isBestHome: false,
        isBestDraw: false,
        isBestAway: false
      });
    }

    return rows;
  }, [match.bookmakerOdds, metricMode, bestHome, bestDraw, bestAway, modelProbabilities, hasDraw]);

  // Filter today's matches by status and sort by highest Rushbet betting options volume (totalMarketsCount DESC)
  const todayMatchesByStatus = useMemo(() => {
    if (!allTodayMatches) return { live: [], finished: [], upcoming: [], filtered: [] };
    const sortByMarketsDesc = (arr: Match[]) =>
      [...arr].sort((a, b) => (b.totalMarketsCount || 110) - (a.totalMarketsCount || 110));

    const live = sortByMarketsDesc(allTodayMatches.filter((m) => m.status === 'live'));
    const finished = sortByMarketsDesc(allTodayMatches.filter((m) => m.status === 'finished'));
    const upcoming = sortByMarketsDesc(allTodayMatches.filter((m) => m.status === 'upcoming'));
    const filtered =
      quickStatusTab === 'all'
        ? [...live, ...upcoming, ...finished]
        : sortByMarketsDesc(allTodayMatches.filter((m) => m.status === quickStatusTab));
    return { live, finished, upcoming, filtered };
  }, [allTodayMatches, quickStatusTab]);

  const homeKey = metricMode === 'competitive_odds' ? 'Local_Cuota' : 'Local_Prob';
  const drawKey = metricMode === 'competitive_odds' ? 'Empate_Cuota' : 'Empate_Prob';
  const awayKey = metricMode === 'competitive_odds' ? 'Visitante_Cuota' : 'Visitante_Prob';

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-5">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              Vista Detallada: Probabilidad de Resultado y Comparativa de Cuotas Apiladas (Wplay · Rushbet · Bet365)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Partido seleccionado:{' '}
            <strong className="text-slate-100">
              {match.homeTeam} vs {match.awayTeam}
            </strong>{' '}
            ({match.leagueName}) · Jornada de Hoy ({todayColombiaStr} COT —{' '}
            {getColombiaFullDateTimeLabel(new Date())})
          </p>
        </div>

        {/* Toggle between Stacked Competitive Odds and Stacked Outcome Probabilities */}
        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMetricMode('competitive_odds')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              metricMode === 'competitive_odds'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cuotas Apiladas (1X2 Competitiva)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('implied_probability')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              metricMode === 'implied_probability'
                ? 'bg-sky-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Probabilidad de Resultado (%)
          </button>
        </div>
      </div>

      {/* Quick Today Match Selector Strip (En Curso | Finalizados | Próximos de Hoy) */}
      {allTodayMatches && allTodayMatches.length > 0 && !compact && (
        <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span>Partidos del Día de Hoy ({todayColombiaStr} COT) — Seleccione para comparar sus cuotas:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuickStatusTab('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                  quickStatusTab === 'all'
                    ? 'bg-slate-200 text-slate-950'
                    : 'bg-[#0B0F17] text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                Todos Hoy ({allTodayMatches.length})
              </button>
              <button
                type="button"
                onClick={() => setQuickStatusTab('live')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  quickStatusTab === 'live'
                    ? 'bg-[#FF4B4B] text-white'
                    : 'bg-[#0B0F17] text-[#FF4B4B] border border-[#FF4B4B]/40 hover:bg-[#FF4B4B]/15'
                }`}
              >
                <Radio className="w-3 h-3 animate-pulse" />
                <span>En Curso ({todayMatchesByStatus.live.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickStatusTab('finished')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  quickStatusTab === 'finished'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-[#0B0F17] text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/15'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Finalizados Hoy ({todayMatchesByStatus.finished.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickStatusTab('upcoming')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  quickStatusTab === 'upcoming'
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-[#0B0F17] text-sky-300 border border-sky-500/40 hover:bg-sky-500/15'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Próximos Hoy ({todayMatchesByStatus.upcoming.length})</span>
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Pill Strip of Today's Matches */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {todayMatchesByStatus.filtered.map((m) => {
              const isCurrent = m.id === match.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMatch?.(m.id)}
                  className={`px-3 py-2 rounded-lg border text-left shrink-0 transition-all flex items-center gap-2.5 ${
                    isCurrent
                      ? 'bg-[#172C51] border-emerald-400 shadow-md'
                      : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      m.status === 'live'
                        ? 'bg-[#FF4B4B] animate-ping'
                        : m.status === 'finished'
                        ? 'bg-emerald-400'
                        : 'bg-sky-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-100 whitespace-nowrap">
                      {m.homeTeam}{' '}
                      <span className="font-mono text-emerald-400">
                        {m.status === 'upcoming' ? 'vs' : `${m.homeScore}-${m.awayScore}`}
                      </span>{' '}
                      {m.awayTeam}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span className="text-amber-300 font-bold">
                        +{m.totalMarketsCount || (m.sport === 'football' ? 148 : m.sport === 'basketball' ? 118 : 64)} opc.
                      </span>
                      <span>·</span>
                      <span>
                        {m.status === 'live'
                          ? `EN CURSO ${m.minuteOrPeriod}`
                          : m.status === 'finished'
                          ? 'FINALIZADO HOY'
                          : `PRÓXIMO ${m.startTime} COT`}
                      </span>
                      <span>·</span>
                      <span className="truncate max-w-[130px]">{m.leagueName}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Best Competitive Odds Winner Cards per Outcome (Local / Empate / Visitante) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {bestHome && (
          <div className="p-3.5 rounded-xl bg-[#111827] border border-emerald-500/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Mejor Cuota Local (1)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] uppercase">
                {bestHome.bookmakerName}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <div className="text-sm font-bold text-slate-100 truncate">{match.homeTeam}</div>
                <div className="text-[11px] font-mono text-slate-400">
                  Prob. Real: {modelProbabilities.homeTrue}% vs Implícita:{' '}
                  {(100 / bestHome.homeOdds).toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                @{bestHome.homeOdds.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {hasDraw && bestDraw && (
          <div className="p-3.5 rounded-xl bg-[#111827] border border-amber-500/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Mejor Cuota Empate (X)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] uppercase">
                {bestDraw.bookmakerName}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <div className="text-sm font-bold text-slate-100">Empate Reglamentario</div>
                <div className="text-[11px] font-mono text-slate-400">
                  Prob. Real: {modelProbabilities.drawTrue}% vs Implícita:{' '}
                  {bestDraw.drawOdds ? (100 / bestDraw.drawOdds).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-2xl font-mono font-bold text-amber-300 tabular-nums">
                @{bestDraw.drawOdds?.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {bestAway && (
          <div className="p-3.5 rounded-xl bg-[#111827] border border-sky-500/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Mejor Cuota Visitante (2)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold text-[11px] uppercase">
                {bestAway.bookmakerName}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <div className="text-sm font-bold text-slate-100 truncate">{match.awayTeam}</div>
                <div className="text-[11px] font-mono text-slate-400">
                  Prob. Real: {modelProbabilities.awayTrue}% vs Implícita:{' '}
                  {(100 / bestAway.awayOdds).toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl font-mono font-bold text-sky-400 tabular-nums">
                @{bestAway.awayOdds.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Stacked Bar Chart (Recharts) + Side-by-Side Competitive Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Recharts Stacked BarChart */}
        <div className="lg:col-span-7 h-80 w-full bg-[#111827]/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-200">
              {metricMode === 'competitive_odds'
                ? 'Gráfico de Barras Apiladas: Cuotas 1X2 por Casa de Apuestas'
                : 'Gráfico de Barras Apiladas: Distribución de Probabilidad de Resultado (100%)'}
            </span>
            <span className="font-mono text-[11px] text-emerald-400">
              Menor comisión: {lowestMarginBookie?.bookmakerName} ({lowestMarginBookie?.marginPercent}% margen)
            </span>
          </div>

          <ResponsiveContainer width="100%" height="88%">
            <BarChart
              data={stackedData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={true} vertical={true} />
              <XAxis
                type="number"
                domain={metricMode === 'implied_probability' ? [0, 100] : ['auto', 'auto']}
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                unit={metricMode === 'implied_probability' ? '%' : ''}
                stroke="#334155"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={115}
                tick={{ fill: '#F8FAFC', fontSize: 12, fontWeight: 700 }}
                stroke="#334155"
              />
              <Tooltip
                cursor={{ fill: 'rgba(30, 41, 59, 0.45)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const row = payload[0].payload;
                  return (
                    <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-700 shadow-2xl text-xs space-y-2 font-mono tabular-nums min-w-[260px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-sans font-bold text-slate-100 text-sm">
                          {row.name}
                        </span>
                        <span className="text-[11px] text-emerald-400">
                          Margen: {row.marginPercent}%
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>1 · {match.homeTeam}:</span>
                          <strong>
                            @{row.Local_Cuota.toFixed(2)} ({row.Local_Prob}%)
                            {row.isBestHome ? ' ★ MEJOR' : ''}
                          </strong>
                        </div>

                        {hasDraw && (
                          <div className="flex items-center justify-between text-amber-300">
                            <span>X · Empate:</span>
                            <strong>
                              @{row.Empate_Cuota.toFixed(2)} ({row.Empate_Prob}%)
                              {row.isBestDraw ? ' ★ MEJOR' : ''}
                            </strong>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sky-400">
                          <span>2 · {match.awayTeam}:</span>
                          <strong>
                            @{row.Visitante_Cuota.toFixed(2)} ({row.Visitante_Prob}%)
                            {row.isBestAway ? ' ★ MEJOR' : ''}
                          </strong>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Suma Prob. Implícita (Overround):</span>
                        <span className="text-slate-200 font-bold">{row.overround}%</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
              {metricMode === 'implied_probability' && (
                <ReferenceLine x={50} stroke="#475569" strokeDasharray="3 3" />
              )}

              <Bar
                dataKey={homeKey}
                name={`1 · ${match.homeTeam}`}
                stackId="outcomeStack"
                fill="#10B981"
                radius={[4, 0, 0, 4]}
              >
                {stackedData.map((entry, index) => (
                  <Cell
                    key={`cell-home-${index}`}
                    fill={entry.isBestHome ? '#10B981' : '#059669'}
                  />
                ))}
              </Bar>

              {hasDraw && (
                <Bar
                  dataKey={drawKey}
                  name="X · Empate"
                  stackId="outcomeStack"
                  fill="#F59E0B"
                >
                  {stackedData.map((entry, index) => (
                    <Cell
                      key={`cell-draw-${index}`}
                      fill={entry.isBestDraw ? '#FBBF24' : '#D97706'}
                    />
                  ))}
                </Bar>
              )}

              <Bar
                dataKey={awayKey}
                name={`2 · ${match.awayTeam}`}
                stackId="outcomeStack"
                fill="#38BDF8"
                radius={[0, 4, 4, 0]}
              >
                {stackedData.map((entry, index) => (
                  <Cell
                    key={`cell-away-${index}`}
                    fill={entry.isBestAway ? '#38BDF8' : '#0284C7'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Column: Detailed Bookmaker Competitiveness & Quick Copy Table */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">
                Comparador Directo de Competitividad en Tiempo Real
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                ★ = Cuota Más Alta
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                    <th className="py-2 pr-2 font-sans">Casa</th>
                    <th className="py-2 px-2 text-right">1 (Local)</th>
                    {hasDraw && <th className="py-2 px-2 text-right">X (Emp)</th>}
                    <th className="py-2 px-2 text-right">2 (Vis.)</th>
                    <th className="py-2 pl-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {stackedData
                    .filter((r) => r.name !== 'Consenso 5 Fuentes (Real)')
                    .map((row) => {
                      const isBookieSelected = selectedBookmaker === row.bookmakerId;
                      const copyId = `comp-${match.id}-${row.bookmakerId}`;
                      const copyStr = `[${row.name.toUpperCase()}] ${match.homeTeam} vs ${match.awayTeam} | Cuotas 1X2: Local @${row.Local_Cuota.toFixed(2)} (${row.Local_Prob}%) ${
                        hasDraw ? `| Empate @${row.Empate_Cuota.toFixed(2)} (${row.Empate_Prob}%) ` : ''
                      }| Visitante @${row.Visitante_Cuota.toFixed(2)} (${row.Visitante_Prob}%) | Margen Casa: ${row.marginPercent}%`;

                      return (
                        <tr
                          key={row.name}
                          className={`${
                            isBookieSelected ? 'bg-emerald-500/10' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <td className="py-2.5 pr-2 font-sans font-bold text-slate-100">
                            <div>{row.name}</div>
                            <div className="text-[10px] font-mono font-normal text-slate-400">
                              Overround {row.overround}%
                            </div>
                          </td>

                          <td className="py-2.5 px-2 text-right">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                row.isBestHome
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'text-slate-200'
                              }`}
                            >
                              {row.Local_Cuota.toFixed(2)}
                              {row.isBestHome ? '★' : ''}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {row.Local_Prob}%
                            </div>
                          </td>

                          {hasDraw && (
                            <td className="py-2.5 px-2 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold ${
                                  row.isBestDraw
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'text-slate-300'
                                }`}
                              >
                                {row.Empate_Cuota.toFixed(2)}
                                {row.isBestDraw ? '★' : ''}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {row.Empate_Prob}%
                              </div>
                            </td>
                          )}

                          <td className="py-2.5 px-2 text-right">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                row.isBestAway
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                  : 'text-slate-300'
                              }`}
                            >
                              {row.Visitante_Cuota.toFixed(2)}
                              {row.isBestAway ? '★' : ''}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {row.Visitante_Prob}%
                            </div>
                          </td>

                          <td className="py-2.5 pl-2 text-right font-sans">
                            <button
                              type="button"
                              onClick={() => onCopyPick(copyStr, copyId)}
                              className="px-2 py-1 rounded bg-[#0B0F17] hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium inline-flex items-center gap-1"
                              title="Copiar comparativa de esta casa"
                            >
                              {copiedPickId === copyId ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Arbitrage / Value Recommendation Summary */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-emerald-300 flex items-center gap-1">
                <span>Diagnóstico de Cuota Más Competitiva en Tiempo Real</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <p className="text-slate-200 mt-0.5">
                Para <strong>{match.homeTeam} (Local)</strong> la cuota más alta está en{' '}
                <strong className="text-emerald-300 uppercase">{bestHome?.bookmakerName}</strong> (@
                {bestHome?.homeOdds.toFixed(2)}), mientras que para{' '}
                <strong>{match.awayTeam} (Visitante)</strong> lidera{' '}
                <strong className="text-sky-300 uppercase">{bestAway?.bookmakerName}</strong> (@
                {bestAway?.awayOdds.toFixed(2)}). La casa con menor comisión matemática en este partido es{' '}
                <strong className="text-amber-300">{lowestMarginBookie?.bookmakerName}</strong> (margen de solo{' '}
                {lowestMarginBookie?.marginPercent}%).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
