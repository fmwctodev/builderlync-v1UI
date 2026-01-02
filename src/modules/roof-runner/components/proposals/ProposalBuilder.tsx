import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  FileText,
  Image,
  FileType,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Save,
  GripVertical,
  Upload,
  Settings,
  Send,
  ExternalLink,
} from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  getCatalogItems,
  CatalogItem as APICatalogItem,
} from "../../../../shared/store/services/catalogApi";
import { proposalsApi } from "../../services/proposalsApi";
import { getContacts, type Contact } from "../../../../shared/store/services/contactsApi";
import { proposalSharingApi } from "../../services/proposalSharingApi";
import { abcSupplyService, ABCSupplyOrderHistoryItem } from "../../services/abcSupplyService";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
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

  return canvas.toDataURL("image/jpeg");
};

interface ProposalBuilderProps {
  proposalId: string;
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

export default function ProposalBuilder({
  proposalId,
  onClose,
}: ProposalBuilderProps) {
  const [templateName, setTemplateName] = useState("demo");
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
  const logoInputRef = useRef<HTMLInputElement>(null);
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
  const [optionTitle, setOptionTitle] = useState("Option 1");
  const [optionDescription, setOptionDescription] = useState("Add description");
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
      .filter((item) => item.visible && !item.isHeading)
      .reduce((sum, item) => {
        const price =
          parseFloat(item.unitCost || "0") * parseFloat(item.qty || "0");
        return sum + price;
      }, 0)
      .toFixed(2);
  };

  const calculateUpgradeSubtotal = () => {
    return upgrades
      .reduce((sum, upgrade) => {
        const upgradeTotal = upgrade.items
          .filter((item) => item.visible && !item.isHeading)
          .reduce((itemSum, item) => {
            const price =
              parseFloat(item.unitCost || "0") * parseFloat(item.qty || "0");
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
  const [showUpgradeCatalogDropdown, setShowUpgradeCatalogDropdown] = useState<
    string | null
  >(null);
  const [upgradeCatalogSearch, setUpgradeCatalogSearch] = useState("");
  const upgradeCatalogInputRef = useRef<HTMLInputElement>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingUpgradeItemId, setEditingUpgradeItemId] = useState<{
    upgradeId: string;
    itemId: string;
  } | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggedUpgradeItem, setDraggedUpgradeItem] = useState<{
    upgradeId: string;
    itemIndex: number;
  } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedUpgradeItems, setSelectedUpgradeItems] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(
    null
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [catalogItems, setCatalogItems] = useState<APICatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showEmailSidebar, setShowEmailSidebar] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailType, setEmailType] = useState<"marketing" | "plain">("marketing");
  const [buttonLabel, setButtonLabel] = useState("View & Review Proposal");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<string>('draft');
  const [orderHistory, setOrderHistory] = useState<ABCSupplyOrderHistoryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [showMeasurementDownloadModal, setShowMeasurementDownloadModal] = useState(false);
  const [proposalData, setProposalData] = useState<any>(null);

  const [sections, setSections] = useState<Section[]>([
    { id: "cover", name: "Cover", active: true, order: 0 },
    {
      id: "estimate",
      name: "Estimate",
      active: true,
      order: 1,
      subsections: [optionTitle, "Summary"],
      type: "estimate",
    },
  ]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const estimateTotal =
        parseFloat(calculateEstimateSubtotal()) +
        parseFloat(calculateUpgradeSubtotal());

      await proposalsApi.updateProposal(Number(proposalId), {
        title: templateName,
        sections: {
          items,
          sections,
          settings: {
            coverImage,
            coverTitle,
            coverDate,
            customerName,
            customerAddress,
            customerPhone,
            customerEmail,
            companyName,
            companyPhone,
            companyEmail,
            optionTitle,
            optionDescription,
            itemSectionTitle,
            upgradesTitle,
            defaultMargin,
            minimumMargin,
            coverContent,
            companyLogo,
            contactId: selectedContact?.id,
          },
          upgrades,
          templateName,
        },
        total: estimateTotal,
        address: {
          address: customerAddress,
        },
      });
      console.log("Proposal saved successfully!");
    } catch (error) {
      console.error("Error saving proposal:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadProposal = async () => {
      try {
        const response = await proposalsApi.getProposalById(Number(proposalId));
        const proposal = response.data || response;
        setProposalData(proposal);

        if (proposal.status) setProposalStatus(proposal.status);
        if (proposal.title) setTemplateName(proposal.title);
        if (proposal.address?.address) setCustomerAddress(proposal.address.address);

        // Store report data if available
        if (proposal.report) {
          console.log('Report data available:', proposal.report);
        }

        const content = proposal.sections;
        if (!content) return;

        // Load settings
        if (content.settings) {
          const s = content.settings;
          if (s.coverImage) setCoverImage(s.coverImage);
          if (s.coverTitle) setCoverTitle(s.coverTitle);
          if (s.coverDate) setCoverDate(s.coverDate);
          if (s.customerName) setCustomerName(s.customerName);
          if (s.customerAddress) setCustomerAddress(s.customerAddress);
          if (s.customerPhone) setCustomerPhone(s.customerPhone);
          if (s.customerEmail) setCustomerEmail(s.customerEmail);
          if (s.companyName) setCompanyName(s.companyName);
          if (s.companyPhone) setCompanyPhone(s.companyPhone);
          if (s.companyEmail) setCompanyEmail(s.companyEmail);
          if (s.optionTitle) setOptionTitle(s.optionTitle);
          if (s.optionDescription) setOptionDescription(s.optionDescription);
          if (s.itemSectionTitle) setItemSectionTitle(s.itemSectionTitle);
          if (s.upgradesTitle) setUpgradesTitle(s.upgradesTitle);
          if (s.defaultMargin) setDefaultMargin(s.defaultMargin);
          if (s.minimumMargin) setMinimumMargin(s.minimumMargin);
          if (s.contactId) {
            setSelectedContact({ id: s.contactId, fullName: s.customerName, email: s.customerEmail, phone: s.customerPhone, address: s.customerAddress } as any);
          }
        }

        // Load sections
        if (content.sections) {
          setSections(content.sections);
        }

        // Load items
        if (content.items) {
          setItems(content.items);
        }

        // Load upgrades
        if (content.upgrades) {
          setUpgrades(content.upgrades);
        }
      } catch (error) {
        console.error("Error loading proposal:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadOrderHistory = async () => {
      setLoadingOrders(true);
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endDate = tomorrow.toISOString().split('T')[0];

        const response = await abcSupplyService.getOrdersHistory({
          startDate: '2024-03-15',
          endDate: endDate,
          itemsPerPage: 20,
          pageNumber: 1
        });
        
        if (response.success) {
          setOrderHistory(response.data.items || []);
        }
      } catch (error) {
        console.error('Error loading order history:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadProposal();
    loadOrderHistory();
  }, [proposalId]);

  // Auto-save disabled - use manual save button only

  useEffect(() => {
    const loadCatalogItems = async () => {
      setLoadingCatalog(true);
      try {
        const response = await getCatalogItems({});
        if (response.success && response.data) {
          setCatalogItems(response.data.items);
        }
      } catch (error) {
        console.error("Failed to load catalog items:", error);
      } finally {
        setLoadingCatalog(false);
      }
    };

    if (!loading) {
      loadCatalogItems();
    }
  }, [loading]);

  useEffect(() => {
    if (!showContactModal) return;

    const searchContacts = async () => {
      setLoadingContacts(true);
      try {
        const response = await getContacts(contactSearch, undefined, 1, 50);
        if (response.success && response.data) {
          setContacts(response.data.contacts || []);
        }
      } catch (error) {
        console.error("Failed to load contacts:", error);
      } finally {
        setLoadingContacts(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchContacts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [contactSearch, showContactModal]);

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

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionName: string
  ) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        const blobUrl = URL.createObjectURL(file);
        uploadPhoto(sectionName, blobUrl);

        try {
          const section = sections.find((s) => s.name === sectionName);
          if (!section) return;

          const API_BASE_URL =
            import.meta.env.VITE_API_BASE_URL ||
            "https://builderlyncapi.testenvapp.com/api";
          const token = localStorage.getItem("token");

          const formData = new FormData();
          formData.append("file", file);
          formData.append("sectionId", section.id);
          formData.append("type", "photo");

          const response = await fetch(
            `${API_BASE_URL}/templates/${proposalId}/media`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          const result = await response.json();
          if (result.success) {
            const permanentUrl = result.data.url;
            setSections((prev) =>
              prev.map((s) =>
                s.name === sectionName && s.content?.photos
                  ? {
                      ...s,
                      content: {
                        ...s.content,
                        photos: s.content.photos.map((url) =>
                          url === blobUrl ? permanentUrl : url
                        ),
                      },
                    }
                  : s
              )
            );
            URL.revokeObjectURL(blobUrl);
          }
        } catch (error) {
          console.error("Error uploading photo:", error);
        }
      }
    }
  };

  const uploadPhoto = (sectionName: string, photoUrl: string) => {
    setSections(
      sections.map((section) =>
        section.name === sectionName && section.content?.photos
          ? {
              ...section,
              content: {
                ...section.content,
                photos: [...section.content.photos, photoUrl],
              },
            }
          : section
      )
    );
  };

  const deletePhoto = async (sectionName: string, index: number) => {
    const section = sections.find((s) => s.name === sectionName);
    if (!section?.content?.photos) return;

    const photoUrl = section.content.photos[index];

    if (!photoUrl.startsWith("blob:")) {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5175/api";
        const token = localStorage.getItem("token");
        await fetch(
          `${API_BASE_URL}/templates/${proposalId}/media?sectionId=${
            section.id
          }&url=${encodeURIComponent(photoUrl)}&type=photo`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error("Error deleting photo:", error);
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

  const handlePDFUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionName: string
  ) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        const blobUrl = URL.createObjectURL(file);
        uploadPDF(sectionName, { name: file.name, url: blobUrl });

        try {
          const section = sections.find((s) => s.name === sectionName);
          if (!section) return;

          const API_BASE_URL =
            import.meta.env.VITE_API_BASE_URL ||
            "https://builderlyncapi.testenvapp.com/api";
          const token = localStorage.getItem("token");

          const formData = new FormData();
          formData.append("file", file);
          formData.append("sectionId", section.id);
          formData.append("type", "pdf");

          const response = await fetch(
            `${API_BASE_URL}/templates/${proposalId}/media`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          const result = await response.json();
          if (result.success) {
            const permanentUrl = result.data.url;
            setSections((prev) =>
              prev.map((s) => {
                if (s.name === sectionName && s.content?.pdfs) {
                  return {
                    ...s,
                    content: {
                      ...s.content,
                      pdfs: s.content.pdfs.map((pdf) =>
                        pdf.url === blobUrl
                          ? { ...pdf, url: permanentUrl }
                          : pdf
                      ),
                    },
                  };
                }
                return s;
              })
            );
            URL.revokeObjectURL(blobUrl);
          }
        } catch (error) {
          console.error("Error uploading PDF:", error);
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
    const section = sections.find((s) => s.name === sectionName);
    if (!section?.content?.pdfs) return;

    const pdf = section.content.pdfs[index];

    if (!pdf.url.startsWith("blob:")) {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5175/api";
        const token = localStorage.getItem("token");
        await fetch(
          `${API_BASE_URL}/templates/${proposalId}/media?sectionId=${
            section.id
          }&url=${encodeURIComponent(pdf.url)}&type=pdf`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error("Error deleting PDF:", error);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setCompanyLogo(blobUrl);

      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL ||
          "https://builderlyncapi.testenvapp.com/api";
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${API_BASE_URL}/templates/${proposalId}/logo`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const result = await response.json();
        if (result.success) {
          const permanentUrl = result.data.url;
          setCompanyLogo(permanentUrl);
          URL.revokeObjectURL(blobUrl);
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
      }
    }
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

  const addItemFromCatalog = (catalogItem: APICatalogItem) => {
    if (editingItemId) {
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === editingItemId
            ? {
                ...i,
                name: catalogItem.name,
                description: catalogItem.description || "",
                coverage: catalogItem.coverage?.toString() || "",
                unitCost: catalogItem.preTaxCost?.toString() || "0",
                unit: catalogItem.unit || "square",
                salesTax: catalogItem.salesTax?.toString() || "0",
              }
            : i
        )
      );
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
      setItems((prevItems) => [...prevItems, newItem]);
    }
    setShowCatalogDropdown(false);
    setCatalogSearch("");
  };

  const addItemToUpgrade = (upgradeId: string) => {
    setShowUpgradeCatalogDropdown(upgradeId);
    setTimeout(() => upgradeCatalogInputRef.current?.focus(), 100);
  };

  const addItemToUpgradeFromCatalog = (
    upgradeId: string,
    catalogItem: APICatalogItem
  ) => {
    if (editingUpgradeItemId && editingUpgradeItemId.upgradeId === upgradeId) {
      setUpgrades((prevUpgrades) =>
        prevUpgrades.map((u) =>
          u.id === upgradeId
            ? {
                ...u,
                items: u.items.map((i) =>
                  i.id === editingUpgradeItemId.itemId
                    ? {
                        ...i,
                        name: catalogItem.name,
                        description: catalogItem.description || "",
                        coverage: catalogItem.coverage?.toString() || "",
                        unitCost: catalogItem.preTaxCost?.toString() || "0",
                        unit: catalogItem.unit || "square",
                        salesTax: catalogItem.salesTax?.toString() || "0",
                      }
                    : i
                ),
              }
            : u
        )
      );
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
      setUpgrades((prevUpgrades) =>
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

  const handleUpgradeItemDragOver = (
    e: React.DragEvent,
    upgradeId: string,
    index: number
  ) => {
    e.preventDefault();
    if (
      !draggedUpgradeItem ||
      draggedUpgradeItem.upgradeId !== upgradeId ||
      draggedUpgradeItem.itemIndex === index
    )
      return;
    setUpgrades(
      upgrades.map((upgrade) => {
        if (upgrade.id === upgradeId) {
          const newItems = [...upgrade.items];
          const draggedItem = newItems[draggedUpgradeItem.itemIndex];
          newItems.splice(draggedUpgradeItem.itemIndex, 1);
          newItems.splice(index, 0, draggedItem);
          setDraggedUpgradeItem({ upgradeId, itemIndex: index });
          return { ...upgrade, items: newItems };
        }
        return upgrade;
      })
    );
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
    setItems(items.filter((item) => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  const bulkHideItems = () => {
    setItems(
      items.map((item) =>
        selectedItems.has(item.id) ? { ...item, visible: false } : item
      )
    );
    setSelectedItems(new Set());
  };

  const bulkUnhideItems = () => {
    setItems(
      items.map((item) =>
        selectedItems.has(item.id) ? { ...item, visible: true } : item
      )
    );
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
    setUpgrades(
      upgrades.map((u) =>
        u.id === upgradeId
          ? { ...u, items: u.items.filter((item) => !selected.has(item.id)) }
          : u
      )
    );
    const newMap = new Map(selectedUpgradeItems);
    newMap.delete(upgradeId);
    setSelectedUpgradeItems(newMap);
  };

  const bulkHideUpgradeItems = (upgradeId: string) => {
    const selected = selectedUpgradeItems.get(upgradeId) || new Set();
    setUpgrades(
      upgrades.map((u) =>
        u.id === upgradeId
          ? {
              ...u,
              items: u.items.map((item) =>
                selected.has(item.id) ? { ...item, visible: false } : item
              ),
            }
          : u
      )
    );
    const newMap = new Map(selectedUpgradeItems);
    newMap.delete(upgradeId);
    setSelectedUpgradeItems(newMap);
  };

  const bulkUnhideUpgradeItems = (upgradeId: string) => {
    const selected = selectedUpgradeItems.get(upgradeId) || new Set();
    setUpgrades(
      upgrades.map((u) =>
        u.id === upgradeId
          ? {
              ...u,
              items: u.items.map((item) =>
                selected.has(item.id) ? { ...item, visible: true } : item
              ),
            }
          : u
      )
    );
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
    if (index === 0) return;
    setDraggedSectionIndex(index);
  };

  const handleSectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (
      index === 0 ||
      draggedSectionIndex === null ||
      draggedSectionIndex === index
    )
      return;
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

  interface EditableTextProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    multiline?: boolean;
    triggerFocus?: boolean;
    onFocusComplete?: () => void;
  }

  const EditableText = ({
    value,
    onChange,
    className = "",
    multiline = false,
    triggerFocus = false,
    onFocusComplete,
  }: EditableTextProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const isDisabled = proposalStatus === 'sent';

    useEffect(() => {
      if (triggerFocus && !isDisabled) {
        setIsEditing(true);
        if (onFocusComplete) onFocusComplete();
      }
    }, [triggerFocus, onFocusComplete]);

    useEffect(() => {
      setTempValue(value);
    }, [value]);

    const handleBlur = () => {
      setIsEditing(false);
      onChange(tempValue);
    };

    if (isEditing && !isDisabled) {
      return multiline ? (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className={`${className} w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none px-0 py-1`}
        />
      ) : (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className={`${className} w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none px-0 py-1`}
        />
      );
    }

    return (
      <span
        onClick={() => !isDisabled && setIsEditing(true)}
        className={`${className} ${isDisabled ? 'cursor-default' : 'cursor-pointer'} inline-block w-full py-1`}
      >
        {value}
      </span>
    );
  };

  // Company details should always be editable regardless of proposal status
  const CompanyEditableText = ({
    value,
    onChange,
    className = "",
    multiline = false,
  }: Omit<EditableTextProps, 'triggerFocus' | 'onFocusComplete'>) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    useEffect(() => {
      setTempValue(value);
    }, [value]);

    const handleBlur = () => {
      setIsEditing(false);
      onChange(tempValue);
    };

    if (isEditing) {
      return multiline ? (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className={`${className} w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none px-0 py-1`}
        />
      ) : (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className={`${className} w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none px-0 py-1`}
        />
      );
    }

    return (
      <span
        onClick={() => setIsEditing(true)}
        className={`${className} cursor-pointer inline-block w-full py-1`}
      >
        {value}
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

  useEffect(() => {
    const loadCatalogItems = async () => {
      setLoadingCatalog(true);
      try {
        const response = await getCatalogItems({});
        if (response.success && response.data) {
          setCatalogItems(response.data.items);
        }
      } catch (error) {
        console.error("Failed to load catalog items:", error);
      } finally {
        setLoadingCatalog(false);
      }
    };

    if (!loading) {
      loadCatalogItems();
    }
  }, [loading]);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500 dark:text-gray-400">
            Loading proposal...
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex">
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Back to Proposals
              </button>
              <div className="text-xs text-gray-500">Use Save button to save changes</div>
            </div>

            <div className="flex-1 p-4">
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Contact
                </label>
                <button
                  onClick={() => proposalStatus !== 'sent' && setShowContactModal(true)}
                  disabled={proposalStatus === 'sent'}
                  className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedContact ? (
                    <div>
                      <div className="font-medium">{selectedContact.fullName || selectedContact.full_name}</div>
                      {selectedContact.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{selectedContact.email}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Select contact...</span>
                  )}
                </button>
              </div>

              {proposalData?.report && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowMeasurementDownloadModal(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink size={16} />
                    <span className="text-sm font-medium">
                      View Measurement
                    </span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  Proposal sections
                </span>
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
              </div>

              <div>

                <div className="space-y-2">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      draggable={index > 0}
                      onDragStart={() => handleSectionDragStart(index)}
                      onDragOver={(e) => handleSectionDragOver(e, index)}
                      onDragEnd={handleSectionDragEnd}
                      className={index > 0 ? "cursor-move" : ""}
                    >
                      <div
                        className={`flex items-center gap-2 p-2 rounded ${
                          activeSection === section.name
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {index > 0 && (
                          <GripVertical
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                        )}
                        <button
                          className="flex items-center justify-between flex-1 text-left"
                          onClick={() => setActiveSection(section.name)}
                        >
                          {editingSectionId === section.id ? (
                            <input
                              type="text"
                              value={section.name}
                              onChange={(e) => {
                                setSections(
                                  sections.map((s) =>
                                    s.id === section.id
                                      ? { ...s, name: e.target.value }
                                      : s
                                  )
                                );
                              }}
                              onBlur={() => setEditingSectionId(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  setEditingSectionId(null);
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm font-medium bg-transparent border-0 focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 w-full"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {section.name}
                            </span>
                          )}
                        </button>
                        {index > 0 && proposalStatus !== 'sent' && (
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
                                  setSections(
                                    sections.map((s) =>
                                      s.id === section.id
                                        ? { ...s, active: !s.active }
                                        : s
                                    )
                                  );
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title={
                                  section.active
                                    ? "Hide section"
                                    : "Show section"
                                }
                              >
                                {section.active ? (
                                  <Eye size={14} />
                                ) : (
                                  <EyeOff size={14} />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSections(
                                    sections.filter((s) => s.id !== section.id)
                                  );
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
                                const targetId =
                                  idx === 0
                                    ? "estimate-page-1"
                                    : "estimate-page-2";
                                document
                                  .getElementById(targetId)
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                              }}
                              className={`flex items-center justify-between p-2 rounded w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                activeSubsection === sub
                                  ? "bg-gray-100 dark:bg-gray-700"
                                  : ""
                              }`}
                            >
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {idx === 0 ? optionTitle : sub}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {proposalStatus !== 'sent' && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <Plus size={16} />
                      <span className="text-sm">Add section</span>
                    </button>
                  )}
                </div>
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
                {activeSection === "Estimate" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
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
                {proposalStatus !== 'sent' && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Proposal"}
                  </button>
                )}
                <button
                  onClick={() => {
                    window.open(`/proposals/preview/${proposalId}`, '_blank');
                  }}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium flex items-center gap-2"
                >
                  <Eye size={16} />
                  Preview
                </button>
                {proposalStatus === 'sent' ? (
                  <div className="px-4 py-2 bg-gray-400 text-white rounded-md text-sm font-medium flex items-center gap-2 cursor-not-allowed">
                    <Send size={16} />
                    Sent
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (items.length === 0 || customerName === "Customer Name" || !customerName) {
                        setShowValidationModal(true);
                        return;
                      }
                      setEmailSubject(`Proposal for ${customerName}`);
                      setShowEmailSidebar(true);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium flex items-center gap-2"
                  >
                    <Send size={16} />
                    Send
                  </button>
                )}
              </div>
            </div>

            {/* Template Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-4xl mx-auto">
                <div
                  className={
                    activeSection === "Estimate"
                      ? "space-y-8"
                      : `bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
                          activeSection === "Cover" ? "" : "p-8"
                        }`
                  }
                >
                  {/* Render active section content */}
                  {activeSection === "Cover" && (
                    <div className="flex flex-col min-h-[800px]">
                      {/* Top 60% - Cover Image */}
                      <div
                        className={`relative h-[480px] bg-gray-100 dark:bg-gray-700 overflow-hidden ${proposalStatus !== 'sent' ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600' : 'cursor-default'} transition-colors`}
                        onClick={() =>
                          !coverImage && proposalStatus !== 'sent' && coverImageInputRef.current?.click()
                        }
                      >
                        {coverImage && (
                          <img
                            src={coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {!coverImage && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                              <Upload
                                size={48}
                                className="text-gray-400 mx-auto mb-2"
                              />
                              <span className="text-gray-500 dark:text-gray-400">
                                Click to Upload Cover Image
                              </span>
                            </div>
                          </div>
                        )}
                        {proposalStatus !== 'sent' && (
                          <div className="absolute top-4 right-4 flex gap-2">
                            {coverImage && (
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
                        )}
                        <input
                          ref={coverImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
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
                          <EditableText
                            value={coverTitle}
                            onChange={setCoverTitle}
                            className="text-2xl font-bold text-gray-900 dark:text-white block mb-2"
                          />
                          <EditableText
                            value={coverDate}
                            onChange={setCoverDate}
                            className="text-sm text-gray-500 dark:text-gray-400 block"
                          />
                        </div>
                        <div className="text-right text-sm">
                          <EditableText
                            value={customerName}
                            onChange={setCustomerName}
                            className="font-medium text-gray-900 dark:text-white block mb-1"
                          />
                          <EditableText
                            value={customerAddress}
                            onChange={setCustomerAddress}
                            className="text-gray-600 dark:text-gray-400 block mb-1"
                          />
                          <EditableText
                            value={customerPhone}
                            onChange={setCustomerPhone}
                            className="text-gray-600 dark:text-gray-400 block mb-1"
                          />
                          <EditableText
                            value={customerEmail}
                            onChange={setCustomerEmail}
                            className="text-gray-600 dark:text-gray-400 block"
                          />
                        </div>
                      </div>

                      {/* Bottom 40% - Footer (Company Info) */}
                      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Company representative name
                            </div>
                            <div className="flex items-center gap-2">
                              <CompanyEditableText
                                value={companyName}
                                onChange={setCompanyName}
                                className="font-medium text-gray-900 dark:text-white"
                              />
                            </div>
                            <CompanyEditableText
                              value={companyPhone}
                              onChange={setCompanyPhone}
                              className="text-sm text-gray-500 dark:text-gray-400 block"
                            />
                            <CompanyEditableText
                              value={companyEmail}
                              onChange={setCompanyEmail}
                              className="text-sm text-gray-500 dark:text-gray-400 block"
                            />
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
                            <button
                              onClick={() => logoInputRef.current?.click()}
                              className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors shadow-sm"
                            >
                              <Pencil size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sections.find(
                    (s) => s.name === activeSection && s.type === "photos"
                  ) && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Photos
                      </h2>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {sections
                          .find((s) => s.name === activeSection)
                          ?.content?.photos?.map((photo, idx) => (
                            <div
                              key={idx}
                              className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative group"
                            >
                              <img
                                src={photo}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {proposalStatus !== 'sent' && (
                                <button
                                  onClick={() => deletePhoto(activeSection, idx)}
                                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        {proposalStatus !== 'sent' && (
                          <button
                            onClick={() => photoInputRef.current?.click()}
                            className="aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <Plus className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Upload Photo
                            </span>
                          </button>
                        )}
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
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        PDF Documents
                      </h2>
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
                                  {proposalStatus !== 'sent' && (
                                    <button
                                      onClick={() =>
                                        deletePDF(activeSection, idx)
                                      }
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
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
                      {proposalStatus !== 'sent' && (
                        <button
                          onClick={() => pdfInputRef.current?.click()}
                          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <Plus className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Upload PDF
                          </span>
                        </button>
                      )}
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
                          sections.find((s) => s.name === activeSection)
                            ?.content?.text || "Click to add title"
                        }
                        onChange={(val) =>
                          updateTextContent(
                            activeSection,
                            val,
                            sections.find((s) => s.name === activeSection)
                              ?.content?.description
                          )
                        }
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-4 block"
                      />
                      <EditableText
                        value={
                          sections.find((s) => s.name === activeSection)
                            ?.content?.description || "Click to add description"
                        }
                        onChange={(val) =>
                          updateTextContent(
                            activeSection,
                            sections.find((s) => s.name === activeSection)
                              ?.content?.text || "",
                            val
                          )
                        }
                        className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
                        multiline={true}
                      />
                    </div>
                  )}

                  {activeSection === "Estimate" && (
                    <>
                      {/* Page 1: Option Details */}
                      <div
                        id="estimate-page-1"
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 min-h-[1000px] flex flex-col mb-8"
                      >
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <EditableText
                              value={optionTitle || "Add title"}
                              onChange={setOptionTitle}
                              className="text-lg font-medium text-gray-900 dark:text-white"
                              triggerFocus={triggerFocus}
                              onFocusComplete={() => setTriggerFocus(false)}
                            />
                            {proposalStatus !== 'sent' && (
                              <button
                                onClick={() => setShowEditModal(true)}
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                              >
                                <Pencil size={14} />
                                Edit option
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <EditableText
                              value={optionDescription || "Add description"}
                              onChange={setOptionDescription}
                              className="text-sm text-gray-500 dark:text-gray-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {itemSectionTitle}
                              </div>
                            </div>

                            {items
                              .filter((item) => item.visible)
                              .map((item, idx) => (
                                <div key={item.id}>
                                  {item.isHeading ? (
                                    <>
                                      <hr className="border-gray-300 dark:border-gray-600 my-3" />
                                      <div className="font-semibold text-gray-900 dark:text-white mb-2">
                                        {item.name}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="mb-2 pl-3 text-sm">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900 dark:text-white">
                                            {item.name}
                                          </div>
                                          {item.description && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                              {item.description}
                                            </div>
                                          )}
                                          {item.mapping && (
                                            <div className="text-gray-500 dark:text-gray-500 text-xs">
                                              {item.mapping}
                                            </div>
                                          )}
                                          <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {item.unitCost && (
                                              <span>
                                                Unit Cost: ${item.unitCost}
                                              </span>
                                            )}
                                            {item.qty && (
                                              <span>Qty: {item.qty}</span>
                                            )}
                                            {item.unit && (
                                              <span>Unit: {item.unit}</span>
                                            )}
                                          </div>
                                        </div>
                                        {item.unitCost && item.qty && (
                                          <div className="font-medium text-gray-900 dark:text-white">
                                            $
                                            {(
                                              parseFloat(item.unitCost) *
                                              parseFloat(item.qty)
                                            ).toFixed(2)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}

                            {proposalStatus !== 'sent' && (
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
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <EditableText
                                value={upgradesTitle}
                                onChange={setUpgradesTitle}
                                className="font-medium text-gray-900 dark:text-white"
                              />
                            </div>

                            {upgrades.map((upgrade) => (
                              <div
                                key={upgrade.id}
                                className="mb-4 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                              >
                                <div className="font-medium text-gray-900 dark:text-white mb-3">
                                  {upgrade.name}
                                </div>
                                {upgrade.items
                                  .filter((item) => item.visible)
                                  .map((item) => (
                                    <div key={item.id}>
                                      {item.isHeading ? (
                                        <>
                                          <hr className="border-gray-300 dark:border-gray-600 my-3" />
                                          <div className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                            {item.name}
                                          </div>
                                        </>
                                      ) : (
                                        <div className="mb-2 pl-3 text-sm">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <div className="font-medium text-gray-900 dark:text-white">
                                                {item.name}
                                              </div>
                                              {item.description && (
                                                <div className="text-gray-600 dark:text-gray-400">
                                                  {item.description}
                                                </div>
                                              )}
                                              {item.mapping && (
                                                <div className="text-gray-500 dark:text-gray-500 text-xs">
                                                  {item.mapping}
                                                </div>
                                              )}
                                              <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {item.unitCost && (
                                                  <span>
                                                    Unit Cost: ${item.unitCost}
                                                  </span>
                                                )}
                                                {item.qty && (
                                                  <span>Qty: {item.qty}</span>
                                                )}
                                                {item.unit && (
                                                  <span>Unit: {item.unit}</span>
                                                )}
                                              </div>
                                            </div>
                                            {item.unitCost && item.qty && (
                                              <div className="font-medium text-gray-900 dark:text-white">
                                                $
                                                {(
                                                  parseFloat(item.unitCost) *
                                                  parseFloat(item.qty)
                                                ).toFixed(2)}
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
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Company representative name
                              </div>
                              <div className="flex items-center gap-2">
                                <EditableText
                                  value={companyName}
                                  onChange={setCompanyName}
                                  className="font-medium text-gray-900 dark:text-white"
                                />
                              </div>
                              <EditableText
                                value={companyPhone}
                                onChange={setCompanyPhone}
                                className="text-sm text-gray-500 dark:text-gray-400 block"
                              />
                              <EditableText
                                value={companyEmail}
                                onChange={setCompanyEmail}
                                className="text-sm text-gray-500 dark:text-gray-400 block"
                              />
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
                              <button
                                onClick={() => logoInputRef.current?.click()}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors shadow-sm"
                              >
                                <Pencil size={10} />
                              </button>
                              <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Page 2: Summary */}
                      <div
                        id="estimate-page-2"
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 min-h-[1000px] flex flex-col"
                      >
                        <div className="flex-1">
                          <div className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                              Summary
                            </h2>
                          </div>

                          <div className="space-y-6">
                            <div>
                              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {optionTitle}
                                </div>
                              </div>
                              <div className="flex justify-between items-center py-2 pl-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {optionDescription}
                                </span>
                              </div>
                              <div className="space-y-2 py-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                  <span className="text-gray-900 dark:text-white">${calculateEstimateSubtotal()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Margin ({defaultMargin}%)</span>
                                  <span className="text-gray-900 dark:text-white">${(parseFloat(calculateEstimateSubtotal()) * parseFloat(defaultMargin) / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                                  <span className="font-medium text-gray-900 dark:text-white">Total</span>
                                  <span className="font-medium text-gray-900 dark:text-white">${(parseFloat(calculateEstimateSubtotal()) * (1 + parseFloat(defaultMargin) / 100)).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {upgradesTitle}
                                </div>
                              </div>
                              {upgrades.map((upgrade) => {
                                const upgradeSubtotal = upgrade.items
                                  .filter((item) => item.visible && !item.isHeading)
                                  .reduce((sum, item) => sum + parseFloat(item.unitCost || "0") * parseFloat(item.qty || "0"), 0);
                                const upgradeTotal = upgradeSubtotal * (1 + parseFloat(defaultMargin) / 100);
                                return (
                                  <div key={upgrade.id} className="mb-2 pl-3 text-sm">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">{upgrade.name}</div>
                                      </div>
                                      <div className="font-medium text-gray-900 dark:text-white">${upgradeTotal.toFixed(2)}</div>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="space-y-2 py-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                  <span className="text-gray-900 dark:text-white">${calculateUpgradeSubtotal()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Margin ({defaultMargin}%)</span>
                                  <span className="text-gray-900 dark:text-white">${(parseFloat(calculateUpgradeSubtotal()) * parseFloat(defaultMargin) / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <span className="font-medium text-gray-900 dark:text-white">Total</span>
                                  <span className="font-medium text-gray-900 dark:text-white">${(parseFloat(calculateUpgradeSubtotal()) * (1 + parseFloat(defaultMargin) / 100)).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                              <div className="flex justify-between items-center py-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Overall Total</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  ${(
                                    (parseFloat(calculateEstimateSubtotal()) + parseFloat(calculateUpgradeSubtotal())) * 
                                    (1 + parseFloat(defaultMargin) / 100)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                By signing this document you agree to the
                                statement of works provided by {companyName} and
                                in accordance with any terms described within.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Company representative name
                              </div>
                              <div className="flex items-center gap-2">
                                <EditableText
                                  value={companyName}
                                  onChange={setCompanyName}
                                  className="font-medium text-gray-900 dark:text-white"
                                />
                              </div>
                              <EditableText
                                value={companyPhone}
                                onChange={setCompanyPhone}
                                className="text-sm text-gray-500 dark:text-gray-400 block"
                              />
                              <EditableText
                                value={companyEmail}
                                onChange={setCompanyEmail}
                                className="text-sm text-gray-500 dark:text-gray-400 block"
                              />
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
                              <button
                                onClick={() => logoInputRef.current?.click()}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors shadow-sm"
                              >
                                <Pencil size={10} />
                              </button>
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
                  <div className="flex items-center gap-2">
                    <EditableText
                      value={optionTitle}
                      onChange={setOptionTitle}
                      className="text-lg font-medium text-gray-900 dark:text-white"
                    />
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
                                <button
                                  onClick={bulkHideItems}
                                  className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                  Hide
                                </button>
                                <button
                                  onClick={bulkUnhideItems}
                                  className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                  Unhide
                                </button>
                                <button
                                  onClick={bulkDeleteItems}
                                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={bulkUnselectItems}
                                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                  Unselect
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 dark:border-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"></th>
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
                                {items.map((item, index) =>
                                  item.isHeading ? (
                                    <tr
                                      key={item.id}
                                      draggable
                                      onDragStart={() =>
                                        handleItemDragStart(index)
                                      }
                                      onDragOver={(e) =>
                                        handleItemDragOver(e, index)
                                      }
                                      onDragEnd={handleItemDragEnd}
                                      className="bg-gray-800 text-white cursor-move"
                                    >
                                      <td className="px-3 py-2">
                                        <GripVertical
                                          size={16}
                                          className="text-gray-400"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={selectedItems.has(item.id)}
                                          onChange={() =>
                                            toggleItemSelection(item.id)
                                          }
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
                                                  ? {
                                                      ...i,
                                                      name: e.target.value,
                                                    }
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
                                            onClick={() =>
                                              toggleItemVisibility(item.id)
                                            }
                                            className="text-white hover:text-gray-300"
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
                                  ) : (
                                    <tr
                                      key={item.id}
                                      draggable
                                      onDragStart={() =>
                                        handleItemDragStart(index)
                                      }
                                      onDragOver={(e) =>
                                        handleItemDragOver(e, index)
                                      }
                                      onDragEnd={handleItemDragEnd}
                                      className={
                                        item.checked
                                          ? "bg-gray-800 text-white cursor-move"
                                          : "cursor-move"
                                      }
                                    >
                                      <td className="px-3 py-2">
                                        <GripVertical
                                          size={16}
                                          className="text-gray-400"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={selectedItems.has(item.id)}
                                          onChange={() =>
                                            toggleItemSelection(item.id)
                                          }
                                          className="rounded"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-sm relative">
                                        <input
                                          type="text"
                                          value={item.name}
                                          onFocus={() => {
                                            setEditingItemId(item.id);
                                            setShowCatalogDropdown(true);
                                            setTimeout(
                                              () =>
                                                catalogInputRef.current?.focus(),
                                              100
                                            );
                                          }}
                                          readOnly
                                          className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 cursor-pointer"
                                        />
                                        {showCatalogDropdown &&
                                          editingItemId === item.id && (
                                            <div className="absolute top-full left-0 mt-1 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                  Editing: {item.name}
                                                </div>
                                                <input
                                                  ref={catalogInputRef}
                                                  type="text"
                                                  value={catalogSearch}
                                                  onChange={(e) =>
                                                    setCatalogSearch(
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="Search catalog..."
                                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                  onBlur={() =>
                                                    setTimeout(() => {
                                                      setShowCatalogDropdown(
                                                        false
                                                      );
                                                      setEditingItemId(null);
                                                    }, 200)
                                                  }
                                                />
                                              </div>
                                              <div className="max-h-64 overflow-y-auto">
                                                {catalogItems
                                                  .filter((item) =>
                                                    item.name
                                                      .toLowerCase()
                                                      .includes(
                                                        catalogSearch.toLowerCase()
                                                      )
                                                  )
                                                  .map((item, idx) => (
                                                    <button
                                                      key={idx}
                                                      onClick={() =>
                                                        addItemFromCatalog(item)
                                                      }
                                                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                                                    >
                                                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {item.name}
                                                      </div>
                                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.description}
                                                      </div>
                                                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        ${item.unitCost} per{" "}
                                                        {item.unit}
                                                      </div>
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
                                                      description:
                                                        e.target.value,
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
                                                  ? {
                                                      ...i,
                                                      mapping: e.target.value,
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
                                          value={item.coverage}
                                          onChange={(e) =>
                                            setItems(
                                              items.map((i) =>
                                                i.id === item.id
                                                  ? {
                                                      ...i,
                                                      coverage: e.target.value,
                                                    }
                                                  : i
                                              )
                                            )
                                          }
                                          className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                          disabled
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
                                                  ? {
                                                      ...i,
                                                      unitCost: e.target.value,
                                                    }
                                                  : i
                                              )
                                            )
                                          }
                                          className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                          disabled
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
                                                  ? {
                                                      ...i,
                                                      unit: e.target.value,
                                                    }
                                                  : i
                                              )
                                            )
                                          }
                                          className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                          disabled
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
                                                  ? {
                                                      ...i,
                                                      qty: e.target.value,
                                                    }
                                                  : i
                                              )
                                            );
                                          }}
                                          className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {item.unitCost && item.qty
                                          ? `$${(
                                              parseFloat(item.unitCost) *
                                              parseFloat(item.qty)
                                            ).toFixed(2)}`
                                          : "$0.00"}
                                      </td>
                                      <td className="px-3 py-2 text-sm">
                                        <input
                                          type="text"
                                          value={item.salesTax}
                                          onChange={(e) =>
                                            setItems(
                                              items.map((i) =>
                                                i.id === item.id
                                                  ? {
                                                      ...i,
                                                      salesTax: e.target.value,
                                                    }
                                                  : i
                                              )
                                            )
                                          }
                                          className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300"
                                          disabled
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
                                )}
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
                                      onChange={(e) =>
                                        setCatalogSearch(e.target.value)
                                      }
                                      placeholder="Search catalog..."
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      onBlur={() =>
                                        setTimeout(
                                          () => setShowCatalogDropdown(false),
                                          200
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="max-h-64 overflow-y-auto">
                                    {catalogItems
                                      .filter((item) =>
                                        item.name
                                          .toLowerCase()
                                          .includes(catalogSearch.toLowerCase())
                                      )
                                      .map((item, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() =>
                                            addItemFromCatalog(item)
                                          }
                                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                                        >
                                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                                            {item.name}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.description}
                                          </div>
                                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            ${item.unitCost} per {item.unit}
                                          </div>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={addSectionHeading}
                              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add section heading
                            </button>
                            <button
                              onClick={() => setShowMeasurementsModal(true)}
                              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Select measurement report (optional)
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
                                        upgrades.filter(
                                          (u) => u.id !== upgrade.id
                                        )
                                      );
                                    }}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                                {(selectedUpgradeItems.get(upgrade.id)?.size ||
                                  0) > 0 && (
                                  <div className="mb-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {selectedUpgradeItems.get(upgrade.id)
                                        ?.size || 0}{" "}
                                      item(s) selected
                                    </span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          bulkHideUpgradeItems(upgrade.id)
                                        }
                                        className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                      >
                                        Hide
                                      </button>
                                      <button
                                        onClick={() =>
                                          bulkUnhideUpgradeItems(upgrade.id)
                                        }
                                        className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                      >
                                        Unhide
                                      </button>
                                      <button
                                        onClick={() =>
                                          bulkDeleteUpgradeItems(upgrade.id)
                                        }
                                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      >
                                        Delete
                                      </button>
                                      <button
                                        onClick={() =>
                                          bulkUnselectUpgradeItems(upgrade.id)
                                        }
                                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                      >
                                        Unselect
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <table className="w-full border border-gray-200 dark:border-gray-700 mt-2">
                                  <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"></th>
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
                                    {upgrade.items.map((uItem, itemIndex) =>
                                      uItem.isHeading ? (
                                        <tr
                                          key={uItem.id}
                                          draggable
                                          onDragStart={() =>
                                            handleUpgradeItemDragStart(
                                              upgrade.id,
                                              itemIndex
                                            )
                                          }
                                          onDragOver={(e) =>
                                            handleUpgradeItemDragOver(
                                              e,
                                              upgrade.id,
                                              itemIndex
                                            )
                                          }
                                          onDragEnd={handleUpgradeItemDragEnd}
                                          className="bg-gray-800 text-white cursor-move"
                                        >
                                          <td className="px-3 py-2">
                                            <GripVertical
                                              size={16}
                                              className="text-gray-400"
                                            />
                                          </td>
                                          <td className="px-3 py-2">
                                            <input
                                              type="checkbox"
                                              checked={(
                                                selectedUpgradeItems.get(
                                                  upgrade.id
                                                ) || new Set()
                                              ).has(uItem.id)}
                                              onChange={() =>
                                                toggleUpgradeItemSelection(
                                                  upgrade.id,
                                                  uItem.id
                                                )
                                              }
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
                                                          items: u.items.map(
                                                            (i) =>
                                                              i.id === uItem.id
                                                                ? {
                                                                    ...i,
                                                                    name: e
                                                                      .target
                                                                      .value,
                                                                  }
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
                                                onClick={() =>
                                                  deleteUpgradeItem(
                                                    upgrade.id,
                                                    uItem.id
                                                  )
                                                }
                                                className="text-white hover:text-gray-300"
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
                                                className="text-white hover:text-gray-300"
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
                                      ) : (
                                        <tr
                                          key={uItem.id}
                                          draggable
                                          onDragStart={() =>
                                            handleUpgradeItemDragStart(
                                              upgrade.id,
                                              itemIndex
                                            )
                                          }
                                          onDragOver={(e) =>
                                            handleUpgradeItemDragOver(
                                              e,
                                              upgrade.id,
                                              itemIndex
                                            )
                                          }
                                          onDragEnd={handleUpgradeItemDragEnd}
                                          className={
                                            uItem.checked
                                              ? "bg-gray-800 text-white cursor-move"
                                              : "cursor-move"
                                          }
                                        >
                                          <td className="px-3 py-2">
                                            <GripVertical
                                              size={16}
                                              className="text-gray-400"
                                            />
                                          </td>
                                          <td className="px-3 py-2">
                                            <input
                                              type="checkbox"
                                              checked={(
                                                selectedUpgradeItems.get(
                                                  upgrade.id
                                                ) || new Set()
                                              ).has(uItem.id)}
                                              onChange={() =>
                                                toggleUpgradeItemSelection(
                                                  upgrade.id,
                                                  uItem.id
                                                )
                                              }
                                              className="rounded"
                                            />
                                          </td>
                                          <td className="px-3 py-2 text-sm relative">
                                            <input
                                              type="text"
                                              value={uItem.name}
                                              onFocus={() => {
                                                setEditingUpgradeItemId({
                                                  upgradeId: upgrade.id,
                                                  itemId: uItem.id,
                                                });
                                                setShowUpgradeCatalogDropdown(
                                                  upgrade.id
                                                );
                                                setTimeout(
                                                  () =>
                                                    upgradeCatalogInputRef.current?.focus(),
                                                  100
                                                );
                                              }}
                                              readOnly
                                              className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 cursor-pointer"
                                            />
                                            {showUpgradeCatalogDropdown ===
                                              upgrade.id &&
                                              editingUpgradeItemId?.itemId ===
                                                uItem.id && (
                                                <div className="absolute top-full left-0 mt-1 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                      Editing: {uItem.name}
                                                    </div>
                                                    <input
                                                      ref={
                                                        upgradeCatalogInputRef
                                                      }
                                                      type="text"
                                                      value={
                                                        upgradeCatalogSearch
                                                      }
                                                      onChange={(e) =>
                                                        setUpgradeCatalogSearch(
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="Search catalog..."
                                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                      onBlur={() =>
                                                        setTimeout(() => {
                                                          setShowUpgradeCatalogDropdown(
                                                            null
                                                          );
                                                          setEditingUpgradeItemId(
                                                            null
                                                          );
                                                        }, 200)
                                                      }
                                                    />
                                                  </div>
                                                  <div className="max-h-64 overflow-y-auto">
                                                    {catalogItems
                                                      .filter((item) =>
                                                        item.name
                                                          .toLowerCase()
                                                          .includes(
                                                            upgradeCatalogSearch.toLowerCase()
                                                          )
                                                      )
                                                      .map((item, idx) => (
                                                        <button
                                                          key={idx}
                                                          onClick={() =>
                                                            addItemToUpgradeFromCatalog(
                                                              upgrade.id,
                                                              item
                                                            )
                                                          }
                                                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                                                        >
                                                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {item.name}
                                                          </div>
                                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.description}
                                                          </div>
                                                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                            ${item.unitCost} per{" "}
                                                            {item.unit}
                                                          </div>
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
                                                          items: u.items.map(
                                                            (i) =>
                                                              i.id === uItem.id
                                                                ? {
                                                                    ...i,
                                                                    description:
                                                                      e.target
                                                                        .value,
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
                                                          items: u.items.map(
                                                            (i) =>
                                                              i.id === uItem.id
                                                                ? {
                                                                    ...i,
                                                                    mapping:
                                                                      e.target
                                                                        .value,
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
                                                          items: u.items.map(
                                                            (i) =>
                                                              i.id === uItem.id
                                                                ? {
                                                                    ...i,
                                                                    coverage:
                                                                      e.target
                                                                        .value,
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
                                                          items: u.items.map(
                                                            (i) =>
                                                              i.id === uItem.id
                                                                ? {
                                                                    ...i,
                                                                    unitCost:
                                                                      e.target
                                                                        .value,
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
                                                          items: u.items.map(
                                                            (i) =>
                                                              i.id === uItem.id
                                                                ? {
                                                                    ...i,
                                                                    unit: e
                                                                      .target
                                                                      .value,
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
                                                          items: u.items.map(
                                                            (i) =>
                                                              i.id === uItem.id
                                                                ? {
                                                                    ...i,
                                                                    qty: e
                                                                      .target
                                                                      .value,
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
                                            {uItem.unitCost && uItem.qty
                                              ? `$${(
                                                  parseFloat(uItem.unitCost) *
                                                  parseFloat(uItem.qty)
                                                ).toFixed(2)}`
                                              : "$0.00"}
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
                                                          items: u.items.map(
                                                            (i) =>
                                                              i.id === uItem.id
                                                                ? {
                                                                    ...i,
                                                                    salesTax:
                                                                      e.target
                                                                        .value,
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
                                    )}
                                  </tbody>
                                </table>

                                <div className="flex gap-4 mt-4 text-sm relative">
                                  <div className="relative">
                                    <button
                                      onClick={() =>
                                        addItemToUpgrade(upgrade.id)
                                      }
                                      className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                    >
                                      <Plus size={14} />
                                      Add item from catalog
                                    </button>
                                    {showUpgradeCatalogDropdown ===
                                      upgrade.id && (
                                      <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                          <input
                                            ref={upgradeCatalogInputRef}
                                            type="text"
                                            value={upgradeCatalogSearch}
                                            onChange={(e) =>
                                              setUpgradeCatalogSearch(
                                                e.target.value
                                              )
                                            }
                                            placeholder="Search catalog..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            onBlur={() =>
                                              setTimeout(
                                                () =>
                                                  setShowUpgradeCatalogDropdown(
                                                    null
                                                  ),
                                                200
                                              )
                                            }
                                          />
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                          {catalogItems
                                            .filter((item) =>
                                              item.name
                                                .toLowerCase()
                                                .includes(
                                                  upgradeCatalogSearch.toLowerCase()
                                                )
                                            )
                                            .map((item, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() =>
                                                  addItemToUpgradeFromCatalog(
                                                    upgrade.id,
                                                    item
                                                  )
                                                }
                                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                                              >
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                  {item.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                  {item.description}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                  ${item.unitCost} per{" "}
                                                  {item.unit}
                                                </div>
                                              </button>
                                            ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() =>
                                      addSectionHeadingToUpgrade(upgrade.id)
                                    }
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
                                  onChange={(e) =>
                                    setDefaultMargin(e.target.value)
                                  }
                                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={minimumMargin}
                                  onChange={(e) =>
                                    setMinimumMargin(e.target.value)
                                  }
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

          {/* Contact Selection Modal */}
          {showContactModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select Contact</h3>
                  <button
                    onClick={() => {
                      setShowContactModal(false);
                      setContactSearch("");
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      placeholder="Search contacts..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {loadingContacts ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading contacts...</div>
                    ) : contacts && contacts.length > 0 ? (
                      contacts.map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => {
                              setSelectedContact(contact);
                              setCustomerName(contact.fullName || contact.full_name);
                              setCustomerEmail(contact.email || "");
                              setCustomerPhone(contact.phone || "");
                              setCustomerAddress(contact.address || "");
                              setShowContactModal(false);
                              setContactSearch("");
                            }}
                            className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {contact.fullName || contact.full_name}
                            </div>
                            {contact.company && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{contact.company}</div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {contact.email}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {contact.phone}
                            </div>
                          </button>
                        ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        {contactSearch ? "No contacts found" : "Type to search contacts"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Modal */}
          {showValidationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Cannot Send Proposal
                  </h3>
                  <button
                    onClick={() => setShowValidationModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Please complete the following before sending:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        items.length > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        {items.length > 0 ? (
                          <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 text-xs">✗</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          items.length > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          Add items to the proposal
                        </p>
                        {items.length === 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Click "Edit option" to add items from catalog
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        customerName !== "Customer Name" && customerName ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        {customerName !== "Customer Name" && customerName ? (
                          <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 text-xs">✗</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          customerName !== "Customer Name" && customerName ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          Select a customer or client
                        </p>
                        {(customerName === "Customer Name" || !customerName) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Click on "Customer Name" in the Cover section to edit
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowValidationModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PDF Ready Modal */}
          {showMeasurementDownloadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    PDF Ready
                  </h2>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowMeasurementDownloadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const reportId = proposalData?.report?.response_data?.ReportIds?.[0];
                      if (!reportId) return;
                      
                      try {
                        const token = localStorage.getItem('token');
                        const API_BASE_URL = 'https://builderlyncapi.testenvapp.com/api';
                        
                        const reportResponse = await fetch(
                          `${API_BASE_URL}/eagleview/report?reportId=${reportId}`,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`
                            }
                          }
                        );
                        
                        const reportData = await reportResponse.json();
                        
                        if (reportData.success && reportData.data?.ReportDownloadLink) {
                          const link = document.createElement('a');
                          link.href = reportData.data.ReportDownloadLink;
                          link.setAttribute('download', `report-${reportId}.pdf`);
                          link.setAttribute('target', '_blank');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } else {
                          alert('Report download link not available.');
                        }
                      } catch (error) {
                        console.error('Error downloading report:', error);
                        alert('Failed to download report. Please try again.');
                      }
                      setShowMeasurementDownloadModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Download Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email Sidebar */}
          {showEmailSidebar && (
            <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Send Proposal</h3>
                <button
                  onClick={() => setShowEmailSidebar(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Recipient Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="recipient@email.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter subject"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Enter your message..."
                  />
                </div>

                {/* Message Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
                      style={{
                        borderColor: emailType === "marketing" ? "rgb(59, 130, 246)" : "rgb(209, 213, 219)",
                        backgroundColor: emailType === "marketing" ? "rgb(239, 246, 255)" : "transparent"
                      }}
                    >
                      <input
                        type="radio"
                        name="emailType"
                        value="marketing"
                        checked={emailType === "marketing"}
                        onChange={(e) => setEmailType(e.target.value as "marketing")}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Marketing</span>
                    </label>
                    <label className="relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
                      style={{
                        borderColor: emailType === "plain" ? "rgb(59, 130, 246)" : "rgb(209, 213, 219)",
                        backgroundColor: emailType === "plain" ? "rgb(239, 246, 255)" : "transparent"
                      }}
                    >
                      <input
                        type="radio"
                        name="emailType"
                        value="plain"
                        checked={emailType === "plain"}
                        onChange={(e) => setEmailType(e.target.value as "plain")}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Plain Text</span>
                    </label>
                  </div>
                </div>

                {/* Button Configuration */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      💡 All proposal email messages must include a button to a sent or signed proposal
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={buttonLabel}
                      onChange={(e) => setButtonLabel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Button label"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Links to <span className="text-red-500">*</span>
                    </label>
                    <select
                      disabled
                      value="proposal"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    >
                      <option value="proposal">Proposal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <button
                  onClick={async () => {
                    if (!customerEmail || !emailSubject || !buttonLabel) return;
                    
                    try {
                      setSendingEmail(true);
                      await proposalSharingApi.sendEmail(Number(proposalId), {
                        recipientEmail: customerEmail,
                        recipientName: customerName,
                        subject: emailSubject,
                        message: emailMessage
                      });
                      alert('Proposal sent successfully!');
                      setShowEmailSidebar(false);
                      onClose();
                    } catch (error: any) {
                      alert(error.response?.data?.message || 'Failed to send proposal. Please try again.');
                    } finally {
                      setSendingEmail(false);
                    }
                  }}
                  disabled={!customerEmail || !emailSubject || !buttonLabel || sendingEmail}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {sendingEmail ? 'Sending...' : 'Send Proposal'}
                </button>
              </div>
            </div>
          )}

          {/* Image Crop Modal */}
          {showCropModal && cropImage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Crop Cover Image
                  </h3>
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
                    onCropComplete={(_, croppedAreaPixels) =>
                      setCroppedAreaPixels(croppedAreaPixels)
                    }
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
                        if (croppedAreaPixels && cropImage) {
                          const croppedImage = await getCroppedImg(
                            cropImage,
                            croppedAreaPixels
                          );
                          setCoverImage(croppedImage);

                          // Upload to server using same API as photos/PDFs
                          try {
                            const blob = await fetch(croppedImage).then((r) =>
                              r.blob()
                            );
                            const file = new File([blob], "cover-image.jpg", {
                              type: "image/jpeg",
                            });

                            const API_BASE_URL =
                              import.meta.env.VITE_API_BASE_URL ||
                              "https://builderlyncapi.testenvapp.com/api";
                            const token = localStorage.getItem("token");

                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("sectionId", "cover");
                            formData.append("type", "photo");

                            const response = await fetch(
                              `${API_BASE_URL}/templates/${proposalId}/media`,
                              {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                                body: formData,
                              }
                            );

                            const result = await response.json();
                            if (result.success) {
                              setCoverImage(result.data.url);
                            }
                          } catch (error) {
                            console.error(
                              "Error uploading cover image:",
                              error
                            );
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
      )}
    </>
  );
}
