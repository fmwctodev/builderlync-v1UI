import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
  Save, Loader2, Check, Eye, Send, GripVertical,
  DollarSign, Package, FileText, User, MapPin
} from 'lucide-react';
import { useProposalBuilder } from '../../hooks/useProposalBuilder';
import { formatCurrency } from './proposalUtils';
import type { ProposalLineItem } from '../../types/proposalIntegration';

interface LineItemRowProps {
  item: ProposalLineItem;
  onUpdate: (id: string, field: keyof ProposalLineItem, value: unknown) => void;
  onRemove: (id: string) => void;
}

function LineItemRow({ item, onUpdate, onRemove }: LineItemRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-2">
      <div className="flex items-center gap-2 px-3 py-3">
        <GripVertical size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={item.name || item.item_name || ''}
            onChange={e => onUpdate(item.id, 'name', e.target.value)}
            placeholder="Item name"
            className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400"
          />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">Qty:</span>
            <input
              type="number"
              value={item.quantity}
              onChange={e => onUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)}
              className="w-12 text-xs text-gray-600 dark:text-gray-300 bg-transparent outline-none"
            />
            <span className="text-xs text-gray-400">{item.unit || 'unit'}</span>
            <span className="text-xs text-gray-400 ml-auto">@ {formatCurrency(item.unit_price)}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {formatCurrency(item.quantity * item.unit_price)}
          </p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 p-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-900/50">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Unit Price</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">$</span>
              <input
                type="number"
                value={item.unit_price}
                onChange={e => onUpdate(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                className="flex-1 text-sm text-gray-900 dark:text-white bg-transparent outline-none border-b border-gray-200 dark:border-gray-700 pb-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Unit</label>
            <input
              type="text"
              value={item.unit || ''}
              onChange={e => onUpdate(item.id, 'unit', e.target.value)}
              placeholder="e.g. sq ft, hour, each"
              className="w-full text-sm text-gray-900 dark:text-white bg-transparent outline-none border-b border-gray-200 dark:border-gray-700 pb-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Description</label>
            <textarea
              value={item.description || ''}
              onChange={e => onUpdate(item.id, 'description', e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5 outline-none resize-none"
            />
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 text-xs text-red-500 font-medium"
          >
            <Trash2 size={12} />
            Remove item
          </button>
        </div>
      )}
    </div>
  );
}

type ActiveSection = 'overview' | 'line-items' | 'totals';

export default function MobileProposalBuilder() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [showSendSheet, setShowSendSheet] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const {
    proposal,
    lineItems,
    totals,
    isLoading,
    isSaving,
    isDirty,
    error,
    updateProposalField,
    updateLineItemField,
    addNewLineItem,
    removeLineItem,
    saveNow,
  } = useProposalBuilder(proposalId || '');

  const handleLineItemUpdate = async (id: string, field: keyof ProposalLineItem, value: unknown) => {
    await updateLineItemField(id, { [field]: value } as any);
  };

  const handleAddItem = async () => {
    await addNewLineItem({
      name: '',
      item_name: 'New Item',
      quantity: 1,
      unit_price: 0,
      unit: 'each',
      line_number: lineItems.length + 1,
      source: 'manual',
    });
  };

  const handleSaveAndSend = async () => {
    await saveNow();
    setShowSendSheet(true);
  };

  if (!proposalId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500 dark:text-gray-400">No proposal ID provided</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 text-sm">{error || 'Proposal not found'}</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600">
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3 py-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 p-1">
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{proposal.title}</p>
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Saving...
                  </span>
                ) : isDirty ? (
                  <span className="text-xs text-amber-500">Unsaved changes</span>
                ) : (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <Check size={10} /> Saved
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`../proposals/${proposalId}/preview`)}
              className="p-2 text-gray-500 dark:text-gray-400"
            >
              <Eye size={20} />
            </button>
            <button
              onClick={handleSaveAndSend}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              <Send size={14} />
              Send
            </button>
          </div>

          <div className="flex gap-1 pb-2">
            {([
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'line-items', label: 'Line Items', icon: Package },
              { id: 'totals', label: 'Totals', icon: DollarSign },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === tab.id
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        {activeSection === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-red-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Proposal Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={proposal.title || ''}
                    onChange={e => updateProposalField('title', e.target.value)}
                    className="w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Type</label>
                  <select
                    value={proposal.type || 'proposal'}
                    onChange={e => updateProposalField('type', e.target.value)}
                    className="w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 outline-none"
                  >
                    <option value="proposal">Proposal</option>
                    <option value="estimate">Estimate</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={proposal.expires_at ? new Date(proposal.expires_at).toISOString().split('T')[0] : ''}
                    onChange={e => updateProposalField('expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-red-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Property</h3>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Address</label>
                <input
                  type="text"
                  value={proposal.property_address || ''}
                  onChange={e => updateProposalField('property_address', e.target.value)}
                  placeholder="Enter property address"
                  className="w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-red-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notes</h3>
              </div>
              <textarea
                value={(proposal.content as any)?.notes || ''}
                onChange={e => updateProposalField('content', { ...(proposal.content as any), notes: e.target.value })}
                placeholder="Internal notes about this proposal..."
                rows={4}
                className="w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}

        {activeSection === 'line-items' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <Package size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No line items yet</p>
                <button
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  <Plus size={16} />
                  Add First Item
                </button>
              </div>
            ) : (
              lineItems.map(item => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  onUpdate={handleLineItemUpdate}
                  onRemove={removeLineItem}
                />
              ))
            )}
          </div>
        )}

        {activeSection === 'totals' && (
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
              <div className="space-y-2">
                {lineItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 truncate flex-1 mr-3">
                      {item.name || item.item_name}
                      <span className="text-gray-400 text-xs ml-1">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white flex-shrink-0">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Tax</span>
                  <span>{formatCurrency(totals.tax_amount)}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>

            {totals.items_needing_pricing > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 flex items-center gap-2">
                <DollarSign size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {totals.items_needing_pricing} item{totals.items_needing_pricing !== 1 ? 's need' : ' needs'} pricing
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={() => saveNow()}
            disabled={!isDirty || isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleSaveAndSend}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium text-white"
          >
            <Send size={16} />
            Send Proposal
          </button>
        </div>
      </div>

      {showSendSheet && (
        <SendProposalSheet
          proposalTitle={proposal.title}
          proposalValue={totals.total}
          onClose={() => setShowSendSheet(false)}
          onSent={() => { setSendSuccess(true); setShowSendSheet(false); }}
        />
      )}

      {sendSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Proposal Sent!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Your proposal has been marked as sent.</p>
            <button
              onClick={() => { setSendSuccess(false); navigate(-1); }}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-medium text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SendProposalSheetProps {
  proposalTitle: string;
  proposalValue: number;
  onClose: () => void;
  onSent: () => void;
}

function SendProposalSheet({ proposalTitle, proposalValue, onClose, onSent }: SendProposalSheetProps) {
  const [sendMethod, setSendMethod] = useState<'email' | 'sms'>('email');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState(`Hi, please find the attached proposal "${proposalTitle}" for ${formatCurrency(proposalValue)}. Let me know if you have any questions!`);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl p-6 pb-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Send Proposal</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{proposalTitle}</p>

        <div className="flex gap-2 mb-4">
          {(['email', 'sms'] as const).map(m => (
            <button
              key={m}
              onClick={() => setSendMethod(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                sendMethod === m ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {m === 'email' ? 'Email' : 'SMS'}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              {sendMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={sendMethod === 'email' ? 'email' : 'tel'}
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder={sendMethod === 'email' ? 'customer@email.com' : '+1 (555) 000-0000'}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!recipient.trim() || sending}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 mb-2"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? 'Sending...' : 'Send Now'}
        </button>
        <button onClick={onClose} className="w-full py-2 text-sm text-gray-500">Cancel</button>
      </div>
    </div>
  );
}
