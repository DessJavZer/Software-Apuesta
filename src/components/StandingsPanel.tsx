import React, { useState } from 'react';
import { LeagueStanding } from '../types/sports';
import { Trophy, RefreshCw } from 'lucide-react';

interface StandingsPanelProps {
  standings: LeagueStanding[];
  favoriteTeams: string[];
  onToggleFavoriteTeam: (teamName: string) => void;
}

export const StandingsPanel: React.FC<StandingsPanelProps> = ({
  standings,
  favoriteTeams,
  onToggleFavoriteTeam
}) => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(standings[0]?.leagueId || 'ucl');

  const currentStanding = standings.find((s) => s.leagueId === selectedLeagueId) || standings[0];

  if (!currentStanding) return null;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Tablas de Posiciones en Tiempo Real
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sincronización instantánea con Soccerway, FootyStats (xG) y Transfermarkt (Valor de Plantilla).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
          {standings.map((st) => (
            <button
              key={st.leagueId}
              type="button"
              onClick={() => setSelectedLeagueId(st.leagueId)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedLeagueId === st.leagueId
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              {st.leagueName.split('—')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          <span>Torneo: </span>
          <strong className="text-slate-200">{currentStanding.leagueName}</strong>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Fuente Primaria: </span>
          <strong className="text-emerald-400">{currentStanding.source}</strong>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-emerald-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{currentStanding.lastUpdated}</span>
        </div>
      </div>

      {/* Dense Data Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B0F17] border-b border-slate-800 text-[11px] font-semibold text-slate-400">
              <th className="py-2.5 px-3 w-12">Pos</th>
              <th className="py-2.5 px-3">Equipo / Club</th>
              <th className="py-2.5 px-3 text-right">PJ</th>
              <th className="py-2.5 px-3 text-right">G</th>
              <th className="py-2.5 px-3 text-right">E</th>
              <th className="py-2.5 px-3 text-right">P</th>
              <th className="py-2.5 px-3 text-right">GF / Pts+</th>
              <th className="py-2.5 px-3 text-right">GC / Pts-</th>
              <th className="py-2.5 px-3 text-right">Dif</th>
              <th className="py-2.5 px-3 text-right">xG / Eficiencia</th>
              <th className="py-2.5 px-3 text-right">Valor / Rating</th>
              <th className="py-2.5 px-3 text-center">Últimos 5</th>
              <th className="py-2.5 px-3 text-right">Puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs font-mono tabular-nums bg-[#0B0F17]/50">
            {currentStanding.rows.map((row) => {
              const isFav = favoriteTeams.includes(row.teamName);
              return (
                <tr key={row.position} className="hover:bg-slate-900/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-300">{row.position}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-100">{row.teamName}</span>
                      <button
                        type="button"
                        onClick={() => onToggleFavoriteTeam(row.teamName)}
                        className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                          isFav
                            ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {isFav ? '★ Favorito' : '☆ Seguir'}
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{row.played}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">{row.won}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{row.drawn}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">{row.lost}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{row.goalsFor}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{row.goalsAgainst}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>
                  <td className="py-2.5 px-3 text-right text-sky-400">
                    {row.xGPerMatch ? row.xGPerMatch.toFixed(2) : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{row.marketValue}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      {row.form.map((f, i) => (
                        <span
                          key={i}
                          className={`w-5 h-5 inline-flex items-center justify-center rounded text-[10px] font-bold ${
                            f === 'W'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : f === 'D'
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-base text-emerald-400">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
