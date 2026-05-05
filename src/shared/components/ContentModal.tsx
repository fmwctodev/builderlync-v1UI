import React from 'react';
import Modal from './Modal';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ContentModal: React.FC<ContentModalProps> = ({ isOpen, onClose, title, content, size = 'lg' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <div className="prose prose-sm max-w-none">
        <div 
          className="text-gray-700 leading-7 space-y-4 max-h-[70vh] overflow-y-auto pr-2"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </Modal>
  );
};

export default ContentModal;