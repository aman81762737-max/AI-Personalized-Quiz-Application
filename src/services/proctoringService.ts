import { ProctoringEventType } from '../types';

export interface ProctoringListener {
  (event: { type: ProctoringEventType; details: string; timestamp: string }): void;
}

/**
 * 1. Browser Level Monitoring
 * Tracks tab visibility, window blur, fullscreen exits, copy/paste attempts, context-menu attempts.
 */
export class BrowserMonitoring {
  private listeners: ProctoringListener[] = [];
  private isListening = false;
  private boundVisibilityHandler?: () => void;
  private boundBlurHandler?: () => void;
  private boundFullscreenHandler?: () => void;
  private boundCopyHandler?: (e: ClipboardEvent) => void;
  private boundPasteHandler?: (e: ClipboardEvent) => void;
  private boundContextMenuHandler?: (e: MouseEvent) => void;

  public subscribe(listener: ProctoringListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(type: ProctoringEventType, details: string) {
    const timestamp = new Date().toISOString();
    this.listeners.forEach((listener) => listener({ type, details, timestamp }));
  }

  public start() {
    if (this.isListening) return;
    this.isListening = true;

    this.boundVisibilityHandler = () => {
      if (document.hidden) {
        this.emit('tab_switch', 'Student switched away from examination tab.');
      }
    };

    this.boundBlurHandler = () => {
      this.emit('window_blur', 'Window lost focus (student may have clicked another app).');
    };

    this.boundFullscreenHandler = () => {
      if (!document.fullscreenElement) {
        this.emit('fullscreen_exit', 'Student exited enforced full-screen examination mode.');
      }
    };

    this.boundCopyHandler = (e: ClipboardEvent) => {
      e.preventDefault();
      this.emit('copy_attempt', 'Attempted to copy exam content to clipboard.');
    };

    this.boundPasteHandler = (e: ClipboardEvent) => {
      this.emit('paste_attempt', 'Attempted to paste outside text into answer field.');
    };

    this.boundContextMenuHandler = (e: MouseEvent) => {
      e.preventDefault();
      this.emit('context_menu', 'Right-click context menu inspection attempt blocked.');
    };

    document.addEventListener('visibilitychange', this.boundVisibilityHandler);
    window.addEventListener('blur', this.boundBlurHandler);
    document.addEventListener('fullscreenchange', this.boundFullscreenHandler);
    document.addEventListener('copy', this.boundCopyHandler);
    document.addEventListener('paste', this.boundPasteHandler);
    document.addEventListener('contextmenu', this.boundContextMenuHandler);
  }

  public stop() {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.boundVisibilityHandler) document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    if (this.boundBlurHandler) window.removeEventListener('blur', this.boundBlurHandler);
    if (this.boundFullscreenHandler) document.removeEventListener('fullscreenchange', this.boundFullscreenHandler);
    if (this.boundCopyHandler) document.removeEventListener('copy', this.boundCopyHandler);
    if (this.boundPasteHandler) document.removeEventListener('paste', this.boundPasteHandler);
    if (this.boundContextMenuHandler) document.removeEventListener('contextmenu', this.boundContextMenuHandler);
  }
}

/**
 * 2. Camera Monitoring Module (Modular Staging)
 * Architecture stub for optional camera streams, presence verification, and future face detection.
 */
export class CameraMonitoring {
  private isEnabled = false;
  private mediaStream: MediaStream | null = null;

  public async requestPermissions(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.isEnabled = true;
        return true;
      }
      return false;
    } catch {
      console.warn('Camera permission denied or camera unavailable.');
      return false;
    }
  }

  public stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.isEnabled = false;
  }

  public getStatus() {
    return { enabled: this.isEnabled, streamActive: !!this.mediaStream };
  }
}

/**
 * 3. Audio Monitoring Module (Modular Staging)
 * Architecture stub for decibel thresholding and audio anomaly detection.
 */
export class AudioMonitoring {
  private isEnabled = false;
  private audioStream: MediaStream | null = null;

  public async requestPermissions(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.isEnabled = true;
        return true;
      }
      return false;
    } catch {
      console.warn('Microphone permission denied or microphone unavailable.');
      return false;
    }
  }

  public stop() {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }
    this.isEnabled = false;
  }

  public getStatus() {
    return { enabled: this.isEnabled, streamActive: !!this.audioStream };
  }
}

/**
 * 4. Advanced Detection (Heuristic Risk Engine)
 * Synthesizes browser and future sensor telemetry into an explainable integrity score.
 */
export class AdvancedDetection {
  public calculateIntegrityRating(violationsCount: number): {
    rating: 'Normal' | 'Review Recommended' | 'Flagged';
    color: string;
    details: string;
  } {
    if (violationsCount === 0) {
      return {
        rating: 'Normal',
        color: 'text-emerald-700',
        details: 'Zero suspicious browser interruptions recorded during this session.',
      };
    }
    if (violationsCount <= 2) {
      return {
        rating: 'Review Recommended',
        color: 'text-amber-700',
        details: `${violationsCount} minor interruptions (e.g. occasional tab switch or window blur).`,
      };
    }
    return {
      rating: 'Flagged',
      color: 'text-rose-700',
      details: `${violationsCount} frequent interruptions recorded. Educator review suggested.`,
    };
  }
}

/**
 * Unified Proctoring Service
 */
export class ProctoringService {
  public readonly browser = new BrowserMonitoring();
  public readonly camera = new CameraMonitoring();
  public readonly audio = new AudioMonitoring();
  public readonly advanced = new AdvancedDetection();

  public startExamSession(onViolation: ProctoringListener): () => void {
    const unsubscribe = this.browser.subscribe(onViolation);
    this.browser.start();
    return () => {
      unsubscribe();
      this.browser.stop();
      this.camera.stop();
      this.audio.stop();
    };
  }
}

export const proctoringService = new ProctoringService();
