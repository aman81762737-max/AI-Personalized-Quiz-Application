import React from 'react';
import { Modal } from '../common/Modal';
import { AIThemeGenerator } from './AIThemeGenerator';

interface AIThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIThemeModal: React.FC<AIThemeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gemini AI Dynamic Color Studio"
      subtitle="Restyle the application in real-time with natural language color prompts"
      maxWidth="max-w-4xl"
    >
      <div className="max-h-[80vh] overflow-y-auto pr-1">
        <AIThemeGenerator compact={true} />
      </div>
    </Modal>
  );
};
