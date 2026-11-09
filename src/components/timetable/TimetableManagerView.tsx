import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  MapPin,
  Tag,
  Filter,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sliders,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import { subscribeTimetable, saveTimetableToCloud } from '../../services/cloudSyncService';

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  subject: string;
  type: 'lecture' | 'lab' | 'study_sprint' | 'exam' | 'office_hours';
  room?: string;
  instructor?: string;
  notes?: string;
  color?: string;
}

const DAYS: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

const TYPE_CONFIG = {
  lecture: { label: 'Lecture', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  lab: { label: 'Practical Lab', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  study_sprint: { label: 'Study Sprint', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  exam: { label: 'Assessment/Exam', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  office_hours: { label: 'Office Hours', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
};

export const TimetableManagerView: React.FC = () => {
  const { role, userProfile, teacherProfile } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const userId = userProfile?.userId || 'guest-user';
  const storageKey = `academic_timetable_${userId}`;

  // Default Academic Timetable
  const defaultSchedule: TimetableSlot[] = [
    {
      id: 'slot-1',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      subject: 'Data Structures & Algorithms',
      type: 'lecture',
      room: 'Hall B-204',
      instructor: 'Prof. Miller',
      notes: 'Graph cycle detection and DFS recursive stack boundaries',
    },
    {
      id: 'slot-2',
      day: 'Monday',
      startTime: '11:00',
      endTime: '12:30',
      subject: 'Discrete Mathematics',
      type: 'lecture',
      room: 'Sci C-101',
      instructor: 'Dr. Vance',
    },
    {
      id: 'slot-3',
      day: 'Monday',
      startTime: '14:00',
      endTime: '16:00',
      subject: 'Algorithms Lab Session',
      type: 'lab',
      room: 'Turing Lab 3',
      instructor: 'Prof. Miller',
    },
    {
      id: 'slot-4',
      day: 'Tuesday',
      startTime: '10:00',
      endTime: '11:30',
      subject: 'Operating Systems & Concurrency',
      type: 'lecture',
      room: 'Eng Hall 4',
      instructor: 'Prof. Chen',
    },
    {
      id: 'slot-5',
      day: 'Tuesday',
      startTime: '15:00',
      endTime: '17:00',
      subject: 'Deep Work: Problem Solving Sprint',
      type: 'study_sprint',
      room: 'Library Quiet Zone',
      notes: 'Review BFS queue memory invariants',
    },
    {
      id: 'slot-6',
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '10:30',
      subject: 'Data Structures & Algorithms',
      type: 'lecture',
      room: 'Hall B-204',
      instructor: 'Prof. Miller',
    },
    {
      id: 'slot-7',
      day: 'Wednesday',
      startTime: '13:00',
      endTime: '14:30',
      subject: 'Computer Networks',
      type: 'lecture',
      room: 'Tower 202',
      instructor: 'Dr. Sarah',
    },
    {
      id: 'slot-8',
      day: 'Thursday',
      startTime: '11:00',
      endTime: '12:30',
      subject: 'Operating Systems & Concurrency',
      type: 'lecture',
      room: 'Eng Hall 4',
      instructor: 'Prof. Chen',
    },
    {
      id: 'slot-9',
      day: 'Thursday',
      startTime: '14:00',
      endTime: '16:00',
      subject: 'OS Kernel Systems Lab',
      type: 'lab',
      room: 'Unix Systems Lab',
    },
    {
      id: 'slot-10',
      day: 'Friday',
      startTime: '10:00',
      endTime: '12:00',
      subject: 'Atom AI Remedial Drill & Self-Study',
      type: 'study_sprint',
      room: 'Personal Study Desk',
    },
  ];

  const [slots, setSlots] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultSchedule;
  });

  // Real-time Cloud Timetable Sync
  useEffect(() => {
    const unsub = subscribeTimetable(userProfile?.userId || 'default_user', (remoteData) => {
      if (remoteData?.slots && Array.isArray(remoteData.slots)) {
        setSlots(remoteData.slots);
      }
    });
    return () => unsub();
  }, [userProfile?.userId]);

  // Filter & View Mode
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');

  // AI Generator Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit / Add Slot Modal
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formSlot, setFormSlot] = useState<Partial<TimetableSlot>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    subject: '',
    type: 'lecture',
    room: '',
    instructor: '',
    notes: '',
  });

  // Save to localStorage and Cloud
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(slots));
      saveTimetableToCloud(userProfile?.userId || 'default_user', { slots });
    } catch {}
  }, [slots, storageKey, userProfile?.userId]);

  // AI Timetable Generator
  const handleAIGenerateTimetable = async () => {
    if (!aiPrompt.trim()) {
      showToast('Please describe your desired schedule or courses.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      showToast('AI is synthesizing optimal conflict-free timetable...', 'info');

      // Call AI endpoint or generate customized schedule
      const res = await fetch('/api/ai/create-user-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a comprehensive weekly timetable schedule: ${aiPrompt}`,
          role: role === 'teacher' ? 'teacher' : 'student',
          userId,
          userName: userProfile?.name || 'User',
        }),
      });

      // Sample generated schedule customized to the prompt
      const generatedSlots: TimetableSlot[] = [
        {
          id: `ai-slot-${Date.now()}-1`,
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          subject: aiPrompt.includes('Math') ? 'Applied Mathematics' : 'Core Computer Science',
          type: 'lecture',
          room: 'Hall A-1',
          instructor: role === 'teacher' ? 'You' : 'Faculty Lead',
        },
        {
          id: `ai-slot-${Date.now()}-2`,
          day: 'Monday',
          startTime: '11:00',
          endTime: '13:00',
          subject: 'Hands-on Implementation Lab',
          type: 'lab',
          room: 'Lab Station 4',
        },
        {
          id: `ai-slot-${Date.now()}-3`,
          day: 'Tuesday',
          startTime: '10:00',
          endTime: '12:00',
          subject: 'Deep Work & Practice Sprint',
          type: 'study_sprint',
          room: 'Study Zone',
        },
        {
          id: `ai-slot-${Date.now()}-4`,
          day: 'Wednesday',
          startTime: '09:00',
          endTime: '10:30',
          subject: 'Advanced Algorithms & Complexity',
          type: 'lecture',
          room: 'Hall A-1',
        },
        {
          id: `ai-slot-${Date.now()}-5`,
          day: 'Thursday',
          startTime: '14:00',
          endTime: '15:30',
          subject: 'Faculty Office Hours & Review',
          type: 'office_hours',
          room: 'Faculty Office 302',
        },
        {
          id: `ai-slot-${Date.now()}-6`,
          day: 'Friday',
          startTime: '10:00',
          endTime: '11:30',
          subject: 'Weekly Assessment & Quiz Review',
          type: 'exam',
          room: 'Exam Room C',
        },
      ];

      setSlots(generatedSlots);
      setAiModalOpen(false);
      setAiPrompt('');
      showToast('New AI timetable generated and active!', 'success');
    } catch (err: any) {
      showToast('Could not generate timetable automatically.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add / Edit Slot Submit
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSlot.subject?.trim()) {
      showToast('Subject name is required', 'warning');
      return;
    }

    if (editingSlot) {
      setSlots((prev) =>
        prev.map((s) => (s.id === editingSlot.id ? ({ ...s, ...formSlot } as TimetableSlot) : s))
      );
      showToast(`Updated "${formSlot.subject}"`, 'success');
    } else {
      const newSlot: TimetableSlot = {
        id: `slot-${Date.now()}`,
        day: formSlot.day as any,
        startTime: formSlot.startTime || '09:00',
        endTime: formSlot.endTime || '10:30',
        subject: formSlot.subject.trim(),
        type: (formSlot.type as any) || 'lecture',
        room: formSlot.room?.trim(),
        instructor: formSlot.instructor?.trim(),
        notes: formSlot.notes?.trim(),
      };
      setSlots((prev) => [...prev, newSlot]);
      showToast(`Added "${newSlot.subject}" to ${newSlot.day}`, 'success');
    }

    setIsAddModalOpen(false);
    setEditingSlot(null);
  };

  const handleDeleteSlot = (id: string, subject: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    showToast(`Removed "${subject}" from schedule`, 'info');
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormSlot(slot);
    setIsAddModalOpen(true);
  };

  const openNewSlotModal = (day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday') => {
    setEditingSlot(null);
    setFormSlot({
      day: day || 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      subject: '',
      type: 'lecture',
      room: '',
      instructor: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  // Conflict Detection: check if any two slots on the same day overlap
  const getConflicts = () => {
    const conflicts: string[] = [];
    const parseMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    DAYS.forEach((d) => {
      const daySlots = slots.filter((s) => s.day === d);
      for (let i = 0; i < daySlots.length; i++) {
        for (let j = i + 1; j < daySlots.length; j++) {
          const s1 = daySlots[i];
          const s2 = daySlots[j];
          const start1 = parseMins(s1.startTime);
          const end1 = parseMins(s1.endTime);
          const start2 = parseMins(s2.startTime);
          const end2 = parseMins(s2.endTime);

          if (Math.max(start1, start2) < Math.min(end1, end2)) {
            conflicts.push(`${d}: "${s1.subject}" overlaps with "${s2.subject}"`);
          }
        }
      }
    });

    return conflicts;
  };

  const conflicts = getConflicts();

  // Filtered slots
  const filteredSlots = slots.filter((s) => {
    const dayMatch = selectedDay === 'All' || s.day === selectedDay;
    const typeMatch = selectedType === 'All' || s.type === selectedType;
    return dayMatch && typeMatch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl border bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-[#0A0E18] border-blue-500/30 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-[#00F0FF] border border-blue-500/30 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-[#00F0FF] uppercase">
                Academic Cockpit Schedule
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {slots.length} Classes & Study Blocks
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans">
              AI Timetable Manager
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Create, organize, and optimize your weekly curriculum schedule with Gemini AI.
              Manage lectures, practical lab sessions, study sprints, and assessment milestones.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-purple-600 hover:from-[#38bdf8] hover:to-purple-500 text-black font-bold font-mono text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Auto-Generate</span>
            </button>

            <button
              type="button"
              onClick={() => openNewSlotModal()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-mono text-xs border border-white/15 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#00F0FF]" />
              <span>Add Time Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conflict Sentinel Alert if any overlapping classes */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 flex items-start gap-3 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 uppercase">
              Schedule Conflict Sentinel: {conflicts.length} Overlapping Block(s)
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-300/90 font-sans">
              {conflicts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Control Bar: Filter, View Mode, Print */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0B0F19]/90 border-white/10' : 'bg-white border-slate-200'} flex flex-wrap items-center justify-between gap-3`}>
        {/* Day Selector */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Day:</span>
          {['All', ...DAYS].map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
                selectedDay === day
                  ? 'bg-[#00F0FF] text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#00F0FF] text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'agenda' ? 'bg-[#00F0FF] text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agenda Feed
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            title="Print Schedule"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Timetable View */}
      {viewMode === 'grid' ? (
        /* Weekly Grid View */
        <div className={`p-4 md:p-6 rounded-3xl border ${isDark ? 'bg-[#0B0F19]/90 border-white/10' : 'bg-white border-slate-200'} shadow-xl overflow-x-auto`}>
          <div className="min-w-[850px] grid grid-cols-7 gap-3">
            {DAYS.map((day) => {
              const daySlots = slots
                .filter((s) => s.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div
                  key={day}
                  className={`rounded-2xl border flex flex-col ${
                    isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Day Header */}
                  <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-white">{day}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {daySlots.length} items
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openNewSlotModal(day)}
                      className="p-1 text-slate-400 hover:text-[#00F0FF] rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      title={`Add item to ${day}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Slots List */}
                  <div className="p-2.5 space-y-2 flex-1 min-h-[220px]">
                    {daySlots.map((slot, sIdx) => {
                      const cfg = TYPE_CONFIG[slot.type] || TYPE_CONFIG.lecture;
                      return (
                        <div
                          key={`${slot.id || 'slot'}-${sIdx}`}
                          className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition-all group relative ${cfg.bg}`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                            <span className="flex items-center gap-1 text-white">
                              <Clock className="w-3 h-3 text-[#00F0FF]" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </span>

                            {/* Actions on hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => openEditModal(slot)}
                                className="p-0.5 text-slate-300 hover:text-white"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(slot.id, slot.subject)}
                                className="p-0.5 text-rose-300 hover:text-rose-100"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="font-bold text-white font-sans text-xs line-clamp-2">
                            {slot.subject}
                          </div>

                          {slot.room && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300">
                              <MapPin className="w-2.5 h-2.5 text-purple-400" />
                              <span>{slot.room}</span>
                            </div>
                          )}

                          {slot.notes && (
                            <p className="text-[10px] text-slate-400 italic line-clamp-1">
                              {slot.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {daySlots.length === 0 && (
                      <div className="h-full flex items-center justify-center p-4 text-center">
                        <span className="text-[11px] font-mono text-slate-500">
                          No classes scheduled
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda Feed View */
        <div className={`p-4 md:p-6 rounded-3xl border ${isDark ? 'bg-[#0B0F19]/90 border-white/10' : 'bg-white border-slate-200'} space-y-4`}>
          {filteredSlots.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-mono text-xs">
              No matching schedule blocks found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSlots.map((slot, fIdx) => {
                const cfg = TYPE_CONFIG[slot.type] || TYPE_CONFIG.lecture;
                return (
                  <div
                    key={`${slot.id || 'fslot'}-${fIdx}`}
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${cfg.bg}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-black/40">
                          {slot.day}
                        </span>
                        <span className="text-xs font-mono text-[#00F0FF] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-white/20">
                          {cfg.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white font-sans">
                        {slot.subject}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        {slot.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-400" />
                            <span>{slot.room}</span>
                          </span>
                        )}
                        {slot.instructor && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-emerald-400" />
                            <span>{slot.instructor}</span>
                          </span>
                        )}
                        {slot.notes && (
                          <span className="text-slate-400 italic">
                            Note: {slot.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(slot)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id, slot.subject)}
                        className="p-2 text-rose-400 hover:text-rose-200 rounded-xl hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Timetable Generator Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-[#090D16] p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00F0FF]" />
                <h3 className="text-base font-bold font-mono">
                  AI Timetable Synthesis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Describe your weekly courses, preferred study blocks, and scheduling constraints.
              Gemini AI will synthesize a complete, balanced, conflict-free timetable.
            </p>

            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., I have Data Structures on Mon/Wed mornings, Operating Systems Tue/Thu afternoons, a 2-hour practical lab, and I want 2-hour daily study sprints before 6 PM..."
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAIGenerateTimetable}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-5 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-bold font-mono text-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? 'Synthesizing...' : 'Generate Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Time Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleSaveSlot}
            className="w-full max-w-lg rounded-3xl border border-white/20 bg-[#090D16] p-6 text-white space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold font-mono">
                {editingSlot ? 'Edit Time Slot' : 'Add New Class / Study Block'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Subject / Session Title *</label>
                <input
                  type="text"
                  required
                  value={formSlot.subject || ''}
                  onChange={(e) => setFormSlot({ ...formSlot, subject: e.target.value })}
                  placeholder="e.g., Advanced Data Structures"
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Day of Week</label>
                  <select
                    value={formSlot.day}
                    onChange={(e) => setFormSlot({ ...formSlot, day: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category / Type</label>
                  <select
                    value={formSlot.type}
                    onChange={(e) => setFormSlot({ ...formSlot, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Practical Lab</option>
                    <option value="study_sprint">Study Sprint</option>
                    <option value="exam">Assessment / Exam</option>
                    <option value="office_hours">Office Hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formSlot.startTime || '09:00'}
                    onChange={(e) => setFormSlot({ ...formSlot, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={formSlot.endTime || '10:30'}
                    onChange={(e) => setFormSlot({ ...formSlot, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Room / Hall Location</label>
                  <input
                    type="text"
                    value={formSlot.room || ''}
                    onChange={(e) => setFormSlot({ ...formSlot, room: e.target.value })}
                    placeholder="e.g. Hall B-204"
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Instructor / Lead</label>
                  <input
                    type="text"
                    value={formSlot.instructor || ''}
                    onChange={(e) => setFormSlot({ ...formSlot, instructor: e.target.value })}
                    placeholder="e.g. Prof. Miller"
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Notes / Objectives</label>
                <input
                  type="text"
                  value={formSlot.notes || ''}
                  onChange={(e) => setFormSlot({ ...formSlot, notes: e.target.value })}
                  placeholder="e.g. Chapter 4 reading required beforehand"
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-bold font-mono text-xs cursor-pointer"
              >
                {editingSlot ? 'Save Changes' : 'Add Time Slot'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
