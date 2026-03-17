import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import { proposalsApi, Proposal } from "../services/proposalsApi";
import { getBusinessInfo, BusinessInfo } from "../../../shared/store/services/businessInfoApi";
import { Contact, getContactById } from "../../../shared/store/services/contactsApi";
import { useOrgPath } from "../../../shared/hooks/useOrgPath";
import { PdfPagesPreview } from "../components/proposals/PdfPagesPreview";

type ProposalLineItem = {
  id: string | number;
  name?: string;
  description?: string;
  visible?: boolean;
  isHeading?: boolean;
  unitCost?: string;
  qty?: string;
};

const stripHtmlTags = (value?: string) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const getEstimateItemHeight = (item: ProposalLineItem) => {
  if (item.isHeading) return 44;

  const descriptionText = stripHtmlTags(item.description);
  const descriptionLines = descriptionText
    ? Math.min(5, Math.max(1, Math.ceil(descriptionText.length / 90)))
    : 0;
  const metaHeight = item.unitCost || item.qty ? 20 : 0;

  return 44 + metaHeight + descriptionLines * 17;
};

const paginateEstimateItems = (
  items: ProposalLineItem[],
  optionDescription?: string
) => {
  const descriptionPenalty =
    optionDescription && optionDescription !== "Add description"
      ? Math.min(
          126,
          22 + Math.ceil(stripHtmlTags(optionDescription).length / 90) * 17
        )
      : 0;

  const firstPageLimit = Math.max(590, 850 - descriptionPenalty);
  const continuedPageLimit = 934;
  const pages: ProposalLineItem[][] = [];
  let currentPage: ProposalLineItem[] = [];
  let currentHeight = 0;
  let currentPageLimit = firstPageLimit;

  items.forEach((item) => {
    const itemHeight = getEstimateItemHeight(item);
    const shouldKeepHeadingWithNextRow =
      item.isHeading &&
      currentPage.length > 0 &&
      currentHeight > currentPageLimit - 140;
    const wouldOverflow =
      currentPage.length > 0 && currentHeight + itemHeight > currentPageLimit;

    if (shouldKeepHeadingWithNextRow || wouldOverflow) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
      currentPageLimit = continuedPageLimit;
    }

    currentPage.push(item);
    currentHeight += itemHeight;
  });

  if (currentPage.length > 0 || pages.length === 0) {
    pages.push(currentPage);
  }

  return pages;
};

export default function ProposalPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getOrgPath } = useOrgPath();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
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
      .replace(/==(.+?)==/g, "<mark>$1</mark>")
      .replace(/\n/g, "<br/>");
  };

  const waitForImagesToLoad = async (root: HTMLElement) => {
    const images = Array.from(root.querySelectorAll("img"));

    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const image = img as HTMLImageElement;

            if (image.complete && image.naturalWidth > 0) {
              resolve();
              return;
            }

            image.onload = () => resolve();
            image.onerror = () => resolve();
          })
      )
    );
  };

  useEffect(() => {
    if (id) {
      loadProposal();
      loadBusinessInfo();
    }
  }, [id]);

  useEffect(() => {
    const contactId = proposal?.sections?.settings?.contactId;
    if (!contactId) {
      setContact(null);
      return;
    }

    loadContact(contactId);
  }, [proposal?.sections?.settings?.contactId]);

  useEffect(() => {
    if (!proposal || loading || downloading) return;
    if (searchParams.get("download") !== "1") return;

    handleDownload();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("download");
      return next;
    }, { replace: true });
  }, [proposal, loading, downloading, searchParams, setSearchParams]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const data = await proposalsApi.getProposalById(Number(id));
      setProposal(data);
    } catch (error) {
      console.error("Error loading proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessInfo = async () => {
    try {
      const response = await getBusinessInfo();
      setBusinessInfo(response.data);
    } catch (error) {
      console.error("Error loading business info:", error);
    }
  };

  const loadContact = async (contactId: string | number) => {
    try {
      const response = await getContactById(String(contactId));
      setContact(response.data || null);
    } catch (error) {
      console.error("Error loading contact:", error);
      setContact(null);
    }
  };

  const getCompanyName = () => {
    return businessInfo?.friendly_business_name || proposal?.sections?.settings?.companyName || "Company Name";
  };

  const getCompanyPhone = () => {
    return businessInfo?.business_phone || businessInfo?.representative_phone || "(000) 000-0000";
  };

  const getCompanyEmail = () => {
    return businessInfo?.representative_email || proposal?.sections?.settings?.companyEmail || "company@email.com";
  };

  const getCompanyWebsite = () => {
    const directWebsite =
      (businessInfo as any)?.business_website ||
      (businessInfo as any)?.website ||
      proposal?.sections?.settings?.companyWebsite ||
      "";

    if (directWebsite) {
      return String(directWebsite)
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "");
    }

    const email = getCompanyEmail();
    if (email.includes("@")) {
      return email.split("@")[1];
    }

    return "company.com";
  };

  const getCompanyLogo = () => {
    return businessInfo?.business_logo || proposal?.sections?.settings?.companyLogo || null;
  };

  const getClientDisplayName = () => {
    return contact?.fullName || contact?.full_name || proposal?.sections?.settings?.customerName || "Client Name";
  };

  const getClientEmail = () => {
    return contact?.email || proposal?.sections?.settings?.customerEmail || "customer@email.com";
  };

  const getClientPhone = () => {
    return contact?.phone || proposal?.sections?.settings?.customerPhone || "(000) 000-0000";
  };

  const getClientAddress = () => {
    return contact?.address || proposal?.sections?.settings?.customerAddress || "Customer Address";
  };

  const getRepresentativeName = () => {
    if (businessInfo?.representative_first_name && businessInfo?.representative_last_name) {
      return `${businessInfo.representative_first_name} ${businessInfo.representative_last_name}`;
    }
    return "Company representative name";
  };

  const estimateOptionTitle =
    proposal?.sections?.settings?.optionTitle || "Option 1";
  const estimateOptionDescription =
    proposal?.sections?.settings?.optionDescription;
  const estimateSectionTitle =
    proposal?.sections?.settings?.itemSectionTitle || "Item";
  const visibleEstimateItems = (
    (proposal?.sections?.items || []) as ProposalLineItem[]
  ).filter((item) => item.visible);
  const estimateItemPages = paginateEstimateItems(
    visibleEstimateItems,
    estimateOptionDescription
  );

  const renderAcceptancePage = () => (
    <div
      className="bg-white dark:bg-gray-800 pdf-page"
      style={{
        width: "816px",
        minHeight: "1056px",
        padding: "32px",
        position: "relative"
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <h2 className="text-[30px] font-bold tracking-tight text-gray-900 dark:text-white">
            Acceptance
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            By signing below, both parties agree to the terms, scope, deliverables, timeline, and pricing outlined in this proposal.
            This document shall serve as the binding agreement between both parties upon signature.
          </p>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Client
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Printed Name
                  </div>
                  <div className="mt-2 min-h-[72px] border-b border-gray-300 pb-2 dark:border-gray-600 flex items-end">
                    <div className="text-base text-gray-900 dark:text-white">&nbsp;</div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Date
                  </div>
                  <div className="mt-2 border-b border-gray-300 pb-2 text-base font-medium text-gray-900 dark:border-gray-600 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {getCompanyName()}
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Printed Name
                  </div>
                  <div className="mt-2 border-b border-gray-300 pb-2 text-base font-medium text-gray-900 dark:border-gray-600 dark:text-white">
                    {getRepresentativeName() || getCompanyName()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Date
                  </div>
                  <div className="mt-2 border-b border-gray-300 pb-2 text-base font-medium text-gray-900 dark:border-gray-600 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-gray-50 px-6 py-5 dark:bg-gray-900/50">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Questions about this proposal? We are happy to help.
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="break-all">{getCompanyEmail()}</span>
              <span>{getCompanyPhone()}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <div>Confidential — Prepared exclusively for the Client</div>
          <div className="mt-2 font-medium text-gray-700 dark:text-gray-300">
            {getCompanyWebsite()}
          </div>
        </div>
      </div>
    </div>
  );

  const handleDownload = async () => {
    if (!contentRef.current || downloading) return;

    setDownloading(true);
    
    const element = contentRef.current;
    const pages = element.querySelectorAll('.pdf-page');
    let originalImageSources: Array<{ img: HTMLImageElement; src: string }> = [];
    pages.forEach((page) => {
      (page as HTMLElement).style.marginBottom = '0';
    });

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const imageElements = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
      originalImageSources = imageElements.map((img) => ({
        img,
        src: img.src,
      }));

      const imagePromises = imageElements.map(async (imgElement) => {
        try {
          const originalSrc = imgElement.src;
          
          // Skip if already base64
          if (originalSrc.startsWith('data:')) {
            return true;
          }
          
          // Use backend proxy to fetch image
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
          const token = localStorage.getItem('token');
          
          const response = await fetch(`${API_BASE_URL}/proposals/proxy-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ imageUrl: originalSrc })
          });
          
          if (!response.ok) {
            console.warn('Failed to proxy image:', originalSrc);
            return false;
          }
          
          const data = await response.json();
          if (data.success && data.data.base64) {
            imgElement.src = data.data.base64;
            return true;
          }
          
          return false;
        } catch (e) {
          console.warn('Could not convert image:', e);
          return false;
        }
      });

      await Promise.all(imagePromises);
      await waitForImagesToLoad(element);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const pdfPages = Array.from(element.querySelectorAll(".pdf-page")) as HTMLElement[];

      for (let index = 0; index < pdfPages.length; index += 1) {
        const page = pdfPages[index];
        const canvas = await html2canvas(page, {
          scale: 2,
          logging: false,
          backgroundColor: "#ffffff",
          useCORS: true,
        });
        const imageData = canvas.toDataURL("image/jpeg", 0.98);

        if (index > 0) {
          pdf.addPage("letter", "portrait");
        }

        pdf.addImage(imageData, "JPEG", 0, 0, 612, 792);
      }

      pdf.save(
        `proposal-${proposal?.sections?.settings?.customerName || "document"}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      originalImageSources.forEach(({ img, src }) => {
        img.src = src;
      });
      pages.forEach((page) => {
        (page as HTMLElement).style.marginBottom = '';
      });
      setDownloading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={downloading}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            title="Download PDF"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => navigate(getOrgPath("/proposals"))}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
          >
            Finish
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            Loading preview...
          </div>
        </div>
      ) : !proposal ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            Proposal not found
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <style>{`
            @media print {
              .pdf-page:not(:last-child) {
                page-break-after: always;
                page-break-inside: avoid;
                break-after: page;
                break-inside: avoid;
              }
            }
            @media screen {
              .pdf-page:not(:last-child) {
                margin-bottom: 2rem;
              }
            }
          `}</style>
          <div ref={contentRef} className="max-w-4xl mx-auto">
            {/* Cover Section */}
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 pdf-page"
              style={{ width: "816px", minHeight: "1056px", position: "relative", overflow: "hidden" }}
            >
              <div
                className="relative h-[600px] bg-gray-100 dark:bg-gray-700 overflow-hidden"
              >
                {proposal.sections?.settings?.coverImage ? (
                  <img
                    src={proposal.sections.settings.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
                )}
              </div>
              <div className="flex min-h-[456px] flex-col justify-between p-8">
                <div className="flex items-start justify-between gap-8">
                  <div className="max-w-[55%]">
                    <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {proposal.sections.settings?.coverTitle || "Project Proposal"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {proposal.sections.settings?.coverDate || new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="max-w-[35%] text-right text-sm">
                    <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                      {getClientDisplayName()}
                    </div>
                    <div className="mb-1 text-gray-600 dark:text-gray-400">
                      {getClientAddress()}
                    </div>
                    <div className="mb-1 text-gray-600 dark:text-gray-400">
                      {getClientPhone()}
                    </div>
                    <div className="break-all text-gray-600 dark:text-gray-400">
                      {getClientEmail()}
                    </div>
                  </div>
                </div>
                <div className="mt-auto border-t border-gray-200 pt-8 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-6">
                    <div className="min-w-0">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getRepresentativeName()}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {getCompanyName()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getCompanyPhone()}
                      </div>
                      <div className="break-all text-sm text-gray-600 dark:text-gray-400">
                        {getCompanyEmail()}
                      </div>
                    </div>
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                      {getCompanyLogo() ? (
                        <img
                          src={getCompanyLogo()!}
                          alt="Logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Logo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimate Section */}
            {proposal.sections?.items &&
              estimateItemPages.map((pageItems, pageIndex) => {
                const isFirstEstimatePage = pageIndex === 0;
                const shouldShowOptionDescription =
                  isFirstEstimatePage &&
                  estimateOptionDescription &&
                  estimateOptionDescription !== "Add description";

                return (
                  <div
                    key={`estimate-page-${pageIndex}`}
                    className="bg-white dark:bg-gray-800 pdf-page"
                    style={{
                      width: "816px",
                      position: "relative",
                      padding: "32px",
                      minHeight: "1056px"
                    }}
                  >
                    <div className="mb-8">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {estimateOptionTitle}
                          </h2>
                          {!isFirstEstimatePage && (
                            <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                              Continued
                            </div>
                          )}
                        </div>
                        {estimateItemPages.length > 1 && (
                          <div className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:border-gray-600 dark:text-gray-400">
                            Page {pageIndex + 1} of {estimateItemPages.length}
                          </div>
                        )}
                      </div>
                      {shouldShowOptionDescription && (
                        <div
                          className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{
                            __html: toRichHtml(estimateOptionDescription),
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between gap-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {estimateSectionTitle}
                        </div>
                        {!isFirstEstimatePage && (
                          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                            Continued
                          </div>
                        )}
                      </div>
                      {pageItems.map((item) => (
                        <div
                          key={item.id}
                          className="border-b border-gray-100 py-3 last:border-b-0 dark:border-gray-700"
                        >
                          {item.isHeading ? (
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                          ) : (
                            <div className="pl-3 text-sm">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {item.name}
                                  </div>
                                  {item.description && (
                                    <div
                                      className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                                      dangerouslySetInnerHTML={{
                                        __html: toRichHtml(item.description),
                                      }}
                                    />
                                  )}
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {item.unitCost && (
                                      <span>Unit Cost: ${item.unitCost}</span>
                                    )}
                                    {item.qty && <span>Qty: {item.qty}</span>}
                                  </div>
                                </div>
                                {item.unitCost && item.qty && (
                                  <div className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
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
                  </div>
                );
              })}

            {proposal.sections?.upgrades &&
              proposal.sections.upgrades.length > 0 && (
                <div
                  className="bg-white dark:bg-gray-800 pdf-page"
                  style={{
                    width: "816px",
                    position: "relative",
                    padding: "32px",
                    minHeight: "1056px"
                  }}
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {proposal.sections.settings?.upgradesTitle || "Upgrades"}
                    </h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Optional add-ons and alternate scope items.
                    </div>
                  </div>
                  <div className="space-y-4">
                    {proposal.sections.upgrades.map((upgrade: any) => (
                      <div
                        key={upgrade.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                      >
                        <div className="font-medium text-gray-900 dark:text-white mb-3">
                          {upgrade.name}
                        </div>
                        {upgrade.items
                          .filter((item: any) => item.visible)
                          .map((item: any) => (
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
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                      </div>
                                      {item.description && (
                                        <div
                                          className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                                          dangerouslySetInnerHTML={{
                                            __html: toRichHtml(item.description),
                                          }}
                                        />
                                      )}
                                    </div>
                                    {item.unitCost && item.qty && (
                                      <div className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
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
              )}

            {/* Summary Section */}
            {proposal.sections?.items && (
              <div
                className="bg-white dark:bg-gray-800 pdf-page"
                style={{
                  width: "816px",
                  position: "relative",
                  padding: "32px",
                  minHeight: "1056px"
                }}
              >
                <div className="flex-1">
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Summary
                    </h2>
                  </div>
                  <div className="space-y-8">
                    <div>
                      {/* <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {proposal.sections.settings?.optionTitle ||
                            "Option 1"}
                        </div>
                      </div> */}
                      {/* {proposal.sections.settings?.optionDescription && 
                        proposal.sections.settings.optionDescription !== "Add description" && (
                        <div className="flex justify-between items-center py-2 pl-3">
                          <span
                            className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                            dangerouslySetInnerHTML={{ __html: toRichHtml(proposal.sections.settings.optionDescription) }}
                          />
                        </div>
                      )} */}
                      <div className="mt-4 flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          $
                          {(
                            proposal.sections.items
                              .filter(
                                (item: any) => item.visible && !item.isHeading
                              )
                              .reduce(
                                (sum: number, item: any) =>
                                  sum +
                                  parseFloat(item.unitCost || "0") *
                                    parseFloat(item.qty || "0"),
                                0
                              ) *
                            (1 +
                              parseFloat(
                                proposal.sections.settings?.defaultMargin || "0"
                              ) /
                                100)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {proposal.sections.upgrades &&
                      proposal.sections.upgrades.length > 0 && (
                        <div>
                          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {proposal.sections.settings?.upgradesTitle ||
                                "Upgrades"}
                            </div>
                          </div>
                          {proposal.sections.upgrades.map((upgrade: any) => {
                            const upgradeSubtotal = upgrade.items
                              .filter(
                                (item: any) => item.visible && !item.isHeading
                              )
                              .reduce(
                                (sum: number, item: any) =>
                                  sum +
                                  parseFloat(item.unitCost || "0") *
                                    parseFloat(item.qty || "0"),
                                0
                              );
                            const upgradeTotal =
                              upgradeSubtotal *
                              (1 +
                                parseFloat(
                                  proposal.sections.settings?.defaultMargin ||
                                    "0"
                                ) /
                                  100);
                            return (
                              <div
                                key={upgrade.id}
                                className="mb-2 pl-3 text-sm"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {upgrade.name}
                                    </div>
                                  </div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    ${upgradeTotal.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Total
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              $
                              {proposal.sections.upgrades
                                .reduce((sum: number, upgrade: any) => {
                                  const upgradeSubtotal = upgrade.items
                                    .filter(
                                      (item: any) =>
                                        item.visible && !item.isHeading
                                    )
                                    .reduce(
                                      (itemSum: number, item: any) =>
                                        itemSum +
                                        parseFloat(item.unitCost || "0") *
                                          parseFloat(item.qty || "0"),
                                      0
                                    );
                                  return (
                                    sum +
                                    upgradeSubtotal *
                                      (1 +
                                        parseFloat(
                                          proposal.sections.settings
                                            ?.defaultMargin || "0"
                                        ) /
                                          100)
                                  );
                                }, 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          Overall Total
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          $
                          {(
                            proposal.sections.items
                              .filter(
                                (item: any) => item.visible && !item.isHeading
                              )
                              .reduce(
                                (sum: number, item: any) =>
                                  sum +
                                  parseFloat(item.unitCost || "0") *
                                    parseFloat(item.qty || "0"),
                                0
                              ) *
                              (1 +
                                parseFloat(
                                  proposal.sections.settings?.defaultMargin ||
                                    "0"
                                ) /
                                  100) +
                            (proposal.sections.upgrades?.reduce(
                              (sum: number, upgrade: any) => {
                                const upgradeSubtotal = upgrade.items
                                  .filter(
                                    (item: any) =>
                                      item.visible && !item.isHeading
                                  )
                                  .reduce(
                                    (itemSum: number, item: any) =>
                                      itemSum +
                                      parseFloat(item.unitCost || "0") *
                                        parseFloat(item.qty || "0"),
                                    0
                                  );
                                return (
                                  sum +
                                  upgradeSubtotal *
                                    (1 +
                                      parseFloat(
                                        proposal.sections.settings
                                          ?.defaultMargin || "0"
                                      ) /
                                        100)
                                );
                              },
                              0
                            ) || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        By signing this document you agree to the statement of
                        works provided by{" "}
                        {getCompanyName() ||
                          "Company Name"}{" "}
                        and in accordance with any terms described within.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photos and Other Sections */}
            {proposal.sections?.sections
              ?.filter(
                (s: any) =>
                  s.name !== "Cover" && s.name !== "Estimate" && s.active
              )
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((section: any) => {
                if (section.type === "pdf" && section.content?.pdfs) {
                  return (
                    <React.Fragment key={section.id}>
                      {section.content.pdfs.map((pdf: any, idx: number) => (
                        <PdfPagesPreview
                          key={`${section.id}-${idx}`}
                          url={pdf.url}
                          title={pdf.name}
                          variant="proposal"
                          sectionTitle={section.name}
                          showSectionTitle={idx === 0}
                        />
                      ))}
                    </React.Fragment>
                  );
                }

                return (
                  <div
                    key={section.id}
                    className="bg-white dark:bg-gray-800 pdf-page"
                    style={{
                      width: "816px",
                      minHeight: "1056px",
                      padding: "32px",
                      position: "relative"
                    }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {section.name}
                    </h2>
                    {section.type === "photos" && section.content?.photos && (
                      <div className="grid grid-cols-3 gap-3">
                        {section.content.photos.map(
                          (photo: string, idx: number) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                                <img
                                  src={photo}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400">
                                {`Photo ${idx + 1}`}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {section.type === "text" && (
                      <div
                        className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{
                          __html: toRichHtml(
                            section.content?.description ||
                              section.content?.text ||
                              "Section content"
                          ),
                        }}
                      />
                    )}
                  </div>
                );
              })
            }
            {renderAcceptancePage()}
          </div>
        </div>
      )}
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Download PDF
            </h3>
            {downloading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Generating PDF...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to download this proposal as PDF?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Download
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
