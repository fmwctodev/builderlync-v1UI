import React, { useState } from 'react';
import { 
  X, 
  Search, 
  MessageSquare, 
  Mail, 
  UserPlus, 
  Calendar, 
  Zap, 
  Bot, 
  FileText, 
  Webhook, 
  CreditCard,
  Bell,
  Clock,
  Settings,
  ShieldCheck,
  Layout
} from 'lucide-react';

interface ActionCategory {
  title: string;
  items: ActionItem[];
}

interface ActionItem {
  id: string;
  type: 'trigger' | 'action';
  label: string;
  description: string;
  icon: any;
  color: string;
}

interface ActionsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: ActionItem) => void;
}

const ActionsLibrary: React.FC<ActionsLibraryProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories: ActionCategory[] = [
    {
      title: 'Messaging',
      items: [
        { id: 'sms', type: 'action', label: 'Send SMS', description: 'Send a text message to a contact.', icon: MessageSquare, color: 'text-blue-500' },
        { id: 'email', type: 'action', label: 'Send Email', description: 'Send a professional email template.', icon: Mail, color: 'text-primary-500' },
      ]
    },
    {
      title: 'CRM & Contacts',
      items: [
        { id: 'add-contact', type: 'trigger', label: 'Contact Created', description: 'Triggers when a new contact is added.', icon: UserPlus, color: 'text-green-500' },
        { id: 'update-field', type: 'action', label: 'Update Field', description: 'Update a custom field on a lead.', icon: FileText, color: 'text-orange-500' },
        { id: 'tag', type: 'action', label: 'Add/Remove Tag', description: 'Manage organized contact tags.', icon: Zap, color: 'text-yellow-500' },
      ]
    },
    {
      title: 'Automation & Logic',
      items: [
        { id: 'delay', type: 'action', label: 'Wait/Delay', description: 'Pause the workflow for a set duration.', icon: Clock, color: 'text-purple-500' },
        { id: 'if-else', type: 'action', label: 'If/Else Condition', description: 'Split the flow based on logic.', icon: ShieldCheck, color: 'text-gray-400' },
        { id: 'webhook', type: 'action', label: 'Webhook', description: 'Send data to an external URL.', icon: Webhook, color: 'text-indigo-500' },
      ]
    },
    {
      title: 'AI & Intelligence',
      items: [
        { id: 'ai-prompt', type: 'action', label: 'AI Content Gen', description: 'Use AI to generate custom content.', icon: Bot, color: 'text-pink-500' },
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 left-0 w-[400px] bg-white border-r border-gray-200 shadow-2xl z-[100] transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Element</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium uppercase tracking-wider">Choose a trigger or action</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200 transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search actions..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar">
          {['All', 'Messaging', 'CRM', 'Logic', 'AI'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === cat 
                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20' 
                : 'bg-white text-gray-500 border-gray-200 hover:border-primary-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar">
          {categories.map((cat, catIdx) => (
            <div key={catIdx} className="mb-8 last:mb-20">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary-400" />
                {cat.title}
              </h3>
              <div className="grid gap-3">
                {cat.items
                  .filter(item => 
                    item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    item.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className="group w-full text-left p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/20 transition-all flex items-start gap-4 relative overflow-hidden"
                    >
                      <div className={`p-3 rounded-xl bg-gray-50 transition-colors group-hover:bg-primary-50`}>
                         <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{item.label}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                            item.type === 'trigger' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.description}</p>
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-500 transform translate-x-full group-hover:translate-x-0 transition-transform" />
                    </button>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionsLibrary;
