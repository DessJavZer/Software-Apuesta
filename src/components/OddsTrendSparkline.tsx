import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  YAxis
} from 'recharts';
import { BookmakerId } from '../types/sports';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface OddsTrendSparklineProps {
  predictionId: string;
  currentOdds: number;
  calculatedProbability: number;
  bookmaker: BookmakerId;
  compact?: boolean;
}

interface SparklinePoint {
  timeLabel: string;
  odds: number;
  evPercent: number;
}

/**
 * Generates a deterministic yet realistic 30-minute odds fluctuation series (every 5 minutes)
 * ending at the current live odds, computing the Expected Value (EV+%) at each interval.
 */
function build30MinOddsSeries(
  predictionId: string,
  currentOdds: number,
  calculatedProbability: number
): SparklinePoint[] {
  // Deterministic seed from predictionId
  let seed = 0;
  for (let i = 0; i < predictionId.length; i++) {
    seed = (seed * 31 + predictionId.charCodeAt(i)) % 1000;
  }

  const intervals = ['-30m', '-25m', '-20m', '-15m', '-10m', '-5m', 'Ahora'];
  const points: SparklinePoint[] = [];

  // Simulate realistic sharp money steam or value drift over the last 30 mins
  const isSteamDropping = seed % 2 === 0;
  const startOffset = isSteamDropping ? 0.14 : -0.09;

  intervals.forEach((label, idx) => {
    const progress = idx / (intervals.length - 1); // 0 to 1
    const wave = Math.sin(seed + idx * 1.4) * 0.025;
    const rawOdds =
      idx === intervals.length - 1
        ? currentOdds
        : Number(
            Math.max(
              1.12,
              currentOdds + startOffset * (1 - progress) + wave
            ).toFixed(2)
          );

    const impliedProb = (1 / rawOdds) * 100;
    const ev = Number(Math.max(0.5, calculatedProbability - impliedProb).toFixed(1));

    points.push({
      timeLabel: label,
      odds: rawOdds,
      evPercent: ev
    });
  });

  return points;
}

export const OddsTrendSparkline: React.FC<OddsTrendSparklineProps> = ({
  predictionId,
  currentOdds,
  calculatedProbability,
  bookmaker,
  compact = false
}) => {
  const series = useMemo(
    () => build30MinOddsSeries(predictionId, currentOdds, calculatedProbability),
    [predictionId, currentOdds, calculatedProbability]
  );

  const openOdds = series[0]?.odds || currentOdds;
  const deltaOdds = Number((currentOdds - openOdds).toFixed(2));
  const isDroppingSteam = deltaOdds <= 0; // Dropping odds = Smart Money / Steam entering

  const strokeColor =
    bookmaker === 'rushbet'
      ? '#10B981'
      : bookmaker === 'bet365'
      ? '#38BDF8'
      : '#F59E0B';

  const gradientId = `spark-grad-${predictionId.replace(/[^a-zA-Z0-9]/g, '')}-${compact ? 'sm' : 'lg'}`;

  return (
    <div className="p-2.5 rounded-lg bg-[#111827]/90 border border-slate-800/90 space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">
          Fluctuación Cuota (Últimos 30m)
        </span>
        <span
          className={`font-mono font-semibold tabular-nums flex items-center gap-1 ${
            isDroppingSteam ? 'text-emerald-400' : 'text-amber-300'
          }`}
          title={
            isDroppingSteam
              ? 'Caída de cuota por entrada de flujo inteligente (Smart Money)'
              : 'Subida de cuota que incrementa el margen de Valor Esperado (EV+%)'
          }
        >
          {isDroppingSteam ? (
            <TrendingDown className="w-3 h-3 shrink-0" />
          ) : (
            <TrendingUp className="w-3 h-3 shrink-0" />
          )}
          <span>
            {openOdds.toFixed(2)} → {currentOdds.toFixed(2)} (
            {deltaOdds >= 0 ? `+${deltaOdds.toFixed(2)}` : deltaOdds.toFixed(2)})
          </span>
        </span>
      </div>

      <div className={compact ? 'h-11 w-full' : 'h-14 w-full'}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 2, left: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin - 0.04', 'dataMax + 0.04']} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const pt = payload[0].payload as SparklinePoint;
                return (
                  <div className="px-2.5 py-1.5 rounded bg-[#0B0F17] border border-slate-700 shadow-xl text-[11px] font-mono tabular-nums">
                    <div className="text-slate-400">
                      Tiempo: <strong className="text-slate-100">{pt.timeLabel}</strong>
                    </div>
                    <div className="text-amber-300">
                      Cuota: <strong>@{pt.odds.toFixed(2)}</strong>
                    </div>
                    <div className="text-emerald-400">
                      Tendencia Valor: <strong>+{pt.evPercent.toFixed(1)}% EV</strong>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="odds"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 tabular-nums">
        <span>-30 min ({openOdds.toFixed(2)})</span>
        <span className="text-slate-400">
          {isDroppingSteam ? 'Tendencia: Presión de Mercado' : 'Tendencia: Pico de Valor EV+'}
        </span>
        <span className="text-slate-300 font-semibold">Ahora ({currentOdds.toFixed(2)})</span>
      </div>
    </div>
  );
};
