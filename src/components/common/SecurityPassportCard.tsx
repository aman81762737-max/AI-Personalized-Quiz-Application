import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Download,
  QrCode,
  Sparkles,
  ExternalLink,
  Pencil,
  Phone,
  Calendar,
  Building,
  GraduationCap,
} from 'lucide-react';

export interface SecurityPassportCardProps {
  role: 'student' | 'teacher' | 'admin';
  name: string;
  idNumber: string;
  email: string;
  title: string;
  subTitle: string;
  clearanceLevel?: string;
  statusText?: string;
  avatarUrl?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  college?: string;
  stream?: string;
  year?: string;
  onEditProfile?: () => void;
  metrics: {
    label: string;
    value: string;
    subtext: string;
    accent?: string;
  }[];
  accentColor?: string;
  foilType?: 'cyan' | 'emerald' | 'amber';
}

const formatWithMitSpacing = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(/MIT\s*-\s*WPU/gi, 'MIT - WPU')
    .replace(/MIT-WPU/gi, 'MIT - WPU')
    .replace(/MIT\s+/g, 'MIT  ')
    .replace(/MIT([^\s\-])/g, 'MIT  $1');
};

export const SecurityPassportCard: React.FC<SecurityPassportCardProps> = ({
  role,
  name,
  idNumber,
  email,
  title,
  subTitle,
  clearanceLevel,
  statusText,
  avatarUrl,
  phone,
  gender,
  dob,
  college,
  stream,
  year,
  onEditProfile,
  metrics,
  accentColor = '#00F0FF',
  foilType = 'cyan',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Generate Guilloche Rosette Path
  const generateGuillochePattern = () => {
    const paths = [];
    const R = 80;
    const r = 24;
    const p = 40;
    for (let k = 0; k < 3; k++) {
      let d = '';
      const steps = 180;
      for (let i = 0; i <= steps; i++) {
        const theta = (i * 2 * Math.PI) / steps;
        const phase = (k * Math.PI) / 3;
        const x = 150 + (R - r) * Math.cos(theta + phase) + p * Math.cos(((R - r) * (theta + phase)) / r);
        const y = 150 + (R - r) * Math.sin(theta + phase) - p * Math.sin(((R - r) * (theta + phase)) / r);
        d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      paths.push(d);
    }
    return paths;
  };

  const foilGradients = {
    cyan: 'from-cyan-400/20 via-sky-300/15 via-indigo-400/20 to-purple-400/20',
    emerald: 'from-emerald-400/20 via-teal-300/15 via-cyan-400/20 to-lime-400/20',
    amber: 'from-amber-400/25 via-yellow-200/20 via-orange-400/20 to-rose-400/20',
  };

  const themeBorder =
    role === 'teacher'
      ? 'border-[#10B981]/30 hover:border-[#10B981]/50'
      : role === 'admin'
      ? 'border-amber-400/30 hover:border-amber-400/50'
      : 'border-[#00F0FF]/30 hover:border-[#00F0FF]/50';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`passport-card-element relative w-full rounded-3xl bg-gradient-to-br from-[#0B0F17] via-[#070A10] to-[#04060A] border ${themeBorder} p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 select-none group text-white`}
    >
      {/* Dynamic Iridescent Prismatic Holographic Foil Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 bg-gradient-to-tr ${foilGradients[foilType]} mix-blend-color-dodge`}
        style={{
          opacity: isHovered ? 0.85 : 0.35,
          backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
          transform: isHovered
            ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`
            : undefined,
        }}
      />

      {/* Algorithmic SVG Guilloche Rosette Watermark */}
      <div className="absolute -right-16 -top-16 w-80 h-80 opacity-[0.14] pointer-events-none text-white transition-opacity group-hover:opacity-[0.22]">
        <svg viewBox="0 0 300 300" className="w-full h-full stroke-current" fill="none" strokeWidth="0.8">
          {generateGuillochePattern().map((pathData, idx) => (
            <path key={idx} d={pathData} strokeLinecap="round" />
          ))}
          <circle cx="150" cy="150" r="120" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="95" strokeDasharray="1 4" />
        </svg>
      </div>

      {/* Laser Micro-Text Security Border Top/Bottom */}
      <div className="absolute top-2 left-6 right-6 flex items-center justify-between text-[7px] font-mono tracking-[0.25em] text-white/20 uppercase overflow-hidden whitespace-nowrap pointer-events-none">
        <span>AUTHENTICATED SOVEREIGN IDENTITY · INSTITUTIONAL INTEGRITY SYSTEM · CRYPTOGRAPHIC AUDIT VERIFIED</span>
        <span className="hidden sm:inline">ISO/IEC 27001 COMPLIANT · ED-PRIV-2026</span>
      </div>

      <div className="relative z-10 space-y-6 pt-1">
        {/* Middle Body: Biometric Identity & High-Fashion Typography */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Biometric Portrait Ring with Hologram Aura */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-white/10 via-black/40 to-white/5 border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-2xl group">
              <div className="w-full h-full rounded-xl bg-[#090D14] flex items-center justify-center relative overflow-hidden">
                {/* Radial scan reticle */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]" />
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white select-none">
                    {name.charAt(0)}
                  </span>
                )}
                {/* Holographic corner tick marks */}
                <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/40" />
                <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-white/40" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-white/40" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/40" />
              </div>

              {/* Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#090D14] border border-white/20 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF88]" />
              </div>

            </div>

            {/* Editorial Name & Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase">
                  {title}
                </span>
                {onEditProfile && (
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#00F0FF] hover:underline cursor-pointer"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white flex items-center gap-3">
                <span>{name}</span>
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                {formatWithMitSpacing(subTitle)}
              </p>
              
              {/* Profile Details Strip */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-1 flex-wrap">
                <span>{email}</span>
                {phone && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {phone}
                    </span>
                  </>
                )}
                {dob && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      DOB: {dob}
                    </span>
                  </>
                )}
                {gender && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-slate-300 capitalize">{gender}</span>
                  </>
                )}
              </div>

              {(college || stream || year) && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {college && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300">
                      {formatWithMitSpacing(college)}
                    </span>
                  )}
                  {stream && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF]">
                      {stream}
                    </span>
                  )}
                  {year && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88]">
                      {year}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metrics in Metallic Frames (conditional) */}
          {metrics && metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all text-left min-w-[100px] sm:min-w-[115px]"
                >
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">
                    {m.label}
                  </span>
                  <span
                    className="text-xl sm:text-2xl font-bold font-mono tracking-tight block mt-1"
                    style={{ color: m.accent || '#FFFFFF' }}
                  >
                    {m.value}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono truncate">
                    {m.subtext}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar: Interactive Actions */}
        {onEditProfile && (
          <div className="flex items-center justify-end pt-5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onEditProfile}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5 text-black" />
              <span>Edit Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
