import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { proposalsApi, Proposal } from "../services/proposalsApi";

export default function ProposalPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadProposal();
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

      // Fetch and convert images to base64
      const images = element.querySelectorAll('img');
      const imagePromises = Array.from(images).map(async (img) => {
        try {
          const imgElement = img as HTMLImageElement;
          const response = await fetch(imgElement.src);
          const blob = await response.blob();
          const reader = new FileReader();
          
          return new Promise((resolve) => {
            reader.onloadend = () => {
              imgElement.src = reader.result as string;
              resolve(true);
            };
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Could not fetch image:', e);
          return Promise.resolve(false);
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
            onClick={() => navigate("/proposals")}
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
                      <div className="font-medium text-gray-900 dark:text-white">
                        {proposal.sections.settings.companyName ||
                          "Company Name"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {proposal.sections.settings.companyPhone ||
                          "(000) 000-0000"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {proposal.sections.settings.companyEmail ||
                          "company@email.com"}
                      </div>
                    </div>
                    {proposal.sections.settings.companyLogo && (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={proposal.sections.settings.companyLogo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other Sections - Disabled to show only 3 main pages
            {proposal.sections?.sections
              ?.filter(
                (s: any) =>
                  s.name !== "Cover" && s.name !== "Estimate" && s.active
              )
              .map((section: any) => (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-800 pdf-page"
                  style={{
                    width: "816px",
                    height: "1056px",
                    padding: "32px",
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
                            crossOrigin="anonymous"
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
                    <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {section.content?.description ||
                        section.content?.text ||
                        "Section content"}
                    </div>
                  )}
                </div>
              ))
            */}

            {/* Estimate Section - Page 1 */}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {proposal.sections.settings.optionDescription}
                    </p>
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
                                    <div className="text-gray-600 dark:text-gray-400">
                                      {item.description}
                                    </div>
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
                                            <div className="text-gray-600 dark:text-gray-400">
                                              {item.description}
                                            </div>
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
                        Company representative name
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {proposal.sections.settings?.companyName ||
                          "Company Name"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {proposal.sections.settings?.companyPhone ||
                          "(000) 000-0000"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {proposal.sections.settings?.companyEmail ||
                          "company@email.com"}
                      </div>
                    </div>
                    {proposal.sections.settings?.companyLogo && (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={proposal.sections.settings.companyLogo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
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
                      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {proposal.sections.settings?.optionTitle ||
                            "Option 1"}
                        </div>
                      </div>
                      {proposal.sections.settings?.optionDescription && 
                        proposal.sections.settings.optionDescription !== "Add description" && (
                        <div className="flex justify-between items-center py-2 pl-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {proposal.sections.settings.optionDescription}
                          </span>
                        </div>
                      )}
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
                        {proposal.sections.settings?.companyName ||
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
                        Company representative name
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {proposal.sections.settings?.companyName ||
                          "Company Name"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {proposal.sections.settings?.companyPhone ||
                          "(000) 000-0000"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {proposal.sections.settings?.companyEmail ||
                          "company@email.com"}
                      </div>
                    </div>
                    {proposal.sections.settings?.companyLogo && (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={proposal.sections.settings.companyLogo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
