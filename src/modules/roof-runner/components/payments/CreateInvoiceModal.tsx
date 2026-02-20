import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Upload, Edit2, Check } from 'lucide-react';
import { createInvoice, updateInvoice, Invoice } from '../../../../shared/store/services/paymentsApi';
import { getActiveCoupons, validateCoupon, Coupon } from '../../../../shared/store/services/couponsApi';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoice: Invoice) => void;
  editInvoice?: Invoice | null;
  invoiceType?: 'invoice' | 'estimate';
  isViewOnly?: boolean;
}

interface LineItem {
  item_name?: string;
  description: string;
  qty: number;
  rate: number;
  discount: number;
  tax: number;
  total: number;
  unit_price?: number; // for backend compatibility
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onSuccess, editInvoice, invoiceType = 'invoice', isViewOnly = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCouponList, setShowCouponList] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  // useRef so it's synchronous — useState would be async and miss the first render
  const isLoadingExistingRef = useRef(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    description: '',
    qty: 1,
    rate: 0,
    discount: 0,
    tax: 5, // Static GST @ 5%
    total: 0
  }]);

  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    billing_address: '',
    shipping_address: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    po_number: '',
    payment_terms: 'Net 30',
    ship_method: '',
    ship_date: '',
    tracking_number: '',
    notes: '',
    message_to_customer: '',
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    coupon_discount: 0,
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
    is_estimate: false,
    job_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editInvoice) {
        setFormData({
          customer_id: editInvoice.customer_id ? String(editInvoice.customer_id) : '',
          customer_name: editInvoice.customer_name || '',
          customer_email: (editInvoice as any).customer_email || '',
          billing_address: (editInvoice as any).billing_address || '',
          shipping_address: (editInvoice as any).shipping_address || '',
          invoice_number: editInvoice.invoice_number || '',
          issue_date: editInvoice.issue_date || new Date().toISOString().split('T')[0],
          due_date: editInvoice.due_date || '',
          po_number: editInvoice.po_number || '',
          payment_terms: editInvoice.payment_terms || 'Net 30',
          ship_method: (editInvoice as any).ship_method || '',
          ship_date: (editInvoice as any).ship_date || '',
          tracking_number: (editInvoice as any).tracking_number || '',
          notes: editInvoice.notes || '',
          message_to_customer: editInvoice.message_to_customer || '',
          subtotal: editInvoice.subtotal || 0,
          discount: editInvoice.discount || 0,
          tax: editInvoice.tax || 0,
          shipping: editInvoice.shipping || 0,
          total: editInvoice.total || 0,
          coupon_discount: editInvoice.coupon_discount || 0,
          status: editInvoice.status || 'draft',
          is_estimate: (editInvoice as any).is_estimate ?? false,
          job_id: (editInvoice as any).job_id ? String((editInvoice as any).job_id) : ''
        });

        console.log('Loading invoice with coupon_discount:', editInvoice.coupon_discount);
        console.log('Full editInvoice data:', editInvoice);

        // Load coupon if exists
        if ((editInvoice as any).coupon_id) {
          const couponCode = (editInvoice as any).coupon_code || '';
          if (couponCode) {
            const couponData = {
              id: (editInvoice as any).coupon_id,
              coupon_code: couponCode,
              discount_value: editInvoice.coupon_discount || 0,
              discount_type: 'fixed' as const
            };
            setAppliedCoupon(couponData as any);
            setCouponCode(couponCode);
            setShowCouponInput(true);
          }
        }

        // line_items is stored as JSONB in the invoices table with fields: qty, rate, discount, tax, total
        const rawLineItems = (editInvoice as any).invoice_line_items?.length
          ? (editInvoice as any).invoice_line_items.map((item: any) => ({
            item_name: item.item_name || item.product_name || item.name || '',
            description: item.description || '',
            qty: item.quantity || item.qty || 1,
            rate: item.unit_price || item.rate || item.price || 0,
            discount: item.discount || 0,
            tax: 5,
            total: item.amount || item.total || ((item.quantity || 1) * (item.unit_price || 0))
          }))
          : ((editInvoice as any).line_items || []).map((item: any) => ({
            item_name: item.item_name || item.product_name || item.name || '',
            description: item.description || '',
            qty: item.qty || item.quantity || 1,
            rate: item.rate || item.unit_price || item.price || 0,
            discount: item.discount || 0,
            tax: 5,
            total: item.total || item.amount || ((item.qty || 1) * (item.rate || 0))
          }));
        // Set flag synchronously via ref BEFORE setLineItems so the useEffect guard works
        isLoadingExistingRef.current = true;
        if (rawLineItems.length > 0) {
          setLineItems(rawLineItems);
        } else {
          setLineItems([{ description: '', qty: 1, rate: 0, discount: 0, tax: 5, total: 0 }]);
        }
        // Clear flag after a tick - do NOT recalculate for view mode, keep stored values
        setTimeout(() => {
          isLoadingExistingRef.current = false;
        }, 100);
      }
      else {
        generateInvoiceNumber();
        setFormData(prev => ({ ...prev, is_estimate: invoiceType === 'estimate' }));
      }
      loadActiveCoupons();
      loadCustomers();
      loadJobs();
    }
  }, [isOpen, editInvoice, invoiceType]);

  useEffect(() => {
    // Only auto-recalculate for NEW invoices. For existing invoices (view/edit),
    // the stored subtotal/tax/total from DB are already set and should not be overwritten
    // unless the user actually changes a line item.
    if (!isLoadingExistingRef.current) {
      calculateTotals(lineItems, formData.discount, formData.shipping, appliedCoupon);
    }
  }, [lineItems, formData.discount, formData.shipping, appliedCoupon]);

  const loadCustomers = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCustomers(data.data.contacts || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setCustomers([]);
    }
  };

  const loadJobs = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/jobs?page=1&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setJobs(data.data?.data || data.data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setJobs([]);
    }
  };

  const loadActiveCoupons = async () => {
    try {
      const coupons = await getActiveCoupons();
      setAvailableCoupons(coupons);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const prefix = invoiceType === 'estimate' ? 'EST' : 'INV';
    setFormData(prev => ({ ...prev, invoice_number: `${prefix}-${timestamp}` }));
  };

  const calculateTotals = (
    items = lineItems,
    manualDiscount = formData.discount || 0,
    shipping = formData.shipping || 0,
    coupon = appliedCoupon
  ) => {
    // Step 1: subtotal = sum of (qty × rate), before any discounts
    const subtotal = parseFloat(items.reduce((sum, item) => sum + (item.qty * item.rate), 0).toFixed(2));

    // Step 2: per-line discounts (percentage off each line's base amount)
    const lineDiscountTotal = parseFloat(items.reduce((sum, item) => {
      return sum + ((item.qty * item.rate) * ((item.discount || 0) / 100));
    }, 0).toFixed(2));

    // Step 3: coupon discount (applied on subtotal)
    let coupon_discount = 0;
    if (coupon) {
      if (coupon.discount_type === 'percentage') {
        coupon_discount = parseFloat((subtotal * (coupon.discount_value / 100)).toFixed(2));
      } else {
        coupon_discount = parseFloat(coupon.discount_value.toFixed(2));
      }
    }

    // Step 4: total discount = line discounts + coupon + manual
    const totalDiscounts = parseFloat((lineDiscountTotal + coupon_discount + manualDiscount).toFixed(2));

    // Step 5: taxable base = subtotal minus ALL discounts (matches QBO exactly)
    const taxableBase = parseFloat(Math.max(0, subtotal - totalDiscounts).toFixed(2));

    // Step 6: tax = taxable base × weighted average tax rate across lines
    // We apply each line's tax% proportionally to the taxable base
    const weightedTaxRate = subtotal > 0
      ? items.reduce((sum, item) => sum + ((item.qty * item.rate) / subtotal * (item.tax || 0)), 0)
      : 0;
    const tax = parseFloat((taxableBase * weightedTaxRate / 100).toFixed(2));

    // Step 7: final total
    const total = parseFloat((taxableBase + tax + shipping).toFixed(2));

    console.log('Invoice Calculation:', {
      subtotal,
      lineDiscountTotal,
      coupon_discount,
      manualDiscount,
      totalDiscounts,
      taxableBase,
      weightedTaxRate,
      tax,
      shipping,
      total
    });

    setFormData(prev => ({ ...prev, subtotal, tax, total, coupon_discount, discount: manualDiscount }));
  };

  const handleSelectCustomer = (customer: any) => {
    const customerName = customer.full_name || customer.fullName || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    setFormData({
      ...formData,
      customer_id: customer.id,
      customer_name: customerName,
      customer_email: customer.email || formData.customer_email  // Auto-fill email from contact
    });
    setCustomerSearch(customerName);
    setShowCustomerList(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const coupon = await validateCoupon(couponCode);
      setAppliedCoupon(coupon);
      setShowCouponList(false);
      setCouponCode('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    setCouponCode(coupon.coupon_code);
    setShowCouponList(false);
    setError(null);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...lineItems];
    const parsedValue = (field === 'qty' || field === 'rate' || field === 'discount' || field === 'tax')
      ? parseFloat(value) || 0
      : value;
    updatedItems[index] = { ...updatedItems[index], [field]: parsedValue };
    const item = updatedItems[index];
    const baseAmount = item.qty * item.rate;
    const discountAmount = baseAmount * ((item.discount || 0) / 100);
    // total = post line-item discount (used for display in the row)
    item.total = parseFloat((baseAmount - discountAmount).toFixed(2));
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { item_name: '', description: '', qty: 1, rate: 0, discount: 0, tax: 5, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false, sendToQuickBooks: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate email if sending to QuickBooks
    if (sendToQuickBooks && !formData.customer_email) {
      setError('Customer email is required to send invoice to QuickBooks');
      setIsLoading(false);
      return;
    }

    // Validate email format
    if (sendToQuickBooks && formData.customer_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customer_email)) {
        setError('Please enter a valid customer email address');
        setIsLoading(false);
        return;
      }
    }

    try {
      const invoiceData: any = {
        ...formData,
        job_id: formData.job_id ? parseInt(formData.job_id) : null,
        line_items: lineItems,
        coupon_id: appliedCoupon?.id,
        status: isDraft ? 'draft' : 'sent',
        send_to_quickbooks: sendToQuickBooks
      };

      let response;
      if (editInvoice) {
        response = await updateInvoice(editInvoice.id, invoiceData);
      } else {
        response = await createInvoice(invoiceData);
      }

      if (response.warning) {
        setError(response.warning);
        // Still call onSuccess since invoice was created locally
        onSuccess(response.data || response);
      } else {
        onSuccess(response.data || response);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isViewOnly ? `View ${formData.is_estimate ? 'Estimate' : 'Invoice'}` : editInvoice ? `Edit ${formData.is_estimate ? 'Estimate' : 'Invoice'}` : `Create ${invoiceType === 'estimate' ? 'Estimate' : 'Invoice'}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className={`mb-4 rounded-lg p-3 flex items-start gap-2 ${error.toLowerCase().includes('quickbooks') ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200'
              } border`}>
              <span className={`${error.toLowerCase().includes('quickbooks') ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                } text-sm flex-1`}>
                {error}
                {!error.toLowerCase().includes('quickbooks') && error.includes('Failed to create') && (
                  <p className="mt-1 text-xs opacity-80">This might be due to a database error or missing permissions. Please contact support if this persists.</p>
                )}
              </span>
              {error.toLowerCase().includes('quickbooks') && (
                <button type="button" className="ml-auto px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded whitespace-nowrap">
                  Connect QuickBooks
                </button>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="rounded" disabled={isViewOnly} />
              Make this a recurring invoice
            </label>
          </div>

          <div className="space-y-6">
            {/* Customer & Address Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Search customers..."
                  value={customerSearch || formData.customer_name}
                  disabled={isViewOnly}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setFormData({ ...formData, customer_name: e.target.value });
                    setShowCustomerList(true);
                  }}
                  onFocus={() => !isViewOnly && setShowCustomerList(true)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
                />

                {showCustomerList && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customers
                      .filter(c => {
                        const search = customerSearch.toLowerCase();
                        const fullName = (c.fullName || c.first_name + ' ' + c.last_name).toLowerCase();
                        const email = (c.email || '').toLowerCase();
                        return fullName.includes(search) || email.includes(search);
                      })
                      .map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleSelectCustomer(customer)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-0"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.fullName || customer.first_name + ' ' + customer.last_name}
                          </div>
                          {customer.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</div>
                          )}
                        </button>
                      ))}
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customer_email || ''}
                    disabled={isViewOnly}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Billing Address</label>
                  <textarea
                    value={formData.billing_address || ''}
                    disabled={isViewOnly}
                    onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Address</label>
                  <textarea
                    value={formData.shipping_address || ''}
                    disabled={isViewOnly}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={formData.invoice_number}
                  disabled={isViewOnly}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Date</label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  disabled={isViewOnly}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  disabled={isViewOnly}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* Job Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job (Optional)</label>
              <select
                value={formData.job_id}
                disabled={isViewOnly}
                onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">No job selected</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    #{job.id} ({job.createdByName || 'Job'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Terms</label>
                <select
                  value={formData.payment_terms}
                  disabled={isViewOnly}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option>Net 30</option>
                  <option>Net 60</option>
                  <option>Due on Receipt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PO Number (Optional)</label>
                <input
                  type="text"
                  value={formData.po_number || ''}
                  disabled={isViewOnly}
                  onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* Shipping Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ship Method</label>
                <input
                  type="text"
                  value={formData.ship_method || ''}
                  disabled={isViewOnly}
                  onChange={(e) => setFormData({ ...formData, ship_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ship Date</label>
                <input
                  type="date"
                  value={formData.ship_date ? formData.ship_date.split('T')[0] : ''}
                  disabled={isViewOnly}
                  onChange={(e) => setFormData({ ...formData, ship_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={formData.tracking_number || ''}
                  disabled={isViewOnly}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Line Items</label>
                <button type="button" onClick={() => setShowTemplate(!showTemplate)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                  <span className="inline-block w-4 h-4 border border-current rounded"></span> Show Template
                </button>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <div className="col-span-2">Product/Service</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-1">Rate</div>
                  <div className="col-span-1">Discount %</div>
                  <div className="col-span-1">Tax (GST 5%)</div>
                  <div className="col-span-2">Total</div>
                  {!isViewOnly && <div className="col-span-1">Action</div>}
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {lineItems.map((item, index) => (
                    <div key={index} className="px-3 py-2 grid grid-cols-12 gap-2 items-center bg-white dark:bg-gray-900">
                      <input
                        type="text"
                        placeholder="Product/Service"
                        value={item.item_name || ''}
                        disabled={isViewOnly}
                        onChange={(e) => handleLineItemChange(index, 'item_name', e.target.value)}
                        className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        disabled={isViewOnly}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        className="col-span-3 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                      <input
                        type="number"
                        value={item.qty}
                        disabled={isViewOnly}
                        onChange={(e) => handleLineItemChange(index, 'qty', parseFloat(e.target.value) || 0)}
                        className="col-span-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                      <input
                        type="number"
                        value={item.rate}
                        disabled={isViewOnly}
                        onChange={(e) => handleLineItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="col-span-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                      <input
                        type="number"
                        value={item.discount}
                        disabled={isViewOnly}
                        onChange={(e) => handleLineItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="col-span-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                      <input
                        type="number"
                        value={5}
                        disabled
                        className="col-span-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white opacity-75"
                      />
                      <div className="col-span-2 px-2 text-sm text-gray-900 dark:text-white font-medium">
                        ${(item.total > 0 ? item.total : ((item.qty * item.rate) * (1 - (item.discount || 0) / 100))).toFixed(2)}
                      </div>
                      {!isViewOnly && (
                        <button type="button" onClick={() => removeLineItem(index)} className="col-span-1 text-red-600 hover:text-red-700 justify-self-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!isViewOnly && (
                <button type="button" onClick={addLineItem} className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              )}
            </div>

            {/* Apply Coupon Code */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <input
                  type="checkbox"
                  checked={showCouponInput}
                  disabled={isViewOnly}
                  onChange={(e) => {
                    console.log('Coupon checkbox clicked:', e.target.checked);
                    setShowCouponInput(e.target.checked);
                  }}
                  className="rounded"
                />
                Apply Coupon Code
              </label>

              {showCouponInput && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setShowCouponList(true);
                      }}
                      onFocus={() => setShowCouponList(true)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                    >
                      Apply
                    </button>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          {appliedCoupon.coupon_code} - {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `$${appliedCoupon.discount_value}`} off
                        </span>
                      </div>
                      {!isViewOnly && (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}

                  {showCouponList && availableCoupons.length > 0 && !appliedCoupon && (
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                      {availableCoupons
                        .filter(c => !couponCode || c.coupon_code.includes(couponCode))
                        .map((coupon) => (
                          <button
                            key={coupon.id}
                            type="button"
                            onClick={() => handleSelectCoupon(coupon)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{coupon.coupon_code}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{coupon.coupon_name}</div>
                              </div>
                              <div className="text-sm font-semibold text-primary-600">
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Totals and Notes */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  disabled={isViewOnly}
                  placeholder="Additional notes (not visible for customers)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm disabled:opacity-50"
                />
                <button type="button" className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              <div>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Discount ($)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      disabled={isViewOnly}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping ($)</label>
                    <input
                      type="number"
                      value={formData.shipping}
                      disabled={isViewOnly}
                      onChange={(e) => setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">${formData.subtotal.toFixed(2)}</span>
                  </div>
                  {((formData.discount || 0) + (formData.coupon_discount || 0) > 0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="text-red-600 dark:text-red-400">-${((formData.discount || 0) + (formData.coupon_discount || 0)).toFixed(2)}</span>
                    </div>
                  )}
                  {formData.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">GST @ 5%</span>
                      <span className="text-gray-900 dark:text-white">${formData.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.shipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-white">${formData.shipping.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-base font-semibold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">${formData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message to Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message to Customer</label>
              <textarea
                value={formData.message_to_customer || ''}
                onChange={(e) => setFormData({ ...formData, message_to_customer: e.target.value })}
                rows={3}
                disabled={isViewOnly}
                placeholder="This message will appear on the invoice"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm disabled:opacity-50"
              />
              <button type="button" className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Drag and drop files here, or <span className="text-primary-600">Browse</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Supports: Image, PDF, Document, Video, Midi and Zip file</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            {!isViewOnly && (
              <button
                type="button"
                onClick={(e: any) => handleSubmit(e, true)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                Save as Draft
              </button>
            )}
            <div className={`flex gap-3 ${isViewOnly ? 'ml-auto' : ''}`}>
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                {isViewOnly ? 'Close' : 'Cancel'}
              </button>
              {!isViewOnly && !editInvoice && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={(e) => handleSubmit(e, false, true)}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? 'Processing...' : 'Create and Send'}
                </button>
              )}
              {!isViewOnly && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? 'Creating...' : editInvoice ? `Update ${formData.is_estimate ? 'Estimate' : 'Invoice'}` : `Create ${invoiceType === 'estimate' ? 'Estimate' : 'Invoice'}`}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
