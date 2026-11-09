import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import {
  ClassroomRoom,
  CommunityPost,
  CommunityReply,
  CommunityAttachment,
} from '../../types';
import { communityService } from '../../services/communityService';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Download,
  Eye,
  Plus,
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Filter,
  Paperclip,
  Trash2,
  X,
  Copy,
  ChevronDown,
  Clock,
  AlertCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const CommunityView: React.FC = () => {
  const { userProfile, role } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();

  const isTeacher = role === 'teacher' || role === 'admin';

  // Classrooms State
  const [classrooms, setClassrooms] = useState<ClassroomRoom[]>([]);
  const [activeClassroomId, setActiveClassroomId] = useState<string>('room-general');

  // Posts State
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('all');

  // New Classroom Modal (Teacher only)
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');

  // New Post State
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'announcement' | 'material' | 'doubt'>('announcement');
  const [attachmentFileName, setAttachmentFileName] = useState('');
  const [attachmentContent, setAttachmentContent] = useState('');

  // Reply state per post
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyTargetMap, setReplyTargetMap] = useState<Record<string, string>>({}); // e.g. "@Alex Rivera"
  const [isVerifyingMap, setIsVerifyingMap] = useState<Record<string, boolean>>({});
  const [guardWarningMap, setGuardWarningMap] = useState<Record<string, string>>({});

  // Document Preview Modal
  const [previewAttachment, setPreviewAttachment] = useState<CommunityAttachment | null>(null);

  // Load classrooms & posts
  useEffect(() => {
    refreshCommunity();
  }, []);

  const refreshCommunity = () => {
    const loadedRooms = communityService.getClassrooms();
    setClassrooms(loadedRooms);
    if (loadedRooms.length > 0 && !loadedRooms.some((r) => r.id === activeClassroomId)) {
      setActiveClassroomId(loadedRooms[0].id);
    }
    const loadedPosts = communityService.getPosts();
    setPosts(loadedPosts);
  };

  const activeRoom = classrooms.find((r) => r.id === activeClassroomId) || classrooms[0];

  // Unique faculty members for filtering
  const facultyMembers = Array.from(
    new Set(posts.filter((p) => p.authorRole === 'teacher').map((p) => p.authorName))
  );

  // Filter posts by active classroom & selected faculty filter
  const displayedPosts = posts.filter((p) => {
    const matchesRoom = p.classroomId === activeClassroomId;
    const matchesFaculty =
      selectedFacultyFilter === 'all' || p.authorName === selectedFacultyFilter;
    return matchesRoom && matchesFaculty;
  });

  // Handle Create Classroom (Teacher only)
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !newRoomSubject.trim()) {
      showToast('Please enter room name and subject', 'warning');
      return;
    }
    const created = communityService.createClassroom({
      name: newRoomName.trim(),
      subject: newRoomSubject.trim(),
      code: newRoomCode.trim() || `CLS-${Math.floor(100 + Math.random() * 900)}`,
      description: newRoomDesc.trim() || `Coursework and doubts hub for ${newRoomSubject.trim()}.`,
      teacherId: userProfile?.userId || 'faculty-01',
      teacherName: userProfile?.name || 'Dr. Alan Vance',
    });
    setClassrooms(communityService.getClassrooms());
    setActiveClassroomId(created.id);
    setIsNewRoomModalOpen(false);
    setNewRoomName('');
    setNewRoomSubject('');
    setNewRoomCode('');
    setNewRoomDesc('');
    showToast(`Created new class session "${created.name}"!`, 'success');
  };

  // Handle Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      showToast('Please provide a title and post content', 'warning');
      return;
    }

    const attachments: CommunityAttachment[] = [];
    if (attachmentFileName.trim()) {
      attachments.push({
        name: attachmentFileName.trim(),
        size: '1.8 MB',
        type: attachmentFileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'notes',
        contentPreview: attachmentContent.trim() || `Course notes for ${newPostTitle.trim()}.`,
      });
    }

    communityService.createPost({
      classroomId: activeClassroomId,
      authorId: userProfile?.userId || (isTeacher ? 'faculty-01' : 'student-01'),
      authorName: userProfile?.name || (isTeacher ? 'Dr. Alan Vance' : 'Alex Rivera'),
      authorRole: isTeacher ? 'teacher' : 'student',
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      postType: isTeacher ? newPostType : 'doubt',
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setPosts(communityService.getPosts());
    setIsNewPostModalOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
    setAttachmentFileName('');
    setAttachmentContent('');
    showToast('Published post to classroom stream!', 'success');
  };

  // Handle Student / Teacher Reply with AI Study Guard
  const handleSendReply = async (postId: string) => {
    const rawText = replyTextMap[postId] || '';
    const targetMention = replyTargetMap[postId] ? `${replyTargetMap[postId]} ` : '';
    const fullText = (targetMention + rawText).trim();

    if (!fullText) {
      showToast('Please type a reply or question.', 'warning');
      return;
    }

    // Clear previous warning
    setGuardWarningMap((prev) => ({ ...prev, [postId]: '' }));

    // AI Study Guard verification for students
    if (!isTeacher) {
      setIsVerifyingMap((prev) => ({ ...prev, [postId]: true }));
      try {
        const verification = await communityService.verifyStudyRelatedness(
          rawText,
          posts.find((p) => p.id === postId)?.title
        );

        if (!verification.isStudyRelated) {
          setIsVerifyingMap((prev) => ({ ...prev, [postId]: false }));
          setGuardWarningMap((prev) => ({
            ...prev,
            [postId]: verification.reason || 'Message not recognized as coursework or study-related.',
          }));
          showToast('AI Study Guard: Please keep messages study-related.', 'warning');
          return;
        }
      } catch (err) {
        console.warn('AI Guard check error:', err);
      } finally {
        setIsVerifyingMap((prev) => ({ ...prev, [postId]: false }));
      }
    }

    // Post reply
    communityService.addReply(postId, {
      postId,
      authorId: userProfile?.userId || (isTeacher ? 'faculty-01' : 'student-01'),
      authorName: userProfile?.name || (isTeacher ? 'Dr. Alan Vance' : 'Alex Rivera'),
      authorRole: isTeacher ? 'teacher' : 'student',
      content: fullText,
      replyToUser: replyTargetMap[postId]?.replace(/^@/, '') || undefined,
      isOfficialFacultyAnswer: isTeacher,
      aiVerification: !isTeacher ? { isStudyRelated: true, confidence: 0.99 } : undefined,
    });

    setPosts(communityService.getPosts());
    setReplyTextMap((prev) => ({ ...prev, [postId]: '' }));
    setReplyTargetMap((prev) => ({ ...prev, [postId]: '' }));
    setGuardWarningMap((prev) => ({ ...prev, [postId]: '' }));
    showToast(isTeacher ? 'Faculty answer posted!' : 'Doubt posted and verified by AI Study Guard!', 'success');
  };

  // Download attachment as text file
  const handleDownloadAttachment = (att: CommunityAttachment) => {
    const element = document.createElement('a');
    const fileContent = att.contentPreview || `Attached file: ${att.name}\nPublished in Course Room: ${activeRoom?.name}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = att.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloaded "${att.name}"`, 'success');
  };

  return (
    <div className={`max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* 1. Header & Classroom Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-[#00F0FF]">
            <GraduationCap className="w-4 h-4 text-[#00F0FF]" />
            <span className="uppercase tracking-wider font-mono">ACADEMIC COMMUNITY & CLASSROOMS</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Course Rooms & Doubt Clearing Hub
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Google Classroom-style collaborative learning. Download faculty lecture notes, post doubts, and discuss course concepts under AI Study Guard protection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Create Classroom (Teacher only) */}
          {isTeacher && (
            <button
              type="button"
              onClick={() => setIsNewRoomModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold font-mono text-black bg-[#10B981] hover:bg-[#34d399] rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Class Session</span>
            </button>
          )}

          {/* New Post Button */}
          <button
            type="button"
            onClick={() => setIsNewPostModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isTeacher ? 'Post Announcement / Handout' : 'Ask Academic Doubt'}</span>
          </button>
        </div>
      </div>

      {/* 2. Active Classroom Banner (Google Classroom Style) */}
      <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-r ${activeRoom?.bannerColor || 'from-blue-600 to-indigo-800'} text-white shadow-xl relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold">
                {activeRoom?.subject}
              </span>
              {activeRoom?.isDefault && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-bold">
                  Default All-Cohort Room
                </span>
              )}
              <span className="text-white/80 font-mono text-xs">
                Code: <strong className="text-white">{activeRoom?.code}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{activeRoom?.name}</h2>
            <p className="text-xs text-white/90 leading-relaxed pt-1">{activeRoom?.description}</p>
            <div className="text-[11px] text-white/80 font-mono pt-1">
              Instructor: <strong className="text-white">{activeRoom?.teacherName}</strong>
            </div>
          </div>

          {/* Classroom Selector Dropdown */}
          <div className="shrink-0 space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/80 block">
              Switch Course Room
            </label>
            <div className="relative">
              <select
                value={activeClassroomId}
                onChange={(e) => setActiveClassroomId(e.target.value)}
                className="w-full md:w-64 px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-xs font-mono font-bold focus:outline-hidden cursor-pointer"
              >
                {classrooms.map((room) => (
                  <option key={room.id} value={room.id} className="bg-slate-900 text-white">
                    {room.name} ({room.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stream Controls: Faculty Filter & Search */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
        isDark ? 'bg-[#0A0D14]/85 border-white/10' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#00F0FF]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Faculty Posts Filter:
          </span>
          <select
            value={selectedFacultyFilter}
            onChange={(e) => setSelectedFacultyFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${
              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
            } focus:outline-hidden cursor-pointer`}
          >
            <option value="all">All Faculty & Student Posts</option>
            {facultyMembers.map((fac) => (
              <option key={fac} value={fac}>
                Only {fac}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-lg border border-emerald-800/40">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AI Study Guard Active (Academic Filter Enforced)</span>
        </div>
      </div>

      {/* 4. Stream Posts Feed */}
      <div className="space-y-6">
        {displayedPosts.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-[#0A0D14]/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
            <MessageSquare className="w-12 h-12 mx-auto text-slate-500 opacity-50" />
            <h3 className="text-sm font-bold">No posts in this classroom yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Be the first to share a lecture note or ask an academic question! Click "Post Announcement / Handout" above.
            </p>
          </div>
        ) : (
          displayedPosts.map((post, postIdx) => (
            <div
              key={`${post.id || 'post'}-${postIdx}`}
              className={`p-6 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-[#0A0D14]/90 border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
              } space-y-4 font-sans`}
            >
              {/* Post Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    post.authorRole === 'teacher'
                      ? 'bg-blue-500/20 text-[#00F0FF] border border-[#00F0FF]/30'
                      : 'bg-emerald-500/20 text-[#10B981] border border-[#10B981]/30'
                  }`}>
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm leading-none">{post.authorName}</span>
                      {post.authorRole === 'teacher' ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-[#00F0FF] border border-[#00F0FF]/30">
                          Verified Faculty
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Student Scholar
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg ${
                  post.postType === 'material'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : post.postType === 'doubt'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}>
                  {post.postType}
                </span>
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <h3 className="text-base font-bold tracking-tight">{post.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'} whitespace-pre-wrap`}>
                  {post.content}
                </p>
              </div>

              {/* Attachments Section (Documents, Handouts, PDFs) */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Faculty Attached Documents & Study Handouts:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {post.attachments.map((att, attIdx) => (
                      <div
                        key={attIdx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:border-[#00F0FF]/40'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate">{att.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{att.size} · PDF Handout</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {att.contentPreview && (
                            <button
                              type="button"
                              onClick={() => setPreviewAttachment(att)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00F0FF] hover:bg-white/10 transition-colors cursor-pointer"
                              title="Preview Document Handout"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(att)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-colors cursor-pointer shadow-xs"
                            title="Download Handout"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Threaded Discussion / Doubt Clearing Section */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>Academic Inquiries & Faculty Responses ({post.replies.length})</span>
                  </span>
                </div>

                {/* Replies Stream */}
                {post.replies.length > 0 && (
                  <div className="space-y-2.5 pl-2 sm:pl-4 border-l-2 border-white/10">
                    {post.replies.map((reply, replyIdx) => (
                      <div
                        key={`${reply.id || 'rep'}-${replyIdx}`}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          reply.isOfficialFacultyAnswer
                            ? isDark ? 'bg-blue-950/20 border-blue-500/30' : 'bg-blue-50/70 border-blue-200'
                            : isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{reply.authorName}</span>
                            {reply.isOfficialFacultyAnswer && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                                Official Faculty Resolution
                              </span>
                            )}
                            {reply.replyToUser && (
                              <span className="text-[10px] font-mono text-cyan-400">
                                replying to @{reply.replyToUser}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {/* Teacher can click to reply specifically to this individual student */}
                            {isTeacher && reply.authorRole === 'student' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyTargetMap((prev) => ({ ...prev, [post.id]: `@${reply.authorName}` }));
                                  setReplyTextMap((prev) => ({
                                    ...prev,
                                    [post.id]: prev[post.id] || '',
                                  }));
                                }}
                                className="text-[10px] font-mono text-[#00F0FF] hover:underline cursor-pointer"
                              >
                                Reply to Student
                              </button>
                            )}
                          </div>
                        </div>

                        <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {reply.content}
                        </p>

                        {reply.aiVerification?.isStudyRelated && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono pt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Verified Coursework Inquiry</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Study Guard Warning (if flagged) */}
                {guardWarningMap[post.id] && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">AI Study Guard Notice: </strong>
                      <span>{guardWarningMap[post.id]}</span>
                    </div>
                  </div>
                )}

                {/* Reply Input Box */}
                <div className="space-y-1.5 pt-1">
                  {replyTargetMap[post.id] && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 px-2">
                      <span>Replying to {replyTargetMap[post.id]}</span>
                      <button
                        type="button"
                        onClick={() => setReplyTargetMap((prev) => ({ ...prev, [post.id]: '' }))}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        Cancel mention
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyTextMap[post.id] || ''}
                      onChange={(e) => {
                        setReplyTextMap((prev) => ({ ...prev, [post.id]: e.target.value }));
                        if (guardWarningMap[post.id]) {
                          setGuardWarningMap((prev) => ({ ...prev, [post.id]: '' }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendReply(post.id);
                        }
                      }}
                      placeholder={
                        isTeacher
                          ? 'Write faculty answer or guidance (public to class)...'
                          : 'Ask a doubt or question about this topic (AI Study Guard protected)...'
                      }
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-xs font-sans ${
                        isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      } focus:outline-hidden focus:border-[#00F0FF]`}
                    />

                    <button
                      type="button"
                      disabled={isVerifyingMap[post.id]}
                      onClick={() => handleSendReply(post.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isVerifyingMap[post.id] ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>AI Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{isTeacher ? 'Post Answer' : 'Submit Doubt'}</span>
                        </>
                      )}
                    </button>
                  </div>
                  {!isTeacher && (
                    <div className="text-[10px] text-slate-400 font-mono px-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#00F0FF]" />
                      <span>AI Study Guard checks that your reply is coursework-related before sending.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Create New Class Session (Teacher) */}
      <Modal
        isOpen={isNewRoomModalOpen}
        onClose={() => setIsNewRoomModalOpen(false)}
        title="Create Academic Class Session"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase">Course Title / Session Name</label>
            <input
              type="text"
              required
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="e.g., CS 402: Distributed Systems & Consensus"
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase">Subject Discipline</label>
              <input
                type="text"
                required
                value={newRoomSubject}
                onChange={(e) => setNewRoomSubject(e.target.value)}
                placeholder="e.g., Computer Science"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase">Room Code</label>
              <input
                type="text"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                placeholder="e.g., CS-402"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase">Room Description & Syllabus Scope</label>
            <textarea
              rows={3}
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
              placeholder="Enter course scope, recitation schedule, and doubt clearing objectives..."
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsNewRoomModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold font-mono text-black bg-[#10B981] hover:bg-[#34d399] transition-all cursor-pointer shadow-md"
            >
              Create Classroom
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: New Announcement / Handout Post */}
      <Modal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        title={isTeacher ? 'Publish Course Announcement / Handout' : 'Ask Academic Doubt'}
      >
        <form onSubmit={handleCreatePost} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase">Topic / Heading</label>
            <input
              type="text"
              required
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder={isTeacher ? 'e.g., Lecture Handout: Graph BFS/DFS Invariants' : 'e.g., Doubt regarding Dijkstra negative weight cycles'}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF]"
            />
          </div>

          {isTeacher && (
            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase">Post Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewPostType('announcement')}
                  className={`p-2.5 rounded-xl border text-center font-mono font-bold cursor-pointer ${
                    newPostType === 'announcement'
                      ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF]'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setNewPostType('material')}
                  className={`p-2.5 rounded-xl border text-center font-mono font-bold cursor-pointer ${
                    newPostType === 'material'
                      ? 'border-purple-500 bg-purple-500/15 text-purple-400'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  Course Material Handout
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase">Description / Detailed Guidance</label>
            <textarea
              rows={4}
              required
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Provide complete explanation, lecture instructions, or your conceptual doubt..."
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF] resize-none"
            />
          </div>

          {/* Teacher Document Upload Section */}
          {isTeacher && (
            <div className="p-3.5 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <div className="flex items-center gap-2 font-mono font-bold text-slate-300">
                <Paperclip className="w-4 h-4 text-[#00F0FF]" />
                <span>Attach Course Document (Handout / Slides / Formula Sheet)</span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-mono uppercase">File Name (with extension)</label>
                <input
                  type="text"
                  value={attachmentFileName}
                  onChange={(e) => setAttachmentFileName(e.target.value)}
                  placeholder="e.g., Week4_Recitation_Handout.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-mono uppercase">Document Text / Key Excerpts</label>
                <textarea
                  rows={3}
                  value={attachmentContent}
                  onChange={(e) => setAttachmentContent(e.target.value)}
                  placeholder="Paste handout text, key equations, or summary notes for students to download..."
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#00F0FF] resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsNewPostModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold font-mono text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all cursor-pointer shadow-md"
            >
              Publish to Stream
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Preview Document Handout */}
      <Modal
        isOpen={previewAttachment !== null}
        onClose={() => setPreviewAttachment(null)}
        title={previewAttachment?.name || 'Document Handout'}
      >
        <div className="space-y-4 font-sans">
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
            {previewAttachment?.contentPreview || 'No preview available for this document.'}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono text-slate-400">{previewAttachment?.size} · Verified Faculty Handout</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white cursor-pointer text-xs font-mono"
              >
                Close
              </button>
              {previewAttachment && (
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadAttachment(previewAttachment);
                    setPreviewAttachment(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Handout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
