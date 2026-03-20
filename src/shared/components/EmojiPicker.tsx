import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const EMOJI_CATEGORIES = [
    {
        name: 'Smileys & Emotion',
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖']
    },
    {
        name: 'Hands & Body',
        emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪']
    },
    {
        name: 'Objects',
        emojis: ['⌚️', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛️', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🪓', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒', '🛠', '⛏', '🪚', '🔩', '⚙️', '🪝', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪚', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🪜', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🪆', '🖼', '🪞', 'window', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '📁']
    }
];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    position?: 'top' | 'bottom';
}

export function EmojiPicker({ onSelect, onClose, position = 'bottom' }: EmojiPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return EMOJI_CATEGORIES;
        return EMOJI_CATEGORIES.map(cat => ({
            ...cat,
            emojis: cat.emojis.filter(emoji => emoji.includes(searchQuery) || cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
        })).filter(cat => cat.emojis.length > 0);
    }, [searchQuery]);

    const positioningClass = position === 'top'
        ? 'bottom-[calc(100%+0.5rem)] mb-0'
        : 'top-[calc(100%+0.5rem)] mt-0';

    return (
        <div
            ref={pickerRef}
            className={`absolute left-0 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 ${positioningClass}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Search emojis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="overflow-y-auto max-h-64 p-3 scrollbar-thin">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
                                {category.name}
                            </h4>
                            <div className="grid grid-cols-8 gap-1">
                                {category.emojis.map((emoji, eIdx) => (
                                    <button
                                        key={eIdx}
                                        type="button"
                                        onClick={() => {
                                            onSelect(emoji);
                                            if (!searchQuery) onClose();
                                        }}
                                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all hover:scale-110 active:scale-95"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center text-gray-500 text-sm">
                        No emojis found 😕
                    </div>
                )}
            </div>

            <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center px-4">
                <span className="text-[10px] text-gray-400 font-medium">Emoji Picker</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
