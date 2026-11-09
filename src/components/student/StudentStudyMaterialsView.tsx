import React, { useState } from 'react';
import { Material, Question } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { QuickNotesModal } from '../common/QuickNotesModal';
import { GenerateQuestionsModal } from '../teacher/GenerateQuestionsModal';
import { uploadToStorage } from '../../lib/storage';
import {
  BookOpen,
  Search,
  UploadCloud,
  FileText,
  Video,
  ExternalLink,
  Sparkles,
  Zap,
  Play,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap,
  FolderOpen,
  Filter,
  ArrowRight,
  FileCheck,
  Terminal,
} from 'lucide-react';
import {
  StaggerContainer,
  StaggerItem,
  FadeIn,
  SlideUp,
} from '../animation/AnimationComponents';

interface StudentStudyMaterialsViewProps {
  materials: Material[];
  onStartPracticeWithQuestions?: (questions: Question[], topic: string) => void;
  onNavigatePractice?: (topic?: string) => void;
  onAddMaterial?: (material: Material) => void;
}

interface CuratedResource {
  type: 'video' | 'article';
  title: string;
  source: string;
  url: string;
  durationOrReadTime: string;
  summary: string;
}

const TOPIC_RESOURCES: Record<string, CuratedResource[]> = {
  'Trees & Hierarchies': [
    {
      type: 'video',
      title: 'Binary Search Trees & Traversal Algorithms Visualized',
      source: 'Abdul Bari / Algorithms',
      url: 'https://www.youtube.com/results?search_query=Binary+Search+Tree+traversal+Abdul+Bari',
      durationOrReadTime: '18 min',
      summary: 'Mathematical breakdown of In-Order, Pre-Order, and AVL balance factor guarantees.',
    },
    {
      type: 'video',
      title: 'Binary Search Tree - Operations, Traversal, and Insertion',
      source: 'NeetCode',
      url: 'https://www.youtube.com/results?search_query=Binary+Search+Tree+NeetCode',
      durationOrReadTime: '12 min',
      summary: 'Practical code walkthrough for recursion stack invariants and edge cases.',
    },
    {
      type: 'article',
      title: 'BST Visualizer & Interactive Complexity Sandbox',
      source: 'VisuAlgo.net',
      url: 'https://visualgo.net/en/bst',
      durationOrReadTime: '8 min interactive',
      summary: 'Step-through animations showing dynamic tree rotations and balance restoration.',
    },
    {
      type: 'article',
      title: 'Binary Search Tree Invariants & Deletion Guide',
      source: 'Stanford CS Education Library',
      url: 'http://cslibrary.stanford.edu/110/BinaryTrees.html',
      durationOrReadTime: '10 min read',
      summary: 'Definitive guide on pointer invariants, recursion stack limits, and balance proofs.',
    },
  ],
  'Graph Algorithms': [
    {
      type: 'video',
      title: 'Breadth-First Search (BFS) & Depth-First Search (DFS) In-Depth',
      source: 'WilliamFiset',
      url: 'https://www.youtube.com/results?search_query=BFS+and+DFS+Graph+Algorithms+WilliamFiset',
      durationOrReadTime: '22 min',
      summary: 'Visualizing FIFO Queue state vs recursion call stacks and back-edge cycle detection.',
    },
    {
      type: 'video',
      title: 'Dijkstra Shortest Path Algorithm Explained Visually',
      source: 'Abdul Bari',
      url: 'https://www.youtube.com/results?search_query=Dijkstra+Shortest+Path+Algorithm+Abdul+Bari',
      durationOrReadTime: '16 min',
      summary: 'Visualizing greedy edge relaxation proofs and priority queue complexity bounds.',
    },
    {
      type: 'article',
      title: 'Graph Traversal & Topological Ordering Deep Dive',
      source: 'MIT OpenCourseWare (6.006)',
      url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
      durationOrReadTime: '15 min read',
      summary: 'Rigorous lecture notes proving cycle detection invariants and strongly connected components.',
    },
  ],
  'Dynamic Programming': [
    {
      type: 'video',
      title: 'Dynamic Programming - Learn to Solve Algorithmic Problems',
      source: 'freeCodeCamp',
      url: 'https://www.youtube.com/results?search_query=dynamic+programming+freecodecamp',
      durationOrReadTime: '45 min',
      summary: 'Comprehensive breakdown of 0/1 Knapsack, memoization trees, and bottom-up tabular optimization.',
    },
    {
      type: 'article',
      title: 'Demystifying Dynamic Programming Recurrences',
      source: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/dynamic-programming/',
      durationOrReadTime: '12 min read',
      summary: 'Transition functions, state space minimization, and DAG topological sub-problem ordering.',
    },
  ],
};

const DEFAULT_RESOURCES: CuratedResource[] = [
  {
    type: 'video',
    title: 'Core Algorithmic Complexity & Asymptotic Analysis',
    source: 'MIT 6.006 Algorithms',
    url: 'https://www.youtube.com/results?search_query=MIT+6.006+algorithms+lecture+1',
    durationOrReadTime: '20 min',
    summary: 'Master equation proofs, recursion trees, and asymptotic bounds.',
  },
  {
    type: 'article',
    title: 'Interactive Algorithm Visualizer & Complexity Sandbox',
    source: 'Algorithm Visualizer',
    url: 'https://algorithm-visualizer.org/',
    durationOrReadTime: '10 min interactive',
    summary: 'Live execution visualizer stepping through code line-by-line with call stack diagnostics.',
  },
];

export const StudentStudyMaterialsView: React.FC<StudentStudyMaterialsViewProps> = ({
  materials,
  onStartPracticeWithQuestions,
  onNavigatePractice,
  onAddMaterial,
}) => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [quickNotesTopic, setQuickNotesTopic] = useState<string | null>(null);

  // Question generator modal state
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [selectedForGen, setSelectedForGen] = useState<Material | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const subjects = Array.from(new Set(materials.map((m) => m.subject).filter(Boolean)));

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.structuredConcepts?.some((st) =>
        st.concepts.some((c) => c.concept.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    const matchesSubject = selectedSubject === 'all' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getResourcesForMaterial = (mat: Material): CuratedResource[] => {
    const topic = mat.topic || '';
    if (TOPIC_RESOURCES[topic]) return TOPIC_RESOURCES[topic];
    for (const [key, resources] of Object.entries(TOPIC_RESOURCES)) {
      if (topic.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(topic.toLowerCase())) {
        return resources;
      }
    }
    return DEFAULT_RESOURCES;
  };

  const handleStudentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showToast(`Uploading and extracting "${file.name}"...`, 'info');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: file.type || 'application/pdf',
            fileName: file.name,
          }),
        });

        if (!res.ok) throw new Error('Document extraction failed');
        const data = await res.json();

        let studentStoragePath = '';
        let studentStorageUrl = '';
        try {
          studentStoragePath = `student-uploads/${userProfile?.userId || 'student'}/${Date.now()}_${file.name}`;
          studentStorageUrl = await uploadToStorage(studentStoragePath, file);
        } catch {
          // Fallback handled transparently
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
        const inferredFileType = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt', 'csv', 'md'].includes(ext)
          ? ext
          : file.type.includes('pdf')
          ? 'pdf'
          : file.type.includes('doc')
          ? 'docx'
          : 'txt';

        const newMat: Material = {
          materialId: `mat-student-${Date.now()}`,
          teacherId: userProfile?.userId || 'student-01',
          fileName: file.name,
          fileType: inferredFileType as any,
          storagePath: studentStoragePath,
          fileUrl: studentStorageUrl,
          subject: data.subject || 'Student Notes',
          topic: data.topics?.[0]?.name || file.name.replace(/\.[^/.]+$/, ''),
          uploadDate: new Date().toISOString(),
          processingStatus: 'processed',
          extractedText: data.extractedText ? data.extractedText.slice(0, 150000) : '',
          structuredConcepts: data.topics || [],
          summary: data.summary || 'Student uploaded document for practice questions and revision.',
        };

        if (onAddMaterial) {
          onAddMaterial(newMat);
        }
        showToast(`Document "${file.name}" ready! You can now generate questions from it.`, 'success');
        setSelectedForGen(newMat);
        setGenModalOpen(true);
      } catch (err: any) {
        showToast(err.message || 'Failed to upload document', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7 text-white">
      {/* Tactical HUD Header */}
      <SlideUp>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl text-xs font-mono font-bold text-[#00F0FF] mb-2">
              <FolderOpen className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>OFFICIAL CURRICULUM ARCHIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Course Study Materials & AI Knowledge Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Access lecture handouts, slides, and study notes uploaded by faculty, paired with AI-curated video lectures, academic articles, and on-demand question synthesis.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Upload Any Document Button */}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] active:scale-95">
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Analyzing...' : 'Upload Doc for Questions'}</span>
              <input
                type="file"
                accept=".pdf,.txt,.docx,.doc,.pptx,.ppt,.md,.csv,.png,.jpg"
                onChange={handleStudentUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setSelectedForGen(null);
                setGenModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 fill-black text-black" />
              <span>Synthesize Questions</span>
            </button>
          </div>
        </div>
      </SlideUp>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0A0D14]/85 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study materials by file name, topic, or concept (e.g., AVL, Trees, BFS)..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-400 focus:outline-hidden focus:border-[#00F0FF] transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-mono py-1.5 px-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-hidden focus:border-[#00F0FF]"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Count Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] flex items-center justify-center shrink-0 border border-[#00F0FF]/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Teacher Handouts</span>
            <span className="text-lg font-extrabold text-white tabular-nums">{materials.length} Documents</span>
          </div>
        </div>

        <div className="p-4 bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AI YouTube Lessons</span>
            <span className="text-lg font-extrabold text-white">Curated Lectures</span>
          </div>
        </div>

        <div className="p-4 bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Adaptive Generator</span>
            <span className="text-lg font-extrabold text-white">Active from Docs</span>
          </div>
        </div>
      </div>

      {/* Study Materials Cards List */}
      <div className="space-y-6">
        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md space-y-3 font-mono">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No study materials match your search</h3>
            <p className="text-xs text-slate-400">Try changing your search keywords or upload a new document.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMaterials.map((mat, matIdx) => {
              const resources = getResourcesForMaterial(mat);
              const concepts = mat.structuredConcepts
                ? mat.structuredConcepts.flatMap((st) => st.concepts.map((c) => c.concept))
                : [mat.topic];

              return (
                <div
                  key={`${mat.materialId || 'mat'}-${matIdx}`}
                  className="bg-[#0A0D14]/80 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl overflow-hidden transition-all hover:border-[#00F0FF]/30"
                >
                  {/* Top Bar of Material Card */}
                  <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-[#00F0FF] flex items-center justify-center shadow-lg shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {mat.fileName}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                            {mat.subject}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white/5 border border-white/10 text-slate-300">
                            {mat.fileType}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                          {mat.summary ||
                            mat.extractedText?.slice(0, 220) + '...' ||
                            'Official course handout uploaded by faculty covering core syllabus definitions and theorems.'}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              Uploaded {new Date(mat.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </span>
                          <span>·</span>
                          <span className="text-[#10B981] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                            <span>AI Calibrated into Assessment Bank</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 font-mono">
                      <button
                        type="button"
                        onClick={() => setPreviewMaterial(mat)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Handout</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedForGen(mat);
                          setGenModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Questions</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickNotesTopic(mat.topic || mat.fileName)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      >
                        <Zap className="w-3.5 h-3.5 fill-black text-black" />
                        <span>Quick Notes</span>
                      </button>
                    </div>
                  </div>

                  {/* Concepts Chips */}
                  {concepts.length > 0 && (
                    <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center gap-2 overflow-x-auto font-mono">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                        Concepts Covered:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {concepts.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-black/40 text-slate-300 border border-white/10"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Curated Videos & Academic Links Section */}
                  <div className="p-6 bg-black/20 space-y-4">
                    <div className="flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>AI Recommended Videos & Academic Visualizers</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Verified External Deep Dives
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono">
                      {/* YouTube Videos */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5" />
                          <span>Curated Video Lessons:</span>
                        </div>
                        {resources
                          .filter((r) => r.type === 'video')
                          .map((vid, idx) => (
                            <a
                              key={idx}
                              href={vid.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-rose-400/50 transition-all flex flex-col justify-between group block shadow-md"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                  {vid.source}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span>{vid.durationOrReadTime}</span>
                                  <ExternalLink className="w-3 h-3 group-hover:text-rose-400" />
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-white mt-1 group-hover:text-rose-300 leading-snug">
                                {vid.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {vid.summary}
                              </p>
                            </a>
                          ))}
                      </div>

                      {/* Academic Articles & Visualizers */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Articles & Interactive Visualizers:</span>
                        </div>
                        {resources
                          .filter((r) => r.type === 'article')
                          .map((art, idx) => (
                            <a
                              key={idx}
                              href={art.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-[#00F0FF]/50 transition-all flex flex-col justify-between group block shadow-md"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded border border-[#00F0FF]/20">
                                  {art.source}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span>{art.durationOrReadTime}</span>
                                  <ExternalLink className="w-3 h-3 group-hover:text-[#00F0FF]" />
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-white mt-1 group-hover:text-[#00F0FF] leading-snug">
                                {art.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {art.summary}
                              </p>
                            </a>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Document Question Generator */}
      <GenerateQuestionsModal
        isOpen={genModalOpen}
        onClose={() => {
          setGenModalOpen(false);
          setSelectedForGen(null);
        }}
        materials={materials}
        selectedMaterial={selectedForGen}
        onAddApprovedQuestions={(questions) => {
          setGenModalOpen(false);
          if (onStartPracticeWithQuestions) {
            onStartPracticeWithQuestions(questions, selectedForGen?.topic || 'Document Practice');
          } else if (onNavigatePractice) {
            onNavigatePractice(selectedForGen?.topic || 'Practice');
          }
          showToast(`Loaded ${questions.length} questions from document into practice session!`, 'success');
        }}
      />

      {/* Modal: AI Quick Notes */}
      {quickNotesTopic && (
        <QuickNotesModal
          isOpen={!!quickNotesTopic}
          onClose={() => setQuickNotesTopic(null)}
          initialTopic={quickNotesTopic}
          role="student"
          onStartPractice={(top) => {
            setQuickNotesTopic(null);
            if (onNavigatePractice) onNavigatePractice(top);
          }}
        />
      )}

      {/* Modal: Handout Reader & Excerpt Viewer */}
      {previewMaterial && (
        <Modal
          isOpen={!!previewMaterial}
          onClose={() => setPreviewMaterial(null)}
          title={previewMaterial.fileName}
          subtitle={`Curriculum Handout · ${previewMaterial.subject}`}
        >
          <div className="space-y-4 text-xs text-white">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 font-mono">
              <span className="font-bold block uppercase text-[10px] text-[#00F0FF]">Document Information:</span>
              <p className="text-xs text-slate-300">
                {previewMaterial.summary || 'Official study material calibrated into intelligent assessment bank.'}
              </p>
            </div>

            {previewMaterial.structuredConcepts && previewMaterial.structuredConcepts.length > 0 && (
              <div>
                <h4 className="font-mono font-bold text-white mb-1.5 uppercase text-[11px]">
                  Concepts Extracted by AI:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {previewMaterial.structuredConcepts
                    .flatMap((st) => st.concepts.map((c) => c.concept))
                    .map((conceptName, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white/5 text-slate-300 border border-white/10"
                      >
                        {conceptName}
                      </span>
                    ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-mono font-bold text-white mb-1.5 uppercase text-[11px]">
                Full Material Excerpt & Course Text:
              </h4>
              <div className="p-4 bg-black/40 rounded-xl border border-white/10 max-h-72 overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-300">
                {previewMaterial.extractedText ||
                  previewMaterial.summary ||
                  'Course lecture handout text.'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono">
              <button
                type="button"
                onClick={() => {
                  setPreviewMaterial(null);
                  setSelectedForGen(previewMaterial);
                  setGenModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Questions from this Document</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                Close Reader
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
