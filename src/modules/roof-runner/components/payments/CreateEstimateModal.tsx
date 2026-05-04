import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Upload, FileText, AlertCircle, Check, Link as LinkIcon, Package } from 'lucide-react';
import {
  createEstimate,
  Estimate,
  EstimateItem,
  InvoiceTemplate,
  fetchInvoiceTemplates,
  createEstimateItems,
  createEstimateAttachment,
  Coupon,
  updateCoupon
} from '../../../../shared/store/services/paymentsApi';
import {
  getQuickBooksStatus,
  createQuickBooksEstimate,
  QuickBooksEstimateRequest,
  QuickBooksEstimateLineItem
} from '../../../../shared/store/services/quickbooksApi';
import { getAllProposals, Proposal } from '../../../../shared/store/services/proposalsApi';
import { Contact } from '../../../../shared/store/services/contactsApi';
import { filesApi } from '../../../../shared/services/filesApi';
import CustomerSelection from './CustomerSelection';
import LineItemsSection from './LineItemsSection';
import FileAttachmentSection from './FileAttachmentSection';
import CouponSelector from './CouponSelector';

interface CreateEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (estimate: Estimate) => void;
  preselectedCustomer?: Contact;
}

interface FormData {
  customer_id: string | null;
  customer_name: string;
  estimate_number: string;
  issue_date: string;
  expiry_date: string;
  payment_terms: string;
  po_number: string;
  notes: string;
  customer_message: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  proposal_id: string | null;
}

const CreateEstimateModal: React.FC<CreateEstimateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomer
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickbooksConnected, setQuickbooksConnected] = useState(false);
  const [syncToQuickbooks, setSyncToQuickbooks] = useState(true);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Contact | null>(preselectedCustomer || null);
  const [lineItems, setLineItems] = useState<EstimateItem[]>([{
    line_number: 1,
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0,
    discount_percentage: 0,
    discount_amount: 0,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 0
  }]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState<FormData>({
    customer_id: preselectedCustomer?.id || null,
    customer_name: preselectedCustomer?.full_name || '',
    estimate_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_terms: 'Net 30',
    po_number: '',
    notes: '',
    customer_message: '',
    subtotal: 0,
    discount_amount: 0,
    tax_amount: 0,
    shipping_amount: 0,
    amount: 0,
    status: 'draft',
    proposal_id: null
  });

  useEffect(() => {
    if (isOpen) {
      checkQuickBooksConnection();
      loadTemplates();
      loadProposals();
      generateEstimateNumber();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateTotals();
  }, [lineItems, formData.discount_amount, formData.tax_amount, formData.shipping_amount]);

  const checkQuickBooksConnection = async () => {
    try {
      const response = await getQuickBooksStatus();
      setQuickbooksConnected(response.data.connected);
      setSyncToQuickbooks(response.data.connected);
    } catch (err) {
      console.error('Error checking QuickBooks status:', err);
      setQuickbooksConnected(false);
      setSyncToQuickbooks(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await fetchInvoiceTemplates({ isActive: true });
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const loadProposals = async () => {
    try {
      const response = await getAllProposals();
      if (response.success) {
        setProposals(response.data);
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
    }
  };

  const generateEstimateNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData(prev => ({ ...prev, estimate_number: `EST-${timestamp}` }));
  };

  const calculateCouponDiscount = (coupon: Coupon | null, subtotal: number): number => {
    if (!coupon) return 0;

    if (coupon.discount_type === 'percentage') {
      return (subtotal * coupon.discount_value) / 100;
    } else {
      return Math.min(coupon.discount_value, subtotal);
    }
  };

  const handleCouponSelect = (coupon: Coupon | null) => {
    setSelectedCoupon(coupon);
    if (coupon) {
      const discount = calculateCouponDiscount(coupon, formData.subtotal);
      setFormData(prev => ({ ...prev, discount_amount: discount }));
    } else {
      setFormData(prev => ({ ...prev, discount_amount: 0 }));
    }
  };

  const calculateTotals = useCallback(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total_amount, 0);
    let discountAmount = formData.discount_amount;

    if (selectedCoupon) {
      discountAmount = calculateCouponDiscount(selectedCoupon, subtotal);
    }

    const total = subtotal - discountAmount + formData.tax_amount + formData.shipping_amount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      discount_amount: discountAmount,
      amount: total
    }));
  }, [lineItems, selectedCoupon, formData.tax_amount, formData.shipping_amount]);

  const handleLineItemChange = (index: number, field: keyof EstimateItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    const item = updatedItems[index];
    item.amount = item.quantity * item.rate;
    item.discount_amount = (item.amount * item.discount_percentage) / 100;
    item.tax_amount = ((item.amount - item.discount_amount) * item.tax_rate) / 100;
    item.total_amount = item.amount - item.discount_amount + item.tax_amount;

    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      line_number: lineItems.length + 1,
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      discount_percentage: 0,
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: 0
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updatedItems = lineItems.filter((_, i) => i !== index);
      updatedItems.forEach((item, i) => item.line_number = i + 1);
      setLineItems(updatedItems);
    }
  };

  const applyTemplate = (templateId: string, index: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      handleLineItemChange(index, 'description', template.description || template.name);
      handleLineItemChange(index, 'quantity', template.default_quantity);
      handleLineItemChange(index, 'rate', template.default_price);
      handleLineItemChange(index, 'tax_rate', template.tax_rate);
      handleLineItemChange(index, 'template_id', template.id);
    }
  };

  const handleProposalSelect = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposal(proposal);
      setFormData(prev => ({
        ...prev,
        proposal_id: proposal.id,
        customer_id: proposal.customer_id || prev.customer_id,
        notes: proposal.content?.notes || prev.notes
      }));

      if (proposal.content?.items && Array.isArray(proposal.content.items)) {
        const importedItems = proposal.content.items.map((item: any, index: number) => ({
          line_number: index + 1,
          description: item.description || '',
          quantity: item.quantity || 1,
          rate: item.rate || 0,
          amount: (item.quantity || 1) * (item.rate || 0),
          discount_percentage: item.discount_percentage || 0,
          discount_amount: item.discount_amount || 0,
          tax_rate: item.tax_rate || 0,
          tax_amount: item.tax_amount || 0,
          total_amount: item.total_amount || 0
        }));
        setLineItems(importedItems);
      }
    }
  };

  const clearProposal = () => {
    setSelectedProposal(null);
    setFormData(prev => ({
      ...prev,
      proposal_id: null
    }));
  };

  const handleFileUpload = (files: File[]) => {
    setAttachedFiles([...attachedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const validateForm = (): string | null => {
    if (!selectedCustomer) return 'Please select a customer';
    if (!formData.estimate_number) return 'Estimate number is required';
    if (!formData.issue_date) return 'Issue date is required';
    if (!formData.expiry_date) return 'Expiry date is required';
    if (new Date(formData.expiry_date) < new Date(formData.issue_date)) {
      return 'Expiry date must be after issue date';
    }
    if (lineItems.length === 0) return 'At least one line item is required';
    if (lineItems.some(item => !item.description || item.quantity <= 0 || item.rate < 0)) {
      return 'All line items must have a description, positive quantity, and valid rate';
    }
    return null;
  };

  const uploadFiles = async (estimateId: string) => {
    for (const file of attachedFiles) {
      try {
        const uploadedFile = await filesApi.uploadFile(file);
        await createEstimateAttachment({
          estimate_id: estimateId,
          file_id: uploadedFile.id,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        });
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }
  };

  const syncWithQuickBooks = async (estimate: Estimate, items: EstimateItem[]) => {
    if (!syncToQuickbooks || !quickbooksConnected || !selectedCustomer) return;

    try {
      const qbLineItems: QuickBooksEstimateLineItem[] = items.map(item => ({
        Description: item.description,
        Amount: item.total_amount,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          UnitPrice: item.rate,
          Qty: item.quantity,
          TaxCodeRef: item.tax_rate > 0 ? { value: 'TAX' } : undefined
        }
      }));

      const qbEstimateData: QuickBooksEstimateRequest = {
        CustomerRef: { value: selectedCustomer.id },
        Line: qbLineItems,
        TxnDate: formData.issue_date,
        ExpirationDate: formData.expiry_date,
        PrivateNote: formData.notes,
        CustomerMemo: formData.customer_message ? { value: formData.customer_message } : undefined,
        PONumber: formData.po_number || undefined
      };

      await createQuickBooksEstimate(qbEstimateData);
    } catch (err) {
      console.error('QuickBooks sync error:', err);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const estimateData: Partial<Estimate> = {
        ...formData,
        customer_id: selectedCustomer?.id,
        name: `Estimate for ${selectedCustomer?.full_name}`,
        coupon_id: selectedCoupon?.id,
        coupon_code: selectedCoupon?.code,
        coupon_discount_amount: selectedCoupon ? formData.discount_amount : undefined,
        quickbooks_sync_status: syncToQuickbooks && quickbooksConnected ? 'pending' : 'not_synced',
        acceptance_status: 'pending'
      };

      const createdEstimate = await createEstimate(estimateData);

      const itemsWithEstimateId = lineItems.map(item => ({
        ...item,
        estimate_id: createdEstimate.id
      }));
      const createdItems = await createEstimateItems(itemsWithEstimateId);

      if (attachedFiles.length > 0) {
        await uploadFiles(createdEstimate.id);
      }

      if (syncToQuickbooks && quickbooksConnected) {
        await syncWithQuickBooks(createdEstimate, createdItems);
      }

      if (selectedCoupon) {
        await updateCoupon(selectedCoupon.id, {
          redemption_count: selectedCoupon.redemption_count + 1
        });
      }

      onSuccess(createdEstimate);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create estimate');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Estimate
            </h2>
            {quickbooksConnected && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Check size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">QuickBooks Connected</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {!quickbooksConnected && (
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  QuickBooks is not connected. Estimate will be saved locally only.
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/settings/integrations'}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                <LinkIcon size={16} />
                <span>Connect QuickBooks</span>
              </button>
            </div>
          )}

          {proposals.length > 0 && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Package size={16} />
                <span>Import from Proposal:</span>
              </label>
              <select
                value={selectedProposal?.id || ''}
                onChange={(e) => e.target.value ? handleProposalSelect(e.target.value) : clearProposal()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a proposal (optional)</option>
                {proposals.map(proposal => (
                  <option key={proposal.id} value={proposal.id}>
                    {proposal.title} - ${proposal.value.toFixed(2)}
                  </option>
                ))}
              </select>
              {selectedProposal && (
                <button
                  onClick={clearProposal}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {quickbooksConnected && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToQuickbooks}
                onChange={(e) => setSyncToQuickbooks(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sync to QuickBooks
              </span>
            </label>
          )}

          <CustomerSelection
            selectedCustomer={selectedCustomer}
            onCustomerChange={setSelectedCustomer}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimate Number
              </label>
              <input
                type="text"
                value={formData.estimate_number}
                onChange={(e) => setFormData({ ...formData, estimate_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Terms
              </label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Due on receipt">Due on receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Net 90">Net 90</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PO Number (Optional)
              </label>
              <input
                type="text"
                value={formData.po_number}
                onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                placeholder="Purchase order number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <LineItemsSection
            lineItems={lineItems}
            templates={templates}
            onLineItemChange={handleLineItemChange}
            onAddLineItem={addLineItem}
            onRemoveLineItem={removeLineItem}
            onApplyTemplate={applyTemplate}
          />

          <CouponSelector
            onCouponSelect={handleCouponSelect}
            selectedCoupon={selectedCoupon}
            subtotal={formData.subtotal}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Internal)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Internal notes (not visible to customer)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message to Customer
                </label>
                <textarea
                  value={formData.customer_message}
                  onChange={(e) => setFormData({ ...formData, customer_message: e.target.value })}
                  rows={3}
                  placeholder="This message will appear on the estimate"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-3 bg-paper dark:bg-canvas p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${formData.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Discount:
                  {selectedCoupon && (
                    <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                      (Coupon Applied)
                    </span>
                  )}
                </span>
                <input
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) => !selectedCoupon && setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                  disabled={!!selectedCoupon}
                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <input
                  type="number"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                <input
                  type="number"
                  value={formData.shipping_amount}
                  onChange={(e) => setFormData({ ...formData, shipping_amount: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${formData.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <FileAttachmentSection
            files={attachedFiles}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
          />
        </div>

        <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-paper dark:bg-canvas">
          <button
            onClick={() => setFormData({ ...formData, status: 'draft' })}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            Save as Draft
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span>Create Estimate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEstimateModal;
