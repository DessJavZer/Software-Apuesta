import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  is2FAEnabled: boolean;
  is2FAVerifiedSession: boolean;
  onVerifySuccess: () => void;
  onToggle2FA: (enabled: boolean) => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  is2FAEnabled,
  is2FAVerifiedSession,
  onVerifySuccess,
  onToggle2FA
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(['4', '8', '2', '9', '1', '6']);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('QEDG-9482-X7LP-M319');

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    setErrorMsg('');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Ingrese los 6 dígitos del código de autenticación TOTP.');
      return;
    }
    onVerifySuccess();
    onClose();
  };

  const regenerateDemoCode = () => {
    const randomDigits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString());
    setOtpDigits(randomDigits);
    setSecretKey(`QEDG-${Math.floor(1000 + Math.random() * 9000)}-V9KR-${Math.floor(1000 + Math.random() * 9000)}`);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-100">Seguridad de Cuenta · 2FA (TOTP)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-colors"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            La autenticación de dos factores (2FA) protege su historial analítico, configuración de banca y alertas personalizadas de valor estadístico (EV+).
          </p>

          <div className="flex items-center justify-between p-3 bg-[#0B0F17] border border-slate-800/90 rounded-lg">
            <div>
              <div className="text-xs font-medium text-slate-200">Estado de Protección 2FA</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {is2FAEnabled ? 'Requerido para exportar y modificar banca' : 'Desactivado temporalmente'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggle2FA(!is2FAEnabled)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                is2FAEnabled
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {is2FAEnabled ? '2FA Activo' : 'Activar 2FA'}
            </button>
          </div>

          <div className="p-3.5 bg-[#0B0F17] border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                Clave Secreta Autenticador (SHA-1)
              </span>
              <button
                type="button"
                onClick={regenerateDemoCode}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Sincronizar Token
              </button>
            </div>
            <div className="font-mono text-xs text-slate-200 tracking-wider bg-slate-900/90 px-3 py-2 rounded border border-slate-800 select-all">
              {secretKey}
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Código Temporal de 6 Dígitos (Google Authenticator / Authy)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    className="w-full h-11 text-center font-mono text-base font-semibold bg-[#0B0F17] border border-slate-700 focus:border-emerald-400 focus:outline-none rounded-lg text-slate-100 tabular-nums"
                  />
                ))}
              </div>
              {errorMsg && <p className="text-xs text-rose-400 mt-1.5">{errorMsg}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                {is2FAVerifiedSession ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Sesión verificada con 2FA</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Pendiente verificación de sesión</span>
                  </>
                )}
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap"
              >
                Verificar y Autorizar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
