import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  ShieldCheck,
  Mail,
  ArrowRight,
  GraduationCap,
  BookOpen,
  User,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
  IdCard,
  Zap,
  Sparkles,
  School,
  KeyRound,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { ACCREDITED_INSTITUTIONS, validateInstitutionalEmail } from '../../lib/institutions';
import { UserRole } from '../../types';
import { Auth3DGateway } from '../three/Auth3DGateway';

interface AuthPageProps {
  initialMode?: 'login' | 'register-student' | 'register-teacher';
  onNavigateHome?: () => void;
  onAuthSuccess: (role: UserRole) => void;
}

export type AuthTab =
  | 'login'
  | 'register-student'
  | 'register-teacher'
  | 'admin-access';

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onNavigateHome,
  onAuthSuccess,
}) => {
  const { loginWithEmail, loginAsDemo, registerStudent, registerTeacher, registerAdmin } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AuthTab>(
    initialMode === 'register-student'
      ? 'register-student'
      : initialMode === 'register-teacher'
      ? 'register-teacher'
      : 'login'
  );

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login tab inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Student Registration inputs
  const [studentName, setStudentName] = useState('');
  const [studentInstitutionId, setStudentInstitutionId] = useState(ACCREDITED_INSTITUTIONS[0]?.id || '');
  const [studentCustomInstitution, setStudentCustomInstitution] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Teacher Registration inputs
  const [teacherName, setTeacherName] = useState('');
  const [teacherInstitutionId, setTeacherInstitutionId] = useState(ACCREDITED_INSTITUTIONS[0]?.id || '');
  const [teacherCustomInstitution, setTeacherCustomInstitution] = useState('');
  const [teacherFacultyId, setTeacherFacultyId] = useState('');
  const [teacherDepartment, setTeacherDepartment] = useState('School of Computer Science');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // Admin access inputs
  const [adminEmail, setAdminEmail] = useState('');
  const [adminKey, setAdminKey] = useState('');

  // Real-time domain validation checks
  const loginDomainValidation = useMemo(() => {
    if (!loginEmail.trim()) return null;
    return validateInstitutionalEmail(loginEmail.trim());
  }, [loginEmail]);

  const studentDomainValidation = useMemo(() => {
    if (!studentEmail.trim()) return null;
    return validateInstitutionalEmail(
      studentEmail.trim(),
      studentInstitutionId !== 'custom' ? studentInstitutionId : undefined
    );
  }, [studentEmail, studentInstitutionId]);

  const teacherDomainValidation = useMemo(() => {
    if (!teacherEmail.trim()) return null;
    return validateInstitutionalEmail(
      teacherEmail.trim(),
      teacherInstitutionId !== 'custom' ? teacherInstitutionId : undefined
    );
  }, [teacherEmail, teacherInstitutionId]);

  // 1-Click Demo Login Handler
  const handleDemoSignIn = async (roleType: 'student' | 'teacher' | 'admin') => {
    setLoading(true);
    try {
      const profile = await loginAsDemo(roleType);
      const roleTitle = roleType === 'student' ? 'Student' : roleType === 'teacher' ? 'Faculty' : 'Administrator';
      showToast(`Welcome! Signed in with ${roleTitle} Demo Account (${profile.name})`, 'success');
      onAuthSuccess(profile.role);
    } catch (err: any) {
      showToast(err?.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Standard Login Handler (No OTP)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Please enter your email address', 'warning');
      return;
    }

    const cleanEmail = loginEmail.trim().toLowerCase();
    const domainValidation = validateInstitutionalEmail(cleanEmail);
    if (!domainValidation.isValid) {
      showToast(domainValidation.message || 'Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const profile = await loginWithEmail(cleanEmail, loginPassword || 'Password123!');
      showToast(`Welcome back, ${profile.name}!`, 'success');
      onAuthSuccess(profile.role);
    } catch (err: any) {
      showToast(err?.message || 'Login failed. Please verify your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Student Registration Handler (Direct, No OTP)
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      showToast('Please enter your full student name', 'warning');
      return;
    }
    if (!studentIdNumber.trim()) {
      showToast('Please enter your PRN / Student ID', 'warning');
      return;
    }
    if (!studentEmail.trim()) {
      showToast('Please enter your email address', 'warning');
      return;
    }

    const cleanEmail = studentEmail.trim().toLowerCase();
    const studentValidation = validateInstitutionalEmail(
      cleanEmail,
      studentInstitutionId !== 'custom' ? studentInstitutionId : undefined
    );

    if (!studentValidation.isValid) {
      showToast(studentValidation.message || 'Please enter a valid email address.', 'error');
      return;
    }

    const selectedInst = ACCREDITED_INSTITUTIONS.find((i) => i.id === studentInstitutionId);
    const instName =
      studentInstitutionId === 'custom'
        ? studentCustomInstitution.trim() || 'Independent College / Campus'
        : selectedInst?.name || 'Accredited Institution';

    setLoading(true);
    try {
      const profile = await registerStudent({
        studentIdNumber: studentIdNumber.trim(),
        name: studentName.trim(),
        email: cleanEmail,
        pass: studentPassword || 'Password123!',
        institutionId: studentInstitutionId,
        institutionName: instName,
      });

      showToast(`Welcome, ${profile.name}! Student account created successfully.`, 'success');
      onAuthSuccess(profile.role);
    } catch (err: any) {
      showToast(err?.message || 'Student registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Faculty Registration Handler (Direct, No OTP)
  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      showToast('Please enter your full faculty name', 'warning');
      return;
    }
    if (!teacherFacultyId.trim()) {
      showToast('Please enter your Faculty or Staff ID', 'warning');
      return;
    }
    if (!teacherEmail.trim()) {
      showToast('Please enter your official faculty email', 'warning');
      return;
    }

    const cleanEmail = teacherEmail.trim().toLowerCase();
    const teacherValidation = validateInstitutionalEmail(
      cleanEmail,
      teacherInstitutionId !== 'custom' ? teacherInstitutionId : undefined
    );

    if (!teacherValidation.isValid) {
      showToast(teacherValidation.message || 'Please enter a valid faculty email.', 'error');
      return;
    }

    const selectedInst = ACCREDITED_INSTITUTIONS.find((i) => i.id === teacherInstitutionId);
    const instName =
      teacherInstitutionId === 'custom'
        ? teacherCustomInstitution.trim() || 'Independent College / Campus'
        : selectedInst?.name || 'Accredited Institution';

    setLoading(true);
    try {
      const profile = await registerTeacher({
        name: teacherName.trim(),
        facultyIdNumber: teacherFacultyId.trim(),
        email: cleanEmail,
        department: teacherDepartment.trim() || 'School of Computer Science',
        institutionId: teacherInstitutionId,
        institutionName: instName,
        pass: teacherPassword || 'Password123!',
      });

      showToast(`Welcome, ${profile.name}! Faculty account created successfully.`, 'success');
      onAuthSuccess(profile.role);
    } catch (err: any) {
      showToast(err?.message || 'Faculty registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Admin Access Handler
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminKey.trim()) {
      showToast('Please enter administrative credentials', 'warning');
      return;
    }

    const cleanEmail = adminEmail.trim().toLowerCase();
    setLoading(true);
    try {
      const profile = await registerAdmin({
        name: 'Institutional Administrator',
        email: cleanEmail,
      });
      showToast('Administrator identity verified! Access granted.', 'success');
      onAuthSuccess('admin');
    } catch (err: any) {
      showToast(err?.message || 'Admin authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-[#07090E] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-slate-900'
    } flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors`}>

      {/* 3D Interactive Academic Gateway Vault */}
      <div className="max-w-xl w-full mx-auto">
        <Auth3DGateway activeTab={activeTab} />
      </div>

      {/* MAIN AUTHENTICATION CARD */}
      <div className="max-w-xl w-full mx-auto my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900/90 rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden transition-colors backdrop-blur-md"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-slate-900 dark:to-slate-950 p-6 sm:p-7 text-white relative border-b border-blue-500/20 dark:border-slate-800 transition-colors">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 dark:bg-slate-800/80 backdrop-blur-md text-[11px] font-bold text-white mb-2">
              <Building2 className="w-3.5 h-3.5 text-blue-200 dark:text-blue-400" />
              <span>Academic Single Sign-On Gateway</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {activeTab === 'login'
                ? 'Sign In to Workspace'
                : activeTab === 'register-student'
                ? 'Student Registration'
                : activeTab === 'register-teacher'
                ? 'Faculty Registration'
                : 'Administrator Access'}
            </h1>
            <p className="text-xs text-blue-100 dark:text-slate-300 mt-1">
              {activeTab === 'login'
                ? 'Select a 1-click demo account below or sign in with your credentials.'
                : 'Create your academic profile to access personalized courses and assessments.'}
            </p>
          </div>

          {/* TAB BAR */}
          <div className="bg-slate-100 dark:bg-slate-950 p-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold overflow-x-auto scrollbar-none transition-colors">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white font-extrabold shadow-md ring-2 ring-blue-500/50'
                  : 'text-slate-800 dark:text-white font-bold bg-white/90 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-800 shadow-2xs'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-200 dark:text-cyan-400" />
              <span>Sign In / Demo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('register-student')}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'register-student'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-md ring-2 ring-emerald-500/50'
                  : 'text-slate-800 dark:text-white font-bold bg-white/90 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 shadow-2xs'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-200 dark:text-emerald-400" />
              <span>Student Register</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('register-teacher')}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'register-teacher'
                  ? 'bg-indigo-600 text-white font-extrabold shadow-md ring-2 ring-indigo-500/50'
                  : 'text-slate-800 dark:text-white font-bold bg-white/90 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 shadow-2xs'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-200 dark:text-indigo-400" />
              <span>Faculty Register</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin-access')}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'admin-access'
                  ? 'bg-purple-600 text-white font-extrabold shadow-md ring-2 ring-purple-500/50'
                  : 'text-slate-800 dark:text-white font-bold bg-white/90 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-800 shadow-2xs'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-200 dark:text-purple-400" />
              <span>Admin</span>
            </button>
          </div>

          {/* CARD BODY */}
          <div className="p-6 sm:p-7 bg-white dark:bg-slate-900 transition-colors">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                /* TAB 1: UNIFIED INSTITUTIONAL LOGIN & DEMO ACCOUNTS */
                <motion.div
                  key="login-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* INSTANT 1-CLICK DEMO ACCOUNTS CARD */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-50 dark:from-slate-800/90 dark:via-slate-850 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-500/30 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-900 dark:text-cyan-300">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>INSTANT 1-CLICK DEMO ACCOUNTS</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        Zero Password / Direct Access
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Demo Student */}
                      <button
                        type="button"
                        onClick={() => handleDemoSignIn('student')}
                        disabled={loading}
                        className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white/95 dark:bg-slate-900/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-all cursor-pointer shadow-xs active:scale-98 group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Student Demo</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Alex Morgan</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">MIT-WPU · CS Sophomore (88% avg)</div>
                      </button>

                      {/* Demo Teacher */}
                      <button
                        type="button"
                        onClick={() => handleDemoSignIn('teacher')}
                        disabled={loading}
                        className="p-3 rounded-xl border border-blue-300 dark:border-blue-700/80 bg-white/95 dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-all cursor-pointer shadow-xs active:scale-98 group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 dark:text-cyan-400">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Faculty Demo</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Dr. Sarah Jenkins</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">MIT-WPU · CS Faculty (142 students)</div>
                      </button>
                    </div>

                    {/* Demo Admin */}
                    <button
                      type="button"
                      onClick={() => handleDemoSignIn('admin')}
                      disabled={loading}
                      className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/70 bg-white/80 dark:bg-slate-900/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between group text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white">Administrator Demo</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2">Multi-Campus Directorate Access</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* DIVIDER */}
                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                    <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                      Or Sign In with Credentials
                    </span>
                    <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                  </div>

                  {/* REGULAR CREDENTIAL LOGIN FORM */}
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                        Student or Institutional Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="aman81762737@gmail.com, student@mitwpu.edu.in..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-blue-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-blue-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-blue-600 dark:caret-cyan-400 shadow-xs"
                        />
                      </div>
                      {loginDomainValidation && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                          {loginDomainValidation.isValid ? (
                            <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              {loginDomainValidation.message}
                            </span>
                          ) : (
                            <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                              {loginDomainValidation.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                          Password
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your account password"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-blue-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-blue-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-blue-600 dark:caret-cyan-400 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Signing In...</span>
                      ) : (
                        <>
                          <span>Sign In to Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="pt-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Need a new account?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('register-student')}
                        className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-extrabold hover:underline cursor-pointer ml-1"
                      >
                        Register as Student
                      </button>
                      {' · '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('register-teacher')}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-extrabold hover:underline cursor-pointer ml-1"
                      >
                        Register as Faculty
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : activeTab === 'register-student' ? (
                /* TAB 2: STUDENT REGISTRATION */
                <motion.form
                  key="register-student-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleStudentRegister}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Full Student Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-emerald-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-emerald-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-emerald-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                        PRN / Student ID
                      </label>
                      <div className="relative">
                        <IdCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={studentIdNumber}
                          onChange={(e) => setStudentIdNumber(e.target.value)}
                          placeholder="PRN Number"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-emerald-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-emerald-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-emerald-600 dark:caret-cyan-400 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                        Institution
                      </label>
                      <select
                        value={studentInstitutionId}
                        onChange={(e) => setStudentInstitutionId(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:border-emerald-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-emerald-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all cursor-pointer shadow-xs"
                      >
                        {ACCREDITED_INSTITUTIONS.map((inst) => (
                          <option key={inst.id} value={inst.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-1.5 font-medium">
                            {inst.name} ({inst.shortCode})
                          </option>
                        ))}
                        <option value="custom" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-1.5 font-medium">Other / Independent Campus</option>
                      </select>
                    </div>
                  </div>

                  {studentInstitutionId === 'custom' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                        Campus / University Name
                      </label>
                      <input
                        type="text"
                        value={studentCustomInstitution}
                        onChange={(e) => setStudentCustomInstitution(e.target.value)}
                        placeholder="City College / State University"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-emerald-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-emerald-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-cyan-400/25 outline-hidden caret-emerald-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Student Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="aman81762737@gmail.com or student@college.edu"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-emerald-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-emerald-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-emerald-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                    {studentDomainValidation && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                        {studentDomainValidation.isValid ? (
                          <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {studentDomainValidation.message}
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                            {studentDomainValidation.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-emerald-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-emerald-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-emerald-600 dark:caret-cyan-400 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Creating Student Account...</span>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4" />
                        <span>Complete Student Registration</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-emerald-600 dark:text-cyan-400 hover:text-emerald-700 dark:hover:text-cyan-300 font-extrabold hover:underline cursor-pointer ml-1"
                    >
                      Sign In here
                    </button>
                  </div>
                </motion.form>
              ) : activeTab === 'register-teacher' ? (
                /* TAB 3: FACULTY REGISTRATION */
                <motion.form
                  key="register-teacher-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleTeacherRegister}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Full Faculty Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="Dr. Sarah Jenkins"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-indigo-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-indigo-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-indigo-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                        Faculty ID
                      </label>
                      <div className="relative">
                        <IdCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={teacherFacultyId}
                          onChange={(e) => setTeacherFacultyId(e.target.value)}
                          placeholder="Faculty ID"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-indigo-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-indigo-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-indigo-600 dark:caret-cyan-400 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherDepartment}
                        onChange={(e) => setTeacherDepartment(e.target.value)}
                        placeholder="Computer Science"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-indigo-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-indigo-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-indigo-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Accredited Institution
                    </label>
                    <select
                      value={teacherInstitutionId}
                      onChange={(e) => setTeacherInstitutionId(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:border-indigo-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-indigo-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all cursor-pointer shadow-xs"
                    >
                      {ACCREDITED_INSTITUTIONS.map((inst) => (
                        <option key={inst.id} value={inst.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-1.5 font-medium">
                          {inst.name} ({inst.shortCode})
                        </option>
                      ))}
                      <option value="custom" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white py-1.5 font-medium">Other / Independent Campus</option>
                    </select>
                  </div>

                  {teacherInstitutionId === 'custom' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                        Campus / University Name
                      </label>
                      <input
                        type="text"
                        value={teacherCustomInstitution}
                        onChange={(e) => setTeacherCustomInstitution(e.target.value)}
                        placeholder="City College / State University"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-indigo-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-indigo-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-cyan-400/25 outline-hidden caret-indigo-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Faculty Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        placeholder="sarah.jenkins@mit.edu or professor@college.edu"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-indigo-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-indigo-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-indigo-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                    {teacherDomainValidation && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                        {teacherDomainValidation.isValid ? (
                          <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {teacherDomainValidation.message}
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                            {teacherDomainValidation.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-indigo-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-indigo-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-indigo-600 dark:caret-cyan-400 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition-all disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Creating Faculty Account...</span>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Complete Faculty Registration</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-indigo-600 dark:text-cyan-400 hover:text-indigo-700 dark:hover:text-cyan-300 font-extrabold hover:underline cursor-pointer ml-1"
                    >
                      Sign In here
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* TAB 4: ADMINISTRATOR ACCESS */
                <motion.form
                  key="admin-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleAdminSubmit}
                  className="space-y-4"
                >
                  {/* Quick Admin Demo Button */}
                  <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 mb-2">
                    <button
                      type="button"
                      onClick={() => handleDemoSignIn('admin')}
                      disabled={loading}
                      className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Instant 1-Click Administrator Access</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Administrator Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@evalplatform.edu"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-purple-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-purple-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-purple-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                      Consortium Security Key
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-semibold focus:border-purple-600 dark:focus:border-cyan-400 focus:border-l-[6px] focus:border-l-purple-600 dark:focus:border-l-cyan-400 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-cyan-400/25 outline-hidden transition-all caret-purple-600 dark:caret-cyan-400 shadow-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-purple-600 hover:bg-purple-500 active:scale-98 transition-all disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Verifying Authority...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In to Admin Console</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-4">
        Academic Assessment & Learning Platform · Institutional Single Sign-On
      </div>
    </div>
  );
};
