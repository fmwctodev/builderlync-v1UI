import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { proposalsApi, Proposal } from "../services/proposalsApi";
import { getBusinessInfo, BusinessInfo } from "../../../shared/store/services/businessInfoApi";
import { useOrgPath } from "../../../shared/hooks/useOrgPath";

export default function ProposalPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrgPath } = useOrgPath();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
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

  useEffect(() => {
    if (id) {
      loadProposal();
      loadBusinessInfo();
    }
  }, [id]);

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

  const getCompanyName = () => {
    return businessInfo?.friendly_business_name || proposal?.sections?.settings?.companyName || "Company Name";
  };

  const getCompanyPhone = () => {
    return businessInfo?.business_phone || businessInfo?.representative_phone || "(000) 000-0000";
  };

  const getCompanyEmail = () => {
    return businessInfo?.representative_email || proposal?.sections?.settings?.companyEmail || "company@email.com";
  };

  const getCompanyLogo = () => {
    return businessInfo?.business_logo || proposal?.sections?.settings?.companyLogo || null;
  };

  const getRepresentativeName = () => {
    if (businessInfo?.representative_first_name && businessInfo?.representative_last_name) {
      return `${businessInfo.representative_first_name} ${businessInfo.representative_last_name}`;
    }
    return "Company representative name";
  };

  const handleDownload = async () => {
    if (!contentRef.current || downloading) return;

    setDownloading(true);
    
    const pages = contentRef.current.querySelectorAll('.pdf-page');
    pages.forEach((page) => {
      (page as HTMLElement).style.marginBottom = '0';
    });

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = contentRef.current.cloneNode(true) as HTMLElement;

      // Convert images to base64 via backend proxy to avoid CORS
      const images = element.querySelectorAll('img');
      const imagePromises = Array.from(images).map(async (img) => {
        try {
          const imgElement = img as HTMLImageElement;
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

      const opt = {
        margin: 0,
        filename: `proposal-${
          proposal?.sections?.settings?.customerName || "document"
        }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          logging: false
        },
        jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
        pagebreak: {
          mode: "avoid",
          avoid: ["tr", "td", "li", "h1", "h2", "h3"],
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      pages.forEach((page) => {
        (page as HTMLElement).style.marginBottom = '';
      });
      setDownloading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Review and Sign
        </h1>
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
            {proposal.sections?.settings?.coverImage && (
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 pdf-page"
              >
                <div
                  className="relative h-[600px] bg-gray-100 dark:bg-gray-700 overflow-hidden"
                >
                  <img
                    src={proposal.sections.settings.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {proposal.sections.settings.coverTitle ||
                        "Project Proposal"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {proposal.sections.settings.coverDate ||
                        new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {proposal.sections.settings.customerName ||
                        "Customer Name"}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mb-1">
                      {proposal.sections.settings.customerAddress ||
                        "Customer Address"}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mb-1">
                      {proposal.sections.settings.customerPhone ||
                        "(000) 000-0000"}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {proposal.sections.settings.customerEmail ||
                        "customer@email.com"}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 p-6" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getRepresentativeName()}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getCompanyName()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getCompanyPhone()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getCompanyEmail()}
                      </div>
                    </div>
                    {getCompanyLogo() && (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={getCompanyLogo()!}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Estimate Section - Page 1 (Demo) */}
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
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {proposal.sections.settings?.optionTitle || "Option 1"}
                  </h2>
                  {proposal.sections.settings?.optionDescription && 
                    proposal.sections.settings.optionDescription !== "Add description" && (
                    <div
                      className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{ __html: toRichHtml(proposal.sections.settings.optionDescription) }}
                    />
                  )}
                </div>
                <div className="space-y-8">
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {proposal.sections.settings?.itemSectionTitle || "Item"}
                      </div>
                    </div>
                    {proposal.sections.items
                      .filter((item: any) => item.visible)
                      .map((item: any) => (
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
                                    <div
                                      className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                                      dangerouslySetInnerHTML={{ __html: toRichHtml(item.description) }}
                                    />
                                  )}
                                  <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {item.unitCost && (
                                      <span>Unit Cost: ${item.unitCost}</span>
                                    )}
                                    {item.qty && <span>Qty: {item.qty}</span>}
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
                  {proposal.sections.upgrades &&
                    proposal.sections.upgrades.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                          {proposal.sections.settings?.upgradesTitle ||
                            "Upgrades"}
                        </div>
                        {proposal.sections.upgrades.map((upgrade: any) => (
                          <div
                            key={upgrade.id}
                            className="mb-4 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
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
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900 dark:text-white">
                                            {item.name}
                                          </div>
                                          {item.description && (
                                            <div
                                              className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                                              dangerouslySetInnerHTML={{ __html: toRichHtml(item.description) }}
                                            />
                                          )}
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
                    )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8" style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getRepresentativeName()}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getCompanyName()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getCompanyPhone()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getCompanyEmail()}
                      </div>
                    </div>
                    {getCompanyLogo() && (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={getCompanyLogo()!}
                          alt="Logo"
                          className="w-full h-full object-cover"
                          
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Section - Page 2 */}
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
                      <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Subtotal
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          $
                          {proposal.sections.items
                            .filter(
                              (item: any) => item.visible && !item.isHeading
                            )
                            .reduce(
                              (sum: number, item: any) =>
                                sum +
                                parseFloat(item.unitCost || "0") *
                                  parseFloat(item.qty || "0"),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Margin (
                          {proposal.sections.settings?.defaultMargin || "0"}%)
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
                            (parseFloat(
                              proposal.sections.settings?.defaultMargin || "0"
                            ) /
                              100)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
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
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8" style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getRepresentativeName()}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getCompanyName()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getCompanyPhone()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getCompanyEmail()}
                      </div>
                    </div>
                    {getCompanyLogo() && (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={getCompanyLogo()!}
                          alt="Logo"
                          className="w-full h-full object-cover"
                          
                        />
                      </div>
                    )}
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
              .map((section: any) => (
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
                    <div className="grid grid-cols-2 gap-4">
                      {section.content.photos.map(
                        (photo: string, idx: number) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                        )
                      )}
                    </div>
                  )}
                  {section.type === "pdf" && section.content?.pdfs && (
                    <div className="space-y-4">
                      {section.content.pdfs.map((pdf: any, idx: number) => (
                        <div
                          key={idx}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                        >
                          <iframe
                            src={pdf.url}
                            className="w-full h-[600px]"
                            title={pdf.name}
                          />
                        </div>
                      ))}
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
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-8" style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getRepresentativeName()}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getCompanyName()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getCompanyPhone()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getCompanyEmail()}
                        </div>
                      </div>
                      {getCompanyLogo() && (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                          <img
                            src={getCompanyLogo()!}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            }
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
