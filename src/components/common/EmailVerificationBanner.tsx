import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { Mail, CheckCircle, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const EmailVerificationBanner: React.FC = () => {
  const { currentUser, userProfile, emailVerified, sendVerificationEmail, reloadUser } = useAuth();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  // If not logged in, or already verified, or demo admin bypass, do not show
  if (!userProfile || emailVerified || userProfile.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      showToast(`Verification link sent to ${userProfile.email}. Please check your college inbox.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to resend verification email.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const isVerified = await reloadUser();
      if (isVerified) {
        showToast('Institutional email verified successfully!', 'success');
      } else {
        showToast('Email not verified yet. Please check your inbox or spam folder for the link.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Status check failed.', 'error');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-[#0A0D14]/95 border-b border-amber-400/30 px-4 py-3 text-white backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-400/15 text-amber-400 shrink-0 border border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-amber-300">
              INSTITUTIONAL EMAIL VERIFICATION PENDING:
            </span>{' '}
            <span className="text-slate-300 font-sans">
              An official verification link was dispatched to{' '}
              <strong className="text-[#00F0FF] underline font-mono">{userProfile.email}</strong>.
              Verify to confirm your official college credentials.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50 cursor-pointer text-xs font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${sending ? 'animate-spin' : ''}`} />
            <span>{sending ? 'Sending...' : 'Resend Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF88]/15 hover:bg-[#00FF88]/25 text-[#00FF88] border border-[#00FF88]/40 transition-all disabled:opacity-50 cursor-pointer text-xs font-mono font-bold shadow-[0_0_15px_rgba(0,255,136,0.15)]"
          >
            <CheckCircle className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : "I'VE VERIFIED"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
