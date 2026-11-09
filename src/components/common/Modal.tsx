import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  const { isDark } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full ${maxWidth} ${
          isDark
            ? 'bg-[#0A0D14]/95 border-white/10 text-white shadow-[0_24px_80px_rgba(0,0,0,0.9)]'
            : 'bg-white border-slate-300 text-slate-900 shadow-2xl'
        } rounded-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-all backdrop-blur-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
        } shrink-0`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse"></span>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>{title}</h3>
            </div>
            {subtitle && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono mt-1`}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer border ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-200'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={`p-6 overflow-y-auto flex-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{children}</div>
      </div>
    </div>
  );
};
