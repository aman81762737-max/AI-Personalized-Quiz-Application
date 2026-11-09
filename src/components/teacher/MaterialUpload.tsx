import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Material } from '../../types';
import { FileDataPayload } from '../../services/aiService';
import { useToast } from '../common/Toast';
import { synthesisManager } from '../../services/documentSynthesisManager';
import { deleteMaterialFromCloud } from '../../services/cloudSyncService';
import { ViewAllMaterialsModal } from './ViewAllMaterialsModal';
import {
  AIThinkingAnimation,
  FadeIn,
  SlideUp,
} from '../animation/AnimationComponents';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Plus,
  Loader2,
  X,
  FolderOpen,
  Terminal,
  Trash2,
  List,
  Cpu,
  Activity,
  Layers,
  Radio,
} from 'lucide-react';

interface MaterialUploadProps {
  materials: Material[];
  onAddMaterial: (material: Material) => void;
  onUpdateMaterial?: (material: Material) => void;
  onDeleteMaterial?: (materialId: string) => void;
  onSelectForQuestions: (material: Material) => void;
}

export const MaterialUpload: React.FC<MaterialUploadProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onSelectForQuestions,
}) => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Data Structures');
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileDataPayload | null>(null);
  const [fileExtension, setFileExtension] = useState<string>('');
  const [rawFile, setRawFile] = useState<File | null>(null);

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    materials.length > 0 ? materials[0] : null
  );

  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Sync synthesisManager with current materials
  useEffect(() => {
    synthesisManager.updateMaterials(materials);
  }, [materials]);

  // Keep selected material updated if current changes
  useEffect(() => {
    if (selectedMaterial) {
      const match = materials.find((m) => m.materialId === selectedMaterial.materialId);
      if (match) {
        setSelectedMaterial(match);
      } else if (materials.length > 0) {
        setSelectedMaterial(materials[0]);
      } else {
        setSelectedMaterial(null);
      }
    } else if (materials.length > 0) {
      setSelectedMaterial(materials[0]);
    }
  }, [materials]);

  const processSelectedFile = (file: File) => {
    setFileName(file.name);
    setRawFile(file);

    // Auto-infer topic & format from filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    setFileExtension(ext);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
    if (topic === 'Data Structures' || !topic.trim()) {
      setTopic(nameWithoutExt);
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('File exceeds 50MB limit. Please upload a smaller file.', 'error');
      return;
    }

    const textExtensions = [
      'txt', 'md', 'markdown', 'json', 'csv', 'tsv', 'html', 'xml', 'yaml', 'yml',
      'py', 'js', 'jsx', 'ts', 'tsx', 'java', 'cpp', 'c', 'h', 'cs', 'sql', 'sh', 'r', 'tex'
    ];
    const isTextFile = textExtensions.includes(ext) || (file.type && file.type.startsWith('text/'));

    if (isTextFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = (event.target?.result as string) || '';
        setExtractedText(content);
        try {
          const base64 = btoa(unescape(encodeURIComponent(content)));
          setUploadedFile({
            mimeType: file.type || 'text/plain',
            base64,
            fileName: file.name,
            size: file.size,
          });
        } catch {
          setUploadedFile(null);
        }
        showToast(`Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'success');
      };
      reader.onerror = () => {
        showToast('Error reading text file.', 'error');
      };
      reader.readAsText(file);
    } else {
      // Multimodal files: PDF, DOCX, DOC, PPTX, PPT, XLSX, XLS, PNG, JPG, JPEG, WEBP, etc.
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = (event.target?.result as string) || '';
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        const mimeType = file.type || (ext === 'pdf' ? 'application/pdf' : 'application/octet-stream');
        const payload: FileDataPayload = {
          mimeType,
          base64,
          fileName: file.name,
          size: file.size,
        };
        setUploadedFile(payload);

        // Preview snippet
        setExtractedText(
          `[Attached Multimodal File: ${file.name}]\n` +
          `File format: ${ext.toUpperCase()}\n` +
          `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB\n` +
          `Processing Pipeline: Gemini 3.8 Flash Document Vision`
        );
        showToast(`Loaded ${file.name} for AI analysis`, 'success');
      };
      reader.onerror = () => {
        showToast('Error reading binary document.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleResetFormForNewUpload = () => {
    setUploadedFile(null);
    setFileName('');
    setExtractedText('');
    setFileExtension('');
    setRawFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Ready for another document upload. You can process multiple documents in parallel!', 'info');
  };

  const handleProcessMaterial = async () => {
    if (!extractedText.trim() && !uploadedFile) {
      showToast('Please provide course text or attach a file', 'warning');
      return;
    }

    const currentDocName = fileName || `${topic} Material`;
    setIsProcessing(true);

    try {
      showToast(`Starting background synthesis for "${currentDocName}"...`, 'info');

      // Start background synthesis: immediately creates a draft with status 'processing'
      const draft = await synthesisManager.startSynthesis({
        fileName: currentDocName,
        fileExtension: fileExtension || 'txt',
        subject,
        topic,
        extractedText,
        uploadedFile,
        rawFile,
        userId: userProfile?.userId || 'faculty-01',
        onSuccess: (completedMat) => {
          showToast(`"${completedMat.fileName}" synthesized and ready!`, 'success');
          if (onUpdateMaterial) {
            onUpdateMaterial(completedMat);
          }
        },
        onError: () => {
          // Clean, user-friendly failure notice (no giant error dumps)
          showToast(`Synthesis failed for "${currentDocName}". Please try again with a cleaner document or text.`, 'error');
          if (onDeleteMaterial) {
            onDeleteMaterial(draft.materialId);
          }
        },
      });

      // Add draft immediately to component parent
      onAddMaterial(draft);
      setSelectedMaterial(draft);

      // Reset form so the teacher can immediately begin uploading another document!
      setFileName('');
      setExtractedText('');
      setUploadedFile(null);
      setFileExtension('');
      setRawFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      showToast('Unable to initiate synthesis. Please check your document and try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = (materialId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onDeleteMaterial) {
      onDeleteMaterial(materialId);
    } else {
      deleteMaterialFromCloud(materialId).catch(() => {});
    }
    showToast('Synthesized document removed', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7 text-white">
      {/* Tactical HUD Header */}
      <SlideUp>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-[#10B981]">
              <Terminal className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">CURRICULUM INGESTION TERMINAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Curriculum Uploads & Concept Decomposition
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Upload textbook PDFs, PowerPoint slides, and notes. Gemini decomposes them into structured knowledge trees.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Start Another Ingestion button with single '+' icon */}
            <button
              type="button"
              onClick={handleResetFormForNewUpload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-black font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer active:scale-95 shrink-0"
              title="Start another document processing in parallel"
            >
              <Plus className="w-4 h-4" />
              <span>Start Another Ingestion</span>
            </button>

            <button
              type="button"
              onClick={() => setIsViewAllOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <List className="w-4 h-4 text-[#00F0FF]" />
              <span>View All ({materials.length})</span>
            </button>
          </div>
        </div>
      </SlideUp>

      {/* Grid: Upload & Form (Left 5 Cols) vs Structured Knowledge (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0A0D14]/85 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#10B981]" />
                <span>Upload New Material</span>
              </h2>

              {/* Single + Button in Ingestion Section */}
              <button
                type="button"
                onClick={handleResetFormForNewUpload}
                title="Clear inputs and start another document upload"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-white/5 hover:bg-white/10 text-[#10B981] border border-[#10B981]/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Upload</span>
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                isDragging
                  ? 'border-[#00F0FF] bg-[#00F0FF]/10'
                  : uploadedFile
                  ? 'border-[#10B981] bg-[#10B981]/10'
                  : 'border-white/15 hover:border-[#10B981]/50 bg-white/5'
              }`}
            >
              {uploadedFile ? (
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-[#10B981] border border-white/10 flex items-center justify-center font-mono font-bold text-xs uppercase shrink-0">
                      {fileExtension || 'FILE'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {uploadedFile.fileName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {((uploadedFile.size || 0) / 1024).toFixed(1)} KB · Ready for AI Decomposition
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFormForNewUpload}
                    className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <UploadCloud className="w-8 h-8 text-[#10B981] mx-auto animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Drag & drop any course document here
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      PDF, PPTX, PPT, DOCX, TXT, CSV, MD, Code, Images (up to 50 MB)
                    </span>
                  </div>
                  <div className="flex items-center justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-95"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Browse Files</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.csv,.md,.json,.py,.js,.ts"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Trees & Hierarchies"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-black/40 text-white focus:outline-hidden focus:border-[#10B981]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 font-mono">
                <label className="block text-xs text-slate-400">
                  {uploadedFile ? 'File Metadata / Supplementary Context' : 'Course Content / Pasted Text'}
                </label>
                {uploadedFile && (
                  <span className="text-[11px] text-[#10B981] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> File Attached ({fileExtension.toUpperCase() || 'DOCUMENT'})
                  </span>
                )}
              </div>
              <textarea
                rows={6}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Paste curriculum notes, textbook chapters, or definitions here, or rely directly on your uploaded file..."
                className="w-full p-3 text-xs rounded-xl border border-white/10 bg-black/40 text-white font-mono focus:outline-hidden focus:border-[#10B981] leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleProcessMaterial}
              disabled={isProcessing || (!extractedText.trim() && !uploadedFile)}
              className="w-full py-2.5 px-4 text-xs font-mono font-bold text-black bg-[#10B981] hover:bg-emerald-400 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing in Background...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{uploadedFile ? `Process ${fileExtension.toUpperCase() || 'File'} with AI` : 'Process with AI'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structured Knowledge Representation Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Row for Selector - Notice: The secondary inline View All link is removed per user request */}
          <div className="flex items-center justify-between pb-1 font-mono">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ingested Curriculum Documents ({materials.length})
            </span>
          </div>

          {/* Material Selector Bar with Hover 'X' and Vertical Padding to Prevent Cutoffs */}
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-1 font-mono">
            {materials.map((m, mIdx) => {
              const isProcessingItem = m.processingStatus === 'processing';
              const isSelected = selectedMaterial?.materialId === m.materialId;

              return (
                <div
                  key={`${m.materialId || 'mat'}-${mIdx}`}
                  onClick={() => setSelectedMaterial(m)}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      m.fileType === 'pdf'
                        ? 'bg-rose-500 text-white'
                        : m.fileType?.includes('ppt')
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {m.fileType || 'txt'}
                  </span>

                  <span className="truncate max-w-[120px]">{m.fileName}</span>

                  {/* High-Tech Futuristic Cybernetic Processing Badge */}
                  {isProcessingItem && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-[#00F0FF] bg-[#00F0FF]/15 border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
                      </span>
                      <span className="tracking-wide">AI SYNTHESIZING</span>
                    </span>
                  )}

                  {/* Hover 'X' Icon Button to Remove Synthesized Document */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(m.materialId, e)}
                    title="Remove document"
                    className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {selectedMaterial ? (
            <div className="bg-[#0A0D14]/85 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 font-mono flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-white/5 text-[#00F0FF] border border-[#00F0FF]/30"
                    >
                      {selectedMaterial.fileType || 'FILE'}
                    </span>
                    <span className="text-[11px] font-semibold text-[#10B981] uppercase tracking-wider">
                      {selectedMaterial.subject} · {selectedMaterial.topic}
                    </span>
                    {selectedMaterial.processingStatus === 'processing' && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00F0FF] bg-[#00F0FF]/15 px-2.5 py-0.5 rounded-full border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
                        </span>
                        <span>DECOMPOSING INGESTION STREAM...</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {selectedMaterial.fileName}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedMaterial.processingStatus !== 'processing' && (
                    <button
                      type="button"
                      onClick={() => onSelectForQuestions(selectedMaterial)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-black bg-[#00F0FF] hover:bg-[#38bdf8] rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] shrink-0 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Assignment for Students</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(selectedMaterial.materialId)}
                    title="Delete this synthesized document"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Advanced Futuristic Ingestion Progress Radar when Processing */}
              {selectedMaterial.processingStatus === 'processing' ? (
                <div className="p-6 rounded-2xl bg-[#07090E] border border-[#00F0FF]/30 space-y-6 relative overflow-hidden font-mono shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                  {/* Holographic scanning background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/5 to-transparent animate-pulse pointer-events-none" />

                  <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    {/* Concentric Cybernetic Radar Scanner */}
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-[#00F0FF]/20 animate-ping [animation-duration:3s]" />
                      <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#00F0FF]/40 animate-spin [animation-duration:8s]" />
                      <div className="absolute inset-3 rounded-full border border-emerald-400/30 animate-spin [animation-duration:5s] [animation-direction:reverse]" />
                      <div className="w-12 h-12 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/60 flex items-center justify-center text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                        <Cpu className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>

                    {/* Telemetry Stage Indicators */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#00F0FF] flex items-center gap-2">
                          <Radio className="w-3.5 h-3.5 animate-pulse text-[#00F0FF]" />
                          <span>AI INGESTION PIPELINE ACTIVE</span>
                        </span>
                        <span className="text-[11px] text-slate-400">Step 2 of 3</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Document Source Matrix & Slide Text Extracted</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#00F0FF] animate-pulse">
                          <Activity className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-bold">Decomposing Deep Concept Taxonomies & Bloom Objectives...</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Layers className="w-3.5 h-3.5 shrink-0" />
                          <span>Structuring Knowledge Graph & Pedagogical Tree</span>
                        </div>
                      </div>

                      {/* Animated Shimmer Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden relative mt-2">
                        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#00F0FF] via-emerald-400 to-[#00F0FF] animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {selectedMaterial.summary && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 leading-relaxed font-mono">
                      <div className="font-bold text-white mb-1">Pedagogical Overview:</div>
                      {selectedMaterial.summary}
                    </div>
                  )}

                  {/* Extracted Usable Content / Text Excerpt */}
                  {selectedMaterial.extractedText && (
                    <div className="border border-white/10 rounded-xl p-4 bg-black/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#00F0FF]" />
                          <span>Extracted Document Content & Notes</span>
                        </span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {selectedMaterial.extractedText.length.toLocaleString()} characters
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto p-3 bg-black/60 rounded-xl border border-white/10">
                        {selectedMaterial.extractedText}
                      </p>
                    </div>
                  )}

                  {/* Structured Knowledge Hierarchy Tree */}
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#10B981]" />
                      <span>Decomposed Structured Knowledge Representation</span>
                    </h3>

                    <div className="space-y-4">
                      {selectedMaterial.structuredConcepts &&
                      selectedMaterial.structuredConcepts.length > 0 ? (
                        selectedMaterial.structuredConcepts.map((t, tIdx) => (
                          <div key={tIdx} className="border border-white/10 rounded-xl p-4 bg-white/5 font-mono">
                            <div className="font-bold text-xs text-white mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                              <span>Topic: {t.name}</span>
                            </div>

                            <div className="space-y-3 pl-3 border-l-2 border-[#10B981]/40">
                              {t.concepts.map((c, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="bg-black/40 p-3.5 rounded-xl border border-white/10 shadow-sm space-y-1.5"
                                >
                                  <div className="text-xs font-bold text-[#00F0FF]">
                                    Concept: {c.concept}
                                  </div>
                                  <div className="text-xs text-slate-300">
                                    <span className="font-medium text-slate-400">Definition: </span>
                                    {c.definition}
                                  </div>
                                  <div className="text-xs text-slate-300">
                                    <span className="font-medium text-slate-400">Example: </span>
                                    {c.example}
                                  </div>
                                  <div className="text-[11px] text-[#10B981] font-medium">
                                    <span>Objective: </span>
                                    {c.learningObjective}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs font-mono text-slate-400">
                          No decomposed concepts stored yet. Click "Process with AI" to generate structured knowledge tree.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-[#0A0D14]/85 p-12 rounded-2xl border border-white/10 text-center text-xs font-mono text-slate-400">
              No learning material selected. Select an existing material or upload one.
            </div>
          )}
        </div>
      </div>

      {/* View All Synthesized Documents Modal */}
      <ViewAllMaterialsModal
        isOpen={isViewAllOpen}
        onClose={() => setIsViewAllOpen(false)}
        materials={materials}
        selectedMaterialId={selectedMaterial?.materialId}
        onSelectMaterial={(m) => setSelectedMaterial(m)}
        onDeleteMaterial={(id) => handleDeleteItem(id)}
        onSelectForQuestions={(m) => onSelectForQuestions(m)}
      />
    </div>
  );
};
