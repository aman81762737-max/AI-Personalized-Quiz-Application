import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, Radio } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  details?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, details?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = 'info', details?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, details }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-4 h-4 text-[#00FF88] shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
            error: <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
            info: <Info className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />,
          };

          const borders = {
            success: 'border-[#00FF88]/40 bg-[#0A0D14]/95 shadow-[0_0_20px_rgba(0,255,136,0.15)]',
            warning: 'border-amber-400/40 bg-[#0A0D14]/95 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
            error: 'border-rose-500/40 bg-[#0A0D14]/95 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
            info: 'border-[#00F0FF]/40 bg-[#0A0D14]/95 shadow-[0_0_20px_rgba(0,240,255,0.15)]',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borders[toast.type]} backdrop-blur-xl transition-all animate-in fade-in duration-200 text-white`}
            >
              {icons[toast.type]}
              <div className="flex-1">
                <p className="text-xs font-mono font-bold text-white tracking-wide">{toast.message}</p>
                {toast.details && <p className="text-[11px] text-slate-400 mt-1 font-sans">{toast.details}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white p-0.5 cursor-pointer transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
