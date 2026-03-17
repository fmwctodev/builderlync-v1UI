import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, QrCode, Code, Plus, X, Save, Edit } from 'lucide-react';
import { apiService } from '../store/services/api';
import Toast from '../../../shared/components/Toast';

interface InstantEstimatorManageModalProps {
    isOpen: boolean;
    onClose: () => void;
    estimatorId: number;
    onSaved?: () => void;
}

const InstantEstimatorManageModal: React.FC<InstantEstimatorManageModalProps> = ({ isOpen, onClose, estimatorId, onSaved }) => {
    const [estimatorName, setEstimatorName] = useState('');
    const [publicUrl, setPublicUrl] = useState('');

    const [loading, setLoading] = useState(true);
    const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
    const [restrictMaterials, setRestrictMaterials] = useState(false);
    const [pricingType, setPricingType] = useState('per-square-foot');
    const [showPriceRange, setShowPriceRange] = useState(false);
    const [showFinancing, setShowFinancing] = useState(false);
    const [lowerRange, setLowerRange] = useState('0');
    const [upperRange, setUpperRange] = useState('0');
    const [termLength, setTermLength] = useState('1');
    const [interestRate, setInterestRate] = useState('0');
    const [showProjectShowcase, setShowProjectShowcase] = useState(false);
    const [showSocialMedia, setShowSocialMedia] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState('share');
    const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
    const [materialName, setMaterialName] = useState('');
    const [materialType, setMaterialType] = useState('Asphalt');
    const [imageUrl, setImageUrl] = useState('');
    const [lowPitch, setLowPitch] = useState('');
    const [moderatePitch, setModeratePitch] = useState('');
    const [steepPitch, setSteepPitch] = useState('');
    const [flat, setFlat] = useState('');
    const [multiStorySurcharge, setMultiStorySurcharge] = useState('');
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [materialTemplates, setMaterialTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [selectedStageId, setSelectedStageId] = useState('');
    const [staffMembers, setStaffMembers] = useState<any[]>([]);
    const [defaultJobOwnerId, setDefaultJobOwnerId] = useState('');
    const [notificationEmail, setNotificationEmail] = useState('');
    const [financingLink, setFinancingLink] = useState('');
    const [proposalTemplates, setProposalTemplates] = useState<any[]>([]);
    const [selectedProposalTemplateId, setSelectedProposalTemplateId] = useState('');
    const [contactSettings, setContactSettings] = useState<any>({});
    const [schedulingLink, setSchedulingLink] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);

    useEffect(() => {
        if (isOpen && estimatorId) {
            fetchEstimatorData();
            fetchPipelines();
            fetchMaterialTemplates();
            fetchProposalTemplates();
            fetchStaff();
        }
    }, [isOpen, estimatorId]);

    const normalizeMaterial = (material: any) => {
        const pricing = material?.pricing || {};

        return {
            ...material,
            imageUrl: material?.imageUrl || material?.image_url || '',
            pricing: {
                ...pricing,
                lowPitch: material?.lowPitch ?? pricing.lowPitch ?? '',
                moderatePitch: material?.moderatePitch ?? pricing.moderatePitch ?? '',
                steepPitch: material?.steepPitch ?? pricing.steepPitch ?? '',
                flat: material?.flat ?? pricing.flat ?? '',
                multiStorySurcharge: material?.multiStorySurcharge ?? pricing.multiStorySurcharge ?? ''
            }
        };
    };

    const fetchPipelines = async () => {
        try {
            const response = await apiService.getPipelines();
            setPipelines(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Failed to fetch pipelines:', error);
        }
    };

    const fetchMaterialTemplates = async () => {
        try {
            const response = await apiService.getMaterialTemplates();
            setMaterialTemplates(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Failed to fetch material templates:', error);
        }
    };

    const fetchProposalTemplates = async () => {
        try {
            const response = await apiService.getProposalTemplates();
            setProposalTemplates(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Failed to fetch proposal templates:', error);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await apiService.getStaff();
            let staffList = [];
            if (Array.isArray(response)) {
                staffList = response;
            } else if (response.data && Array.isArray(response.data.data)) {
                staffList = response.data.data;
            } else if (response.data && Array.isArray(response.data)) {
                staffList = response.data;
            } else if (response.data && response.data.staff && Array.isArray(response.data.staff)) {
                staffList = response.data.staff;
            }
            setStaffMembers(staffList);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        }
    };

    const fetchEstimatorData = async () => {
        if (!estimatorId) return;
        try {
            setLoading(true);
            const response = await apiService.getInstantEstimator(estimatorId);
            if (response && (response.data || response.id)) {
                const estimator = response.data || response;
                setEstimatorName(estimator.name);
                setPublicUrl(estimator.public_url);
                setSelectedMaterials((estimator.materials || []).map(normalizeMaterial));

                const pricingSettings = estimator.pricing_settings || {};
                setRestrictMaterials(pricingSettings.restrict_materials || false);
                setPricingType(pricingSettings.pricing_type || 'per-square-foot');
                setShowPriceRange(pricingSettings.show_price_range || false);
                setShowFinancing(pricingSettings.show_financing || false);
                setLowerRange(pricingSettings.lower_range || '10');
                setUpperRange(pricingSettings.upper_range || '10');
                setTermLength(pricingSettings.term_length || '60');
                setInterestRate(pricingSettings.interest_rate || '5.99');
                setFinancingLink(pricingSettings.financing_link || '');

                const additionalSettings = estimator.additional_settings || {};
                const loadedContactSettings = estimator.contact_settings || {};
                setContactSettings(loadedContactSettings);
                setSchedulingLink(
                    loadedContactSettings.scheduling_link ||
                    loadedContactSettings.calendar_link ||
                    ''
                );
                setShowProjectShowcase(additionalSettings.show_project_showcase || false);
                setShowSocialMedia(additionalSettings.show_social_media || false);
                setSelectedStageId(additionalSettings.stage_id || '');
                setSelectedProposalTemplateId(additionalSettings.proposal_template_id || '');
                setDefaultJobOwnerId(additionalSettings.default_job_owner_id || '');
                setNotificationEmail(additionalSettings.notification_email || '');
            } else {
                setEstimatorName('Estimator Not Found');
            }
        } catch (error) {
            console.error('Failed to fetch estimator:', error);
            setEstimatorName('Error Loading Estimator');
        } finally {
            setLoading(false);
        }
    };

    const saveAllSettings = async () => {
        if (!estimatorId) return;
        try {
            await apiService.updateInstantEstimatorPricingSettings(estimatorId, {
                restrict_materials: restrictMaterials,
                pricing_type: pricingType,
                show_price_range: showPriceRange,
                show_financing: showFinancing,
                lower_range: lowerRange,
                upper_range: upperRange,
                term_length: termLength,
                interest_rate: interestRate,
                financing_link: financingLink
            });

            await apiService.updateInstantEstimatorAdditionalSettings(estimatorId, {
                show_project_showcase: showProjectShowcase,
                show_social_media: showSocialMedia,
                stage_id: selectedStageId,
                proposal_template_id: selectedProposalTemplateId,
                default_job_owner_id: defaultJobOwnerId,
                notification_email: notificationEmail
            });

            await apiService.updateInstantEstimator(estimatorId, {
                contact_settings: {
                    ...contactSettings,
                    scheduling_link: schedulingLink,
                    calendar_link: schedulingLink
                }
            });

            setContactSettings((prev: any) => ({
                ...prev,
                scheduling_link: schedulingLink,
                calendar_link: schedulingLink
            }));

            setToast({ message: 'Settings saved successfully!', type: 'success' });
            if (onSaved) onSaved();
        } catch (error) {
            console.error('Failed to save settings:', error);
            setToast({ message: 'Failed to save settings', type: 'error' });
        }
    };

    const getEstimatorUrl = () => `${window.location.origin}/estimator/${publicUrl}`;

    const generateQRCode = (url: string) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
    };

    const getEmbedCode = (url: string) => {
        return `<iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>`;
    };

    const resetMaterialForm = () => {
        setEditingMaterialId(null);
        setSelectedTemplateId('');
        setMaterialName('');
        setMaterialType('Asphalt');
        setImageUrl('');
        setLowPitch('');
        setModeratePitch('');
        setSteepPitch('');
        setFlat('');
        setMultiStorySurcharge('');
    };

    const openAddMaterialModal = () => {
        resetMaterialForm();
        setShowAddMaterialModal(true);
    };

    const openEditMaterialModal = (material: any) => {
        setEditingMaterialId(material.id);
        setSelectedTemplateId('');
        setMaterialName(material.name || '');
        setMaterialType(material.materialType || 'Asphalt');
        setImageUrl(material.imageUrl || '');
        setLowPitch(material.pricing?.lowPitch?.toString() || '');
        setModeratePitch(material.pricing?.moderatePitch?.toString() || '');
        setSteepPitch(material.pricing?.steepPitch?.toString() || '');
        setFlat(material.pricing?.flat?.toString() || '');
        setMultiStorySurcharge(material.pricing?.multiStorySurcharge?.toString() || '');
        setShowAddMaterialModal(true);
    };

    const buildMaterialPayload = () => ({
        name: materialName,
        materialType,
        imageUrl,
        lowPitch,
        moderatePitch,
        steepPitch,
        flat,
        multiStorySurcharge
    });

    const buildMaterialPreview = (materialId?: string | null) => normalizeMaterial({
        id: materialId || editingMaterialId || `${Date.now()}`,
        name: materialName,
        materialType,
        imageUrl,
        lowPitch,
        moderatePitch,
        steepPitch,
        flat,
        multiStorySurcharge
    });

    const downloadQRCode = async () => {
        try {
            const url = generateQRCode(getEstimatorUrl());
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch QR image');
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = `${(estimatorName || 'instant-estimator').toLowerCase().replace(/\s+/g, '-')}-qr.png`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(blobUrl);
            setToast({ message: 'QR code downloaded successfully!', type: 'success' });
        } catch (error) {
            console.error('Failed to download QR code:', error);
            setToast({ message: 'Failed to download QR code', type: 'error' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Manage: {loading ? 'Loading...' : estimatorName || 'Estimator'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Configure settings for this instant estimator
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={saveAllSettings}
                            className="flex items-center gap-2 bg-[#dc2626] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save All
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-gray-900 dark:bg-gray-950 border-b border-gray-700">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('share')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'share'
                                ? 'text-primary-500 border-b-2 border-primary-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Share & Embed
                        </button>
                        <button
                            onClick={() => setActiveTab('pricing')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'pricing'
                                ? 'text-primary-500 border-b-2 border-primary-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Pricing
                        </button>
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'materials'
                                ? 'text-primary-500 border-b-2 border-primary-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Materials
                        </button>
                        <button
                            onClick={() => setActiveTab('scheduling')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'scheduling'
                                ? 'text-primary-500 border-b-2 border-primary-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Scheduling
                        </button>
                        <button
                            onClick={() => setActiveTab('additional')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'additional'
                                ? 'text-primary-500 border-b-2 border-primary-500'
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Additional
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">

                        {/* Share & Embed Tab */}
                        {activeTab === 'share' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Public URL</h3>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <input
                                            type="text"
                                            value={`${window.location.origin}/estimator/${publicUrl}`}
                                            readOnly
                                            className="flex-1 bg-transparent text-gray-600 dark:text-gray-300 text-sm"
                                        />
                                        <button
                                            onClick={async () => {
                                                const url = `${window.location.origin}/estimator/${publicUrl}`;
                                                try {
                                                    await navigator.clipboard.writeText(url);
                                                    setToast({ message: 'Link copied to clipboard!', type: 'success' });
                                                } catch (err) {
                                                    const textArea = document.createElement('textarea');
                                                    textArea.value = url;
                                                    document.body.appendChild(textArea);
                                                    textArea.select();
                                                    document.execCommand('copy');
                                                    document.body.removeChild(textArea);
                                                    setToast({ message: 'Link copied to clipboard!', type: 'success' });
                                                }
                                            }}
                                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const url = `${window.location.origin}/estimator/${publicUrl}`;
                                                window.open(url, '_blank', 'noopener,noreferrer');
                                            }}
                                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Open
                                        </button>

                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-4 text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setShowQRModal(true)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <QrCode className="w-4 h-4" />
                                            QR code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmbedModal(true)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <Code className="w-4 h-4" />
                                            Embed code
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing Tab */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={restrictMaterials}
                                        onChange={(e) => setRestrictMaterials(e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Restrict customer to the materials I've configured pricing for
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                        Choose how you would like to specify your pricing
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setPricingType('per-square-foot')}
                                            className={`flex-1 py-3 px-4 text-sm border rounded-lg ${pricingType === 'per-square-foot'
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            Per square foot
                                        </button>
                                        <button
                                            onClick={() => setPricingType('per-square')}
                                            className={`flex-1 py-3 px-4 text-sm border rounded-lg ${pricingType === 'per-square'
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            Per square
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="checkbox"
                                            checked={showPriceRange}
                                            onChange={(e) => setShowPriceRange(e.target.checked)}
                                            className="w-5 h-5 text-primary-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Show prices as range</span>
                                    </div>
                                    {showPriceRange && (
                                        <div className="grid grid-cols-2 gap-4 ml-7">
                                            <div>
                                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Lower range (%)</label>
                                                <input
                                                    type="number"
                                                    value={lowerRange}
                                                    onChange={(e) => setLowerRange(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Upper range (%)</label>
                                                <input
                                                    type="number"
                                                    value={upperRange}
                                                    onChange={(e) => setUpperRange(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="checkbox"
                                            checked={showFinancing}
                                            onChange={(e) => setShowFinancing(e.target.checked)}
                                            className="w-5 h-5 text-primary-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Show financing options</span>
                                    </div>
                                    {showFinancing && (
                                        <div className="ml-7 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Term length (months)</label>
                                                    <input
                                                        type="number"
                                                        value={termLength}
                                                        onChange={(e) => setTermLength(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Interest rate (%)</label>
                                                    <input
                                                        type="number"
                                                        value={interestRate}
                                                        onChange={(e) => setInterestRate(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Financing link (optional)</label>
                                                <input
                                                    type="text"
                                                    value={financingLink}
                                                    onChange={(e) => setFinancingLink(e.target.value)}
                                                    placeholder="https://your-financing-portal.com"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Materials Tab */}
                        {activeTab === 'materials' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Configure materials and pricing for this estimator
                                    </p>
                                    <button
                                        onClick={openAddMaterialModal}
                                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Material
                                    </button>
                                </div>

                                {selectedMaterials.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedMaterials.map((material: any, index: number) => (
                                            <div key={material.id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {material.imageUrl ? (
                                                        <img src={material.imageUrl} alt={material.name} className="w-12 h-12 rounded object-cover" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center">
                                                            <span className="text-white text-sm font-medium">
                                                                {material.materialType?.charAt(0) || material.name?.charAt(0) || 'M'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {material.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {material.materialType}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                            {material.pricing?.lowPitch && `Low: $${material.pricing.lowPitch}/sqft`}
                                                            {material.pricing?.moderatePitch && ` | Moderate: $${material.pricing.moderatePitch}/sqft`}
                                                            {material.pricing?.steepPitch && ` | Steep: $${material.pricing.steepPitch}/sqft`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditMaterialModal(material)}
                                                        className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white p-2"
                                                        aria-label={`Edit ${material.name}`}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to delete this material?')) {
                                                            try {
                                                                await apiService.deleteInstantEstimatorMaterial(estimatorId, material.id);
                                                                setSelectedMaterials((prev: any[]) =>
                                                                    prev.filter((currentMaterial: any) => currentMaterial.id !== material.id)
                                                                );
                                                                setToast({ message: 'Material deleted successfully!', type: 'success' });
                                                                fetchEstimatorData();
                                                            } catch (error) {
                                                                console.error('Error deleting material:', error);
                                                                setToast({ message: 'Failed to delete material', type: 'error' });
                                                                }
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-700 p-2"
                                                        aria-label={`Delete ${material.name}`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        No materials configured yet. Click "Add Material" to get started.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Scheduling Tab */}
                        {activeTab === 'scheduling' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default job owner</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        The default assignee will be assigned to every new lead that is created from instant estimators.
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Default job owner
                                        </label>
                                        <select
                                            value={defaultJobOwnerId}
                                            onChange={(e) => setDefaultJobOwnerId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">Select a team member</option>
                                            {Array.isArray(staffMembers) && staffMembers.map((member: any) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.first_name} {member.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Scheduling</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Add a link to your calendar. Customers will be directed from the link in your contact card.
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Add a scheduling link
                                        </label>
                                        <input
                                            type="text"
                                            value={schedulingLink}
                                            onChange={(e) => setSchedulingLink(e.target.value)}
                                            placeholder="Add a link from Calendly, Google Calendar, Doodle, etc"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Tab */}
                        {activeTab === 'additional' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Additional content</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Tell your customers more about your business with additional content that can help build trust. Manage the content in <a href="#" className="text-primary-600 hover:text-primary-700">Instant Estimator settings</a>.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show customer reviews</span>
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Beta</span>
                                            </div>
                                            <button
                                                onClick={() => setShowProjectShowcase(!showProjectShowcase)}
                                                className={`relative inline-block w-10 h-6 rounded-full transition-colors ${showProjectShowcase ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showProjectShowcase ? 'translate-x-5' : 'translate-x-1'
                                                    }`}></div>
                                            </button>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show social media links</span>
                                                <button
                                                    onClick={() => setShowSocialMedia(!showSocialMedia)}
                                                    className={`relative inline-block w-10 h-6 rounded-full transition-colors ${showSocialMedia ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showSocialMedia ? 'translate-x-5' : 'translate-x-1'
                                                        }`}></div>
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Manage social media links in <a href="#" className="text-primary-600 hover:text-primary-700">profile & branding settings</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lead notifications & pipeline</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Configure how leads from instant estimators are handled. Leads will automatically create opportunities in the selected pipeline category.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Default pipeline type
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                New leads will be added as opportunities in this pipeline category
                                            </p>
                                            <select
                                                value={selectedStageId}
                                                onChange={(e) => setSelectedStageId(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">Select a stage</option>
                                                {pipelines.map((pipeline: any) => (
                                                    <optgroup label={pipeline.name} key={pipeline.id}>
                                                        {pipeline.stages && pipeline.stages.map((stage: any) => (
                                                            <option key={stage.id} value={stage.id}>
                                                                {stage.name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Automatic Proposal Template
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                Select a template to automatically generate a proposal when a lead is requested
                                            </p>
                                            <select
                                                value={selectedProposalTemplateId}
                                                onChange={(e) => setSelectedProposalTemplateId(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">No template selected</option>
                                                {proposalTemplates.map((template: any) => (
                                                    <option key={template.id} value={template.id}>
                                                        {template.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notification email
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                Receive email notifications when new leads are generated
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={notificationEmail}
                                                    onChange={(e) => setNotificationEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                                <button
                                                    onClick={saveAllSettings}
                                                    className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">QR Code</h3>
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="text-center">
                                <img
                                    src={generateQRCode(getEstimatorUrl())}
                                    alt="Estimator QR Code"
                                    className="mx-auto mb-4"
                                />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Scan to open this estimator</p>
                                <button
                                    type="button"
                                    onClick={downloadQRCode}
                                    className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
                                >
                                    Download QR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Embed Code Modal */}
            {showEmbedModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Embed Code</h3>
                                <button
                                    onClick={() => setShowEmbedModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <textarea
                                    value={getEmbedCode(getEstimatorUrl())}
                                    readOnly
                                    className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    const embedCode = getEmbedCode(getEstimatorUrl());
                                    try {
                                        await navigator.clipboard.writeText(embedCode);
                                    } catch (err) {
                                        const textArea = document.createElement('textarea');
                                        textArea.value = embedCode;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        document.execCommand('copy');
                                        document.body.removeChild(textArea);
                                    }
                                    setToast({ message: 'Embed code copied to clipboard!', type: 'success' });
                                    setShowEmbedModal(false);
                                }}
                                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                            >
                                Copy Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Material Modal */}
            {
                showAddMaterialModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {editingMaterialId ? 'Edit Material' : 'Add Material'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowAddMaterialModal(false);
                                            resetMaterialForm();
                                        }}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Template Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select from Templates
                                        </label>
                                        <select
                                            value={selectedTemplateId}
                                            onChange={(e) => {
                                                const tId = e.target.value;
                                                setSelectedTemplateId(tId);
                                                if (tId) {
                                                    const t = materialTemplates.find((mt: any) => mt.id?.toString() === tId);
                                                    if (t) {
                                                        setMaterialName(t.name);
                                                        setMaterialType(t.material_type || 'Asphalt');
                                                        setImageUrl(t.image_url || '');
                                                        const p = t.pricing || {};
                                                        setLowPitch(p.lowPitch || '');
                                                        setModeratePitch(p.moderatePitch || '');
                                                        setSteepPitch(p.steepPitch || '');
                                                        setFlat(p.flat || '');
                                                        setMultiStorySurcharge(p.multiStorySurcharge || '');
                                                    }
                                                } else {
                                                    setMaterialName('');
                                                    setMaterialType('Asphalt');
                                                    setImageUrl('');
                                                    setLowPitch('');
                                                    setModeratePitch('');
                                                    setSteepPitch('');
                                                    setFlat('');
                                                    setMultiStorySurcharge('');
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">-- Create Custom Material --</option>
                                            {materialTemplates.map((t: any) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Material Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={materialName}
                                                onChange={(e) => setMaterialName(e.target.value)}
                                                placeholder="e.g., GAF Timberline HDZ"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Material Type
                                            </label>
                                            <select
                                                value={materialType}
                                                onChange={(e) => setMaterialType(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option>Asphalt</option>
                                                <option>Metal</option>
                                                <option>Tile</option>
                                                <option>Slate</option>
                                                <option>Wood Shake</option>
                                                <option>Synthetic</option>
                                                <option>Flat/TPO</option>
                                                <option>EPDM</option>
                                                <option>Modified Bitumen</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Image URL (optional)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Pricing (per sqft)
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            Enter prices for each roof pitch category. Leave blank to show "-" for that category.
                                        </p>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Low Pitch</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                                    <input
                                                        type="text"
                                                        value={lowPitch}
                                                        onChange={(e) => setLowPitch(e.target.value)}
                                                        placeholder="-"
                                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Moderate Pitch</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                                    <input
                                                        type="text"
                                                        value={moderatePitch}
                                                        onChange={(e) => setModeratePitch(e.target.value)}
                                                        placeholder="-"
                                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Steep Pitch</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                                    <input
                                                        type="text"
                                                        value={steepPitch}
                                                        onChange={(e) => setSteepPitch(e.target.value)}
                                                        placeholder="-"
                                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Flat</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                                    <input
                                                        type="text"
                                                        value={flat}
                                                        onChange={(e) => setFlat(e.target.value)}
                                                        placeholder="-"
                                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Multi-story Surcharge</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                                    <input
                                                        type="text"
                                                        value={multiStorySurcharge}
                                                        onChange={(e) => setMultiStorySurcharge(e.target.value)}
                                                        placeholder="-"
                                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowAddMaterialModal(false);
                                            resetMaterialForm();
                                        }}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!materialName.trim()) {
                                                setToast({ message: 'Material name is required', type: 'error' });
                                                return;
                                            }
                                            const isEditing = Boolean(editingMaterialId);
                                            const materialPayload = buildMaterialPayload();
                                            try {
                                                if (isEditing && editingMaterialId) {
                                                    await apiService.updateInstantEstimatorMaterial(estimatorId, editingMaterialId, materialPayload);
                                                    setSelectedMaterials(prev =>
                                                        prev.map((material: any) =>
                                                            material.id === editingMaterialId
                                                                ? { ...material, ...buildMaterialPreview(editingMaterialId) }
                                                                : material
                                                        )
                                                    );
                                                } else {
                                                    const response = await apiService.addInstantEstimatorMaterial(estimatorId, materialPayload);
                                                    const createdMaterial =
                                                        response?.data ||
                                                        response?.material ||
                                                        response;

                                                    setSelectedMaterials(prev => [
                                                        ...prev,
                                                        createdMaterial?.id
                                                            ? normalizeMaterial(createdMaterial)
                                                            : buildMaterialPreview(createdMaterial?.id)
                                                    ]);
                                                }
                                                setShowAddMaterialModal(false);
                                                resetMaterialForm();
                                                setToast({
                                                    message: isEditing ? 'Material updated successfully!' : 'Material added successfully!',
                                                    type: 'success'
                                                });
                                                fetchEstimatorData();
                                            } catch (error) {
                                                console.error(`Error ${isEditing ? 'updating' : 'adding'} material:`, error);
                                                setToast({
                                                    message: isEditing ? 'Failed to update material' : 'Failed to add material',
                                                    type: 'error'
                                                });
                                            }
                                        }}
                                        disabled={!materialName.trim()}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editingMaterialId ? 'Save Changes' : 'Add Material'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default InstantEstimatorManageModal;
