import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Pencil,
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Building,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from './Toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, role, updateUserProfile } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    dob: '2004-05-14',
    college: 'MIT  World Peace University (MIT - WPU)',
    stream: 'Computer Science & Engineering',
    year: '3rd Year',
    studentIdNumber: 'PRN-2026-CS-8492',
    bio: '',
    avatarUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || (role === 'student' ? '+1 (555) 234-5678' : '+1 (555) 876-5432'),
        gender: userProfile.gender || (role === 'teacher' ? 'female' : 'male'),
        dob: userProfile.dob || (role === 'student' ? '2004-05-14' : '1985-09-22'),
        college: userProfile.college || userProfile.institutionName || 'MIT  World Peace University (MIT - WPU)',
        stream: userProfile.stream || userProfile.department || 'Computer Science & Engineering',
        year: userProfile.year || (role === 'student' ? '3rd Year' : role === 'teacher' ? 'Associate Professor' : 'Director General'),
        studentIdNumber: userProfile.studentIdNumber || userProfile.employeeId || userProfile.facultyIdNumber || 'PRN-2026-CS-8492',
        bio: userProfile.bio || (role === 'student'
          ? 'Undergraduate scholar focusing on algorithmic invariants, graph proofs, and distributed systems.'
          : 'Leading curriculum design in Advanced Algorithms and AI Automated Assessment Systems.'),
        avatarUrl: userProfile.avatarUrl || userProfile.profilePhoto || '',
      });
      setAvatarPreview(userProfile.avatarUrl || userProfile.profilePhoto || '');
    }
  }, [userProfile, role, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setFormData((prev) => ({ ...prev, avatarUrl: result }));
      showToast('Profile photo updated successfully from local computer!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
        employeeId: formData.studentIdNumber.trim(),
        facultyIdNumber: formData.studentIdNumber.trim(),
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl,
        profilePhoto: formData.avatarUrl,
      });
      showToast('Profile details updated successfully across all databases!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-2xl rounded-3xl ${
            isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          } border shadow-2xl overflow-hidden my-auto`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl brand-ai-gradient flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-mono tracking-tight">Academic Identity Profile</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    role === 'student'
                      ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30'
                      : role === 'teacher'
                      ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {role}
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Manage biometric identity, contact details, college credentials, and cohort year.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              } transition-colors cursor-pointer`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-8rem)] overflow-y-auto">
            {/* Avatar Section with Pencil Overlay */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10 dark:border-white/10">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#00F0FF]/30 border-2 border-white/20 bg-[#07090E] flex items-center justify-center relative shadow-xl">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={formData.name || 'User Avatar'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-3xl font-bold font-serif text-white">
                      {formData.name?.charAt(0) || 'U'}
                    </span>
                  )}
                  {/* Subtle dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Visible Pencil Icon Button on the profile picture */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00F0FF] text-black font-bold flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-[#0B0F17] cursor-pointer"
                  title="Change profile picture from local computer"
                >
                  <Pencil className="w-4 h-4 text-black" />
                </button>

                {/* Hidden File Input */}
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
                  <h3 className="text-base font-bold font-mono">{formData.name || 'User Profile'}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Click the pencil icon on your picture to upload a custom photo directly from your local computer.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                      isDark
                        ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    } transition-colors cursor-pointer`}
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>Upload Image File</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    } focus:outline-none focus:border-[#00F0FF] transition-colors`}
                    placeholder="e.g. Alex Morgan"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Official Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
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
                    } focus:outline-none focus:border-[#00F0FF] transition-colors`}
                    placeholder="+1 (555) 000-0000"
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
                  } focus:outline-none focus:border-[#00F0FF] transition-colors cursor-pointer`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
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
                    } focus:outline-none focus:border-[#00F0FF] transition-colors`}
                  />
                </div>
              </div>

              {/* Roll No / Faculty ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  {role === 'student' ? 'Student Roll No / PRN *' : 'Faculty / Employee ID *'}
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.studentIdNumber}
                    onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#00F0FF] transition-colors`}
                    placeholder="e.g. PRN-2026-CS-8492"
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
                    } focus:outline-none focus:border-[#00F0FF] transition-colors`}
                    placeholder="e.g. MIT World Peace University (MIT-WPU)"
                  />
                </div>
              </div>

              {/* Stream / Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Stream / Department *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#00F0FF] transition-colors cursor-pointer`}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Mathematics & Computing">Mathematics & Computing</option>
                  </select>
                </div>
              </div>

              {/* Year of Study / Designation */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  {role === 'student' ? 'Academic Year of Study *' : 'Academic Designation *'}
                </label>
                {role === 'student' ? (
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#00F0FF] transition-colors cursor-pointer`}
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Graduate">Graduate / Master's</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:border-[#00F0FF] transition-colors`}
                    placeholder="e.g. Associate Professor"
                  />
                )}
              </div>

              {/* Bio / Academic Focus */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Academic Focus & Research Bio
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full p-3 text-xs font-sans rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  } focus:outline-none focus:border-[#00F0FF] transition-colors`}
                  placeholder="Describe your primary academic interests, target exams, or research goals..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} flex items-center justify-end gap-3`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-mono ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } transition-colors cursor-pointer`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl text-xs font-mono font-bold bg-[#00F0FF] hover:bg-[#38bdf8] text-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
