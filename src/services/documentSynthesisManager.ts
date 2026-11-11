import { Material } from '../types';
import { aiService, FileDataPayload } from './aiService';
import { saveMaterialToCloud, deleteMaterialFromCloud } from './cloudSyncService';
import { uploadToStorage } from '../lib/storage';
import { extractDocumentTextInBrowser, hasRealDocumentContent } from '../utils/clientDocumentExtractor';

export interface SynthesisJob {
  jobId: string;
  materialId: string;
  fileName: string;
  topic: string;
  subject: string;
  startTime: number;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

type MaterialListener = (materials: Material[]) => void;
type JobListener = (activeJobs: SynthesisJob[]) => void;

class DocumentSynthesisManager {
  private activeJobs: Map<string, SynthesisJob> = new Map();
  private listeners: Set<MaterialListener> = new Set();
  private jobListeners: Set<JobListener> = new Set();
  private currentMaterials: Material[] = [];

  public init(initialMaterials: Material[], onUpdate?: MaterialListener) {
    this.currentMaterials = initialMaterials;
    if (onUpdate) {
      this.listeners.add(onUpdate);
    }
  }

  public subscribe(listener: MaterialListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeJobs(listener: JobListener) {
    this.jobListeners.add(listener);
    listener(this.getActiveJobs());
    return () => {
      this.jobListeners.delete(listener);
    };
  }

  public updateMaterials(materials: Material[]) {
    this.currentMaterials = materials;
  }

  public getActiveJobs(): SynthesisJob[] {
    return Array.from(this.activeJobs.values()).filter((j) => j.status === 'processing');
  }

  public isJobActive(materialId?: string): boolean {
    if (!materialId) return false;
    const job = Array.from(this.activeJobs.values()).find((j) => j.materialId === materialId);
    return job?.status === 'processing';
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener([...this.currentMaterials]);
      } catch (err) {
        console.warn('DocumentSynthesisManager listener error:', err);
      }
    });
  }

  private notifyJobs() {
    const jobs = this.getActiveJobs();
    this.jobListeners.forEach((listener) => {
      try {
        listener(jobs);
      } catch (err) {
        console.warn('DocumentSynthesisManager jobListener error:', err);
      }
    });
  }

  /**
   * Starts a background document synthesis process.
   * Immediately inserts a draft with processingStatus: 'processing'.
   * If synthesis succeeds, it updates the material with full concepts and summary.
   * If synthesis fails, it completely removes the draft material.
   */
  public async startSynthesis(params: {
    fileName: string;
    fileExtension: string;
    subject: string;
    topic: string;
    extractedText: string;
    uploadedFile: FileDataPayload | null;
    rawFile: File | null;
    userId: string;
    onSuccess?: (material: Material) => void;
    onError?: (err: Error) => void;
  }): Promise<Material> {
    const {
      fileName,
      fileExtension,
      subject,
      topic,
      extractedText,
      uploadedFile,
      rawFile,
      userId,
      onSuccess,
      onError,
    } = params;

    const materialId = `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const jobId = `job-${Date.now()}`;

    // Ensure real text is extracted from rawFile immediately if not already extracted
    let initialText = extractedText || '';
    if (!hasRealDocumentContent(initialText) && rawFile) {
      try {
        const extractedInBrowser = await extractDocumentTextInBrowser(rawFile);
        if (extractedInBrowser && extractedInBrowser.trim().length > 20) {
          initialText = extractedInBrowser;
        }
      } catch (err) {
        console.warn('Synthesis manager browser extraction warning:', err);
      }
    }

    const cleanTopic = (topic || fileName || 'Core Subject Concepts')
      .replace(/\.[^/.]+$/, '')
      .replace(/[_\\-]/g, ' ')
      .replace(/\b(final|merged|draft|copy|v\d+|\d{1,2}[a-z]{3}\d{2,4})\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Core Subject Concepts';

    // 1. Immediately create a draft material with 'processing' status and real extractedText
    const draftMaterial: Material = {
      materialId,
      teacherId: userId || 'faculty-01',
      fileName: fileName || `${cleanTopic} Material`,
      fileType: (fileExtension || 'txt') as any,
      subject: subject || 'Academic Curriculum',
      topic: cleanTopic,
      uploadDate: new Date().toISOString(),
      processingStatus: 'processing',
      extractedText: initialText,
      structuredConcepts: [],
      summary: 'AI is synthesizing full curriculum content, slide concepts, and learning objectives in background...',
      fileData: uploadedFile || undefined,
    };

    // Track active job
    this.activeJobs.set(jobId, {
      jobId,
      materialId,
      fileName: draftMaterial.fileName,
      topic: draftMaterial.topic,
      subject: draftMaterial.subject,
      startTime: Date.now(),
      status: 'processing',
    });
    this.notifyJobs();

    // Add draft to materials list immediately
    this.currentMaterials = [draftMaterial, ...this.currentMaterials.filter((m) => m.materialId !== materialId)];
    this.notify();

    // Persist draft to cloud (so it survives page refresh/device switch)
    saveMaterialToCloud(draftMaterial).catch(() => {});

    // 2. Launch background execution (detaches from component lifecycle)
    (async () => {
      try {
        // Start storage upload in parallel so it does not delay AI analysis by 3.5s
        const storagePromise = rawFile
          ? (async () => {
              try {
                const sPath = `materials/${userId || 'faculty'}/${Date.now()}_${rawFile.name}`;
                const fUrl = await uploadToStorage(sPath, rawFile);
                return { storagePath: sPath, fileUrl: fUrl };
              } catch {
                return { storagePath: '', fileUrl: '' };
              }
            })()
          : Promise.resolve({ storagePath: '', fileUrl: '' });

        // If we already extracted full text in the browser and the binary file is >1.5MB,
        // omit heavy binary payload so the HTTP call finishes in <1s
        const effectiveFileData =
          hasRealDocumentContent(initialText) &&
          uploadedFile &&
          (uploadedFile.size || 0) > 1.5 * 1024 * 1024 &&
          uploadedFile.mimeType !== 'text/plain'
            ? undefined
            : uploadedFile || undefined;

        // Call Gemini analysis
        const parsedData = await aiService.analyzeMaterial(
          fileName || `${cleanTopic} Material`,
          initialText,
          subject,
          effectiveFileData
        );

        const { storagePath, fileUrl } = await storagePromise;

        const realExtracted = hasRealDocumentContent(parsedData.extractedText)
          ? parsedData.extractedText!
          : hasRealDocumentContent(initialText)
          ? initialText
          : parsedData.summary || '';

        const completedMaterial: Material = {
          ...draftMaterial,
          storagePath: storagePath || draftMaterial.storagePath,
          fileUrl: fileUrl || draftMaterial.fileUrl,
          subject: parsedData.subject || subject,
          topic: cleanTopic,
          processingStatus: 'processed',
          extractedText: realExtracted ? realExtracted.slice(0, 150000) : '',
          structuredConcepts: parsedData.topics || [],
          summary: parsedData.summary || 'Comprehensive curriculum analysis complete.',
          fileData: uploadedFile || draftMaterial.fileData,
        };

        // Update active job status
        const job = this.activeJobs.get(jobId);
        if (job) {
          job.status = 'completed';
        }
        this.notifyJobs();

        // Update materials state
        this.currentMaterials = this.currentMaterials.map((m) =>
          m.materialId === materialId ? completedMaterial : m
        );
        this.notify();

        // Persist completed material to Firestore
        await saveMaterialToCloud(completedMaterial);

        if (onSuccess) {
          onSuccess(completedMaterial);
        }
      } catch (err: any) {
        console.error('Background document synthesis failed:', err);

        // Update active job status
        const job = this.activeJobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.error = err?.message || 'Synthesis failed';
        }
        this.notifyJobs();

        // PER USER REQUIREMENT: "if processing failed then remove"
        this.currentMaterials = this.currentMaterials.filter((m) => m.materialId !== materialId);
        this.notify();

        // Remove from cloud
        deleteMaterialFromCloud(materialId).catch(() => {});

        if (onError) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        setTimeout(() => {
          this.activeJobs.delete(jobId);
          this.notifyJobs();
        }, 1500);
      }
    })();

    return draftMaterial;
  }
}

export const synthesisManager = new DocumentSynthesisManager();
