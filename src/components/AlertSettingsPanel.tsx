import React from 'react';
import { AlertSettingsConfig, BookmakerId, Match } from '../types/sports';
import { getFootballCategorizedPredictions } from '../utils/footballMarketsGenerator';
import {
  BellRing,
  Radio,
  TrendingUp,
  Volume2,
  Sliders,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface AlertSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertSettingsConfig;
  onUpdateConfig: (next: AlertSettingsConfig) => void;
  matches: Match[];
  onTestGoalAlert: () => void;
  onTestInvestmentAlert: () => void;
}

export const AlertSettingsPanel: React.FC<AlertSettingsPanelProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  matches,
  onTestGoalAlert,
  onTestInvestmentAlert
}) => {
  if (!isOpen) return null;

  // Count how many current predictions qualify for the user's configured Investment Opportunity threshold
  const qualifyingOpportunitiesCount = matches
    .flatMap((m) =>
      m.sport === 'football'
        ? getFootballCategorizedPredictions(m).flatMap((g) => g.predictions)
        : m.predictions
    )
    .filter(
      (p) =>
        p.expectedValuePercent >= config.investmentMinEVPercent &&
        p.confidenceIndex >= config.investmentMinConfidence &&
        p.calculatedProbability >= config.investmentMinProbability &&
        config.investmentBookmakers.includes(p.bestBookmaker)
    ).length;

  const toggleBookmaker = (bm: BookmakerId) => {
    const exists = config.investmentBookmakers.includes(bm);
    if (exists && config.investmentBookmakers.length === 1) return; // Keep at least 1
    const nextBms = exists
      ? config.investmentBookmakers.filter((b) => b !== bm)
      : [...config.investmentBookmakers, bm];
    onUpdateConfig({ ...config, investmentBookmakers: nextBms });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Configuración de Alertas Push y Umbrales de Valor (EV+%)
              </h2>
              <p className="text-xs text-slate-400">
                Personalice por separado las notificaciones de <strong className="text-[#FF4B4B]">Gol en Directo</strong> y las de <strong className="text-emerald-400">Oportunidad de Inversión (EV+)</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({ ...config, masterPushEnabled: !config.masterPushEnabled })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                config.masterPushEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Push Maestro: {config.masterPushEnabled ? 'ACTIVO' : 'PAUSADO'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dual Configuration Columns: 1. Alertas de Gol vs 2. Alertas de Oportunidad de Inversión */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* =================================================================
              COLUMNA 1: ALERTAS DE 'GOL' EN DIRECTO (ESTILO FLASHSCORE)
             ================================================================= */}
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#FF4B4B] animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-100">
                    1. Alertas de Gol en Directo
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({ ...config, goalAlertsEnabled: !config.goalAlertsEnabled })
                  }
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                    config.goalAlertsEnabled
                      ? 'bg-[#FF4B4B] text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {config.goalAlertsEnabled ? 'ACTIVAS' : 'OFF'}
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Dispara avisos instantáneos al segundo cuando ocurre un gol, revisión VAR o cambio de marcador en Flashscore y SofaScore, recalculando las cuotas en vivo.
              </p>

              {/* Toggle Options for Goal Alerts */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#111827] border border-slate-800/90 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Solo Equipos Favoritos (★)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Notificar únicamente goles de clubes marcados con estrella
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.goalOnlyFavorites}
                    onChange={(e) =>
                      onUpdateConfig({ ...config, goalOnlyFavorites: e.target.checked })
                    }
                    className="accent-[#FF4B4B] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#111827] border border-slate-800/90 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Incluir Tarjetas Rojas y Penaltis VAR
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Eventos críticos que alteran la probabilidad del partido
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.goalIncludeVarAndRedCards}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        goalIncludeVarAndRedCards: e.target.checked
                      })
                    }
                    className="accent-[#FF4B4B] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#111827] border border-slate-800/90 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#FF4B4B]" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        Pitido Sonoro de Gol (Flashscore)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Alerta auditiva de doble tono al anotar
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.goalSoundWhistle}
                    onChange={(e) =>
                      onUpdateConfig({ ...config, goalSoundWhistle: e.target.checked })
                    }
                    className="accent-[#FF4B4B] w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* Post-Goal EV+ Recalibration Threshold */}
                <div className="p-3 rounded-lg bg-[#111827] border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      Umbral EV+% Post-Gol Adjunto:
                    </span>
                    <span className="font-mono font-bold text-[#FF4B4B] tabular-nums">
                      ≥ +{config.goalPostRecalibrationMinEV.toFixed(1)}% EV
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={config.goalPostRecalibrationMinEV}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        goalPostRecalibrationMinEV: Number(e.target.value)
                      })
                    }
                    className="w-full accent-[#FF4B4B] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="text-[11px] text-slate-400">
                    Adjunta en la notificación del gol la mejor cuota recalculada si supera este margen.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onTestGoalAlert}
              className="w-full py-2.5 px-3 rounded-lg bg-[#FF4B4B]/20 hover:bg-[#FF4B4B]/30 text-[#FF4B4B] border border-[#FF4B4B]/40 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Probar Notificación Push de GOL Ahora</span>
            </button>
          </div>

          {/* =================================================================
              COLUMNA 2: ALERTAS DE 'OPORTUNIDAD DE INVERSIÓN' (VALOR EV+%)
             ================================================================= */}
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-emerald-500/30 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    2. Alertas de Oportunidad de Inversión
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      ...config,
                      investmentAlertsEnabled: !config.investmentAlertsEnabled
                    })
                  }
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                    config.investmentAlertsEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {config.investmentAlertsEnabled ? 'ACTIVAS' : 'OFF'}
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Detecta automáticamente discrepancias matemáticas donde la probabilidad real (FootyStats · SofaScore) supera la cuota ofrecida en Rushbet, Bet365 o Wplay.
              </p>

              {/* Specific EV+% Threshold Slider */}
              <div className="p-3 rounded-lg bg-[#111827] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    Umbral Mínimo de Valor (EV+%):
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                    +{config.investmentMinEVPercent.toFixed(1)}% EV
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={0.5}
                  value={config.investmentMinEVPercent}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      investmentMinEVPercent: Number(e.target.value)
                    })
                  }
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>+1.0% (Frecuente)</span>
                  <span>+7.5% (Óptimo)</span>
                  <span>+16.0% (Ultra Sharp)</span>
                </div>
              </div>

              {/* Minimum Confidence Index & Probability Thresholds */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Confianza Mín.</span>
                    <span className="font-mono font-bold text-sky-400 tabular-nums">
                      {config.investmentMinConfidence}/100
                    </span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={95}
                    step={1}
                    value={config.investmentMinConfidence}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        investmentMinConfidence: Number(e.target.value)
                      })
                    }
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Prob. Éxito Mín.</span>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      {config.investmentMinProbability}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={45}
                    max={85}
                    step={5}
                    value={config.investmentMinProbability}
                    onChange={(e) =>
                      onUpdateConfig({
                        ...config,
                        investmentMinProbability: Number(e.target.value)
                      })
                    }
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Bookmakers Monitored for Investment Alerts */}
              <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-300 font-medium">
                  Casas Monitoreadas para Oportunidades:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['rushbet', 'bet365', 'wplay'] as const).map((bm) => {
                    const active = config.investmentBookmakers.includes(bm);
                    return (
                      <button
                        key={bm}
                        type="button"
                        onClick={() => toggleBookmaker(bm)}
                        className={`py-1.5 px-2 rounded text-xs font-mono uppercase font-semibold border transition-colors ${
                          active
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-[#0B0F17] border-slate-800 text-slate-500'
                        }`}
                      >
                        {bm}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Match Count Matching Threshold */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Oportunidades activas con este filtro:</span>
                </span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {qualifyingOpportunitiesCount} mercados
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onTestInvestmentAlert}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Probar Alerta de Oportunidad de Inversión (EV+)</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#0B0F17] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Los umbrales configurados se aplican en tiempo real sin recargar la página (Hora Oficial Colombia COT).
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition-colors"
          >
            Guardar y Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
