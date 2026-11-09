import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminBrandingPanel } from './AdminBrandingPanel';
import { UserProfile, UserRole } from '../../types';
import { useToast } from '../common/Toast';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Users,
  ShieldCheck,
  BrainCircuit,
  Activity,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Server,
  Key,
  ShieldAlert,
  Building2,
  Sliders,
  Palette,
  School,
  Globe,
  Plus,
  BadgeCheck,
  Terminal,
  Radio,
  Cpu,
} from 'lucide-react';
import { ACCREDITED_INSTITUTIONS } from '../../lib/institutions';
import { Institution } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

import { getEnrolledCohort } from '../../data/cohortData';

interface AdminDashboardProps {
  initialUsers: UserProfile[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialUsers }) => {
  const { userProfile } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'system' | 'institutions' | 'branding'>('system');
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const cohort = getEnrolledCohort();
    const studentUsers: UserProfile[] = cohort.map((s) => ({
      userId: s.id,
      name: s.name,
      email: s.email,
      role: 'student',
      institutionName: s.college,
      department: s.stream,
      studentIdNumber: s.studentId,
      approvalStatus: 'approved',
      emailVerified: true,
      status: 'active',
      phone: s.phone,
      gender: s.gender as any,
      dob: s.dob,
      college: s.college,
      stream: s.stream,
      year: s.year,
      avatarUrl: s.avatarUrl,
      createdAt: new Date().toISOString(),
    }));

    const teacherUser: UserProfile = {
      userId: 'demo_teacher_jenkins',
      name: 'Dr. Sarah Jenkins',
      email: 'faculty@mitwpu.edu.in',
      role: 'teacher',
      institutionName: 'MIT  World Peace University (MIT - WPU)',
      department: 'Department of Computer Science & Engineering',
      facultyIdNumber: 'FAC-CS-1042',
      approvalStatus: 'approved',
      emailVerified: true,
      status: 'active',
      phone: '+1 (555) 876-5432',
      gender: 'female',
      dob: '1985-09-22',
      college: 'MIT  World Peace University (MIT - WPU)',
      stream: 'Computer Science & Engineering',
      year: 'Associate Professor',
      createdAt: new Date().toISOString(),
    };

    const adminUser: UserProfile = {
      userId: 'demo_admin_root',
      name: 'Consortium Director',
      email: 'admin@institution.edu',
      role: 'admin',
      institutionName: 'Consortium Central Directorate',
      department: 'Academic Governance & Accreditation',
      employeeId: 'GOV-SEC-ROOT-001',
      approvalStatus: 'approved',
      emailVerified: true,
      status: 'active',
      phone: '+1 (555) 000-1122',
      gender: 'male',
      dob: '1980-01-01',
      college: 'Consortium Central Directorate',
      stream: 'Academic Governance & Accreditation',
      year: 'Director General',
      createdAt: new Date().toISOString(),
    };

    const all = [...initialUsers];
    [teacherUser, adminUser, ...studentUsers].forEach((u) => {
      if (!all.some((existing) => existing.userId === u.userId || existing.email === u.email)) {
        all.push(u);
      }
    });
    return all;
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [institutionsList, setInstitutionsList] = useState<Institution[]>(ACCREDITED_INSTITUTIONS);
  const [newInstName, setNewInstName] = useState('');
  const [newInstDomain, setNewInstDomain] = useState('');
  const [newInstCode, setNewInstCode] = useState('');
  const [showAddInstModal, setShowAddInstModal] = useState(false);

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim() || !newInstDomain.trim()) return;

    const newInst: Institution = {
      id: `inst-${Date.now()}`,
      name: newInstName.trim(),
      shortCode: newInstCode.trim() || newInstName.slice(0, 4).toUpperCase(),
      officialEmailDomains: [newInstDomain.trim().toLowerCase()],
      type: 'university',
      location: 'Metropolitan Campus',
      studentCount: 1,
      teacherCount: 1,
      verified: true,
    };

    setInstitutionsList([newInst, ...institutionsList]);
    setNewInstName('');
    setNewInstDomain('');
    setNewInstCode('');
    setShowAddInstModal(false);
    showToast(`Institution "${newInst.name}" registered with official domain @${newInstDomain}!`, 'success');
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          showToast(`User status updated to ${newStatus}`, 'info');
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          showToast(`User role updated to ${newRole}`, 'info');
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const loaded: UserProfile[] = [];
          snap.forEach((d) => loaded.push(d.data() as UserProfile));
          setUsersList(loaded);
        }
      } catch {}
    };
    fetchRegisteredUsers();
  }, []);

  const auditLogs = [
    {
      actor: 'security-gateway',
      action: 'OTP Cryptographic Verification',
      details: 'Dispatched single-use 6-digit passcode to institutional domain via SMTP/Resend',
      time: 'Just now',
      level: 'normal',
    },
    {
      actor: 'system',
      action: 'Multi-Tenant Security Check',
      details: 'Privilege isolation enforced across student, educator, and governance scopes',
      time: '12 mins ago',
      level: 'normal',
    },
    {
      actor: 'security-monitor',
      action: 'Assessment Lock Mode',
      details: 'Focus monitor online: full-screen enforcement and tab-blur detection ready',
      time: '1 hour ago',
      level: 'normal',
    },
    {
      actor: 'proctor-engine',
      action: 'Integrity Telemetry',
      details: 'Proctor telemetry online: zero active integrity flags detected',
      time: '3 hours ago',
      level: 'normal',
    },
    {
      actor: userProfile?.email || 'admin@evalplatform.edu',
      action: 'Admin Governance Audit',
      details: 'Inspected role permissions and academic security policies',
      time: 'Active Session',
      level: 'normal',
    },
  ];

  return (
    <div className={`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Tactical Header with HUD Telemetry */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold tracking-wider text-amber-500">
            <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>ROOT GOVERNANCE & SECURITY COCKPIT</span>
            <span className={isDark ? "text-white/20" : "text-slate-300"}>/</span>
            <span className={isDark ? "text-slate-400" : "text-slate-600 font-medium"}>SYS-ADMIN-SEC-01</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-3`}>
            System Administration & Security Governance
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Global access controls, proctoring security alerts, institutional domain enforcement, and AI infrastructure telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`px-3.5 py-1.5 rounded-lg ${
            isDark ? 'bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          } border text-xs font-mono font-bold flex items-center gap-2 shadow-xs`}>
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
            <span>ALL SUB-SYSTEMS NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Admin Section Tabs - Hairline Glass Navigation */}
      <div className={`flex items-center gap-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} pb-2 overflow-x-auto`}>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap border ${
            activeTab === 'system'
              ? isDark
                ? 'bg-amber-400/15 border-amber-400/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs'
              : isDark
              ? 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/20'
              : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-amber-500" />
          <span>Accounts & Security Governance</span>
        </button>

        <button
          onClick={() => setActiveTab('institutions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap border ${
            activeTab === 'institutions'
              ? isDark
                ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                : 'bg-cyan-50 border-cyan-300 text-cyan-800 font-bold shadow-xs'
              : isDark
              ? 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/20'
              : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <School className={`w-4 h-4 ${isDark ? 'text-[#00F0FF]' : 'text-cyan-600'}`} />
          <span>Institutions & Domain Registry ({institutionsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap border ${
            activeTab === 'branding'
              ? isDark
                ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                : 'bg-purple-50 border-purple-300 text-purple-800 font-bold shadow-xs'
              : isDark
              ? 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/20'
              : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <span>Institution Brand Customization</span>
        </button>
      </div>

      {activeTab === 'institutions' ? (
        <div className={`${
          isDark
            ? 'bg-[#0A0D14]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
            : 'bg-white border-slate-200 shadow-sm'
        } p-6 sm:p-8 rounded-2xl border space-y-6 backdrop-blur-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#00F0FF]">
                <Radio className="w-3 h-3 text-[#00F0FF] animate-pulse" />
                <span>FEDERATED IDENTITY REGISTRY</span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                <School className="w-5 h-5 text-[#00F0FF]" />
                <span>City-Wide Institution Directory & Official Domain Registry</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage registered universities and autonomous colleges. User registration validates strictly against these authorized domains.
              </p>
            </div>

            <button
              onClick={() => setShowAddInstModal(!showAddInstModal)}
              className="px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-mono font-bold text-xs shadow-[0_0_25px_rgba(0,240,255,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>REGISTER INSTITUTION</span>
            </button>
          </div>

          <AnimatePresence>
            {showAddInstModal && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddInstitution}
                className="p-5 rounded-2xl bg-black/60 border border-[#00F0FF]/30 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.1)]"
              >
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00F0FF]" />
                  <span>REGISTER NEW ACCREDITED INSTITUTION & WILDCARD DOMAIN</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Institution Full Name (e.g. Pune City Tech College)"
                    value={newInstName}
                    onChange={(e) => setNewInstName(e.target.value)}
                    className="px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#0A0D14] text-white placeholder-slate-500 focus:outline-hidden focus:border-[#00F0FF] font-sans"
                  />
                  <input
                    type="text"
                    placeholder="Short Code (e.g. PCTC)"
                    value={newInstCode}
                    onChange={(e) => setNewInstCode(e.target.value)}
                    className="px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#0A0D14] text-white placeholder-slate-500 focus:outline-hidden focus:border-[#00F0FF] font-mono uppercase"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Official Domain (e.g. pctc.ac.in or college.edu)"
                    value={newInstDomain}
                    onChange={(e) => setNewInstDomain(e.target.value)}
                    className="px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-[#0A0D14] text-white placeholder-slate-500 focus:outline-hidden focus:border-[#00F0FF] font-mono"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddInstModal(false)}
                    className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
                  >
                    Authorize & Commit Domain
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutionsList.map((inst, instIdx) => (
              <div
                key={`${inst.id || 'inst'}-${instIdx}`}
                className={`p-5 rounded-2xl border ${
                  isDark
                    ? 'border-white/10 bg-white/[0.02] hover:border-[#00F0FF]/40 hover:bg-white/[0.04]'
                    : 'border-slate-200 bg-slate-50/70 hover:border-cyan-500/50 hover:bg-white shadow-2xs'
                } space-y-3.5 transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {inst.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isDark ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30' : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                      } border`}>
                        {inst.shortCode}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
                      {inst.location} · <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{inst.type.toUpperCase()}</span>
                    </p>
                  </div>

                  <span className={`flex items-center gap-1.5 text-[11px] font-mono font-bold ${
                    isDark ? 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
                  } px-2.5 py-1 rounded-lg border`}>
                    <BadgeCheck className="w-3.5 h-3.5" />
                    VERIFIED
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider block mb-1.5`}>
                    Authorized Email Domains:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inst.officialEmailDomains.map((domain, dIdx) => (
                      <span
                        key={dIdx}
                        className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg ${
                          isDark ? 'bg-black/60 border-white/10 text-[#00F0FF]' : 'bg-white border-slate-200 text-cyan-700 shadow-2xs'
                        } border flex items-center gap-1.5`}
                      >
                        <Globe className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                        <span>@{domain}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-2.5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-mono`}>
                  <span>Enrolled: <strong className={`${isDark ? 'text-white' : 'text-slate-900'} tabular-nums`}>{inst.studentCount.toLocaleString()}</strong> students</span>
                  <span>Faculty: <strong className={`${isDark ? 'text-white' : 'text-slate-900'} tabular-nums`}>{inst.teacherCount.toLocaleString()}</strong> chairs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'branding' ? (
        <div className={`${
          isDark
            ? 'bg-[#0A0D14]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-white'
            : 'bg-white border-slate-200 shadow-sm text-slate-900'
        } p-6 sm:p-8 rounded-2xl border space-y-6 backdrop-blur-xl`}>
          <div className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'} pb-4`}>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">
              <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>CAMPUS BRAND CONTROL</span>
            </div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <Palette className="w-5 h-5 text-amber-500" />
              <span>Institution Brand Identity & Theme Control</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Customize institution-wide branding: university name, logo mark, primary & secondary brand colors, and login page tagline.
            </p>
          </div>
          <AdminBrandingPanel />
        </div>
      ) : (
        <>
          {/* System Health & Security Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Registered Users */}
            <div className={`p-5 ${
              isDark
                ? 'bg-[#0A0D14]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
                : 'bg-white border-slate-200 shadow-sm'
            } rounded-2xl border backdrop-blur-xl group hover:border-[#00F0FF]/30 transition-colors`}>
              <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="tracking-wider uppercase">ACCOUNTS REGISTRY</span>
                <Users className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <div className={`mt-2 text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} font-mono tabular-nums tracking-tight`}>
                {usersList.length}
              </div>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} block mt-1 font-mono`}>
                Faculty, students & admins
              </span>
            </div>

            {/* Health & Uptime */}
            <div className={`p-5 ${
              isDark
                ? 'bg-[#0A0D14]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
                : 'bg-white border-slate-200 shadow-sm'
            } rounded-2xl border backdrop-blur-xl group hover:border-[#00FF88]/30 transition-colors`}>
              <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="tracking-wider uppercase">CORE UPTIME</span>
                <Activity className="w-4 h-4 text-[#00FF88]" />
              </div>
              <div className={`mt-2 text-3xl font-extrabold ${isDark ? 'text-[#00FF88]' : 'text-emerald-600'} font-mono tabular-nums tracking-tight`}>
                99.98%
              </div>
              <span className={`text-[11px] ${isDark ? 'text-[#00FF88]' : 'text-emerald-700 font-semibold'} block mt-1 font-mono flex items-center gap-1.5`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse"></span>
                All microservices nominal
              </span>
            </div>

            {/* Security Alerts */}
            <div className={`p-5 ${
              isDark
                ? 'bg-[#0A0D14]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
                : 'bg-white border-slate-200 shadow-sm'
            } rounded-2xl border backdrop-blur-xl group hover:border-rose-500/30 transition-colors`}>
              <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="tracking-wider uppercase">PROCTOR FLAGS</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div className={`mt-2 text-3xl font-extrabold ${isDark ? 'text-rose-400' : 'text-rose-600'} font-mono tabular-nums tracking-tight`}>
                2 Flagged
              </div>
              <span className={`text-[11px] ${isDark ? 'text-rose-300' : 'text-rose-600 font-semibold'} block mt-1 font-mono`}>
                Assessment Lock tab breaches
              </span>
            </div>

            {/* Security Rules State */}
            <div className={`p-5 ${
              isDark
                ? 'bg-[#0A0D14]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
                : 'bg-white border-slate-200 shadow-sm'
            } rounded-2xl border backdrop-blur-xl group hover:border-amber-400/30 transition-colors`}>
              <div className={`flex items-center justify-between text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="tracking-wider uppercase">ACCESS RULES</span>
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
              <div className={`mt-2 text-3xl font-extrabold ${isDark ? 'text-amber-400' : 'text-amber-600'} font-mono tabular-nums tracking-tight`}>
                Enforced
              </div>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} block mt-1 font-mono`}>
                RBAC privilege walls active
              </span>
            </div>
          </div>

          {/* User Directory Management */}
          <div className={`${
            isDark
              ? 'bg-[#0A0D14]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
              : 'bg-white border-slate-200 shadow-sm'
          } rounded-2xl border p-6 sm:p-7 space-y-6 backdrop-blur-xl`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} pb-4`}>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-1">
                  <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>IDENTITY ROSTER</span>
                </div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  User Accounts Directory
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                  Manage active student, faculty, and administrator accounts across all university departments.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className={`pl-9 pr-3.5 py-2 text-xs rounded-xl border ${
                      isDark
                        ? 'border-white/10 bg-black/60 text-white placeholder-slate-500 focus:border-amber-400'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                    } font-sans`}
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-xl border ${
                    isDark
                      ? 'border-white/10 bg-black/60 text-white focus:border-amber-400'
                      : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-500'
                  } font-mono cursor-pointer`}
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Faculty</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            <div className={`overflow-x-auto border ${isDark ? 'border-white/5' : 'border-slate-200'} rounded-xl`}>
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className={`border-b ${
                    isDark ? 'border-white/10 bg-white/[0.02] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                  } font-mono text-[10px] uppercase tracking-wider`}>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Official Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 font-mono text-xs">
                        No user accounts registered yet. Registered students, faculty, and administrators will appear here.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, uIdx) => (
                      <tr key={`${u.userId || 'user'}-${uIdx}`} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={`capitalize font-bold px-2 py-0.5 rounded text-[10px] border ${
                            u.role === 'admin'
                              ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                              : u.role === 'teacher'
                              ? 'bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]'
                              : 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={`text-[10px] font-bold flex items-center gap-1.5 ${
                            u.status === 'active' ? 'text-[#00FF88]' : 'text-rose-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-[#00FF88]' : 'bg-rose-400'}`}></span>
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(u.userId)}
                            className="text-[11px] font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/30 bg-white/[0.02] cursor-pointer transition-colors"
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Audit Logs */}
          <div className="bg-[#0A0D14]/90 rounded-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-6 sm:p-7 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <span>Real-Time Security & Telemetry Audit Trail</span>
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <Terminal className="w-3 h-3 text-[#00F0FF]" />
                <span>STREAM: ACTIVE</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-white/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[#00F0FF]">{log.actor}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 tabular-nums">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
