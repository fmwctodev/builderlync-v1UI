import React from 'react';
import { Plus, X } from 'lucide-react';

interface Block {
  content: string;
  label?: string;
}

interface GuidelineBlockEditorProps {
  label: string;
  description?: string;
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
  maxItems?: number;
}

const GuidelineBlockEditor: React.FC<GuidelineBlockEditorProps> = ({
  label,
  description,
  blocks,
  onChange,
  placeholder = 'Add item...',
  maxItems = 20,
}) => {
  const addBlock = () => {
    if (blocks.length >= maxItems) return;
    onChange([...blocks, { content: '' }]);
  };

  const updateBlock = (index: number, content: string) => {
    onChange(blocks.map((b, i) => (i === index ? { ...b, content } : b)));
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200">{label}</h4>
          {description && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{description}</p>}
        </div>
        {blocks.length < maxItems && (
          <button
            onClick={addBlock}
            className="flex items-center gap-1 text-xs text-primary-500 dark:text-primary-400 hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <Plus size={13} />
            Add
          </button>
        )}
      </div>

      <div className="space-y-2">
        {blocks.map((block, i) => (
          <div key={i} className="flex items-start gap-2">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(i, e.target.value)}
              placeholder={placeholder}
              rows={2}
              className="flex-1 resize-none bg-gray-100/60 dark:bg-slate-700/60 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <button
              onClick={() => removeBlock(i)}
              className="mt-2 p-1 text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {!blocks.length && (
          <button
            onClick={addBlock}
            className="w-full py-3 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-400 dark:text-slate-500 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition-colors"
          >
            + Add {label.toLowerCase()}
          </button>
        )}
      </div>
    </div>
  );
};

export default GuidelineBlockEditor;
