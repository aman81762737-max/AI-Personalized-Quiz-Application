import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { LearnerActionType, LearnerEvent, AIIntervention, AIMonitorState } from '../types/aiMonitor';
import { useAuth } from './AuthContext';
import { useToast } from '../components/common/Toast';

interface AIMonitorContextType {
  state: AIMonitorState;
  trackAction: (params: {
    actionType: LearnerActionType;
    topic: string;
    subject?: string;
    isCorrect?: boolean;
    studentAnswer?: string;
    correctAnswer?: string;
    questionText?: string;
    timeSpentSeconds?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }) => Promise<AIIntervention | null>;
  openCoachDock: () => void;
  closeCoachDock: () => void;
  toggleCoachDock: () => void;
  openRemedialModal: (intervention?: AIIntervention) => void;
  closeRemedialModal: () => void;
  resolveIntervention: (interventionId: string) => void;
  dismissCurrentIntervention: () => void;
}

const AIMonitorContext = createContext<AIMonitorContextType | undefined>(undefined);

export const AIMonitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [state, setState] = useState<AIMonitorState>({
    isMonitoringActive: true,
    activeIntervention: null,
    interventionHistory: [],
    recentEvents: [],
    consecutiveMistakes: 0,
    currentStreak: 0,
    overallScore: 78,
    activeStruggles: [],
    coachingMessage: 'Atom AI Monitor active: Tracking cognitive momentum and ready to assist.',
    isCoachDockOpen: false,
    remedialModalOpen: false,
  });

  const openCoachDock = useCallback(() => {
    setState((prev) => ({ ...prev, isCoachDockOpen: true }));
  }, []);

  const closeCoachDock = useCallback(() => {
    setState((prev) => ({ ...prev, isCoachDockOpen: false }));
  }, []);

  const toggleCoachDock = useCallback(() => {
    setState((prev) => ({ ...prev, isCoachDockOpen: !prev.isCoachDockOpen }));
  }, []);

  const openRemedialModal = useCallback((intervention?: AIIntervention) => {
    setState((prev) => ({
      ...prev,
      activeIntervention: intervention || prev.activeIntervention,
      remedialModalOpen: true,
    }));
  }, []);

  const closeRemedialModal = useCallback(() => {
    setState((prev) => ({ ...prev, remedialModalOpen: false }));
  }, []);

  const resolveIntervention = useCallback((interventionId: string) => {
    setState((prev) => {
      const updated = prev.interventionHistory.map((item) =>
        item.id === interventionId ? { ...item, resolved: true } : item
      );
      const isCurrent = prev.activeIntervention?.id === interventionId;
      return {
        ...prev,
        interventionHistory: updated,
        activeIntervention: isCurrent ? null : prev.activeIntervention,
        remedialModalOpen: isCurrent ? false : prev.remedialModalOpen,
        consecutiveMistakes: 0,
        currentStreak: prev.currentStreak + 1,
        coachingMessage: 'Concept verified! Knowledge gap closed successfully.',
      };
    });
    showToast('Remedial checkpoint cleared! Concept mastery recorded.', 'success');
  }, [showToast]);

  const dismissCurrentIntervention = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeIntervention: null,
    }));
  }, []);

  const trackAction = useCallback(
    async (params: {
      actionType: LearnerActionType;
      topic: string;
      subject?: string;
      isCorrect?: boolean;
      studentAnswer?: string;
      correctAnswer?: string;
      questionText?: string;
      timeSpentSeconds?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    }): Promise<AIIntervention | null> => {
      const studentId = userProfile?.userId || 'student_guest';
      const studentName = userProfile?.name || 'Alex Mercer';

      try {
        const result = await aiService.logLearnerEvent({
          studentId,
          studentName,
          actionType: params.actionType,
          topic: params.topic,
          subject: params.subject || 'Computer Science',
          isCorrect: params.isCorrect,
          studentAnswer: params.studentAnswer,
          correctAnswer: params.correctAnswer,
          questionText: params.questionText,
          timeSpentSeconds: params.timeSpentSeconds || 15,
          difficulty: params.difficulty || 'medium',
        });

        const newEvent: LearnerEvent = {
          id: result.eventId || `evt_${Date.now()}`,
          studentId,
          studentName,
          actionType: params.actionType,
          topic: params.topic,
          subject: params.subject || 'Computer Science',
          isCorrect: params.isCorrect,
          studentAnswer: params.studentAnswer,
          correctAnswer: params.correctAnswer,
          questionText: params.questionText,
          timeSpentSeconds: params.timeSpentSeconds || 15,
          timestamp: new Date().toISOString(),
          difficulty: params.difficulty,
        };

        setState((prev) => {
          const isCorrect = params.isCorrect !== false;
          const newConsecutive = isCorrect ? 0 : prev.consecutiveMistakes + 1;
          const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
          const updatedStruggles = isCorrect
            ? prev.activeStruggles.filter((s) => s !== params.topic)
            : Array.from(new Set([...prev.activeStruggles, params.topic]));

          let coachingMsg = prev.coachingMessage;
          if (!isCorrect) {
            coachingMsg = `Misconception detected in ${params.topic}. Tap coach for instant recovery!`;
          } else if (newStreak > 3) {
            coachingMsg = `High momentum: ${newStreak} consecutive correct answers! Keep pushing.`;
          }

          const intervention = result.intervention as AIIntervention | undefined;

          return {
            ...prev,
            recentEvents: [newEvent, ...prev.recentEvents.slice(0, 49)],
            consecutiveMistakes: newConsecutive,
            currentStreak: newStreak,
            activeStruggles: updatedStruggles,
            coachingMessage: coachingMsg,
            activeIntervention: intervention || prev.activeIntervention,
            interventionHistory: intervention
              ? [intervention, ...prev.interventionHistory.slice(0, 29)]
              : prev.interventionHistory,
          };
        });

        if (result.interventionNeeded && result.intervention) {
          return result.intervention as AIIntervention;
        }

        return null;
      } catch (err) {
        console.warn('AI telemetry logging notice:', err);
        return null;
      }
    },
    [userProfile, showToast]
  );

  return (
    <AIMonitorContext.Provider
      value={{
        state,
        trackAction,
        openCoachDock,
        closeCoachDock,
        toggleCoachDock,
        openRemedialModal,
        closeRemedialModal,
        resolveIntervention,
        dismissCurrentIntervention,
      }}
    >
      {children}
    </AIMonitorContext.Provider>
  );
};

export const useAIMonitor = () => {
  const context = useContext(AIMonitorContext);
  if (!context) {
    throw new Error('useAIMonitor must be used within an AIMonitorProvider');
  }
  return context;
};
