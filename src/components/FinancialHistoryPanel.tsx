import React, { useState } from 'react';
import { BookmakerId, Match, SportType, TrackedAnalyticalRecord } from '../types/sports';
import { exportMonthlyExcelReport, exportMonthlyPDFReport } from '../utils/exportReports';
import {
  FileSpreadsheet,
  FileText,
  Wallet,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Lock
} from 'lucide-react';

interface FinancialHistoryPanelProps {
  records: TrackedAnalyticalRecord[];
  matches: Match[];
  initialBankrollCOP: number;
  onUpdateBankroll: (amount: number) => void;
  onUpdateRecordStatus: (id: string, status: 'won' | 'lost') => void;
  is2FAEnabled: boolean;
  is2FAVerifiedSession: boolean;
  onOpen2FAModal: () => void;
}

export const FinancialHistoryPanel: React.FC<FinancialHistoryPanelProps> = ({
  records,
  matches,
  initialBankrollCOP,
  onUpdateBankroll,
  onUpdateRecordStatus,
  is2FAEnabled,
  is2FAVerifiedSession,
  onOpen2FAModal
}) => {
  const [filterSport, setFilterSport] = useState<SportType | 'all'>('all');
  const [filterBookmaker, setFilterBookmaker] = useState<BookmakerId | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  const [bankrollInput, setBankrollInput] = useState<string>(initialBankrollCOP.toString());
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => {
    if (filterSport !== 'all' && r.sport !== filterSport) return false;
    if (filterBookmaker !== 'all' && r.bookmaker !== filterBookmaker) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const settledRecords = records.filter((r) => r.status === 'won' || r.status === 'lost');
  const wonCount = records.filter((r) => r.status === 'won').length;
  const hitRate = settledRecords.length > 0 ? (wonCount / settledRecords.length) * 100 : 0;
  const netProfitCOP = records.reduce((acc, r) => acc + r.profitLossCOP, 0);
  const totalStakedCOP = settledRecords.reduce((acc, r) => acc + r.simulatedStakeCOP, 0);
  const yieldPercent = totalStakedCOP > 0 ? (netProfitCOP / totalStakedCOP) * 100 : 0;
  const currentBalanceCOP = initialBankrollCOP + netProfitCOP;

  const handleApplyBankroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (is2FAEnabled && !is2FAVerifiedSession) {
      onOpen2FAModal();
      return;
    }
    const parsed = parseInt(bankrollInput.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 100000) {
      onUpdateBankroll(parsed);
    }
  };

  const handleExportPDF = () => {
    exportMonthlyPDFReport(records, matches, initialBankrollCOP);
    setExportFeedback('Reporte PDF Ejecutivo descargado exitosamente.');
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handleExportExcel = () => {
    exportMonthlyExcelReport(records, matches, initialBankrollCOP);
    setExportFeedback('Reporte Mensual Excel (.CSV UTF-8) descargado exitosamente.');
    setTimeout(() => setExportFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Bar & Monthly Report Export (Req 12 & 16) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-100">
                Panel de Gestión Financiera e Historial de Pronósticos
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Seguimiento analítico de rendimiento personal, ROI/Yield y auditoría de predicciones pasadas en Rushbet, Bet365 y Wplay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3.5 py-2 text-xs font-semibold bg-[#0B0F17] hover:bg-slate-800 text-slate-100 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Exportar Reporte Mensual (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Reporte Mensual (Excel)</span>
            </button>
          </div>
        </div>

        {exportFeedback && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
            <span>{exportFeedback}</span>
            <button onClick={() => setExportFeedback(null)} className="text-emerald-200 underline">
              Cerrar
            </button>
          </div>
        )}

        {/* Financial KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
          <div className="p-4 rounded-lg bg-[#0B0F17] border border-slate-800">
            <div className="text-xs text-slate-400">Balance Total Simulado</div>
            <div className="text-xl font-mono font-bold text-slate-100 tabular-nums mt-1">
              ${currentBalanceCOP.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">COP</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1 tabular-nums">
              Base Inicial: ${initialBankrollCOP.toLocaleString('es-CO')}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0F17] border border-slate-800">
            <div className="text-xs text-slate-400">Beneficio Neto Acumulado</div>
            <div
              className={`text-xl font-mono font-bold tabular-nums mt-1 ${
                netProfitCOP >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netProfitCOP >= 0 ? '+' : ''}${netProfitCOP.toLocaleString('es-CO')} <span className="text-xs font-normal">COP</span>
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Octubre 2026</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0F17] border border-slate-800">
            <div className="text-xs text-slate-400">Yield / ROI Estadístico</div>
            <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums mt-1">
              +{yieldPercent.toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1 tabular-nums">
              Volumen: ${totalStakedCOP.toLocaleString('es-CO')}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0F17] border border-slate-800">
            <div className="text-xs text-slate-400">Tasa de Acierto (Hit Rate)</div>
            <div className="text-xl font-mono font-bold text-sky-400 tabular-nums mt-1">
              {hitRate.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 tabular-nums">
              {wonCount} ganadas de {settledRecords.length} resueltas
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0F17] border border-slate-800">
            <form onSubmit={handleApplyBankroll} className="space-y-1.5">
              <label className="block text-xs text-slate-400">Ajustar Banca Base (COP)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={bankrollInput}
                  onChange={(e) => setBankrollInput(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 tabular-nums focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded transition-colors shrink-0 flex items-center gap-1"
                  title="Requiere sesión 2FA verificada"
                >
                  {is2FAEnabled && !is2FAVerifiedSession && <Lock className="w-3 h-3 text-amber-400" />}
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Detailed History Table (Req 8 & 18) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Historial Detallado de Predicciones y Simulaciones de Valor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Puede marcar como Acertada o Fallida cualquier predicción en curso para actualizar su balance en tiempo real.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value as SportType | 'all')}
              className="bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">Todos los Deportes</option>
              <option value="football">Fútbol</option>
              <option value="tennis">Tenis</option>
              <option value="basketball">Básquetbol</option>
            </select>

            <select
              value={filterBookmaker}
              onChange={(e) => setFilterBookmaker(e.target.value as BookmakerId | 'all')}
              className="bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">Todas las Casas</option>
              <option value="rushbet">Rushbet</option>
              <option value="bet365">Bet365</option>
              <option value="wplay">Wplay.co</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'won' | 'lost' | 'pending')}
              className="bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">Todos los Estados</option>
              <option value="won">Acertadas</option>
              <option value="lost">Fallidas</option>
              <option value="pending">En Curso</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0F17] border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Encuentro & Liga</th>
                <th className="py-2.5 px-3">Selección Sugerida</th>
                <th className="py-2.5 px-3">Casa</th>
                <th className="py-2.5 px-3 text-right">Cuota</th>
                <th className="py-2.5 px-3 text-right">Prob. Éxito</th>
                <th className="py-2.5 px-3 text-right">Confianza</th>
                <th className="py-2.5 px-3 text-right">Valor EV+</th>
                <th className="py-2.5 px-3 text-right">Unidades (COP)</th>
                <th className="py-2.5 px-3 text-center">Estado / Acción</th>
                <th className="py-2.5 px-3 text-right">Balance Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs font-mono tabular-nums bg-[#0B0F17]/50">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-900/75 transition-colors">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{rec.date}</td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-semibold text-slate-100">{rec.matchTitle}</div>
                    <div className="text-[11px] text-slate-400">{rec.leagueName}</div>
                  </td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-200">
                    {rec.marketSelection}
                  </td>
                  <td className="py-3 px-3 uppercase font-semibold text-amber-300">
                    {rec.bookmaker}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-100">
                    {rec.odds.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                    {rec.modelProbability.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right text-sky-400">
                    {rec.confidenceIndex}/100
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                    +{rec.expectedValue.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {rec.simulatedStakeUnits.toFixed(1)}u (${(rec.simulatedStakeCOP / 1000).toFixed(0)}k)
                  </td>
                  <td className="py-3 px-3 text-center font-sans">
                    {rec.status === 'pending' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5" /> En Curso
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateRecordStatus(rec.id, 'won')}
                          className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[11px] font-medium transition-colors"
                          title="Liquidar como Acertada"
                        >
                          Ganada
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateRecordStatus(rec.id, 'lost')}
                          className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[11px] font-medium transition-colors"
                          title="Liquidar como Fallida"
                        >
                          Perdida
                        </button>
                      </div>
                    ) : rec.status === 'won' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acertada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Fallida
                      </span>
                    )}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      rec.profitLossCOP > 0
                        ? 'text-emerald-400'
                        : rec.profitLossCOP < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {rec.profitLossCOP > 0 ? '+' : ''}
                    ${rec.profitLossCOP.toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
