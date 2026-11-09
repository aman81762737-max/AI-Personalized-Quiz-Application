import { Material } from '../types';
import { aiService, FileDataPayload } from './aiService';
import { saveMaterialToCloud, deleteMaterialFromCloud } from './cloudSyncService';
import { uploadToStorage } from '../lib/storage';

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

class DocumentSynthesisManager {
  private activeJobs: Map<string, SynthesisJob> = new Map();
  private listeners: Set<MaterialListener> = new Set();
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

  public updateMaterials(materials: Material[]) {
    this.currentMaterials = materials;
  }

  public getActiveJobs(): SynthesisJob[] {
    return Array.from(this.activeJobs.values());
  }

  public isJobActive(materialId: string): boolean {
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

    // 1. Immediately create a draft material with 'processing' status
    const draftMaterial: Material = {
      materialId,
      teacherId: userId || 'faculty-01',
      fileName: fileName || `${topic} Material`,
      fileType: (fileExtension || 'txt') as any,
      subject: subject || 'Academic Curriculum',
      topic: topic || 'Core Subject Concepts',
      uploadDate: new Date().toISOString(),
      processingStatus: 'processing',
      extractedText: extractedText || '',
      structuredConcepts: [],
      summary: 'AI is synthesizing full curriculum content, slide concepts, and learning objectives in background...',
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

    // Add draft to materials list immediately
    this.currentMaterials = [draftMaterial, ...this.currentMaterials.filter((m) => m.materialId !== materialId)];
    this.notify();

    // Persist draft to cloud (so it survives page refresh/device switch)
    saveMaterialToCloud(draftMaterial).catch(() => {});

    // 2. Launch background execution (detaches from component lifecycle)
    (async () => {
      try {
        // Upload storage file if binary provided
        let storagePath = '';
        let fileUrl = '';
        if (rawFile) {
          try {
            storagePath = `materials/${userId || 'faculty'}/${Date.now()}_${rawFile.name}`;
            fileUrl = await uploadToStorage(storagePath, rawFile);
          } catch {
            // Transparent fallback
          }
        }

        // Call Gemini analysis
        const parsedData = await aiService.analyzeMaterial(
          fileName || `${topic} Material`,
          extractedText,
          subject,
          uploadedFile || undefined
        );

        const realExtracted = (parsedData.extractedText && parsedData.extractedText.length > 50)
          ? parsedData.extractedText
          : extractedText || parsedData.summary;

        const completedMaterial: Material = {
          ...draftMaterial,
          storagePath: storagePath || draftMaterial.storagePath,
          fileUrl: fileUrl || draftMaterial.fileUrl,
          subject: parsedData.subject || subject,
          topic: topic || draftMaterial.topic,
          processingStatus: 'processed',
          extractedText: realExtracted ? realExtracted.slice(0, 150000) : '',
          structuredConcepts: parsedData.topics || [],
          summary: parsedData.summary || 'Comprehensive curriculum analysis complete.',
        };

        // Update active job status
        const job = this.activeJobs.get(jobId);
        if (job) {
          job.status = 'completed';
        }

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

        // PER USER REQUIREMENT: "if processing failed then remove"
        this.currentMaterials = this.currentMaterials.filter((m) => m.materialId !== materialId);
        this.notify();

        // Remove from cloud
        deleteMaterialFromCloud(materialId).catch(() => {});

        if (onError) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        // Clean up job after 10 seconds
        setTimeout(() => {
          this.activeJobs.delete(jobId);
        }, 10000);
      }
    })();

    return draftMaterial;
  }
}

export const synthesisManager = new DocumentSynthesisManager();
