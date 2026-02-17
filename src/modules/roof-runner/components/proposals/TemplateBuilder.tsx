import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  X,
  Plus,
  FileText,
  Image,
  FileType,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Save,
  GripVertical,
  Upload,
} from "lucide-react";
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCatalogItems, CatalogItem as APICatalogItem } from '../../../../shared/store/services/catalogApi';
import { getBusinessInfo } from '../../../../shared/store/services/businessInfoApi';
import { templateApi } from '../../services/templateApi';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
};


interface TemplateBuilderProps {
  templateId: string;
  onClose: () => void;
}

interface Item {
  id: string;
  name: string;
  description: string;
  mapping: string;
  coverage: string;
  unitCost: string;
  unit: string;
  qty: string;
  salesTax: string;
  visible: boolean;
  checked: boolean;
  isHeading?: boolean;
  isCustom?: boolean;
}

interface Upgrade {
  id: string;
  name: string;
  items: Item[];
}

interface Section {
  id: string;
  name: string;
  active: boolean;
  order: number;
  subsections?: string[];
  type?: "photos" | "pdf" | "text" | "estimate";
  content?: {
    photos?: string[];
    pdfs?: { name: string; url: string }[];
    text?: string;
    description?: string;
  };
}

export default function TemplateBuilder({ templateId, onClose }: TemplateBuilderProps) {
  const MAX_OPTION_TITLE_CHARS = 100;
  const limitChars = useCallback((text: string, maxChars: number) => {
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars);
  }, []);

  const [templateName, setTemplateName] = useState("");
  const [activeSection, setActiveSection] = useState("Estimate");
  const [activeSubsection, setActiveSubsection] = useState("Option 1");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Estimate");
  const [triggerFocus, setTriggerFocus] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const upgradeRef = useRef<HTMLDivElement>(null);
  const profitabilityRef = useRef<HTMLDivElement>(null);

  const [viewingPdf, setViewingPdf] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [coverTitle, setCoverTitle] = useState("Project Proposal");
  const [coverDate, setCoverDate] = useState(new Date().toLocaleDateString());
  const [customerName, setCustomerName] = useState("Customer Name");
  const [customerAddress, setCustomerAddress] = useState("Customer Address");
  const [customerPhone, setCustomerPhone] = useState("(000) 000-0000");
  const [customerEmail, setCustomerEmail] = useState("customer@email.com");

  // Template data states
  const [optionTitle, setOptionTitle] = useState("");
  const [optionDescription, setOptionDescription] = useState("");
  const [itemSectionTitle, setItemSectionTitle] = useState("Item");
  const [itemDescription1, setItemDescription1] = useState("This is a testing");
  const [itemDescription2, setItemDescription2] = useState(
    "CERTAINTEED LANDMARK IR AND CLIMATEFLEX 3 BOARD"
  );
  const [upgradesTitle, setUpgradesTitle] = useState("Upgrades");
  const [upgradeItem, setUpgradeItem] = useState("Test");

  // Calculate subtotals dynamically
  const calculateEstimateSubtotal = () => {
    return items
      .filter(item => item.visible && !item.isHeading)
      .reduce((sum, item) => {
        const price = parseFloat(item.unitCost || '0') * parseFloat(item.qty || '0');
        return sum + price;
      }, 0)
      .toFixed(2);
  };

  const calculateUpgradeSubtotal = () => {
    return upgrades
      .reduce((sum, upgrade) => {
        const upgradeTotal = upgrade.items
          .filter(item => item.visible && !item.isHeading)
          .reduce((itemSum, item) => {
            const price = parseFloat(item.unitCost || '0') * parseFloat(item.qty || '0');
            return itemSum + price;
          }, 0);
        return sum + upgradeTotal;
      }, 0)
      .toFixed(2);
  };
  const [companyName, setCompanyName] = useState("Terrylynn Roofing LLC");
  const [companyPhone, setCompanyPhone] = useState("(000) 000-0000");
  const [companyEmail, setCompanyEmail] = useState(
    "Company representative email"
  );
  const [representativeName, setRepresentativeName] = useState("Company Representative");
  const [representativePhone, setRepresentativePhone] = useState("(000) 000-0000");
  const [representativeEmail, setRepresentativeEmail] = useState("representative@email.com");
  const [defaultMargin, setDefaultMargin] = useState("10");
  const [minimumMargin, setMinimumMargin] = useState("5");
  const [coverContent, setCoverContent] = useState(
    "Click to edit cover page content..."
  );

  // Items and upgrades
  const [items, setItems] = useState<Item[]>([]);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const catalogInputRef = useRef<HTMLInputElement>(null);
  const [showUpgradeCatalogDropdown, setShowUpgradeCatalogDropdown] = useState<string | null>(null);
  const [upgradeCatalogSearch, setUpgradeCatalogSearch] = useState("");
  const upgradeCatalogInputRef = useRef<HTMLInputElement>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingUpgradeItemId, setEditingUpgradeItemId] = useState<{upgradeId: string, itemId: string} | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggedUpgradeItem, setDraggedUpgradeItem] = useState<{upgradeId: string, itemIndex: number} | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedUpgradeItems, setSelectedUpgradeItems] = useState<Map<string, Set<string>>>(new Map());
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [catalogItems, setCatalogItems] = useState<APICatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isTemplateLocked, setIsTemplateLocked] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<Set<string>>(new Set());

  const [sections, setSections] = useState<Section[]>([
    { id: 'cover', name: "Cover", active: true, order: 0 },
    {
      id: 'estimate',
      name: "Estimate",
      active: true,
      order: 1,
      subsections: [optionTitle || "Option 1", "Summary"],
      type: "estimate",
    },
  ]);

  const handleOptionTitleChange = useCallback((value: string) => {
    setOptionTitle(limitChars(value, MAX_OPTION_TITLE_CHARS));
  }, [limitChars]);
  const optionTitleCharCount = optionTitle.length;

  const handleUseTemplate = async () => {
    // Check if title is provided
    if (!isTemplateLocked && !optionTitle || optionTitle.trim() === '') {
      alert('Please add a title to use this template');
      return;
    }
    
    // Save the template first
    await handleSave();
    
    // Navigate to proposals tab
    onClose();
    // You can add navigation logic here if needed
    // For example: navigate('/proposals') or trigger a tab change
  };

  const handleSave = async () => {
    if (isTemplateLocked) {
      alert('This is a locked template and cannot be edited.');
      return;
    }

    setSaving(true);
    try {
      const content = {
        templateName,
        sections: sections.map((s, index) => ({ ...s, order: index })),
        items: items.map((item, index) => ({ ...item, order: index })),
        upgrades: upgrades.map((upgrade, index) => ({
          ...upgrade,
          order: index,
          items: upgrade.items.map((item, itemIndex) => ({ ...item, order: itemIndex }))
        })),
        settings: {
          optionTitle,
          optionDescription,
          itemSectionTitle,
          upgradesTitle,
          companyName,
          companyPhone,
          companyEmail,
          defaultMargin,
          minimumMargin,
          coverContent,
          companyLogo: companyLogo || undefined,
          coverImage: coverImage || undefined,
          coverTitle,
          coverDate,
          customerName,
          customerAddress,
          customerPhone: customerPhone,
          customerEmail,
        },
      };

      await templateApi.updateTemplate(templateId, {
        name: templateName,
        content,
      });
      console.log("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      try {
        const data = await templateApi.getTemplateById(templateId);
        setIsTemplateLocked(!!data.is_locked);
        
        // Load template data into state
        setTemplateName(data.name);
        
        if (data.content) {
          setSections(data.content.sections || []);
          setItems(data.content.items || []);
          setUpgrades(data.content.upgrades || []);
          
          if (data.content.settings) {
            const loadedOptionTitle = limitChars(data.content.settings.optionTitle || "", MAX_OPTION_TITLE_CHARS);
            setOptionTitle(loadedOptionTitle);
            // Update subsection name to match option title
            setSections(prev => prev.map(s => 
              s.id === 'estimate' ? { ...s, subsections: [loadedOptionTitle || "Option 1", "Summary"] } : s
            ));
            setOptionDescription(data.content.settings.optionDescription || "");
            setItemSectionTitle(data.content.settings.itemSectionTitle || "Item");
            setUpgradesTitle(data.content.settings.upgradesTitle || "Upgrades");
            setDefaultMargin(data.content.settings.defaultMargin || "10");
            setMinimumMargin(data.content.settings.minimumMargin || "5");
            setCoverContent(data.content.settings.coverContent || "Click to edit cover page content...");
            setCoverImage(data.content.settings.coverImage || null);
            setCoverTitle(data.content.settings.coverTitle || "Project Proposal");
            setCoverDate(data.content.settings.coverDate || new Date().toLocaleDateString());
            setCustomerName(data.content.settings.customerName || "Customer Name");
            setCustomerAddress(data.content.settings.customerAddress || "Customer Address");
            setCustomerPhone(data.content.settings.customerPhone || "(000) 000-0000");
            setCustomerEmail(data.content.settings.customerEmail || "customer@email.com");
          }
        }
      } catch (error) {
        console.error('Failed to load template:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadBusinessProfile = async () => {
      try {
        const response = await getBusinessInfo();
        if (!response.success || !response.data) return;

        const business = response.data;
        const repName = [business.representative_first_name, business.representative_last_name]
          .filter(Boolean)
          .join(' ')
          .trim();

        setCompanyName(business.legal_business_name || business.friendly_business_name || repName || "Terrylynn Roofing LLC");
        setCompanyPhone(business.business_phone || business.representative_phone || "(000) 000-0000");
        setCompanyEmail(business.business_email || business.representative_email || "Company representative email");
        setRepresentativeName(repName || business.legal_business_name || business.friendly_business_name || "Company Representative");
        setRepresentativePhone(business.representative_phone || business.business_phone || "(000) 000-0000");
        setRepresentativeEmail(business.representative_email || business.business_email || "representative@email.com");
        if (business.business_logo) {
          setCompanyLogo(business.business_logo);
        }
      } catch (error) {
        console.error('Failed to load business info:', error);
      }
    };

    const loadCatalogItems = async () => {
      setLoadingCatalog(true);
      try {
        const response = await getCatalogItems({});
        if (response.success && response.data) {
          setCatalogItems(response.data.items);
        }
      } catch (error) {
        console.error('Failed to load catalog items:', error);
      } finally {
        setLoadingCatalog(false);
      }
    };

    const initialize = async () => {
      await loadTemplate();
      await loadBusinessProfile();
    };

    initialize();
    loadCatalogItems();
  }, [templateId]);

  // Removed blob URL cleanup since we're now using permanent URLs

  // Add functions
  const addSection = (type: string) => {
    const sectionType = type.toLowerCase() as "photos" | "pdf" | "text";
    const newSection: Section = {
      id: crypto.randomUUID(),
      name: type,
      active: true,
      order: sections.length,
      type: sectionType,
      content: {
        photos: sectionType === "photos" ? [] : undefined,
        pdfs: sectionType === "pdf" ? [] : undefined,
        text: sectionType === "text" ? "" : undefined,
        description: sectionType === "text" ? "" : undefined,
      },
    };
    setSections([...sections, newSection]);
    setActiveSection(type);
    setShowAddModal(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionName: string) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        const uploadId = crypto.randomUUID();
        setUploadingPhotos(prev => new Set([...prev, uploadId]));
        
        try {
          const section = sections.find(s => s.name === sectionName);
          if (!section) return;

          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
          const token = localStorage.getItem('token');
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('sectionId', section.id);
          formData.append('type', 'photo');

          const response = await fetch(`${API_BASE_URL}/templates/${templateId}/media`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const result = await response.json();
          if (result.success) {
            const fileKey = result.data.key;
            setSections(prev => prev.map(s => 
              s.name === sectionName && s.content?.photos
                ? {
                    ...s,
                    content: {
                      ...s.content,
                      photos: [...s.content.photos, fileKey]
                    }
                  }
                : s
            ));
          }
        } catch (error) {
          console.error('Error uploading photo:', error);
        } finally {
          setUploadingPhotos(prev => {
            const newSet = new Set(prev);
            newSet.delete(uploadId);
            return newSet;
          });
        }
      }
    }
  };


  const deletePhoto = async (sectionName: string, index: number) => {
    const section = sections.find(s => s.name === sectionName);
    if (!section?.content?.photos) return;
    
    const photoUrl = section.content.photos[index];
    
    // Delete from S3 if it's not a blob URL
    if (!photoUrl.startsWith('blob:')) {
      try {
        await templateApi.deleteMedia(templateId, section.id, photoUrl, 'photo');
      } catch (error) {
        console.error('Error deleting photo from S3:', error);
      }
    }
    
    setSections(
      sections.map((s) =>
        s.name === sectionName && s.content?.photos
          ? {
              ...s,
              content: {
                ...s.content,
                photos: s.content.photos.filter((_, i) => i !== index),
              },
            }
          : s
      )
    );
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionName: string) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        const blobUrl = URL.createObjectURL(file);
        uploadPDF(sectionName, { name: file.name, url: blobUrl });
        
        try {
          const section = sections.find(s => s.name === sectionName);
          if (!section) return;

          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
          const token = localStorage.getItem('token');
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('sectionId', section.id);
          formData.append('type', 'pdf');

          const response = await fetch(`${API_BASE_URL}/templates/${templateId}/media`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const result = await response.json();
          if (result.success) {
            const permanentUrl = result.data.url;
            setSections(prev => prev.map(s => {
              if (s.name === sectionName && s.content?.pdfs) {
                return {
                  ...s,
                  content: {
                    ...s.content,
                    pdfs: s.content.pdfs.map(pdf => 
                      pdf.url === blobUrl ? { ...pdf, url: permanentUrl } : pdf
                    )
                  }
                };
              }
              return s;
            }));
            URL.revokeObjectURL(blobUrl);
          }
        } catch (error) {
          console.error('Error uploading PDF:', error);
        }
      }
    }
  };

  const uploadPDF = (
    sectionName: string,
    pdf: { name: string; url: string }
  ) => {
    setSections(
      sections.map((section) =>
        section.name === sectionName && section.content?.pdfs
          ? {
              ...section,
              content: {
                ...section.content,
                pdfs: [...section.content.pdfs, pdf],
              },
            }
          : section
      )
    );
  };

  const deletePDF = async (sectionName: string, index: number) => {
    const section = sections.find(s => s.name === sectionName);
    if (!section?.content?.pdfs) return;
    
    const pdf = section.content.pdfs[index];
    
    // Delete from S3 if it's not a blob URL
    if (!pdf.url.startsWith('blob:')) {
      try {
        await templateApi.deleteMedia(templateId, section.id, pdf.url, 'pdf');
      } catch (error) {
        console.error('Error deleting PDF from S3:', error);
      }
    }
    
    setSections(
      sections.map((s) =>
        s.name === sectionName && s.content?.pdfs
          ? {
              ...s,
              content: {
                ...s.content,
                pdfs: s.content.pdfs.filter((_, i) => i !== index),
              },
            }
          : s
      )
    );
  };

  const updateTextContent = (
    sectionName: string,
    text: string,
    description?: string
  ) => {
    setSections(
      sections.map((section) =>
        section.name === sectionName
          ? { ...section, content: { ...section.content, text, description } }
          : section
      )
    );
  };

  const addItem = () => {
    setShowCatalogDropdown(true);
    setTimeout(() => catalogInputRef.current?.focus(), 100);
  };

  const addSectionHeading = () => {
    const newHeading: Item = {
      id: crypto.randomUUID(),
      name: "New Section",
      description: "",
      mapping: "",
      coverage: "",
      unitCost: "",
      unit: "",
      qty: "",
      salesTax: "",
      visible: true,
      checked: false,
      isHeading: true,
    };
    setItems([...items, newHeading]);
  };

  const addSectionHeadingToUpgrade = (upgradeId: string) => {
    const newHeading: Item = {
      id: crypto.randomUUID(),
      name: "New Section",
      description: "",
      mapping: "",
      coverage: "",
      unitCost: "",
      unit: "",
      qty: "",
      salesTax: "",
      visible: true,
      checked: false,
      isHeading: true,
    };
    setUpgrades(
      upgrades.map((u) =>
        u.id === upgradeId ? { ...u, items: [...u.items, newHeading] } : u
      )
    );
  };

  const addCustomItem = () => {
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: "New Item",
      description: "",
      mapping: "",
      coverage: "",
      unitCost: "0",
      unit: "square",
      qty: "1",
      salesTax: "0",
      visible: true,
      checked: false,
      isCustom: true,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const addCustomItemToUpgrade = (upgradeId: string) => {
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: "New Item",
      description: "",
      mapping: "",
      coverage: "",
      unitCost: "0",
      unit: "square",
      qty: "1",
      salesTax: "0",
      visible: true,
      checked: false,
      isCustom: true,
    };
    setUpgrades((prevUpgrades) =>
      prevUpgrades.map((u) =>
        u.id === upgradeId ? { ...u, items: [...u.items, newItem] } : u
      )
    );
  };

  const addItemFromCatalog = (catalogItem: APICatalogItem) => {
    if (editingItemId) {
      setItems(prevItems => prevItems.map(i => i.id === editingItemId ? {
        ...i,
        name: catalogItem.name,
        description: catalogItem.description || "",
        coverage: catalogItem.coverage?.toString() || "",
        unitCost: catalogItem.preTaxCost?.toString() || "0",
        unit: catalogItem.unit || "square",
        salesTax: catalogItem.salesTax?.toString() || "0",
      } : i));
      setEditingItemId(null);
    } else {
      const newItem: Item = {
        id: crypto.randomUUID(),
        name: catalogItem.name,
        description: catalogItem.description || "",
        mapping: "",
        coverage: catalogItem.coverage?.toString() || "",
        unitCost: catalogItem.preTaxCost?.toString() || "0",
        unit: catalogItem.unit || "square",
        qty: "1",
        salesTax: catalogItem.salesTax?.toString() || "0",
        visible: true,
        checked: false,
      };
      setItems(prevItems => [...prevItems, newItem]);
    }
    setShowCatalogDropdown(false);
    setCatalogSearch("");
  };

  const addItemToUpgrade = (upgradeId: string) => {
    setShowUpgradeCatalogDropdown(upgradeId);
    setTimeout(() => upgradeCatalogInputRef.current?.focus(), 100);
  };

  const addItemToUpgradeFromCatalog = (upgradeId: string, catalogItem: APICatalogItem) => {
    if (editingUpgradeItemId && editingUpgradeItemId.upgradeId === upgradeId) {
      setUpgrades(prevUpgrades => prevUpgrades.map(u => u.id === upgradeId ? {
        ...u,
        items: u.items.map(i => i.id === editingUpgradeItemId.itemId ? {
          ...i,
          name: catalogItem.name,
          description: catalogItem.description || "",
          coverage: catalogItem.coverage?.toString() || "",
          unitCost: catalogItem.preTaxCost?.toString() || "0",
          unit: catalogItem.unit || "square",
          salesTax: catalogItem.salesTax?.toString() || "0",
        } : i)
      } : u));
      setEditingUpgradeItemId(null);
    } else {
      const newItem: Item = {
        id: crypto.randomUUID(),
        name: catalogItem.name,
        description: catalogItem.description || "",
        mapping: "",
        coverage: catalogItem.coverage?.toString() || "",
        unitCost: catalogItem.preTaxCost?.toString() || "0",
        unit: catalogItem.unit || "square",
        qty: "1",
        salesTax: catalogItem.salesTax?.toString() || "0",
        visible: true,
        checked: false,
      };
      setUpgrades(prevUpgrades =>
        prevUpgrades.map((u) =>
          u.id === upgradeId ? { ...u, items: [...u.items, newItem] } : u
        )
      );
    }
    setShowUpgradeCatalogDropdown(null);
    setUpgradeCatalogSearch("");
  };

  const addUpgrade = () => {
    const newUpgrade: Upgrade = {
      id: crypto.randomUUID(),
      name: "New Upgrade",
      items: [],
    };
    setUpgrades([...upgrades, newUpgrade]);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const toggleItemVisibility = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const deleteUpgradeItem = (upgradeId: string, itemId: string) => {
    setUpgrades(
      upgrades.map((upgrade) =>
        upgrade.id === upgradeId
          ? {
              ...upgrade,
              items: upgrade.items.filter((item) => item.id !== itemId),
            }
          : upgrade
      )
    );
  };

  const toggleUpgradeItemVisibility = (upgradeId: string, itemId: string) => {
    setUpgrades(
      upgrades.map((upgrade) =>
        upgrade.id === upgradeId
          ? {
              ...upgrade,
              items: upgrade.items.map((item) =>
                item.id === itemId ? { ...item, visible: !item.visible } : item
              ),
            }
          : upgrade
      )
    );
  };

  const handleItemDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newItems = [...items];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    setDraggedItemIndex(index);
  };

  const handleItemDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleUpgradeItemDragStart = (upgradeId: string, itemIndex: number) => {
    setDraggedUpgradeItem({ upgradeId, itemIndex });
  };

  const handleUpgradeItemDragOver = (e: React.DragEvent, upgradeId: string, index: number) => {
    e.preventDefault();
    if (!draggedUpgradeItem || draggedUpgradeItem.upgradeId !== upgradeId || draggedUpgradeItem.itemIndex === index) return;
    setUpgrades(upgrades.map(upgrade => {
      if (upgrade.id === upgradeId) {
        const newItems = [...upgrade.items];
        const draggedItem = newItems[draggedUpgradeItem.itemIndex];
        newItems.splice(draggedUpgradeItem.itemIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setDraggedUpgradeItem({ upgradeId, itemIndex: index });
        return { ...upgrade, items: newItems };
      }
      return upgrade;
    }));
  };

  const handleUpgradeItemDragEnd = () => {
    setDraggedUpgradeItem(null);
  };

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const bulkDeleteItems = () => {
    setItems(items.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  const bulkHideItems = () => {
    setItems(items.map(item => selectedItems.has(item.id) ? { ...item, visible: false } : item));
    setSelectedItems(new Set());
  };

  const bulkUnhideItems = () => {
    setItems(items.map(item => selectedItems.has(item.id) ? { ...item, visible: true } : item));
    setSelectedItems(new Set());
  };

  const bulkUnselectItems = () => {
    setSelectedItems(new Set());
  };

  const toggleUpgradeItemSelection = (upgradeId: string, itemId: string) => {
    const newMap = new Map(selectedUpgradeItems);
    const upgradeSet = newMap.get(upgradeId) || new Set();
    if (upgradeSet.has(itemId)) {
      upgradeSet.delete(itemId);
    } else {
      upgradeSet.add(itemId);
    }
    newMap.set(upgradeId, upgradeSet);
    setSelectedUpgradeItems(newMap);
  };

  const bulkDeleteUpgradeItems = (upgradeId: string) => {
    const selected = selectedUpgradeItems.get(upgradeId) || new Set();
    setUpgrades(upgrades.map(u => u.id === upgradeId ? { ...u, items: u.items.filter(item => !selected.has(item.id)) } : u));
    const newMap = new Map(selectedUpgradeItems);
    newMap.delete(upgradeId);
    setSelectedUpgradeItems(newMap);
  };

  const bulkHideUpgradeItems = (upgradeId: string) => {
    const selected = selectedUpgradeItems.get(upgradeId) || new Set();
    setUpgrades(upgrades.map(u => u.id === upgradeId ? { ...u, items: u.items.map(item => selected.has(item.id) ? { ...item, visible: false } : item) } : u));
    const newMap = new Map(selectedUpgradeItems);
    newMap.delete(upgradeId);
    setSelectedUpgradeItems(newMap);
  };

  const bulkUnhideUpgradeItems = (upgradeId: string) => {
    const selected = selectedUpgradeItems.get(upgradeId) || new Set();
    setUpgrades(upgrades.map(u => u.id === upgradeId ? { ...u, items: u.items.map(item => selected.has(item.id) ? { ...item, visible: true } : item) } : u));
    const newMap = new Map(selectedUpgradeItems);
    newMap.delete(upgradeId);
    setSelectedUpgradeItems(newMap);
  };

  const bulkUnselectUpgradeItems = (upgradeId: string) => {
    const newMap = new Map(selectedUpgradeItems);
    newMap.delete(upgradeId);
    setSelectedUpgradeItems(newMap);
  };

  const handleSectionDragStart = (index: number) => {
    setDraggedSectionIndex(index);
  };

  const handleSectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === index) return;
    const newSections = [...sections];
    const draggedSection = newSections[draggedSectionIndex];
    newSections.splice(draggedSectionIndex, 1);
    newSections.splice(index, 0, draggedSection);
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
    setDraggedSectionIndex(index);
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionIndex(null);
  };

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const sanitizeRichHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || "", "text/html");
    const allowedTags = new Set([
      "P", "BR", "DIV", "SPAN",
      "B", "STRONG", "I", "EM", "U",
      "UL", "OL", "LI",
      "H1", "H2", "H3",
      "A", "MARK"
    ]);

    const walk = (node: Node) => {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          if (!allowedTags.has(el.tagName)) {
            el.replaceWith(...Array.from(el.childNodes));
            continue;
          }

          for (const attr of Array.from(el.attributes)) {
            if (el.tagName === "A" && ["href", "target", "rel"].includes(attr.name)) continue;
            el.removeAttribute(attr.name);
          }

          if (el.tagName === "A") {
            const href = el.getAttribute("href") || "";
            const safeHref =
              href.startsWith("http://") ||
              href.startsWith("https://") ||
              href.startsWith("mailto:") ||
              href.startsWith("tel:") ||
              href.startsWith("#");
            if (!safeHref) el.removeAttribute("href");
            if (el.getAttribute("target") === "_blank") {
              el.setAttribute("rel", "noopener noreferrer");
            }
          }
        }
        walk(child);
      }
    };

    walk(doc.body);
    return doc.body.innerHTML;
  };

  const toRichHtml = (value: string) => {
    if (!value) return "";
    if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeRichHtml(value);
    return escapeHtml(value)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/==(.+?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-700/40 px-0.5 rounded">$1</mark>')
      .replace(/\n/g, "<br/>");
  };

  interface EditableTextProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    multiline?: boolean;
    richText?: boolean;
    maxLength?: number;
    triggerFocus?: boolean;
    onFocusComplete?: () => void;
  }

  const EditableText = ({
    value,
    onChange,
    placeholder = "",
    className = "",
    multiline = false,
    richText = false,
    maxLength,
    triggerFocus = false,
    onFocusComplete,
  }: EditableTextProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const [formatState, setFormatState] = useState({
      bold: false,
      italic: false,
      underline: false,
      unorderedList: false,
      orderedList: false,
      h2: false,
      highlight: false,
    });
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const initializedRichEditorRef = useRef(false);

    const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
      let node = el?.parentElement || null;
      while (node) {
        const style = window.getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY)) return node;
        node = node.parentElement;
      }
      return null;
    };

    const autoResizeTextarea = () => {
      const el = textareaRef.current;
      if (!el) return;

      const scrollParent = getScrollParent(el);
      const parentScrollTop = scrollParent?.scrollTop ?? null;
      const winX = window.scrollX;
      const winY = window.scrollY;

      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;

      if (scrollParent && parentScrollTop !== null) {
        scrollParent.scrollTop = parentScrollTop;
      }
      window.scrollTo(winX, winY);
    };

    useEffect(() => {
      if (triggerFocus) {
        setIsEditing(true);
        if (onFocusComplete) onFocusComplete();
      }
    }, [triggerFocus, onFocusComplete]);

    useEffect(() => {
      setTempValue(richText && multiline ? toRichHtml(value) : value);
    }, [value]);

    useEffect(() => {
      if (!(isEditing && multiline && richText)) {
        initializedRichEditorRef.current = false;
        return;
      }
      const el = editorRef.current;
      if (!el || initializedRichEditorRef.current) return;
      el.innerHTML = richText && multiline ? toRichHtml(value) : value;
      initializedRichEditorRef.current = true;
      requestAnimationFrame(() => {
        el.focus();
        const selection = window.getSelection();
        if (!selection) return;
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      });
    }, [isEditing, multiline, richText, value]);

    useEffect(() => {
      if (isEditing && multiline) {
        autoResizeTextarea();
      }
    }, [isEditing, multiline]);

    const refreshToolbarState = () => {
      const editor = editorRef.current;
      if (!editor) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const anchor = selection.anchorNode;
      if (!anchor || !editor.contains(anchor)) return;

      const blockValue = String(document.queryCommandValue("formatBlock") || "")
        .replace(/[<>]/g, "")
        .toLowerCase();
      const highlightValue = String(document.queryCommandValue("hiliteColor") || "").toLowerCase();
      const highlightActive =
        !!highlightValue &&
        highlightValue !== "transparent" &&
        highlightValue !== "rgba(0, 0, 0, 0)" &&
        highlightValue !== "none";

      setFormatState({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        h2: blockValue === "h2",
        highlight: highlightActive,
      });
    };

    useEffect(() => {
      if (!(isEditing && multiline && richText)) return;
      const handleSelectionChange = () => refreshToolbarState();
      document.addEventListener("selectionchange", handleSelectionChange);
      return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, [isEditing, multiline, richText]);

    const handleBlur = () => {
      setIsEditing(false);
      onChange(richText && multiline ? sanitizeRichHtml(tempValue) : tempValue);
    };

    if (isEditing) {
      if (multiline && richText) {
        const runCmd = (command: string, val?: string) => {
          editorRef.current?.focus();
          document.execCommand(command, false, val);
          const html = sanitizeRichHtml(editorRef.current?.innerHTML || "");
          setTempValue(html);
          refreshToolbarState();
        };

        const normalizeUrl = (rawUrl: string) => {
          const trimmed = rawUrl.trim();
          if (!trimmed) return "";
          if (/^(https?:\/\/|mailto:|tel:|#)/i.test(trimmed)) return trimmed;
          return `https://${trimmed}`;
        };

        const insertLink = () => {
          const rawUrl = window.prompt("Enter URL");
          if (!rawUrl) return;
          const url = normalizeUrl(rawUrl);
          if (!url) return;

          editorRef.current?.focus();
          const selection = window.getSelection();
          const selectedText = selection?.toString().trim() || "";

          if (!selectedText) {
            const safeUrl = url.replace(/"/g, "&quot;");
            document.execCommand(
              "insertHTML",
              false,
              `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`
            );
          } else {
            document.execCommand("createLink", false, url);
            document.execCommand("styleWithCSS", false, "false");
            document.execCommand("foreColor", false, "inherit");
          }

          const html = sanitizeRichHtml(editorRef.current?.innerHTML || "");
          setTempValue(html);
        };

        const onEditorBlur = () => {
          setIsEditing(false);
          initializedRichEditorRef.current = false;
          const html = sanitizeRichHtml(editorRef.current?.innerHTML || "");
          onChange(html);
        };

        const toggleHeading = () => {
          runCmd("formatBlock", formatState.h2 ? "<p>" : "<h2>");
        };

        const toolbarBtnClass = (isActive = false, extra = "") =>
          `px-2 py-0.5 text-xs border rounded transition-colors ${
            isActive
              ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300"
              : "border-gray-300 dark:border-gray-600"
          } ${extra}`;

        return (
          <div className="w-full">
            <div className="mb-1 flex flex-wrap items-center gap-1">
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd("bold")} className={toolbarBtnClass(formatState.bold)}>B</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd("italic")} className={toolbarBtnClass(formatState.italic, "italic")}>I</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd("underline")} className={toolbarBtnClass(formatState.underline, "underline")}>U</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={toggleHeading} className={toolbarBtnClass(formatState.h2)}>H2</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd("insertUnorderedList")} className={toolbarBtnClass(formatState.unorderedList)}>UL</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd("insertOrderedList")} className={toolbarBtnClass(formatState.orderedList)}>OL</button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCmd("hiliteColor", formatState.highlight ? "transparent" : "#fef08a")}
                className={toolbarBtnClass(formatState.highlight)}
              >
                Highlight
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={insertLink}
                className={toolbarBtnClass(false)}
              >
                Link
              </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd("undo")} className={toolbarBtnClass(false)}>Undo</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd("redo")} className={toolbarBtnClass(false)}>Redo</button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => setTempValue(sanitizeRichHtml(editorRef.current?.innerHTML || ""))}
              onBlur={onEditorBlur}
              className={`${className} w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus-within:border-primary-500 focus:outline-none px-0 py-1 min-h-[72px] whitespace-pre-wrap break-words`}
            />
            {!tempValue && (
              <div className="text-gray-400 dark:text-gray-500 text-sm mt-1">{placeholder}</div>
            )}
          </div>
        );
      }

      return multiline ? (
        <textarea
          ref={textareaRef}
          value={tempValue}
          onChange={(e) => {
            setTempValue(e.target.value);
            requestAnimationFrame(autoResizeTextarea);
          }}
          onInput={autoResizeTextarea}
          onBlur={handleBlur}
          autoFocus
          placeholder={placeholder}
          maxLength={maxLength}
          rows={1}
          className={`${className} w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none px-0 py-1 resize-none overflow-hidden`}
        />
      ) : (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          placeholder={placeholder}
          maxLength={maxLength}
          className={`${className} w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none px-0 py-1`}
        />
      );
    }

    if (richText && multiline && value) {
      return (
        <div
          onClick={() => setIsEditing(true)}
          className={`${className} cursor-pointer inline-block w-full py-1`}
          dangerouslySetInnerHTML={{ __html: toRichHtml(value) }}
        />
      );
    }

    return (
      <span
        onClick={() => setIsEditing(true)}
        className={`${className} cursor-pointer inline-block w-full py-1 ${!value ? "text-gray-400 dark:text-gray-500" : ""}`}
      >
        {value || placeholder}
      </span>
    );
  };

  const addOptions = [
    {
      icon: Image,
      title: "Photos",
      description:
        "Add images that can be annotated and accompanied by detailed descriptions",
    },
    {
      icon: FileType,
      title: "PDF",
      description:
        "Attach PDFs to complement your proposal, such as marketing or manufacturer documents",
    },
    {
      icon: FileText,
      title: "Text",
      description:
        "Customize your proposal with a text section that supports inline signatures and initials",
    },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading template...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to templates
          </button>
          <div className="text-xs text-gray-500">Changes auto-saved</div>
        </div>

        <div className="flex-1 p-4 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Proposal sections
              </span>
              <button
                className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-400 dark:hover:bg-gray-500"
                aria-label="Help information"
                title="Manage sections"
              >
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  ?
                </span>
              </button>
            </div>

            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {sections.map((section, index) => (
                <div 
                  key={section.id}
                  draggable={true}
                  onDragStart={() => handleSectionDragStart(index)}
                  onDragOver={(e) => handleSectionDragOver(e, index)}
                  onDragEnd={handleSectionDragEnd}
                  className="cursor-move"
                >
                  <div
                    className={`flex items-center gap-2 p-2 rounded ${
                      activeSection === section.name
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <GripVertical size={16} className="text-gray-400 flex-shrink-0" />
                    <button
                      className="flex items-center justify-between flex-1 text-left"
                      onClick={() => setActiveSection(section.name)}
                    >
                      {editingSectionId === section.id ? (
                        <input
                          type="text"
                          value={section.name}
                          onChange={(e) => {
                            setSections(sections.map(s => s.id === section.id ? { ...s, name: e.target.value } : s));
                          }}
                          onBlur={() => setEditingSectionId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingSectionId(null);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-medium bg-transparent border-0 focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 w-full"
                        />
                      ) : (
                        <span className="text-sm font-medium">{section.name}</span>
                      )}
                    </button>
                    {section.name !== 'Cover' && section.name !== 'Estimate' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSectionId(section.id);
                          }}
                          className="text-gray-400 hover:text-primary-600"
                          title="Rename section"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSections(sections.map(s => s.id === section.id ? { ...s, active: !s.active } : s));
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title={section.active ? 'Hide section' : 'Show section'}
                        >
                          {section.active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSections(sections.filter(s => s.id !== section.id));
                          }}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete section"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  {section.subsections && (
                    <div className="ml-4 space-y-1">
                      {section.subsections.map((sub, idx) => (
                        <button
                          key={sub}
                          onClick={() => {
                            setActiveSection(section.name);
                            setActiveSubsection(sub);
                            const targetId = idx === 0 ? 'estimate-page-1' : 'estimate-page-2';
                            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className={`flex items-center justify-between p-2 rounded w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            activeSubsection === sub ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400 block truncate" title={idx === 0 ? (optionTitle || "Option 1") : sub}>
                            {idx === 0 ? (optionTitle || "Option 1") : sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex-shrink-0"
            >
              <Plus size={16} />
              <span className="text-sm">Add section</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {activeSection}
            </h2>
            {activeSection === "Estimate" && !isTemplateLocked && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {optionTitle}
                </span>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                >
                  <Pencil size={14} />
                  Edit option
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || isTemplateLocked}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isTemplateLocked ? 'Read Only' : saving ? 'Saving...' : 'Save Template'}
            </button>
            <button
              onClick={handleUseTemplate}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
            >
              Use this template
            </button>
          </div>
        </div>

        {/* Template Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            {isTemplateLocked && (
              <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                This is a locked global template. You can view and use it, but you cannot edit or save changes.
              </div>
            )}
            <div className={activeSection === "Estimate" ? "space-y-8" : `bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${activeSection === "Cover" ? "" : "p-8"}`}>
              {/* Render active section content */}
              {activeSection === "Cover" && (
                <div className="flex flex-col min-h-[800px]">
                  {/* Top 60% - Cover Image */}
                  <div 
                    className={`relative h-[480px] bg-gray-100 dark:bg-gray-700 overflow-hidden transition-colors ${
                      isTemplateLocked
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => !isTemplateLocked && !coverImage && coverImageInputRef.current?.click()}
                  >
                    {coverImage && (
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    )}
                    {!coverImage && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <Upload size={48} className="text-gray-400 mx-auto mb-2" />
                          <span className="text-gray-500 dark:text-gray-400">Click to Upload Cover Image</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {coverImage && !isTemplateLocked && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              coverImageInputRef.current?.click();
                            }}
                            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-lg"
                            title="Change Cover Image"
                          >
                            <Upload size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverImage(null);
                            }}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                            title="Remove Cover Image"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                    <input
                      ref={coverImageInputRef}
                      type="file"
                      accept="image/*"
                      disabled={isTemplateLocked}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = '';
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setCropImage(reader.result as string);
                            setShowCropModal(true);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Middle Section - Title, Date, Customer Details */}
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white block mb-2">
                        {coverTitle}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 block">
                        {coverDate}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-gray-900 dark:text-white block mb-1">
                        {customerName}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 block mb-1">
                        {customerAddress}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 block mb-1">
                        {customerPhone}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 block">
                        {customerEmail}
                      </div>
                    </div>
                  </div>

                  {/* Bottom 40% - Footer (Company Info) */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        {/* <div className="text-sm text-gray-600 dark:text-gray-400">
                          Company representative name
                        </div> */}
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {companyName}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 block">{representativePhone}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 block">{representativeEmail}</div>
                      </div>
                      <div className="relative">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                          {companyLogo ? (
                            <img
                              src={companyLogo}
                              alt="Company Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              LOGO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sections.find(
                (s) => s.name === activeSection && s.type === "photos"
              ) && (
                <div>
                  <EditableText
                    value={sections.find((s) => s.name === activeSection)?.name || "Photos"}
                    onChange={(val) => {
                      const activeSectionData = sections.find((s) => s.name === activeSection && s.type === "photos");
                      if (!activeSectionData) return;
                      setSections(
                        sections.map((s) => (s.id === activeSectionData.id ? { ...s, name: val } : s))
                      );
                      setActiveSection(val);
                    }}
                    className="text-xl font-bold text-gray-900 dark:text-white mb-4 block"
                    placeholder="Section title"
                  />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Gallery view
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {(sections.find((s) => s.name === activeSection)?.content?.photos || []).length} photos
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
                    {sections
                      .find((s) => s.name === activeSection)
                      ?.content?.photos?.map((photo, idx) => (
                        <div
                          key={idx}
                          className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                              src={photo}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <button
                              onClick={() => deletePhoto(activeSection, idx)}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                            {`Photo ${idx + 1}`}
                          </div>
                        </div>
                      ))}
                    {Array.from(uploadingPhotos).map((uploadId) => (
                      <div
                        key={uploadId}
                        className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden relative flex items-center justify-center"
                      >
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="aspect-[4/3] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Plus className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Upload Photo
                      </span>
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(e, activeSection)}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {sections.find(
                (s) => s.name === activeSection && s.type === "pdf"
              ) && (
                <div>
                  <EditableText
                    value={sections.find((s) => s.name === activeSection)?.name || "PDF Documents"}
                    onChange={(val) => {
                      const activeSectionData = sections.find((s) => s.name === activeSection && s.type === "pdf");
                      if (!activeSectionData) return;
                      setSections(
                        sections.map((s) => (s.id === activeSectionData.id ? { ...s, name: val } : s))
                      );
                      setActiveSection(val);
                    }}
                    className="text-xl font-bold text-gray-900 dark:text-white mb-4 block"
                    placeholder="Section title"
                  />
                  <div className="space-y-6 mb-4">
                    {sections
                      .find((s) => s.name === activeSection)
                      ?.content?.pdfs?.map((pdf, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <FileType className="w-6 h-6 text-red-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {pdf.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewingPdf(pdf)}
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                              >
                                <Eye size={16} />
                                View Fullscreen
                              </button>
                              <button
                                onClick={() => deletePDF(activeSection, idx)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <iframe
                            src={pdf.url}
                            className="w-full h-[600px]"
                            title={pdf.name}
                          />
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Plus className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Upload PDF
                    </span>
                  </button>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handlePDFUpload(e, activeSection)}
                    className="hidden"
                  />
                </div>
              )}

              {sections.find(
                (s) => s.name === activeSection && s.type === "text"
              ) && (
                <div>
                  <EditableText
                    value={
                      sections.find((s) => s.name === activeSection)?.content
                        ?.text || ""
                    }
                    onChange={(val) =>
                      updateTextContent(
                        activeSection,
                        val,
                        sections.find((s) => s.name === activeSection)?.content
                          ?.description
                      )
                    }
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-4 block"
                    placeholder="Click to add title"
                  />
                  <EditableText
                    value={
                      sections.find((s) => s.name === activeSection)?.content
                        ?.description || ""
                    }
                    onChange={(val) =>
                      updateTextContent(
                        activeSection,
                        sections.find((s) => s.name === activeSection)?.content
                          ?.text || "",
                        val
                      )
                    }
                    className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
                    multiline={true}
                    richText={true}
                    placeholder="Click to add description"
                  />
                </div>
              )}

              {activeSection === "Estimate" && (
                <>
                  {/* Page 1: Option Details */}
                  <div id="estimate-page-1" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 min-h-[1000px] flex flex-col mb-8">
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <EditableText
                            value={optionTitle}
                            onChange={handleOptionTitleChange}
                            className="text-lg font-medium text-gray-900 dark:text-white break-words"
                            maxLength={MAX_OPTION_TITLE_CHARS}
                            triggerFocus={triggerFocus}
                            onFocusComplete={() => setTriggerFocus(false)}
                            placeholder="Add title"
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {optionTitleCharCount}/{MAX_OPTION_TITLE_CHARS} characters
                          </div>
                        </div>
                        {!isTemplateLocked && (
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 flex-shrink-0"
                          >
                            <Pencil size={14} />
                            Edit option
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <EditableText
                          value={optionDescription}
                          onChange={setOptionDescription}
                          className="text-sm text-gray-500 dark:text-gray-400 break-words"
                          multiline={true}
                          richText={true}
                          placeholder="Add description"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                          <div className="font-medium text-gray-900 dark:text-white">{itemSectionTitle}</div>
                        </div>

                        {items.filter(item => item.visible).map((item, idx) => (
                          <div key={item.id}>
                            {item.isHeading ? (
                              <>
                                <hr className="border-gray-300 dark:border-gray-600 my-3" />
                                <div className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</div>
                              </>
                            ) : (
                              <div className="mb-2 pl-3 text-sm">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                    {item.description && <div className="text-gray-600 dark:text-gray-400">{item.description}</div>}
                                    {item.mapping && <div className="text-gray-500 dark:text-gray-500 text-xs">{item.mapping}</div>}
                                    <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      {item.unitCost && <span>Unit Cost: ${item.unitCost}</span>}
                                      {item.qty && <span>Qty: {item.qty}</span>}
                                      {item.unit && <span>Unit: {item.unit}</span>}
                                    </div>
                                  </div>
                                  {item.unitCost && item.qty && (
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      ${(parseFloat(item.unitCost) * parseFloat(item.qty)).toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex gap-4 mt-3 text-sm">
                          <button
                            onClick={() => {
                              setActiveTab("Estimate");
                              setShowEditModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add item from catalog
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("Estimate");
                              setShowEditModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add section heading
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("Upgrade");
                              setShowEditModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add upgrade
                          </button>
                        </div>
                      </div>

                      <div>
                       {upgrades?.length > 0 && <div className="flex items-center gap-2 mb-2">
                          <EditableText
                            value={upgradesTitle}
                            onChange={setUpgradesTitle}
                            className="font-medium text-gray-900 dark:text-white"
                          />
                        </div>}
                        
                        {upgrades.map((upgrade) => (
                          <div key={upgrade.id} className="mb-4 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="font-medium text-gray-900 dark:text-white mb-3">{upgrade.name}</div>
                            {upgrade.items.filter(item => item.visible).map((item) => (
                              <div key={item.id}>
                                {item.isHeading ? (
                                  <>
                                    <hr className="border-gray-300 dark:border-gray-600 my-3" />
                                    <div className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{item.name}</div>
                                  </>
                                ) : (
                                  <div className="mb-2 pl-3 text-sm">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                        {item.description && <div className="text-gray-600 dark:text-gray-400">{item.description}</div>}
                                        {item.mapping && <div className="text-gray-500 dark:text-gray-500 text-xs">{item.mapping}</div>}
                                        <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                          {item.unitCost && <span>Unit Cost: ${item.unitCost}</span>}
                                          {item.qty && <span>Qty: {item.qty}</span>}
                                          {item.unit && <span>Unit: {item.unit}</span>}
                                        </div>
                                      </div>
                                      {item.unitCost && item.qty && (
                                        <div className="font-medium text-gray-900 dark:text-white">
                                          ${(parseFloat(item.unitCost) * parseFloat(item.qty)).toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}

                      </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          {/* <div className="text-sm text-gray-600 dark:text-gray-400">
                            Company representative name
                          </div> */}
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {companyName}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 block">{representativePhone}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 block">{representativeEmail}</div>
                        </div>
                        <div className="relative">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                            {companyLogo ? (
                              <img
                                src={companyLogo}
                                alt="Company Logo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                LOGO
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2: Summary */}
                  <div id="estimate-page-2" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 min-h-[1000px] flex flex-col">
                    <div className="flex-1">
                      <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Summary</h2>
                      </div>

                      <div className="space-y-6">
                        {items.filter(item => item.visible && !item.isHeading).length > 0 && (
                          <div>
                            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                              <div className="font-medium text-gray-900 dark:text-white truncate" title={optionTitle}>{optionTitle}</div>
                            </div>
                            <div className="flex justify-between items-center py-2 pl-3">
                              <span
                                className="text-sm text-gray-600 dark:text-gray-400 break-words"
                                dangerouslySetInnerHTML={{ __html: toRichHtml(optionDescription || "") }}
                              />
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="font-medium text-gray-900 dark:text-white">Total</span>
                              <span className="font-medium text-gray-900 dark:text-white">${calculateEstimateSubtotal()}</span>
                            </div>
                          </div>
                        )}

                        {upgrades.length > 0 && upgrades.some(u => u.items.filter(item => item.visible && !item.isHeading).length > 0) && (
                          <div>
                            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                              <div className="font-medium text-gray-900 dark:text-white">{upgradesTitle}</div>
                            </div>
                            {upgrades.map((upgrade) => (
                              <div key={upgrade.id} className="mb-2 pl-3 text-sm">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">{upgrade.name}</div>
                                  </div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    ${upgrade.items.filter(item => item.visible && !item.isHeading).reduce((sum, item) => sum + (parseFloat(item.unitCost || '0') * parseFloat(item.qty || '0')), 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="font-medium text-gray-900 dark:text-white">Total</span>
                              <span className="font-medium text-gray-900 dark:text-white">${calculateUpgradeSubtotal()}</span>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Overall Total</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">${(parseFloat(calculateEstimateSubtotal()) + parseFloat(calculateUpgradeSubtotal())).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            By signing this document you agree to the statement of works provided by {companyName} and in accordance with any terms described within.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          {/* <div className="text-sm text-gray-600 dark:text-gray-400">Company representative name</div> */}
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {companyName}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 block">{representativePhone}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 block">{representativeEmail}</div>
                        </div>
                        <div className="relative">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                            {companyLogo ? (
                              <img src={companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">LOGO</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                What would you like to add?
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {addOptions.map((option) => (
                <button
                  key={option.title}
                  onClick={() => addSection(option.title)}
                  className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <option.icon size={20} className="text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Options Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <EditableText
                    value={optionTitle}
                    onChange={handleOptionTitleChange}
                    className="text-lg font-medium text-gray-900 dark:text-white truncate"
                    maxLength={MAX_OPTION_TITLE_CHARS}
                    placeholder="Add title"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {optionTitleCharCount}/{MAX_OPTION_TITLE_CHARS} characters
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  {["Estimate", "Upgrade", "Profitability"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === tab
                          ? "border-primary-500 text-primary-600 dark:text-primary-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {activeTab === "Estimate" && (
                  <div>
                    <div className="p-4">
                      <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded text-sm mb-4 inline-block">
                        Estimate
                      </div>

                      {selectedItems.size > 0 && (
                        <div className="mb-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedItems.size} item(s) selected
                          </span>
                          <div className="flex gap-2">
                            <button onClick={bulkHideItems} className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
                              Hide
                            </button>
                            <button onClick={bulkUnhideItems} className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
                              Unhide
                            </button>
                            <button onClick={bulkDeleteItems} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                              Delete
                            </button>
                            <button onClick={bulkUnselectItems} className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                              Unselect
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 dark:border-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Select
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Description
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Mapping
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Coverage
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Unit cost ($)
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Unit
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Qty
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Price ($)
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Sales tax (%)
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {items.map((item, index) => (
                              item.isHeading ? (
                                <tr
                                  key={item.id}
                                  draggable
                                  onDragStart={() => handleItemDragStart(index)}
                                  onDragOver={(e) => handleItemDragOver(e, index)}
                                  onDragEnd={handleItemDragEnd}
                                  className="bg-gray-800 text-white cursor-move"
                                >
                                  <td className="px-3 py-2">
                                    <GripVertical size={16} className="text-gray-400" />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedItems.has(item.id)}
                                      onChange={() => toggleItemSelection(item.id)}
                                      className="rounded"
                                    />
                                  </td>
                                  <td colSpan={9} className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={item.name}
                                      onChange={(e) =>
                                        setItems(
                                          items.map((i) =>
                                            i.id === item.id
                                              ? { ...i, name: e.target.value }
                                              : i
                                          )
                                        )
                                      }
                                      className="bg-transparent border-0 w-full focus:outline-none text-white font-medium"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-white hover:text-gray-300"
                                      >
                                        <X size={14} />
                                      </button>
                                      <button
                                        onClick={() => toggleItemVisibility(item.id)}
                                        className="text-white hover:text-gray-300"
                                      >
                                        {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                <tr
                                  key={item.id}
                                  draggable
                                  onDragStart={() => handleItemDragStart(index)}
                                  onDragOver={(e) => handleItemDragOver(e, index)}
                                  onDragEnd={handleItemDragEnd}
                                  className={
                                    item.checked ? "bg-gray-800 text-white cursor-move" : "cursor-move"
                                  }
                                >
                                  <td className="px-3 py-2">
                                    <GripVertical size={16} className="text-gray-400" />
                                  </td>
                                  <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => toggleItemSelection(item.id)}
                                    className="rounded"
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm relative">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onFocus={() => {
                                      if (!item.isCustom) {
                                        setEditingItemId(item.id);
                                        setShowCatalogDropdown(true);
                                        setTimeout(() => catalogInputRef.current?.focus(), 100);
                                      }
                                    }}
                                    readOnly={!item.isCustom}
                                    className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 cursor-pointer"
                                  />
                                  {showCatalogDropdown && editingItemId === item.id && (
                                    <div className="absolute top-full left-0 mt-1 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Editing: {item.name}</div>
                                        <input
                                          ref={catalogInputRef}
                                          type="text"
                                          value={catalogSearch}
                                          onChange={(e) => setCatalogSearch(e.target.value)}
                                          placeholder="Search catalog..."
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          onBlur={() => setTimeout(() => { setShowCatalogDropdown(false); setEditingItemId(null); }, 200)}
                                        />
                                      </div>
                                      <div className="max-h-64 overflow-y-auto">
                                        {catalogItems
                                          .filter(item => item.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                                          .map((item, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => addItemFromCatalog(item)}
                                              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                                            >
                                              <div className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</div>
                                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">${item.unitCost} per {item.unit}</div>
                                            </button>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => {
                                      setItems(
                                        items.map((i) =>
                                          i.id === item.id
                                            ? {
                                                ...i,
                                                description: e.target.value,
                                              }
                                            : i
                                        )
                                      );
                                    }}
                                    className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <input
                                    type="text"
                                    value={item.mapping}
                                    onChange={(e) => {
                                      setItems(
                                        items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, mapping: e.target.value }
                                            : i
                                        )
                                      );
                                    }}
                                    className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <input
                                    type="text"
                                    value={item.coverage}
                                    onChange={(e) =>
                                      setItems(
                                        items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, coverage: e.target.value }
                                            : i
                                        )
                                      )
                                    }
                                    className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                    disabled={!item.isCustom}
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <input
                                    type="text"
                                    value={item.unitCost}
                                    onChange={(e) =>
                                      setItems(
                                        items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, unitCost: e.target.value }
                                            : i
                                        )
                                      )
                                    }
                                    className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <input
                                    type="text"
                                    value={item.unit}
                                    onChange={(e) =>
                                      setItems(
                                        items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, unit: e.target.value }
                                            : i
                                        )
                                      )
                                    }
                                    className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                    disabled={!item.isCustom}
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <input
                                    type="text"
                                    value={item.qty}
                                    onChange={(e) => {
                                      setItems(
                                        items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, qty: e.target.value }
                                            : i
                                        )
                                      );
                                    }}
                                    className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                  {item.unitCost && item.qty ? `$${(parseFloat(item.unitCost) * parseFloat(item.qty)).toFixed(2)}` : '$0.00'}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  <input
                                    type="text"
                                    value={item.salesTax}
                                    onChange={(e) =>
                                      setItems(
                                        items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, salesTax: e.target.value }
                                            : i
                                        )
                                      )
                                    }
                                    className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                    disabled={!item.isCustom}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => deleteItem(item.id)}
                                      className={
                                        item.checked
                                          ? "text-white hover:text-gray-300"
                                          : "text-gray-400 hover:text-gray-600"
                                      }
                                    >
                                      <X size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        toggleItemVisibility(item.id)
                                      }
                                      className={
                                        item.checked
                                          ? "text-white hover:text-gray-300"
                                          : "text-gray-400 hover:text-gray-600"
                                      }
                                    >
                                      {item.visible ? (
                                        <Eye size={14} />
                                      ) : (
                                        <EyeOff size={14} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              )
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex gap-4 mt-4 text-sm relative">
                        <div className="relative">
                          <button
                            onClick={addItem}
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add item from catalog
                          </button>
                          {showCatalogDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                <input
                                  ref={catalogInputRef}
                                  type="text"
                                  value={catalogSearch}
                                  onChange={(e) => setCatalogSearch(e.target.value)}
                                  placeholder="Search catalog..."
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  onBlur={() => setTimeout(() => setShowCatalogDropdown(false), 200)}
                                />
                              </div>
                              <div className="max-h-64 overflow-y-auto">
                                {catalogItems
                                  .filter(item => item.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                                  .map((item, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => addItemFromCatalog(item)}
                                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                                    >
                                      <div className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">${item.unitCost} per {item.unit}</div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={addCustomItem}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add custom item
                        </button>
                        <button
                          onClick={addSectionHeading}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add section heading
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Upgrade" && (
                  <div ref={upgradeRef} className="p-4">
                    <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded text-sm mb-4 inline-block">
                      Upgrade
                    </div>

                    <div className="mt-6">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Upgrades
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                        {upgrades.map((upgrade) => (
                          <div key={upgrade.id} className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                value={upgrade.name}
                                onChange={(e) => {
                                  setUpgrades(
                                    upgrades.map((u) =>
                                      u.id === upgrade.id
                                        ? { ...u, name: e.target.value }
                                        : u
                                    )
                                  );
                                }}
                                className="text-sm font-medium bg-transparent border-0 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 text-gray-900 dark:text-white"
                              />
                              <button
                                onClick={() => {
                                  setUpgrades(
                                    upgrades.filter((u) => u.id !== upgrade.id)
                                  );
                                }}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {(selectedUpgradeItems.get(upgrade.id)?.size || 0) > 0 && (
                              <div className="mb-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {selectedUpgradeItems.get(upgrade.id)?.size || 0} item(s) selected
                                </span>
                                <div className="flex gap-2">
                                  <button onClick={() => bulkHideUpgradeItems(upgrade.id)} className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
                                    Hide
                                  </button>
                                  <button onClick={() => bulkUnhideUpgradeItems(upgrade.id)} className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
                                    Unhide
                                  </button>
                                  <button onClick={() => bulkDeleteUpgradeItems(upgrade.id)} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                                    Delete
                                  </button>
                                  <button onClick={() => bulkUnselectUpgradeItems(upgrade.id)} className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                                    Unselect
                                  </button>
                                </div>
                              </div>
                            )}

                            <table className="w-full border border-gray-200 dark:border-gray-700 mt-2">
                              <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Select
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Name
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Description
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Mapping
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Coverage
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Unit cost ($)
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Unit
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Qty
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Price ($)
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Sales tax (%)
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {upgrade.items.map((uItem, itemIndex) => (
                                  uItem.isHeading ? (
                                    <tr
                                      key={uItem.id}
                                      draggable
                                      onDragStart={() => handleUpgradeItemDragStart(upgrade.id, itemIndex)}
                                      onDragOver={(e) => handleUpgradeItemDragOver(e, upgrade.id, itemIndex)}
                                      onDragEnd={handleUpgradeItemDragEnd}
                                      className="bg-gray-800 text-white cursor-move"
                                    >
                                      <td className="px-3 py-2">
                                        <GripVertical size={16} className="text-gray-400" />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={(selectedUpgradeItems.get(upgrade.id) || new Set()).has(uItem.id)}
                                          onChange={() => toggleUpgradeItemSelection(upgrade.id, uItem.id)}
                                          className="rounded"
                                        />
                                      </td>
                                      <td colSpan={9} className="px-3 py-2">
                                        <input
                                          type="text"
                                          value={uItem.name}
                                          onChange={(e) =>
                                            setUpgrades(
                                              upgrades.map((u) =>
                                                u.id === upgrade.id
                                                  ? {
                                                      ...u,
                                                      items: u.items.map((i) =>
                                                        i.id === uItem.id
                                                          ? { ...i, name: e.target.value }
                                                          : i
                                                      ),
                                                    }
                                                  : u
                                              )
                                            )
                                          }
                                          className="bg-transparent border-0 w-full focus:outline-none text-white font-medium"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => deleteUpgradeItem(upgrade.id, uItem.id)}
                                            className="text-white hover:text-gray-300"
                                          >
                                            <X size={14} />
                                          </button>
                                          <button
                                            onClick={() => toggleUpgradeItemVisibility(upgrade.id, uItem.id)}
                                            className="text-white hover:text-gray-300"
                                          >
                                            {uItem.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : (
                                    <tr
                                      key={uItem.id}
                                      draggable
                                      onDragStart={() => handleUpgradeItemDragStart(upgrade.id, itemIndex)}
                                      onDragOver={(e) => handleUpgradeItemDragOver(e, upgrade.id, itemIndex)}
                                      onDragEnd={handleUpgradeItemDragEnd}
                                      className={
                                        uItem.checked
                                          ? "bg-gray-800 text-white cursor-move"
                                          : "cursor-move"
                                      }
                                    >
                                      <td className="px-3 py-2">
                                        <GripVertical size={16} className="text-gray-400" />
                                      </td>
                                      <td className="px-3 py-2">
                                      <input
                                        type="checkbox"
                                        checked={(selectedUpgradeItems.get(upgrade.id) || new Set()).has(uItem.id)}
                                        onChange={() => toggleUpgradeItemSelection(upgrade.id, uItem.id)}
                                        className="rounded"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-sm relative">
                                      <input
                                        type="text"
                                        value={uItem.name}
                                        onFocus={() => {
                                          if (!uItem.isCustom) {
                                            setEditingUpgradeItemId({upgradeId: upgrade.id, itemId: uItem.id});
                                            setShowUpgradeCatalogDropdown(upgrade.id);
                                            setTimeout(() => upgradeCatalogInputRef.current?.focus(), 100);
                                          }
                                        }}
                                        readOnly={!uItem.isCustom}
                                        className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 cursor-pointer"
                                      />
                                      {showUpgradeCatalogDropdown === upgrade.id && editingUpgradeItemId?.itemId === uItem.id && (
                                        <div className="absolute top-full left-0 mt-1 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Editing: {uItem.name}</div>
                                            <input
                                              ref={upgradeCatalogInputRef}
                                              type="text"
                                              value={upgradeCatalogSearch}
                                              onChange={(e) => setUpgradeCatalogSearch(e.target.value)}
                                              placeholder="Search catalog..."
                                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                              onBlur={() => setTimeout(() => { setShowUpgradeCatalogDropdown(null); setEditingUpgradeItemId(null); }, 200)}
                                            />
                                          </div>
                                          <div className="max-h-64 overflow-y-auto">
                                            {catalogItems
                                              .filter(item => item.name.toLowerCase().includes(upgradeCatalogSearch.toLowerCase()))
                                              .map((item, idx) => (
                                                <button
                                                  key={idx}
                                                  onClick={() => addItemToUpgradeFromCatalog(upgrade.id, item)}
                                                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                                                >
                                                  <div className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</div>
                                                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">${item.unitCost} per {item.unit}</div>
                                                </button>
                                              ))}
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                      <input
                                        type="text"
                                        value={uItem.description}
                                        onChange={(e) =>
                                          setUpgrades(
                                            upgrades.map((u) =>
                                              u.id === upgrade.id
                                                ? {
                                                    ...u,
                                                    items: u.items.map((i) =>
                                                      i.id === uItem.id
                                                        ? {
                                                            ...i,
                                                            description:
                                                              e.target.value,
                                                          }
                                                        : i
                                                    ),
                                                  }
                                                : u
                                            )
                                          )
                                        }
                                        className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                      <input
                                        type="text"
                                        value={uItem.mapping}
                                        onChange={(e) =>
                                          setUpgrades(
                                            upgrades.map((u) =>
                                              u.id === upgrade.id
                                                ? {
                                                    ...u,
                                                    items: u.items.map((i) =>
                                                      i.id === uItem.id
                                                        ? {
                                                            ...i,
                                                            mapping:
                                                              e.target.value,
                                                          }
                                                        : i
                                                    ),
                                                  }
                                                : u
                                            )
                                          )
                                        }
                                        className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                      <input
                                        type="text"
                                        value={uItem.coverage}
                                        onChange={(e) =>
                                          setUpgrades(
                                            upgrades.map((u) =>
                                              u.id === upgrade.id
                                                ? {
                                                    ...u,
                                                    items: u.items.map((i) =>
                                                      i.id === uItem.id
                                                        ? {
                                                            ...i,
                                                            coverage:
                                                              e.target.value,
                                                          }
                                                        : i
                                                    ),
                                                  }
                                                : u
                                            )
                                          )
                                        }
                                        className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                      <input
                                        type="text"
                                        value={uItem.unitCost}
                                        onChange={(e) =>
                                          setUpgrades(
                                            upgrades.map((u) =>
                                              u.id === upgrade.id
                                                ? {
                                                    ...u,
                                                    items: u.items.map((i) =>
                                                      i.id === uItem.id
                                                        ? {
                                                            ...i,
                                                            unitCost:
                                                              e.target.value,
                                                          }
                                                        : i
                                                    ),
                                                  }
                                                : u
                                            )
                                          )
                                        }
                                        className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                      <input
                                        type="text"
                                        value={uItem.unit}
                                        onChange={(e) =>
                                          setUpgrades(
                                            upgrades.map((u) =>
                                              u.id === upgrade.id
                                                ? {
                                                    ...u,
                                                    items: u.items.map((i) =>
                                                      i.id === uItem.id
                                                        ? {
                                                            ...i,
                                                            unit: e.target.value,
                                                          }
                                                        : i
                                                    ),
                                                  }
                                                : u
                                            )
                                          )
                                        }
                                        className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                      <input
                                        type="text"
                                        value={uItem.qty}
                                        onChange={(e) => {
                                          setUpgrades(
                                            upgrades.map((u) =>
                                              u.id === upgrade.id
                                                ? {
                                                    ...u,
                                                    items: u.items.map((i) =>
                                                      i.id === uItem.id
                                                        ? {
                                                            ...i,
                                                            qty: e.target.value,
                                                          }
                                                        : i
                                                    ),
                                                  }
                                                : u
                                            )
                                          );
                                        }}
                                        className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                      {uItem.unitCost && uItem.qty ? `$${(parseFloat(uItem.unitCost) * parseFloat(uItem.qty)).toFixed(2)}` : '$0.00'}
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                      <input
                                        type="text"
                                        value={uItem.salesTax}
                                        onChange={(e) =>
                                          setUpgrades(
                                            upgrades.map((u) =>
                                              u.id === upgrade.id
                                                ? {
                                                    ...u,
                                                    items: u.items.map((i) =>
                                                      i.id === uItem.id
                                                        ? {
                                                            ...i,
                                                            salesTax:
                                                              e.target.value,
                                                          }
                                                        : i
                                                    ),
                                                  }
                                                : u
                                            )
                                          )
                                        }
                                        className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() =>
                                            deleteUpgradeItem(
                                              upgrade.id,
                                              uItem.id
                                            )
                                          }
                                          className={
                                            uItem.checked
                                              ? "text-white hover:text-gray-300"
                                              : "text-gray-400 hover:text-gray-600"
                                          }
                                        >
                                          <X size={14} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            toggleUpgradeItemVisibility(
                                              upgrade.id,
                                              uItem.id
                                            )
                                          }
                                          className={
                                            uItem.checked
                                              ? "text-white hover:text-gray-300"
                                              : "text-gray-400 hover:text-gray-600"
                                          }
                                        >
                                          {uItem.visible ? (
                                            <Eye size={14} />
                                          ) : (
                                            <EyeOff size={14} />
                                          )}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  )
                                ))}
                              </tbody>
                            </table>

                            <div className="flex gap-4 mt-4 text-sm relative">
                              <div className="relative">
                                <button
                                  onClick={() => addItemToUpgrade(upgrade.id)}
                                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                >
                                  <Plus size={14} />
                                  Add item from catalog
                                </button>
                                {showUpgradeCatalogDropdown === upgrade.id && (
                                  <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                      <input
                                        ref={upgradeCatalogInputRef}
                                        type="text"
                                        value={upgradeCatalogSearch}
                                        onChange={(e) => setUpgradeCatalogSearch(e.target.value)}
                                        placeholder="Search catalog..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        onBlur={() => setTimeout(() => setShowUpgradeCatalogDropdown(null), 200)}
                                      />
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                      {catalogItems
                                        .filter(item => item.name.toLowerCase().includes(upgradeCatalogSearch.toLowerCase()))
                                        .map((item, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => addItemToUpgradeFromCatalog(upgrade.id, item)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                                          >
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">${item.unitCost} per {item.unit}</div>
                                          </button>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => addCustomItemToUpgrade(upgrade.id)}
                                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                              >
                                <Plus size={14} />
                                Add custom item
                              </button>
                              <button
                                onClick={() => addSectionHeadingToUpgrade(upgrade.id)}
                                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                              >
                                <Plus size={14} />
                                Add section heading
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={addUpgrade}
                          className="text-primary-600 hover:text-primary-700 text-sm mt-4 flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add another upgrade
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Profitability" && (
                  <div ref={profitabilityRef} className="p-4">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Profitability settings
                      </h3>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="default"
                            checked
                            className="rounded"
                            readOnly
                          />
                          <label
                            htmlFor="default"
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            Default (%)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="minimum"
                            checked
                            className="rounded"
                            readOnly
                          />
                          <label
                            htmlFor="minimum"
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            Minimum (%)
                          </label>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Margin
                            </label>
                            <input
                              type="number"
                              value={defaultMargin}
                              onChange={(e) => setDefaultMargin(e.target.value)}
                              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={minimumMargin}
                              onChange={(e) => setMinimumMargin(e.target.value)}
                              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mt-6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSave();
                    setShowEditModal(false);
                  }}
                  disabled={isTemplateLocked}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen PDF Viewer */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white font-medium">
              {viewingPdf.name}
            </h3>
            <button
              onClick={() => setViewingPdf(null)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1">
            <iframe
              src={viewingPdf.url}
              className="w-full h-full"
              title={viewingPdf.name}
            />
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {showCropModal && cropImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Crop Cover Image</h3>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setCropImage(null);
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative h-96 bg-gray-900">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
              />
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setCropImage(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (isTemplateLocked) {
                      alert('This is a locked template and cannot be edited.');
                      return;
                    }
                    if (croppedAreaPixels && cropImage) {
                      const croppedImage = await getCroppedImg(cropImage, croppedAreaPixels);
                      setCoverImage(croppedImage);
                      
                      // Upload to server using same API as photos/PDFs
                      try {
                        const blob = await fetch(croppedImage).then(r => r.blob());
                        const file = new File([blob], 'cover-image.jpg', { type: 'image/jpeg' });
                        
                        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
                        const token = localStorage.getItem('token');
                        
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('sectionId', 'cover');
                        formData.append('type', 'photo');

                        const response = await fetch(`${API_BASE_URL}/templates/${templateId}/media`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          },
                          body: formData
                        });

                        if (!response.ok) {
                          const errorText = await response.text();
                          throw new Error(errorText || 'Failed to upload cover image');
                        }

                        const result = await response.json();
                        if (!result.success || !result.data?.url) {
                          throw new Error(result.message || 'Failed to upload cover image');
                        }
                        setCoverImage(result.data.url);
                      } catch (error) {
                        console.error('Error uploading cover image:', error);
                        alert('Cover image upload failed. Please try again.');
                      }
                      
                      setShowCropModal(false);
                      setCropImage(null);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
