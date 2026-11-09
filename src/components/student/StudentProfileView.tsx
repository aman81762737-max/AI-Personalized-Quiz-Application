import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { SecurityPassportCard } from '../common/SecurityPassportCard';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Pencil,
  Camera,
  Save,
  CheckCircle2,
  Target,
  FileText,
  MessageSquare,
} from 'lucide-react';

interface StudentProfileViewProps {
  onNavigate?: (view: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ onNavigate }) => {
  const { userProfile, studentProfile, updateUserProfile, updateStudentProfile } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: userProfile?.name || 'Alex Morgan',
    email: userProfile?.email || 'alex.morgan@student.edu',
    phone: userProfile?.phone || '+1 (555) 329-8492',
    gender: userProfile?.gender || 'non_binary',
    dob: userProfile?.dob || '2004-03-15',
    college: userProfile?.college || userProfile?.institutionName || 'MIT  World Peace University (MIT - WPU)',
    stream: userProfile?.stream || userProfile?.department || 'B.Tech Computer Science & Engineering',
    year: userProfile?.year || '3rd Year (Junior)',
    studentIdNumber: userProfile?.studentIdNumber || userProfile?.employeeId || 'PRN-2026-CS-8492',
    bio: userProfile?.bio || 'Undergraduate computer science scholar focusing on algorithmic invariants, competitive graph algorithms, and distributed systems.',
    avatarUrl: userProfile?.avatarUrl || userProfile?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || 'Alex Morgan',
        email: userProfile.email || 'alex.morgan@student.edu',
        phone: userProfile.phone || '+1 (555) 329-8492',
        gender: userProfile.gender || 'non_binary',
        dob: userProfile.dob || '2004-03-15',
        college: userProfile.college || userProfile.institutionName || 'MIT  World Peace University (MIT - WPU)',
        stream: userProfile.stream || userProfile.department || 'B.Tech Computer Science & Engineering',
        year: userProfile.year || '3rd Year (Junior)',
        studentIdNumber: userProfile.studentIdNumber || userProfile.employeeId || 'PRN-2026-CS-8492',
        bio: userProfile.bio || 'Undergraduate computer science scholar focusing on algorithmic invariants, competitive graph algorithms, and distributed systems.',
        avatarUrl: userProfile.avatarUrl || userProfile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      });
    }
  }, [userProfile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, avatarUrl: result }));
      showToast('Profile photo updated from your computer! Click Save to apply.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dob: formData.dob,
        college: formData.college.trim(),
        institutionName: formData.college.trim(),
        stream: formData.stream.trim(),
        department: formData.stream.trim(),
        year: formData.year.trim(),
        studentIdNumber: formData.studentIdNumber.trim(),
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl,
        profilePhoto: formData.avatarUrl,
      });

      if (updateStudentProfile && studentProfile) {
        await updateStudentProfile({
          ...studentProfile,
        });
      }

      showToast('General profile information saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Hidden file input for pencil icon upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Sovereign Credential Passport Preview */}
      <section className="space-y-4">
        <div className={`flex items-center justify-between border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'} pb-3`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono tracking-[0.3em] ${isDark ? 'text-[#00F0FF]' : 'text-blue-600 font-bold'} uppercase`}>
              01 / SCHOLAR SOVEREIGN CREDENTIAL
            </span>
          </div>
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'} uppercase tracking-widest`}>
            GENERAL INFORMATION
          </span>
        </div>

        <SecurityPassportCard
          role="student"
          name={userProfile?.name || 'Alex Morgan'}
          idNumber={userProfile?.studentIdNumber || 'PRN-2026-CS-8492'}
          email={userProfile?.email || 'alex.morgan@student.edu'}
          title="UNDERGRADUATE SCHOLAR · COMPUTER SCIENCE"
          subTitle={`${userProfile?.college || 'MIT  World Peace University (MIT - WPU)'} · ${userProfile?.stream || 'Computer Science & Engineering'}`}
          clearanceLevel="CLEARANCE LEVEL 1 (VERIFIED)"
          statusText="ACTIVE SCHOLAR"
          avatarUrl={formData.avatarUrl || userProfile?.avatarUrl || userProfile?.profilePhoto}
          phone={userProfile?.phone}
          gender={userProfile?.gender}
          dob={userProfile?.dob}
          college={userProfile?.college}
          stream={userProfile?.stream}
          year={userProfile?.year}
          onEditProfile={() => {
            document.getElementById('profile-edit-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          metrics={[]}
          accentColor="#00F0FF"
          foilType="cyan"
        />
      </section>

      {/* Quick Actions UI Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className={`text-xs font-mono font-bold tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              SCHOLAR QUICK ACTIONS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            DIRECT WORKFLOW JUMPERS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Active Exam Room */}
          <button
            type="button"
            onClick={() => onNavigate?.('assessments')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group ${
              isDark
                ? 'bg-[#0B0F17]/80 border-white/10 hover:border-[#00F0FF]/50 hover:bg-white/[0.03]'
                : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#00F0FF] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Open Room →
              </span>
            </div>
            <div className="mt-4">
              <h4 className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-[#00F0FF] transition-colors`}>
                Active Exam Room
              </h4>
              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Launch timed proctored examinations and review verified diagnostic results.
              </p>
            </div>
          </button>

          {/* Action 2: Adaptive Remedial Drill */}
          <button
            type="button"
            onClick={() => onNavigate?.('practice')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group ${
              isDark
                ? 'bg-[#0B0F17]/80 border-white/10 hover:border-emerald-400/50 hover:bg-white/[0.03]'
                : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Practice →
              </span>
            </div>
            <div className="mt-4">
              <h4 className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-emerald-400 transition-colors`}>
                Adaptive Drill
              </h4>
              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Target identified knowledge gaps with AI-calibrated practice items and instant feedback.
              </p>
            </div>
          </button>

          {/* Action 3: Socratic AI Tutor */}
          <button
            type="button"
            onClick={() => onNavigate?.('ai-tutor')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group ${
              isDark
                ? 'bg-[#0B0F17]/80 border-white/10 hover:border-purple-400/50 hover:bg-white/[0.03]'
                : 'bg-white border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Consult Tutor →
              </span>
            </div>
            <div className="mt-4">
              <h4 className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-purple-400 transition-colors`}>
                Socratic AI Tutor
              </h4>
              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Engage in grounded syllabus inquiry, concept explanations, and algorithmic proofs.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* General Information Editor Card */}
      <section id="profile-edit-form" className={`p-6 sm:p-8 rounded-3xl ${isDark ? 'bg-[#0B0F17]/90 border-white/[0.08]' : 'bg-white border-slate-200 shadow-xl'} border backdrop-blur-xl space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
              <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                General Information & Profile Details
              </h2>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Click the pencil icon on your avatar to change your picture. Edit your contact details and academic registration below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${isDark ? 'border-[#00F0FF]/30 text-[#00F0FF] bg-[#00F0FF]/10' : 'border-blue-300 text-blue-700 bg-blue-50'}`}>
              Student Database Record
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Profile Section: Only pencil icon, NO upload button */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'} flex items-center gap-5`}>
            <div className="relative group shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-purple-500/20 p-1 border-2 border-[#00F0FF]/40 shadow-xl overflow-hidden flex items-center justify-center cursor-pointer"
              >
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={formData.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center text-white text-2xl font-bold font-serif">
                    {formData.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Direct Pencil Icon Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#00F0FF] text-black font-bold flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-[#0B0F17]"
                title="Click pencil to select new photo from your computer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formData.name}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Click the pencil icon on your avatar to select and update your profile picture.
              </p>
              {formData.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, avatarUrl: '' }))}
                  className="text-xs text-rose-400 hover:underline cursor-pointer block pt-0.5"
                >
                  Reset Avatar
                </button>
              )}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
                <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>

            {/* Email (SSO Identity) */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
                <Mail className="w-3.5 h-3.5 text-[#00F0FF]" />
                Institutional Email (SSO)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans opacity-70 cursor-not-allowed ${
                  isDark
                    ? 'bg-black/40 border-white/5 text-slate-400'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
                <Phone className="w-3.5 h-3.5 text-[#00F0FF]" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-[#0B0F17] border-white/10 text-white'
                    : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                }`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-Binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            {/* Date of Birth (DOB) */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
                <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>

            {/* Student Roll ID / PRN */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Student PRN / Roll ID
              </label>
              <input
                type="text"
                value={formData.studentIdNumber}
                onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
                placeholder="e.g. PRN-2026-CS-8492"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>

            {/* College / Institution */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
                <Building className="w-3.5 h-3.5 text-[#00F0FF]" />
                College / Institution
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. MIT World Peace University (MIT-WPU)"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>

            {/* Stream / Branch */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
                <BookOpen className="w-3.5 h-3.5 text-[#00F0FF]" />
                Academic Stream / Branch
              </label>
              <input
                type="text"
                value={formData.stream}
                onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
                <GraduationCap className="w-3.5 h-3.5 text-[#00F0FF]" />
                Academic Year / Cohort
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g. 3rd Year (Junior) · Class of 2027"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className={`block text-xs font-mono tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Bio & Academic Focus
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Briefly state your learning focus, research interests, or academic goals..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#00FF88]" />
              <span>Direct Database Persistence</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
