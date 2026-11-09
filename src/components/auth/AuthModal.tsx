import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Mail, Lock, User as UserIcon, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';
import { validateInstitutionalEmail } from '../../lib/institutions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const domainValidation = validateInstitutionalEmail(cleanEmail);
    if (!domainValidation.isValid) {
      showToast(domainValidation.message || 'Only verified college / institutional email addresses (.edu, .ac.in, .edu.in) are authorized.', 'error');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await loginWithEmail(cleanEmail, password);
        showToast('Signed in successfully with college credentials', 'success');
        onClose();
      } else if (mode === 'register') {
        if (!name.trim()) {
          showToast('Please enter your full name', 'warning');
          setLoading(false);
          return;
        }
        await registerWithEmail(cleanEmail, password, name, role);
        showToast(`Account created as ${role}!`, 'success');
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(cleanEmail);
        showToast('Password reset link sent to your college email', 'info');
        setMode('login');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign In to Your Account' : mode === 'register' ? 'Create an Account' : 'Reset Password'}
      subtitle={
        mode === 'login'
          ? 'Enter your credentials to access your dashboard'
          : mode === 'register'
          ? 'Select whether you are joining as a Student or Teacher'
          : 'Enter your email to receive recovery instructions'
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith or Alex Taylor"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-hidden focus:border-blue-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-blue-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-cyan-400/25 caret-blue-600 dark:caret-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    role === 'student'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-950 dark:text-white font-extrabold shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Student</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300">Take exams & study</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    role === 'teacher'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-950 dark:text-white font-extrabold shadow-xs'
                      : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 ${role === 'teacher' ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Teacher</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300">Create & analyze</div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.edu"
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-hidden focus:border-blue-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-blue-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-cyan-400/25 caret-blue-600 dark:caret-cyan-400"
            />
          </div>
        </div>

        {mode !== 'reset' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-hidden focus:border-blue-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-blue-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-cyan-400/25 caret-blue-600 dark:caret-cyan-400"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-xs sm:text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all disabled:opacity-50 shadow-md cursor-pointer"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In with College Credentials' : mode === 'register' ? 'Register Institutional Account' : 'Send Reset Link'}
        </button>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-xs font-medium text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Restricted to accredited institutional email domains (.edu, .ac.in, .edu.in). Personal email providers are blocked.</span>
        </div>

        <div className="text-center pt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-extrabold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer ml-1"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-extrabold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
};
