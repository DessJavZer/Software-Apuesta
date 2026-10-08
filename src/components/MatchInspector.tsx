import React, { useState, useMemo, useEffect } from 'react';
import { BookmakerId, Match, PredictionOption, SportMarketCategory, TrackedAnalyticalRecord } from '../types/sports';
import { getSportCategorizedPredictions } from '../utils/footballMarketsGenerator';
import { OddsTrendSparkline } from './OddsTrendSparkline';
import { PlayerDeepAnalysisRadar } from './PlayerDeepAnalysisRadar';
import { OutcomeProbabilityStackedChart } from './OutcomeProbabilityStackedChart';
import {
  Activity,
  Users,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers
} from 'lucide-react';

interface MatchInspectorProps {
  match: Match;
  selectedBookmaker: BookmakerId | 'all';
  onAddPredictionToHistory: (record: Omit<TrackedAnalyticalRecord, 'id'>) => void;
  copiedPickId: string | null;
  onCopyPick: (text: string, id: string) => void;
}

export const MatchInspector: React.FC<MatchInspectorProps> = ({
  match,
  selectedBookmaker,
  onAddPredictionToHistory,
  copiedPickId,
  onCopyPick
}) => {
  const [activeTab, setActiveTab] = useState<'stats_events' | 'lineups' | 'predictions_odds' | 'outcome_probability' | 'sources'>('predictions_odds');
  const [stakeUnits, setStakeUnits] = useState<number>(2.0);
  const [addedPickIds, setAddedPickIds] = useState<string[]>([]);
  const [selectedHomePlayerNum, setSelectedHomePlayerNum] = useState<number | undefined>(undefined);
  const [selectedAwayPlayerNum, setSelectedAwayPlayerNum] = useState<number | undefined>(undefined);

  // Generate the full Rushbet market categories for Football (9 categories), Tennis (7 categories), or Basketball (7 categories)
  const sportMarketGroups = useMemo(() => {
    return getSportCategorizedPredictions(match);
  }, [match]);

  // Track which market category bars are expanded (first category open by default)
  const [expandedCategories, setExpandedCategories] = useState<SportMarketCategory[]>(() =>
    sportMarketGroups.length > 0 ? [sportMarketGroups[0].category] : ['Tiempo reglamentario']
  );

  // When switching between matches of different sports, keep the first category expanded
  useEffect(() => {
    if (sportMarketGroups.length > 0) {
      setExpandedCategories([sportMarketGroups[0].category]);
    }
  }, [match.id, match.sport, sportMarketGroups]);

  const toggleCategory = (cat: SportMarketCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const expandAllSportCategories = () => {
    if (expandedCategories.length === sportMarketGroups.length) {
      setExpandedCategories([]);
    } else {
      setExpandedCategories(sportMarketGroups.map((g) => g.category));
    }
  };

  const totalRushbetMarkets = useMemo(() => {
    if (match.totalMarketsCount && match.totalMarketsCount > 0) return match.totalMarketsCount;
    return sportMarketGroups.reduce((sum, g) => sum + g.badgeCount, 0);
  }, [match.totalMarketsCount, sportMarketGroups]);

  const handleLogPrediction = (pred: PredictionOption) => {
    const stakeCOP = stakeUnits * 100000;
    onAddPredictionToHistory({
      date: `${match.date} ${match.startTime}`,
      sport: match.sport,
      leagueName: match.leagueName,
      matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
      marketSelection: `${pred.category ? `[${pred.category}] ` : ''}${pred.selection}`,
      bookmaker: pred.bestBookmaker,
      odds: pred.bestOdds,
      modelProbability: pred.calculatedProbability,
      confidenceIndex: pred.confidenceIndex,
      expectedValue: pred.expectedValuePercent,
      simulatedStakeUnits: stakeUnits,
      simulatedStakeCOP: stakeCOP,
      status: 'pending',
      profitLossCOP: 0
    });
    setAddedPickIds((prev) => [...prev, pred.id]);
  };

  const renderPredictionCard = (pred: PredictionOption) => {
    const isAdded = addedPickIds.includes(pred.id);
    const isCopied = copiedPickId === pred.id;
    const copyStr = `[${pred.bestBookmaker.toUpperCase()}] ${match.homeTeam} vs ${match.awayTeam} — ${pred.category ? `${pred.category}: ` : ''}${pred.selection} @ ${pred.bestOdds.toFixed(2)} | Probabilidad de Éxito: ${pred.calculatedProbability}% | Índice Confianza: ${pred.confidenceIndex}/100 | Valor: +${pred.expectedValuePercent}%`;

    return (
      <div
        key={pred.id}
        className="p-4 rounded-lg bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-colors"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-sky-400 font-medium">{pred.marketName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Muestra: {pred.sampleSizeMatches} partidos históricos
              </span>
              {pred.isValueOpportunity && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-semibold">
                    Oportunidad EV+
                  </span>
                </>
              )}
            </div>
            <div className="text-base font-bold text-slate-100">
              {pred.selection}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {pred.rationale}
            </p>
            <div className="pt-2 max-w-md">
              <OddsTrendSparkline
                predictionId={pred.id}
                currentOdds={pred.bestOdds}
                calculatedProbability={pred.calculatedProbability}
                bookmaker={pred.bestBookmaker}
                compact
              />
            </div>
          </div>

          {/* Quantitative Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 w-full xl:w-auto pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-800/80">
            <div className="p-2.5 rounded bg-[#111827] border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Prob. de Éxito</div>
              <div className="text-base font-mono font-bold text-emerald-400 tabular-nums mt-0.5">
                {pred.calculatedProbability.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, pred.calculatedProbability)}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#111827] border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Índice Confianza</div>
              <div className="text-base font-mono font-bold text-sky-400 tabular-nums mt-0.5">
                {pred.confidenceIndex}/100
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-sky-400 h-full rounded-full"
                  style={{ width: `${pred.confidenceIndex}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#111827] border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Mejor Cuota</div>
              <div className="text-base font-mono font-bold text-slate-100 tabular-nums mt-0.5">
                {pred.bestOdds.toFixed(2)}{' '}
                <span className="text-xs font-normal text-amber-300 uppercase">
                  {pred.bestBookmaker}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-1">
                Implícita: {pred.impliedProbability.toFixed(1)}%
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#111827] border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Valor Esperado</div>
              <div className="text-base font-mono font-bold text-emerald-400 tabular-nums mt-0.5">
                +{pred.expectedValuePercent.toFixed(1)}% EV
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Ventaja Matemática
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer for Pick */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            Recomendación verificada para ejecutar externamente en{' '}
            <strong className="text-slate-200 uppercase">{pred.bestBookmaker}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopyPick(copyStr, pred.id)}
              className="px-3 py-1.5 text-xs font-medium bg-[#111827] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Datos Copiados' : 'Copiar para Casa de Apuestas'}</span>
            </button>

            <button
              type="button"
              disabled={isAdded}
              onClick={() => handleLogPrediction(pred)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isAdded
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Registrado en Historial</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Registrar en Mi Historial Analítico</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
      {/* Match Header Banner */}
      <div className="p-5 bg-[#0B0F17] border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200">{match.leagueName}</span>
            <span aria-hidden="true">·</span>
            <span>{match.country}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{match.date} · {match.startTime} COT (Hora Colombia)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>+{totalRushbetMarkets} Opciones Rushbet</span>
            </span>
            <span className={match.status === 'live' ? 'text-[#FF4B4B] font-bold' : 'text-slate-400'}>
              {match.status === 'live'
                ? `EN DIRECTO · ${match.minuteOrPeriod}`
                : match.status === 'finished'
                ? 'FINALIZADO'
                : `PRÓXIMO · ${match.startTime} COT`}
            </span>
          </div>
        </div>

        {/* Scoreboard Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-2">
          <div className="text-left">
            <div className="text-lg font-bold text-slate-100 tracking-tight">{match.homeTeam}</div>
            <div className="text-xs text-slate-400 mt-0.5 font-mono">
              {match.homeFormation ? `Esquema ${match.homeFormation} · ` : ''}
              {match.homeMarketValue || ''}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-4 font-mono text-3xl font-bold text-slate-100 tabular-nums">
              <span>{match.homeScore}</span>
              <span className="text-slate-600 text-xl">:</span>
              <span>{match.awayScore}</span>
            </div>
            {(match.homeSubScores || match.awaySubScores) && (
              <div className="text-xs font-mono text-sky-400 mt-1 tabular-nums">
                Parciales: {match.homeSubScores} — {match.awaySubScores}
              </div>
            )}
          </div>

          <div className="text-left md:text-right">
            <div className="text-lg font-bold text-slate-100 tracking-tight">{match.awayTeam}</div>
            <div className="text-xs text-slate-400 mt-0.5 font-mono">
              {match.awayFormation ? `Esquema ${match.awayFormation} · ` : ''}
              {match.awayMarketValue || ''}
            </div>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('predictions_odds')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'predictions_odds'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-[#111827] text-slate-300 hover:text-slate-100 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {match.sport === 'football'
                ? `Mercados de Fútbol Rushbet (${sportMarketGroups.length} Categorías · +${totalRushbetMarkets} Opciones)`
                : match.sport === 'tennis'
                ? `Mercados de Tenis Rushbet (${sportMarketGroups.length} Categorías · +${totalRushbetMarkets} Opciones)`
                : `Mercados de Baloncesto Rushbet (${sportMarketGroups.length} Categorías · +${totalRushbetMarkets} Opciones)`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outcome_probability')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'outcome_probability'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-[#111827] text-slate-300 hover:text-slate-100 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Probabilidad de Resultado (Wplay · Rushbet · Bet365)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats_events')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stats_events'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-[#111827] text-slate-300 hover:text-slate-100 border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Estadísticas Clave & Eventos ({match.events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lineups')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'lineups'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-[#111827] text-slate-300 hover:text-slate-100 border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Alineaciones & Análisis Radar de Jugadores</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sources'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-[#111827] text-slate-300 hover:text-slate-100 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Validación 5 Fuentes ({match.sourceVerifications.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="p-5">
        {activeTab === 'predictions_odds' && (
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {match.sport === 'football'
                      ? `01. Todas las Opciones de Apuesta del Mercado en Fútbol según Rushbet (${sportMarketGroups.length} Categorías · +${totalRushbetMarkets} Mercados)`
                      : match.sport === 'tennis'
                      ? `01. Todas las Opciones de Apuesta del Mercado en Tenis según Rushbet (${sportMarketGroups.length} Categorías · +${totalRushbetMarkets} Mercados)`
                      : `01. Todas las Opciones de Apuesta del Mercado en Baloncesto según Rushbet (${sportMarketGroups.length} Categorías · +${totalRushbetMarkets} Mercados)`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Haga clic en cada categoría oficial de Rushbet para desplegar todas las opciones de apuesta del mercado con su probabilidad de éxito, índice de confianza y mejor cuota entre Rushbet, Bet365 y Wplay.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={expandAllSportCategories}
                    className="px-3 py-1.5 rounded-lg bg-[#0B0F17] hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {expandedCategories.length === sportMarketGroups.length
                      ? 'Contraer Todas las Categorías'
                      : `Desplegar las ${sportMarketGroups.length} Categorías Rushbet`}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Unidades:</span>
                    <select
                      value={stakeUnits}
                      onChange={(e) => setStakeUnits(Number(e.target.value))}
                      className="bg-[#0B0F17] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 tabular-nums"
                    >
                      <option value={1}>1.0 u ($100k COP)</option>
                      <option value={1.5}>1.5 u ($150k COP)</option>
                      <option value={2}>2.0 u ($200k COP)</option>
                      <option value={3}>3.0 u ($300k COP)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Render the Official Rushbet Market Category Accordion Bars for Football, Tennis & Basketball */}
              <div className="space-y-2.5">
                {sportMarketGroups.map((group) => {
                  const isExpanded = expandedCategories.includes(group.category);
                  return (
                    <div key={group.category} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleCategory(group.category)}
                        className={`w-full px-5 py-3.5 rounded-xl flex items-center justify-between transition-all text-left border ${
                          isExpanded
                            ? 'bg-[#172C51] border-sky-500/50 shadow-md'
                            : 'bg-[#132544] hover:bg-[#193058] border-[#1F3761]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-white tracking-tight">
                            {group.category}
                          </span>
                          <span className="text-[11px] text-sky-300/80 font-mono hidden sm:inline">
                            · Mejor prob: {Math.max(...group.predictions.map((p) => p.calculatedProbability)).toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded bg-[#0B0F17]/70 text-xs font-mono font-semibold text-amber-300 tabular-nums border border-slate-700/80">
                            {group.badgeCount} opciones Rushbet
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-sky-300" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Predictions inside this Sport Category */}
                      {isExpanded && (
                        <div className="pl-2 sm:pl-4 space-y-2.5 pt-1 pb-2 border-l-2 border-sky-500/40">
                          {group.predictions.map((pred) => renderPredictionCard(pred))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stacked Bar Chart: Outcome Probability & Competitive Odds Comparison */}
            <OutcomeProbabilityStackedChart
              match={match}
              selectedBookmaker={selectedBookmaker}
              copiedPickId={copiedPickId}
              onCopyPick={onCopyPick}
              compact
            />

            {/* Bookmaker Odds & Reliability Auditor */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-semibold text-slate-100">
                  02. Auditoría de Fiabilidad de Cuotas (Rushbet · Bet365 · Wplay)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Verificación de Margen (Overround) y Estabilidad de Línea
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B0F17] border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                      <th className="py-2.5 px-3">Casa de Apuestas</th>
                      <th className="py-2.5 px-3 text-right">Local (1)</th>
                      <th className="py-2.5 px-3 text-right">Empate (X)</th>
                      <th className="py-2.5 px-3 text-right">Visitante (2)</th>
                      <th className="py-2.5 px-3">Línea Total</th>
                      <th className="py-2.5 px-3 text-right">Más (Over)</th>
                      <th className="py-2.5 px-3 text-right">Menos (Under)</th>
                      <th className="py-2.5 px-3 text-right">Margen Casa</th>
                      <th className="py-2.5 px-3 text-right">Fiabilidad Cuota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs font-mono tabular-nums">
                    {match.bookmakerOdds.map((bm) => {
                      const isHighlighted = selectedBookmaker === bm.bookmaker;
                      return (
                        <tr
                          key={bm.bookmaker}
                          className={`transition-colors ${
                            isHighlighted ? 'bg-emerald-500/10' : 'bg-[#0B0F17]/60 hover:bg-slate-900/80'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                            {bm.bookmakerName}
                            {isHighlighted && (
                              <span className="ml-2 text-[11px] font-normal text-emerald-400">
                                · Seleccionada
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-100 font-semibold">
                            {bm.homeOdds.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300">
                            {bm.drawOdds ? bm.drawOdds.toFixed(2) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300">
                            {bm.awayOdds.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-400">
                            {bm.overUnderLine}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                            {bm.overOdds.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300">
                            {bm.underOdds.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400">
                            {bm.marginPercent.toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-emerald-400 font-semibold">{bm.reliabilityIndex}%</span>
                            <span className="text-slate-500 ml-1 font-sans text-[11px]">
                              ({bm.movement === 'dropping_home' ? 'Tendencia Local' : 'Estable'})
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'outcome_probability' && (
          <OutcomeProbabilityStackedChart
            match={match}
            selectedBookmaker={selectedBookmaker}
            copiedPickId={copiedPickId}
            onCopyPick={onCopyPick}
          />
        )}

        {activeTab === 'stats_events' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 mb-3">
                Comparativa Estadística del Encuentro
              </h3>
              <div className="space-y-3 bg-[#0B0F17] p-4 rounded-lg border border-slate-800">
                {match.stats.map((st, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-slate-100 tabular-nums">
                        {st.homeValue}
                      </span>
                      <span className="text-slate-400">
                        {st.label}{' '}
                        <span className="text-[11px] text-slate-500">· {st.source}</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-100 tabular-nums">
                        {st.awayValue}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-200"
                        style={{ width: `${st.homePercent}%` }}
                      />
                      <div
                        className="bg-sky-500 h-full transition-all duration-200"
                        style={{ width: `${100 - st.homePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-100 mb-3">
                Cronología de Eventos Clave en Tiempo Real (Flashscore / SofaScore)
              </h3>
              <div className="bg-[#0B0F17] p-4 rounded-lg border border-slate-800 space-y-3">
                {match.events.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    El encuentro aún no ha iniciado. Los eventos en vivo aparecerán automáticamente al comenzar.
                  </div>
                ) : (
                  match.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-start justify-between gap-3 py-2 border-b border-slate-800/70 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums w-16 shrink-0">
                          {ev.minute}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-slate-100">
                            {ev.player}{' '}
                            <span className="text-slate-400 font-normal">
                              ({ev.team === 'home' ? match.homeTeam : match.awayTeam})
                            </span>
                          </div>
                          {ev.detail && (
                            <div className="text-xs text-slate-400 mt-0.5">{ev.detail}</div>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0 uppercase">
                        {ev.type === 'goal'
                          ? 'GOL'
                          : ev.type === 'yellow_card'
                          ? 'T. AMARILLA'
                          : ev.type === 'substitution'
                          ? 'CAMBIO'
                          : ev.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lineups' && (
          <div className="space-y-6">
            {/* Interactive Player Deep Analysis Radar Chart (Recharts) */}
            <PlayerDeepAnalysisRadar
              match={match}
              selectedHomePlayerNumber={selectedHomePlayerNum}
              selectedAwayPlayerNumber={selectedAwayPlayerNum}
              onSelectHomePlayer={(num) => setSelectedHomePlayerNum(num)}
              onSelectAwayPlayer={(num) => setSelectedAwayPlayerNum(num)}
            />

            {/* Clickable Lineup Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {match.homeTeam} {match.homeFormation ? `(${match.homeFormation})` : ''}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Haga clic en un jugador para compararlo en el Gráfico de Radar
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Valor: {match.homeMarketValue}
                  </span>
                </div>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0B0F17] border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Jugador</th>
                        <th className="py-2 px-3">Pos.</th>
                        <th className="py-2 px-3 text-right">Valor / Métrica</th>
                        <th className="py-2 px-3 text-right">Rating SofaScore</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-xs bg-[#0B0F17]/50">
                      {match.homeLineup.map((p) => {
                        const isSelected = selectedHomePlayerNum === p.number;
                        return (
                          <tr
                            key={p.number}
                            onClick={() => setSelectedHomePlayerNum(p.number)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-emerald-500/15 border-l-2 border-l-emerald-400'
                                : 'hover:bg-slate-900/70'
                            }`}
                          >
                            <td className="py-2 px-3 font-mono text-slate-400 tabular-nums">{p.number}</td>
                            <td className="py-2 px-3 font-medium text-slate-200">
                              {p.name}
                              {isSelected && (
                                <span className="ml-2 text-[10px] font-mono text-emerald-400">
                                  · En Radar
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-400">{p.position}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                              {p.marketValue || '—'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                              {p.rating.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {match.awayTeam} {match.awayFormation ? `(${match.awayFormation})` : ''}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Haga clic en un jugador para compararlo en el Gráfico de Radar
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Valor: {match.awayMarketValue}
                  </span>
                </div>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0B0F17] border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Jugador</th>
                        <th className="py-2 px-3">Pos.</th>
                        <th className="py-2 px-3 text-right">Valor / Métrica</th>
                        <th className="py-2 px-3 text-right">Rating SofaScore</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-xs bg-[#0B0F17]/50">
                      {match.awayLineup.map((p) => {
                        const isSelected = selectedAwayPlayerNum === p.number;
                        return (
                          <tr
                            key={p.number}
                            onClick={() => setSelectedAwayPlayerNum(p.number)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-sky-500/15 border-l-2 border-l-sky-400'
                                : 'hover:bg-slate-900/70'
                            }`}
                          >
                            <td className="py-2 px-3 font-mono text-slate-400 tabular-nums">{p.number}</td>
                            <td className="py-2 px-3 font-medium text-slate-200">
                              {p.name}
                              {isSelected && (
                                <span className="ml-2 text-[10px] font-mono text-sky-400">
                                  · En Radar
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-400">{p.position}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                              {p.marketValue || '—'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-sky-400 tabular-nums">
                              {p.rating.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Auditoría Cruzada de las 5 Fuentes Estadísticas (Tiempo Real)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Validación de consistencia de datos antes de emitir cualquier porcentaje de probabilidad.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {match.sourceVerifications.map((sv) => (
                <div
                  key={sv.source}
                  className="p-3.5 rounded-lg bg-[#0B0F17] border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-100">{sv.source}</span>
                      <span className="font-mono text-emerald-400 tabular-nums">
                        Consenso {sv.discrepancyScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">{sv.keyMetricLabel}</div>
                    <div className="text-sm font-semibold text-slate-200 mt-0.5 font-mono tabular-nums">
                      {sv.keyMetricValue}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <span>Estado: Sincronizado</span>
                    <span className="font-mono">{sv.lastSync}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
