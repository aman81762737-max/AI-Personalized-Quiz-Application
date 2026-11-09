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
  Upload,
  CheckCircle2,
  Save,
  Clock,
  Layers,
  Sparkles,
  Award,
  Users,
  FileQuestion,
  ClipboardList,
  FileText,
} from 'lucide-react';

interface TeacherProfileViewProps {
  onNavigateCohort?: () => void;
  onNavigateMaterials?: () => void;
  onNavigateAssessments?: () => void;
  onNavigateCreateAssessment?: () => void;
}

export const TeacherProfileView: React.FC<TeacherProfileViewProps> = ({
  onNavigateCohort,
  onNavigateMaterials,
  onNavigateAssessments,
  onNavigateCreateAssessment,
}) => {
  const { userProfile, teacherProfile, updateUserProfile } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: userProfile?.name || 'Dr. Sarah Jenkins',
    email: userProfile?.email || 'faculty@mitwpu.edu.in',
    phone: userProfile?.phone || '+1 (555) 876-5432',
    gender: userProfile?.gender || 'female',
    dob: userProfile?.dob || '1985-09-22',
    college: userProfile?.college || userProfile?.institutionName || 'MIT  World Peace University (MIT - WPU)',
    stream: userProfile?.stream || userProfile?.department || 'Department of Computer Science & Engineering',
    year: userProfile?.year || 'Associate Professor',
    employeeId: userProfile?.employeeId || userProfile?.facultyIdNumber || 'FAC-CS-1042',
    bio: userProfile?.bio || 'Associate Professor & Curriculum Lead. Researching automated AI pedagogy, Socratic diagnostic models, and compiler construction.',
    avatarUrl: userProfile?.avatarUrl || userProfile?.profilePhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'dossier' | 'teaching'>('details');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '+1 (555) 876-5432',
        gender: userProfile.gender || 'female',
        dob: userProfile.dob || '1985-09-22',
        college: userProfile.college || userProfile.institutionName || 'MIT  World Peace University (MIT - WPU)',
        stream: userProfile.stream || userProfile.department || 'Department of Computer Science & Engineering',
        year: userProfile.year || 'Associate Professor',
        employeeId: userProfile.employeeId || userProfile.facultyIdNumber || 'FAC-CS-1042',
        bio: userProfile.bio || 'Associate Professor & Curriculum Lead. Researching automated AI pedagogy, Socratic diagnostic models, and compiler construction.',
        avatarUrl: userProfile.avatarUrl || userProfile.profilePhoto || '',
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
      showToast('Profile photo loaded from local computer. Click "Save Profile" to apply.', 'success');
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
        employeeId: formData.employeeId.trim(),
        facultyIdNumber: formData.employeeId.trim(),
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl,
        profilePhoto: formData.avatarUrl,
      });
      showToast('Faculty profile updated successfully across all databases!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Editorial Marker: Sovereign Faculty Credential */}
      <section className="space-y-4">
        <div className={`flex items-center justify-between border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'} pb-3`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono tracking-[0.3em] ${isDark ? 'text-[#10B981]' : 'text-emerald-700 font-bold'} uppercase`}>
              01 / FACULTY ACADEMIC CREDENTIAL
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            AUTHENTICATED FACULTY DOSSIER
          </span>
        </div>

        <SecurityPassportCard
          role="teacher"
          name={formData.name || 'Dr. Sarah Jenkins'}
          idNumber={formData.employeeId || 'FAC-CS-1042'}
          email={formData.email || 'faculty@mitwpu.edu.in'}
          title={`${formData.year || 'ASSOCIATE PROFESSOR'} · ${formData.stream || 'COMPUTER SCIENCE'}`}
          subTitle={`${formData.college || 'MIT  World Peace University (MIT - WPU)'} · Faculty Accreditation Level 2`}
          clearanceLevel="CLEARANCE LEVEL 2 (FACULTY AUTHORITY)"
          statusText="ACTIVE EDUCATOR"
          avatarUrl={formData.avatarUrl || userProfile?.avatarUrl || userProfile?.profilePhoto}
          phone={formData.phone}
          gender={formData.gender}
          dob={formData.dob}
          college={formData.college}
          stream={formData.stream}
          year={formData.year}
          onEditProfile={() => {
            setActiveTab('details');
            setTimeout(() => {
              document.getElementById('profile-edit-form')?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
          metrics={[]}
          accentColor="#10B981"
          foilType="emerald"
        />
      </section>

      {/* Quick Actions UI Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className={`text-xs font-mono font-bold tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              FACULTY QUICK ACTIONS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            DIRECT WORKFLOW JUMPERS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action 1: Cohort Telemetry -> Opens Student Cohort view */}
          <button
            type="button"
            onClick={onNavigateCohort}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group ${
              isDark
                ? 'bg-[#0B0F17]/80 border-white/10 hover:border-[#10B981]/50 hover:bg-white/[0.03]'
                : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#10B981] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Open Cohort →
              </span>
            </div>
            <div className="mt-4">
              <h4 className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-[#10B981] transition-colors`}>
                Cohort Telemetry
              </h4>
              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Inspect student progression, attendance, and Bloom&apos;s mastery telemetry across your enrolled cohort.
              </p>
            </div>
          </button>

          {/* Action 2: Draft Assessment -> Opens Create Assessment */}
          <button
            type="button"
            onClick={onNavigateCreateAssessment || onNavigateAssessments}
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
                Launch Builder →
              </span>
            </div>
            <div className="mt-4">
              <h4 className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-[#00F0FF] transition-colors`}>
                Draft Assessment
              </h4>
              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Configure timed examinations, randomized question pools, and proctoring safeguards.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Navigation Section Tabs */}
      <div className={`flex items-center gap-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} pb-3`}>
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'bg-[#10B981] text-black shadow-md'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Edit Profile & Photo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teaching')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'teaching'
              ? 'bg-[#10B981] text-black shadow-md'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Teaching Allocations & Stats</span>
        </button>
      </div>

      {/* TAB 1: EDIT PROFILE & LOCAL PHOTO UPLOAD (Separated Dedicated Page) */}
      {activeTab === 'details' && (
        <div id="profile-edit-form" className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
          isDark ? 'bg-[#0B0F17]/90 border-white/10' : 'bg-white border-slate-200'
        } backdrop-blur-xl space-y-8`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold font-mono">Faculty Profile Details</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Edit your personal and academic credentials. Upload photo directly from your local computer.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 font-bold uppercase">
              Isolated Role Database
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Section with Pencil Icon */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#10B981]/40 border-2 border-white/20 bg-[#07090E] flex items-center justify-center relative shadow-xl">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-3xl font-bold font-serif text-white">
                      {formData.name.charAt(0)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Visible Pencil Icon Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#10B981] text-black font-bold flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-[#0B0F17] cursor-pointer"
                  title="Change profile picture from local computer"
                >
                  <Pencil className="w-4 h-4 text-black" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-base font-bold font-mono">{formData.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                    Faculty Verified
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Click the pencil icon on your picture to change your profile photo directly.
                </p>
              </div>
            </div>

            {/* Grid of Profile Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Official Email (Read-Only)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    } cursor-not-allowed`}
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-xl border ${
                    isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  } focus:outline-none focus:border-[#10B981] transition-colors cursor-pointer`}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Date of Birth (DOB) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Date of Birth (DOB) *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
              </div>

              {/* Faculty Employee ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Faculty Employee ID *
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
              </div>

              {/* College / University */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  College / University Institution *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
              </div>

              {/* Stream / Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Department / Stream *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
              </div>

              {/* Academic Designation */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Academic Designation / Rank *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#10B981] transition-colors`}
                    placeholder="e.g. Associate Professor & Department Chair"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Academic Bio & Research Interests
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full p-3 text-xs font-sans rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  } focus:outline-none focus:border-[#10B981] transition-colors`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#10B981] hover:bg-emerald-400 text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-black" />
                <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: TEACHING ALLOCATIONS & STATS */}
      {activeTab === 'teaching' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#0B0F17]/80 border-white/10' : 'bg-white border-slate-200 shadow-md'} space-y-3`}>
            <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono">Enrolled Student Cohort</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              142 active scholars across Computer Science & Engineering. Click below to inspect student progress, filter by college & stream, or review Atom AI diagnostic summaries.
            </p>
            {onNavigateCohort && (
              <button
                type="button"
                onClick={onNavigateCohort}
                className="text-xs font-mono font-bold text-[#00F0FF] hover:underline pt-2 block cursor-pointer"
              >
                Open Student Cohort Explorer →
              </button>
            )}
          </div>

          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#0B0F17]/80 border-white/10' : 'bg-white border-slate-200 shadow-md'} space-y-3`}>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono">Examination Oversight</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              5 active proctored assessment rooms configured with hardware lockdown, blur detection, and automated Bloom's taxonomy rubric grading.
            </p>
            {onNavigateAssessments && (
              <button
                type="button"
                onClick={onNavigateAssessments}
                className="text-xs font-mono font-bold text-emerald-400 hover:underline pt-2 block cursor-pointer"
              >
                Inspect Assessment Rooms →
              </button>
            )}
          </div>

          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#0B0F17]/80 border-white/10' : 'bg-white border-slate-200 shadow-md'} space-y-3`}>
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono">Curriculum Syllabus Library</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              8 indexed academic documents grounded in RAG. Powers autonomous question generation and Socratic proofs.
            </p>
            {onNavigateMaterials && (
              <button
                type="button"
                onClick={onNavigateMaterials}
                className="text-xs font-mono font-bold text-amber-400 hover:underline pt-2 block cursor-pointer"
              >
                Manage Curriculum Files →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
