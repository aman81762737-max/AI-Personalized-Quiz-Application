import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { SecurityPassportCard } from '../common/SecurityPassportCard';
import { InteractiveSVGCompetencyTree, CompetencyNode } from '../common/InteractiveSVGCompetencyTree';
import {
  ShieldCheck,
  Cpu,
  Key,
  Terminal,
  Server,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  Database,
  ChevronRight,
  ExternalLink,
  Pencil,
  Upload,
  Save,
} from 'lucide-react';

interface AdminProfileViewProps {
  onNavigateUsers?: () => void;
  onNavigateSystem?: () => void;
}

const ADMIN_TOPOLOGY_NODES: CompetencyNode[] = [
  {
    id: 'db-cluster',
    name: 'Cloud Firestore Sovereign DB Cluster',
    shortLabel: 'Firestore DB',
    category: 'Persistence',
    tier: 1,
    mastery: 100,
    status: 'mastered',
    questionsCount: 1420,
    prerequisites: [],
    x: 80,
    y: 110,
    diagnosticNote: 'Latency: 24ms. Multi-region replica in sync. Zero storage anomalies or partition splits detected.',
  },
  {
    id: 'auth-gateway',
    name: 'RBAC Federated Token & Key Service',
    shortLabel: 'Auth Gateway',
    category: 'Persistence',
    tier: 1,
    mastery: 100,
    status: 'mastered',
    questionsCount: 1420,
    prerequisites: [],
    x: 80,
    y: 280,
    diagnosticNote: 'Hardware FIDO2 WebAuthn keys enforced. All 12 root administrator accounts cryptographically attested.',
  },
  {
    id: 'ai-engine',
    name: 'Gemini AI Assessment Calibration Engine',
    shortLabel: 'Gemini AI Service',
    category: 'Computation',
    tier: 2,
    mastery: 99,
    status: 'mastered',
    questionsCount: 384,
    prerequisites: ['db-cluster'],
    x: 320,
    y: 90,
    diagnosticNote: 'Average response latency: 142ms. 320 syllabus calibrations/minute throughput. 99.98% reliability.',
  },
  {
    id: 'proctor-ws',
    name: 'Real-Time Proctor WebSocket Gateway',
    shortLabel: 'Proctor Cluster',
    category: 'Computation',
    tier: 2,
    mastery: 98,
    status: 'mastered',
    questionsCount: 840,
    prerequisites: ['db-cluster', 'auth-gateway'],
    x: 320,
    y: 200,
    diagnosticNote: '18ms heartbeat. High-concurrency socket pool monitoring exam attempts with real-time blur/tab telemetry.',
  },
  {
    id: 'edge-cache',
    name: 'Distributed Client Telemetry Edge Cache',
    shortLabel: 'Edge Telemetry',
    category: 'Computation',
    tier: 2,
    mastery: 100,
    status: 'mastered',
    questionsCount: 520,
    prerequisites: ['proctor-ws'],
    x: 320,
    y: 310,
    diagnosticNote: 'Local edge synchronization with zero data loss during transient student network disconnects.',
  },
  {
    id: 'audit-ledger',
    name: 'Immutable Cryptographic Audit Logger',
    shortLabel: 'Audit Logger',
    category: 'Security',
    tier: 3,
    mastery: 100,
    status: 'mastered',
    questionsCount: 1200,
    prerequisites: ['proctor-ws', 'ai-engine'],
    x: 580,
    y: 140,
    diagnosticNote: 'Signed SHA-256 event chaining. Every privilege escalation and grade override immutably logged.',
  },
  {
    id: 'anomaly-guard',
    name: 'Automated Proctor Anomaly Detector',
    shortLabel: 'Anomaly Guard',
    category: 'Security',
    tier: 3,
    mastery: 96,
    status: 'mastered',
    questionsCount: 410,
    prerequisites: ['audit-ledger'],
    x: 580,
    y: 270,
    diagnosticNote: 'Zero false positive flags during midterm examination cycle. Immediate notification trigger operational.',
  },
  {
    id: 'sovereign-core',
    name: 'Institutional Governance Sovereign Root',
    shortLabel: 'Sovereign Root',
    category: 'Governance',
    tier: 4,
    mastery: 100,
    status: 'mastered',
    questionsCount: 1420,
    prerequisites: ['anomaly-guard', 'edge-cache'],
    x: 820,
    y: 200,
    diagnosticNote: 'Full sovereign institutional integrity. ISO/IEC 27001, FERPA, and GDPR certified data policies in effect.',
  },
];

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  onNavigateUsers,
  onNavigateSystem,
}) => {
  const { userProfile, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [adminForm, setAdminForm] = useState({
    name: userProfile?.name || 'Consortium Director',
    phone: userProfile?.phone || '+1 (555) 991-0021',
    gender: userProfile?.gender || 'male',
    dob: userProfile?.dob || '1979-11-04',
    college: userProfile?.college || 'Consortium Central Directorate',
    stream: userProfile?.stream || 'Academic Governance & Accreditation',
    bio: userProfile?.bio || 'Chief Platform Administrator overseeing institutional integrity, accreditation telemetry, and security protocols.',
    avatarUrl: userProfile?.avatarUrl || userProfile?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  });

  useEffect(() => {
    if (userProfile) {
      setAdminForm({
        name: userProfile.name || 'Consortium Director',
        phone: userProfile.phone || '+1 (555) 991-0021',
        gender: userProfile.gender || 'male',
        dob: userProfile.dob || '1979-11-04',
        college: userProfile.college || 'Consortium Central Directorate',
        stream: userProfile.stream || 'Academic Governance & Accreditation',
        bio: userProfile.bio || 'Chief Platform Administrator overseeing institutional integrity, accreditation telemetry, and security protocols.',
        avatarUrl: userProfile.avatarUrl || userProfile.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      });
    }
  }, [userProfile]);

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAdminForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      showToast('Photo loaded from local computer. Click "Save Admin Profile" to apply.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: adminForm.name.trim(),
        phone: adminForm.phone.trim(),
        gender: adminForm.gender,
        dob: adminForm.dob,
        college: adminForm.college.trim(),
        institutionName: adminForm.college.trim(),
        stream: adminForm.stream.trim(),
        department: adminForm.stream.trim(),
        bio: adminForm.bio.trim(),
        avatarUrl: adminForm.avatarUrl,
        profilePhoto: adminForm.avatarUrl,
      });
      showToast('Administrator profile updated successfully!', 'success');
      setIsEditorOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const auditLogs = [
    {
      id: 'AUD-8819',
      actor: 'system.proctor.guard',
      action: 'Verified exam room cryptographic checksum',
      target: 'CS201 Midterm Examination (84 Sessions)',
      timestamp: 'Today at 06:42:18 EST',
      status: 'Clean',
      hash: 'SHA256:7f9a...88c2',
    },
    {
      id: 'AUD-8818',
      actor: 'marcus.vance (Admin)',
      action: 'Policy adjustment: Distractor calibration threshold',
      target: 'Curriculum Assessment Invariants (CS305)',
      timestamp: 'Yesterday at 17:15:02 EST',
      status: 'Audited',
      hash: 'SHA256:3e1b...90d4',
    },
    {
      id: 'AUD-8817',
      actor: 'auth.service',
      action: 'Periodic role token validation sweep (1,420 accounts)',
      target: 'RBAC Registry',
      timestamp: 'Oct 13, 2026 at 00:00:00 EST',
      status: 'Success',
      hash: 'SHA256:881c...22f1',
    },
    {
      id: 'AUD-8816',
      actor: 'system.backup',
      action: 'Cryptographic snapshot created & verified',
      target: 'Firestore State Replica',
      timestamp: 'Oct 12, 2026 at 23:59:45 EST',
      status: 'Verified',
      hash: 'SHA256:55aa...66bb',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-white">
      {/* Editorial Marker 01: Sovereign Root Credential */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-amber-400 uppercase">
              01 / SOVEREIGN ROOT CREDENTIAL
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            SECURITY CLEARANCE LEVEL 4
          </span>
        </div>

        <SecurityPassportCard
          role="admin"
          name={userProfile?.name || 'Consortium Director'}
          idNumber={userProfile?.employeeId || 'GOV-SEC-ROOT-001'}
          email={userProfile?.email || 'admin@institution.edu'}
          title="SOVEREIGN PLATFORM ADMINISTRATOR & GOVERNANCE DIRECTOR"
          subTitle={`${userProfile?.college || 'Consortium Central Directorate'} · ${userProfile?.stream || 'Academic Governance & Accreditation'}`}
          clearanceLevel="CLEARANCE LEVEL 4 (ROOT AUTHORITY)"
          statusText="SOVEREIGN OPERATOR"
          avatarUrl={adminForm.avatarUrl || userProfile?.avatarUrl || userProfile?.profilePhoto}
          phone={userProfile?.phone}
          gender={userProfile?.gender}
          dob={userProfile?.dob}
          college={userProfile?.college}
          stream={userProfile?.stream}
          year={userProfile?.year}
          onEditProfile={() => {
            setIsEditorOpen(true);
            setTimeout(() => {
              document.getElementById('profile-edit-form')?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
          metrics={[]}
          accentColor="#F59E0B"
          foilType="amber"
        />

        {/* Quick Actions UI Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
                GOVERNANCE QUICK ACTIONS
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              DIRECT WORKFLOW JUMPERS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: Manage Accounts */}
            <button
              type="button"
              onClick={onNavigateUsers}
              className="p-5 rounded-2xl border text-left transition-all cursor-pointer group bg-[#0B0F17]/80 border-white/10 hover:border-amber-400/50 hover:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Manage Users →
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold font-mono text-white group-hover:text-amber-400 transition-colors">
                  User Directory
                </h4>
                <p className="text-xs mt-2 leading-relaxed text-slate-400">
                  Provision faculty and student roles with cryptographic access control and verification.
                </p>
              </div>
            </button>

            {/* Action 2: Security & Audits */}
            <button
              type="button"
              onClick={onNavigateSystem}
              className="p-5 rounded-2xl border text-left transition-all cursor-pointer group bg-[#0B0F17]/80 border-white/10 hover:border-emerald-400/50 hover:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Audit Telemetry →
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold font-mono text-white group-hover:text-emerald-400 transition-colors">
                  Security & Audit Logs
                </h4>
                <p className="text-xs mt-2 leading-relaxed text-slate-400">
                  Inspect immutable cryptographic logs, session integrity records, and proctoring alerts.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* In-page Admin Identity Profile Editor (Separated Whole View - Zero Modals) */}
        {isEditorOpen && (
          <div id="profile-edit-form" className="p-6 sm:p-8 rounded-3xl bg-[#0B0F17]/95 border border-amber-400/30 backdrop-blur-xl space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-lg font-bold text-white">Administrator Identity & Governance Record</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Upload profile photo from your computer and edit administrative credentials directly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10"
              >
                Close Editor
              </button>
            </div>

            <form onSubmit={handleAdminSave} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 p-1 border-2 border-amber-400/40 shadow-xl overflow-hidden flex items-center justify-center">
                    {adminForm.avatarUrl ? (
                      <img src={adminForm.avatarUrl} alt={adminForm.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-white text-2xl font-bold font-serif">{adminForm.name.charAt(0)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-[#0B0F17]"
                    title="Upload photo from local computer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAdminPhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <h4 className="text-sm font-bold text-white">Administrator Photo</h4>
                  <p className="text-xs text-slate-400">Click the pencil icon on your avatar to select an image from your computer.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase">Director / Admin Name</label>
                  <input
                    type="text"
                    required
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase">Gender</label>
                  <select
                    value={adminForm.gender}
                    onChange={(e) => setAdminForm({ ...adminForm, gender: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0B0F17] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non-Binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={adminForm.dob}
                    onChange={(e) => setAdminForm({ ...adminForm, dob: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase">College / Directorate</label>
                  <input
                    type="text"
                    value={adminForm.college}
                    onChange={(e) => setAdminForm({ ...adminForm, college: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 uppercase">Stream / Governance Unit</label>
                  <input
                    type="text"
                    value={adminForm.stream}
                    onChange={(e) => setAdminForm({ ...adminForm, stream: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-mono text-slate-300 uppercase">Administrative Bio / Mission Statement</label>
                  <textarea
                    rows={2}
                    value={adminForm.bio}
                    onChange={(e) => setAdminForm({ ...adminForm, bio: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 border border-white/10 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-mono font-bold bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Admin Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* Editorial Marker 02: Infrastructure Topology & Service Vector Map */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#00FF88] uppercase">
              02 / INFRASTRUCTURE TOPOLOGY & SOVEREIGNTY
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            MULTI-CLUSTER HEALTH MAPPING
          </span>
        </div>

        <InteractiveSVGCompetencyTree
          nodes={ADMIN_TOPOLOGY_NODES}
          onLaunchDrill={() => {
            if (onNavigateSystem) onNavigateSystem();
          }}
          roleAccent="#F59E0B"
        />
      </section>

      {/* Editorial Marker 03: Security Clearances & Institutional Directory */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#00F0FF] uppercase">
              03 / SOVEREIGN CLEARANCES & TENANT REGISTRY
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateUsers && (
              <button
                type="button"
                onClick={onNavigateUsers}
                className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>User Directory</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0B0F17]/80 border border-white/[0.08] backdrop-blur-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Hardware Key Attestation</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              FIDO2 WebAuthn cryptographic challenge enforced. Physical security key authentication required for root elevation actions.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#00FF88] border-t border-white/[0.06]">
              Attestation: YubiKey 5C NFC Verified
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B0F17]/80 border border-white/[0.08] backdrop-blur-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center text-[#00FF88]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Institutional Privacy Attestation</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              All proctor telemetry, student recordings, and assessment submissions encrypted at rest with sovereign AES-256 keys.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#00FF88] border-t border-white/[0.06]">
              Compliance: FERPA & GDPR Certified
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B0F17]/80 border border-white/[0.08] backdrop-blur-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center text-[#00F0FF]">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Cloud Firestore Replication</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Instantaneous cross-zone replication. Snapshot integrity verified every 24 hours with cryptographic state hashes.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#00F0FF] border-t border-white/[0.06]">
              Replica: Synchronized (24ms latency)
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Marker 04: Immutable Cryptographic Audit Log */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#00FF88] uppercase">
              04 / IMMUTABLE CRYPTOGRAPHIC AUDIT LOG
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#00FF88] uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
            LIVE TELEMETRY STREAM
          </span>
        </div>

        <div className="bg-[#0B0F17]/80 rounded-3xl border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">{log.id}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-white font-semibold">{log.action}</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Actor: <span className="text-slate-200">{log.actor}</span> · Target: <span className="text-slate-300">{log.target}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                <span className="text-slate-500 text-[11px]">{log.hash}</span>
                <span className="text-slate-400 text-[11px]">{log.timestamp}</span>
                <span className="text-[#00FF88] font-bold text-[11px]">{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
