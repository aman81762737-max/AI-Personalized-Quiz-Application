import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Building,
  BookOpen,
  Calendar,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { StudentCohortRecord, StudentAttemptRecord } from '../../types';
import { StudentProgressionDrawer } from './StudentProgressionDrawer';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENT_COHORT, getEnrolledCohort } from '../../data/cohortData';
import { subscribeEnrolledCohort } from '../../services/cloudSyncService';

export const TeacherCohortView: React.FC = () => {
  const { isDark } = useTheme();
  const { userProfile, studentProfile } = useAuth();

  // Filters State: Open by default to display all enrolled students
  const [selectedCollege, setSelectedCollege] = useState<string>('All Colleges');
  const [selectedStream, setSelectedStream] = useState<string>('All Streams');
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Student for Progression Drawer
  const [selectedStudent, setSelectedStudent] = useState<StudentCohortRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Available Filter Options
  const collegeOptions = [
    'All Colleges',
    'MIT  World Peace University (MIT - WPU)',
    'Consortium Central Directorate',
    'Stanford University',
    'IIT Bombay',
  ];

  const streamOptions = [
    'All Streams',
    'Computer Science & Engineering',
    'Data Science & Artificial Intelligence',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
  ];

  const yearOptions = [
    'All Years',
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Graduate',
  ];

  // Live real-time synchronized cohort from Cloud Firestore
  const [allStudents, setAllStudents] = useState<StudentCohortRecord[]>(() => {
    return getEnrolledCohort(userProfile, studentProfile);
  });

  React.useEffect(() => {
    const unsub = subscribeEnrolledCohort((liveCohort) => {
      setAllStudents(liveCohort);
    });
    return () => unsub();
  }, []);

  // Filter students based on College, Stream, Year, and Search
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      // College Match (fuzzy on MIT/spaces)
      if (selectedCollege && selectedCollege !== 'All Colleges') {
        const normSelected = selectedCollege.toLowerCase().replace(/[\s\-]/g, '');
        const normStudent = s.college.toLowerCase().replace(/[\s\-]/g, '');
        if (!normStudent.includes(normSelected) && !normSelected.includes(normStudent)) return false;
      }

      // Stream Match
      if (selectedStream && selectedStream !== 'All Streams') {
        if (!s.stream.toLowerCase().includes(selectedStream.toLowerCase())) return false;
      }

      // Year Match
      if (selectedYear && selectedYear !== 'All Years') {
        if (!s.year.toLowerCase().includes(selectedYear.toLowerCase())) return false;
      }

      // Search Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesId = s.studentId.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesEmail) return false;
      }

      return true;
    });
  }, [allStudents, selectedCollege, selectedStream, selectedYear, searchQuery]);

  const handleOpenStudentDrawer = (s: StudentCohortRecord) => {
    setSelectedStudent(s);
    setDrawerOpen(true);
  };

  // Animation Variants for Staggered Cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <div className={`space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <Users className="w-4 h-4 text-[#00F0FF]" />
            </div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#00F0FF] uppercase font-bold">
              COHORT ROSTER & ATOM AI PROGRESSION TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Student Cohort Explorer
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-sans max-w-2xl`}>
            Filter students by institution college, academic stream, and year of study. Click any student to inspect attempted assignment marks, synthesize Atom AI diagnostic summaries, and inquire through the guarded pedagogical copilot.
          </p>
        </div>

        {/* Live Cohort Statistics */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`px-4 py-2.5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'} text-right`}>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
              Cohort Match Count
            </span>
            <span className="text-xl font-bold font-mono text-[#00F0FF] tabular-nums">
              {filteredStudents.length} Students
            </span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS: College, Stream, and Year */}
      <div className={`p-6 rounded-3xl border shadow-xl ${
        isDark ? 'bg-[#0B0F17]/90 border-white/10' : 'bg-white border-slate-200'
      } backdrop-blur-xl space-y-4`}>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4 text-[#00F0FF]" />
          <span>Cohort Filter Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. College Selector / Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Student's College / University *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="college-options"
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                placeholder="Enter or select college..."
                className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                } focus:outline-none focus:border-[#00F0FF] transition-colors`}
              />
              <datalist id="college-options">
                {collegeOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 2. Stream / Department Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#00FF88]" />
              <span>Student's Stream / Department *</span>
            </label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              } focus:outline-none focus:border-[#00FF88] transition-colors cursor-pointer`}
            >
              {streamOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 3. Year of Study Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Student's Academic Year *</span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              } focus:outline-none focus:border-amber-400 transition-colors cursor-pointer`}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Search & Active Filter Chips */}
        <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-slate-100'} flex flex-col sm:flex-row items-center justify-between gap-3`}>
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll number..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              } focus:outline-none focus:border-[#00F0FF] transition-colors`}
            />
          </div>

          {/* Preset Buttons for Quick Filtering */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-[10px] text-slate-400 uppercase">Presets:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCollege('MIT  World Peace University (MIT - WPU)');
                setSelectedStream('Computer Science & Engineering');
                setSelectedYear('3rd Year');
              }}
              className={`px-2.5 py-1 rounded-lg ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              } transition-colors cursor-pointer`}
            >
              CS 3rd Year
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCollege('MIT  World Peace University (MIT - WPU)');
                setSelectedStream('Data Science & Artificial Intelligence');
                setSelectedYear('4th Year');
              }}
              className={`px-2.5 py-1 rounded-lg ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              } transition-colors cursor-pointer`}
            >
              AI 4th Year
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCollege('All Colleges');
                setSelectedStream('All Streams');
                setSelectedYear('All Years');
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 rounded-lg ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
              } transition-colors cursor-pointer`}
            >
              Show All
            </button>
          </div>
        </div>
      </div>

      {/* ANIMATED STUDENT ROSTER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#00FF88] uppercase font-bold">
              QUALIFIED COHORT ROSTER ({filteredStudents.length} ENROLLED)
            </span>
          </div>
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Click any student card to view marks & launch Atom AI diagnostic
          </span>
        </div>

        {filteredStudents.length > 0 ? (
          <motion.div
            key={`${selectedCollege}-${selectedStream}-${selectedYear}-${searchQuery}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredStudents.map((s, sIdx) => (
              <motion.div
                key={`${s.id || 'student'}-${sIdx}`}
                variants={itemVariants}
                onClick={() => handleOpenStudentDrawer(s)}
                className={`group p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  isDark
                    ? 'bg-[#0B0F17]/80 border-white/10 hover:border-[#00F0FF]/50 hover:shadow-[0_10px_30px_rgba(0,240,255,0.15)]'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xl'
                }`}
              >
                {/* Holographic accent glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Top Card Strip: Avatar + Name + Roll */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative">
                      <div className="w-13 h-13 rounded-2xl overflow-hidden ring-2 ring-white/15 border border-white/20 bg-[#07090E] flex items-center justify-center shrink-0 shadow-md group-hover:ring-[#00F0FF]/50 transition-all">
                        {s.avatarUrl ? (
                          <img
                            src={s.avatarUrl}
                            alt={s.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-xl font-bold font-serif text-white">
                            {s.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="w-3 h-3 rounded-full bg-[#00FF88] ring-2 ring-[#0B0F17] absolute -bottom-0.5 -right-0.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-bold font-sans tracking-tight truncate group-hover:text-[#00F0FF] transition-colors">
                          {s.name}
                        </h3>
                        <span className="text-xs font-mono font-bold text-[#00FF88] shrink-0">
                          {s.overallPerformance}%
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {s.studentId}
                      </div>
                      <div className="text-[10px] font-mono text-[#00F0FF] truncate">
                        {s.year} · {s.stream}
                      </div>
                    </div>
                  </div>

                  {/* College Tag */}
                  <div className={`p-2 rounded-xl text-[10px] font-mono ${
                    isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'
                  } truncate flex items-center gap-1.5`}>
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{s.college}</span>
                  </div>

                  {/* Performance & Assessments Counter */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className={`p-2.5 rounded-xl border text-left ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">Assessments</span>
                      <span className="text-sm font-bold font-mono">{s.completedAssessments} Attempts</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border text-left ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">Atom Telemetry</span>
                      <span className="text-sm font-bold font-mono text-cyan-400">
                        {s.atomAiTelemetry?.totalEvents || 0} Events
                      </span>
                    </div>
                  </div>

                  {/* Struggle Gaps Preview */}
                  {s.weaknesses && s.weaknesses.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                        Flagged Remediation Focus:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.weaknesses.slice(0, 2).map((w) => (
                          <span
                            key={w}
                            className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300 truncate max-w-[150px]"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Link Footer */}
                  <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-slate-100'} flex items-center justify-between text-xs font-mono text-[#00F0FF] group-hover:underline`}>
                    <span>Inspect Progression Marks</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className={`p-16 text-center rounded-3xl border ${isDark ? 'border-white/10 bg-[#0B0F17]/50' : 'border-slate-200 bg-white'} space-y-3`}>
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold font-mono">No Students Match Active Filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
              Try adjusting the College, Stream, or Year dropdowns, or clear your search query to inspect students in other cohorts.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCollege('All Colleges');
                setSelectedStream('All Streams');
                setSelectedYear('All Years');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#00F0FF] text-black hover:bg-[#38bdf8] transition-all cursor-pointer shadow-md"
            >
              Reset Filters to All
            </button>
          </div>
        )}
      </div>

      {/* Slide-over Progression Drawer */}
      <StudentProgressionDrawer
        isOpen={drawerOpen}
        student={selectedStudent}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};
