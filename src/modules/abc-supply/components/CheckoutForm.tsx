import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { abcSupplyApi } from '../services/api';
import { qxoApi } from '../../roof-runner/services/qxoApi';
import GooglePlacesAutocomplete from '../../../shared/components/GooglePlacesAutocomplete';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CheckoutFormData) => void;
  loading: boolean;
  supplier?: string;
  srsCustomerProfile?: any | null;
  initialData?: Partial<CheckoutFormData>;
}

export interface CheckoutFormData {
  jobId?: number | null;
  deliveryService: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryDate?: string;
  instructions?: string;
  customerCode?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    city: string;
    state: string;
    zipCode: string;
  };
  jobName?: string;
  jobNumber?: string;
  extendedPO?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ isOpen, onClose, onSubmit, loading, supplier, srsCustomerProfile, initialData }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [formData, setFormData] = useState<CheckoutFormData>({
    jobId: null,
    deliveryService: supplier === 'QXO' ? 'O' : 'OTG', // Default to Delivery for QXO
    contact: {
      name: initialData?.contact?.name || '',
      email: initialData?.contact?.email || '',
      phone: initialData?.contact?.phone || ''
    },
    deliveryDate: initialData?.deliveryDate || '',
    instructions: initialData?.instructions || '',
    customerCode: '',
    shippingAddress: {
      name: initialData?.shippingAddress?.name || '',
      line1: initialData?.shippingAddress?.line1 || '',
      city: initialData?.shippingAddress?.city || '',
      state: initialData?.shippingAddress?.state || '',
      zipCode: initialData?.shippingAddress?.zipCode || ''
    },
    extendedPO: ''
  });

  const [qxoJobConfig, setQxoJobConfig] = useState<any>(null);
  const [fetchingQxoConfig, setFetchingQxoConfig] = useState(false);

  const [hasSynced, setHasSynced] = useState(false);

  // Sync initialData only once when the form opens
  useEffect(() => {
    if (!isOpen) {
      setHasSynced(false);
      return;
    }

    if (isOpen && initialData && !hasSynced) {
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          ...initialData.contact
        },
        shippingAddress: {
          ...prev.shippingAddress,
          ...initialData.shippingAddress
        },
        deliveryDate: initialData.deliveryDate || prev.deliveryDate,
        instructions: initialData.instructions || prev.instructions,
        jobNumber: initialData.jobNumber || prev.jobNumber
      }));
      setHasSynced(true);
    }
  }, [isOpen, initialData, hasSynced]);

  useEffect(() => {
    // Fetch jobs
    const fetchJobs = async () => {
      try {
        const data = await abcSupplyApi.getJobs(100);
        if (data.success) {
          setJobs(data.data.data || []);
        } else if (data.data && Array.isArray(data.data.data)) {
          // Fallback in case success flag works differently or data structure varies slightly
          setJobs(data.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      }
    };
    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || supplier !== 'SRS') return;
    const storedCode = srsCustomerProfile?.customer_code || srsCustomerProfile?.customerCode;
    if (storedCode) {
      setFormData(prev => ({
        ...prev,
        customerCode: storedCode
      }));
    }
  }, [isOpen, supplier, srsCustomerProfile]);

  useEffect(() => {
    const accountId = initialData?.jobNumber || "678204";
    
    // Prevent redundant fetches if we already have the config for this account
    if (isOpen && supplier === 'QXO' && qxoJobConfig?.accountId !== accountId) {
      const fetchQxoConfig = async () => {
        if (fetchingQxoConfig) return; // Prevent concurrent identical calls
        
        setFetchingQxoConfig(true);
        try {
          const res = await qxoApi.getJobs(accountId);
          if (res.success && res.data) {
            const config = res.data.data || res.data;
            setQxoJobConfig({
              ...config,
              accountId: accountId, // Store current accountId to track state
              hasJobs: config.hasJobs ?? (config.jobs && config.jobs.length > 0)
            });
          }
        } catch (e) {
          console.error("Failed to fetch QXO job config:", e);
        } finally {
          setFetchingQxoConfig(false);
        }
      };
      fetchQxoConfig();
    }
  }, [isOpen, supplier, initialData?.jobNumber]);

  const onJobAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selectedJob = (qxoJobConfig?.jobs || []).find((j: any) => j.jobNumber === val);
    
    setFormData(prev => {
      const newData = { ...prev, jobId: val ? 999 : null, jobNumber: val };
      
      // Rule 3 & 4: Auto-fill job name if selected from dropdown
      if (selectedJob && (qxoJobConfig?.hasJobNumber === false || qxoJobConfig?.hasJobAccount === false) && qxoJobConfig?.hasJobs) {
        newData.jobName = selectedJob.jobName;
      } else if (selectedJob && qxoJobConfig?.hasJobAccount && !qxoJobConfig?.hasJobNumber && qxoJobConfig?.hasJobs) {
        newData.jobName = selectedJob.jobName;
      }
      
      return newData;
    });
  };

  const handleAddressSelect = (
    address: string,
    isFromAutocomplete: boolean,
    lat?: number,
    lng?: number,
    components?: any
  ) => {
    if (isFromAutocomplete && components) {
      const street = components.street_number 
        ? `${components.street_number} ${components.route || ''}`.trim()
        : components.route || '';
      
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          name: prev.shippingAddress?.name || '', // preserve name
          line1: street || address.split(',')[0],
          city: components.city || '',
          state: components.state || '',
          zipCode: components.zip || ''
        }
      }));
    } else {
      updateField('shippingAddress', 'line1', address);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalData = { ...formData };

    if (supplier === 'QXO') {
      // For QXO, we use the specific jobName/jobNumber set in previous steps
      // No extra mapping needed here as we update them real-time
    } else {
      // Find selected job details to pass along for others
      const selectedJob = jobs.find(j => j.id === formData.jobId);
      finalData = {
        ...formData,
        jobName: selectedJob?.location || selectedJob?.name || "",
        jobNumber: selectedJob?.jobNumber || selectedJob?.id?.toString() || ""
      };
    }
    
    onSubmit(finalData);
  };

  const updateField = (section: keyof CheckoutFormData, field: string, value: string) => {
    let finalValue = value;
    
    // Auto-uppercase state if it's the state field
    if (section === 'shippingAddress' && field === 'state') {
      finalValue = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object'
        ? { ...prev[section], [field]: finalValue }
        : finalValue
    }));
  };

  const isQxo = supplier === 'QXO';
  const addressLimit = 30;
  const stateLimit = 2;
  
  const addressLength = formData.shippingAddress?.line1?.length || 0;
  const stateLength = formData.shippingAddress?.state?.length || 0;
  
  const isAddressInvalid = isQxo && addressLength > addressLimit;
  const isStateInvalid = isQxo && stateLength > stateLimit;

  // QXO Dynamic Validation & Indicators
  const config = qxoJobConfig || {};
  const showExtendedPO = isQxo && config.showExtendedPO;
  const isPoRequired = isQxo ? (showExtendedPO ? config.extendedPORequired : config.poRequired) : false;
  
  const isPoMissing = isQxo && (
    (showExtendedPO && isPoRequired && !formData.extendedPO) ||
    (!showExtendedPO && isPoRequired && !formData.jobNumber)
  );

  const showJobDropdown = isQxo && config.hasJobs;

  const showJobNameField = isQxo && !(config.hasJobNumber && config.hasJobs);

  const jobNameRequired = isQxo && (
    (config.hasJobAccount && !config.hasJobNumber && !config.hasJobs) ||
    (config.hasJobAccount && !config.hasJobNumber && config.hasJobs)
  );
  
  const jobAccountRequired = isQxo && config.hasJobNumber && config.hasJobs;
  
  const isJobMissing = isQxo && (
    (jobAccountRequired && !formData.jobNumber) ||
    (jobNameRequired && !formData.jobName)
  );

  const isFormValid = !isAddressInvalid && !isStateInvalid && !isJobMissing && !isPoMissing;

  if (!isOpen) return null;

  const storedSrsCode = srsCustomerProfile?.customer_code || srsCustomerProfile?.customerCode;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Checkout Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {fetchingQxoConfig && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Loading your account configuration...</p>
            </div>
          )}

          {isQxo ? (
            <div className="space-y-4">
              {showJobDropdown && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Account {jobAccountRequired && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={formData.jobNumber || ''}
                    onChange={onJobAccountChange}
                    className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select Job Account</option>
                    {(qxoJobConfig?.jobs || []).map((job: any) => (
                      <option key={job.jobNumber} value={job.jobNumber}>
                        {job.jobName} ({job.jobNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showJobNameField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Name {jobNameRequired && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.jobName || ''}
                    onChange={(e) => updateField('jobName', '', e.target.value)}
                    placeholder="Enter Job Name"
                    required={jobNameRequired}
                    className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Associate with Job
              </label>
              <select
                value={formData.jobId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value ? Number(e.target.value) : null }))}
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
              >
                <option value="">No job selected</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.location || `Job #${job.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Service
            </label>
            <select
              value={formData.deliveryService}
              onChange={(e) => updateField('deliveryService', '', e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
            >
              {supplier === 'QXO' ? (
                <>
                  <option value="O">Delivery/Order (O)</option>
                  <option value="P">Pickup / Will Call (P)</option>
                </>
              ) : (
                <>
                  <option value="OTG">Our Truck Ground (OTG)</option>
                  <option value="COM">Common Carrier (COM)</option>
                  <option value="CPU">Customer Pickup (CPU)</option>
                  <option value="EXP">Express Pickup (EXP)</option>
                  <option value="OTR">Our Truck Roof (OTR)</option>
                  <option value="OTW">Our Truck Window (OTW)</option>
                  <option value="TPC">Third-Party Carrier (TPC)</option>
                </>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {supplier === 'QXO' 
                ? "Select your preferred fulfillment method for this order."
                : "Note: Delivery Services available are dependent on the branch and are subject to change at the discretion of the branch."}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.contact.name}
                onChange={(e) => updateField('contact', 'name', e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.contact.email}
                onChange={(e) => updateField('contact', 'email', e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.contact.phone}
                onChange={(e) => updateField('contact', 'phone', e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 md:col-span-2"
              />
            </div>
          </div>

          {isQxo && qxoJobConfig && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {showExtendedPO ? 'Extended PO' : 'PO Number'} {isPoRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                placeholder={showExtendedPO ? "Enter Extended PO" : "Enter PO Number"}
                value={showExtendedPO ? formData.extendedPO : formData.jobNumber} // Reusing jobNumber field for standard PO for QXO in UI
                onChange={(e) => showExtendedPO ? updateField('extendedPO', '', e.target.value) : updateField('jobNumber', '', e.target.value)}
                required={isPoRequired}
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          {(supplier === 'SRS' || supplier === 'QXO') && (
            <>
              {supplier === 'SRS' && (
                <>
                  {storedSrsCode ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                      <div className="font-medium">SRS customer code connected</div>
                      <div className="mt-1 text-gray-900 dark:text-white">{storedSrsCode}</div>
                      <div className="mt-2 text-xs text-green-700/80 dark:text-green-200/80">
                        Manage this in Integrations if you need to change it.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer Code (Required for SRS)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your SRS Customer Code"
                        value={formData.customerCode}
                        onChange={(e) => updateField('customerCode', '', e.target.value)}
                        required
                        className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company/Recipient Name"
                    value={formData.shippingAddress?.name}
                    onChange={(e) => updateField('shippingAddress', 'name', e.target.value)}
                    required
                    className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 md:col-span-2"
                  />
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-gray-500">Street Address</label>
                      {isQxo && (
                        <span className={`text-[10px] font-mono ${isAddressInvalid ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                          {addressLength}/{addressLimit}
                        </span>
                      )}
                    </div>
                    {isQxo ? (
                      <GooglePlacesAutocomplete
                        value={formData.shippingAddress?.line1 || ''}
                        onChange={handleAddressSelect}
                        placeholder="Start typing your address..."
                        countries={['us', 'ca']}
                        className={`w-full p-3 bg-white border ${isAddressInvalid ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500`}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={formData.shippingAddress?.line1}
                        onChange={(e) => updateField('shippingAddress', 'line1', e.target.value)}
                        required
                        className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                    )}
                    {isAddressInvalid && (
                      <p className="text-[10px] text-red-500 mt-1">Street address must be 30 characters or less for QXO orders.</p>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.shippingAddress?.city}
                      onChange={(e) => updateField('shippingAddress', 'city', e.target.value)}
                      required
                      disabled={isQxo}
                      className={`w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 ${isQxo ? 'opacity-70 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed' : ''}`}
                    />
                    {isQxo && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-primary-500 uppercase tracking-tighter">Auto-filled</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-medium text-gray-500">State (2 chars)</label>
                        {isQxo && (
                          <span className={`text-[10px] font-mono ${isStateInvalid ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            {stateLength}/{stateLimit}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="ST"
                        value={formData.shippingAddress?.state}
                        onChange={(e) => updateField('shippingAddress', 'state', e.target.value)}
                        required
                        disabled={isQxo}
                        className={`w-full p-3 bg-white border ${isStateInvalid ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 ${isQxo ? 'opacity-70 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed' : ''}`}
                      />
                      {isQxo && <span className="absolute right-3 top-[70%] -translate-y-1/2 text-[9px] font-bold text-primary-500 uppercase tracking-tighter">Auto</span>}
                    </div>
                    <div className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-medium text-gray-500">ZIP Code</label>
                      </div>
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={formData.shippingAddress?.zipCode}
                        onChange={(e) => updateField('shippingAddress', 'zipCode', e.target.value)}
                        required
                        disabled={isQxo}
                        className={`w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 ${isQxo ? 'opacity-70 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed' : ''}`}
                      />
                      {isQxo && <span className="absolute right-3 top-[70%] -translate-y-1/2 text-[9px] font-bold text-primary-500 uppercase tracking-tighter">Auto</span>}
                    </div>
                  </div>
                  {isQxo && (
                    <p className="text-[10px] text-gray-500 mt-2 italic md:col-span-2">
                      Note: Currently, QXO only support valid North American (US and Canada) addresses for order fulfillment.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Date (Optional)
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => updateField('deliveryDate', '', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              placeholder="Any special delivery instructions..."
              value={formData.instructions}
              onChange={(e) => updateField('instructions', '', e.target.value)}
              rows={3}
              className="w-full p-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {supplier === 'SRS' && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed italic">
                <strong>Tax & Delivery Disclaimer:</strong> Tax and delivery fees are estimated in this interface. Final calculation is performed by SRS Distribution upon order submission.
              </p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
