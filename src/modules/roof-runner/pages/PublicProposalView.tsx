import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import { proposalsApi, Proposal } from "../services/proposalsApi";

export default function PublicProposalView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      loadProposal();
    } else {
      setError("Invalid proposal link");
      setLoading(false);
    }
  }, [token]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const { proposalSharingApi } = await import("../services/proposalSharingApi");
      const data = await proposalSharingApi.getProposalByToken(token!);
      setProposal(data);
    } catch (error) {
      console.error("Error loading proposal:", error);
      setError("Proposal not found or link expired");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current || downloading) return;

    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = contentRef.current.cloneNode(true) as HTMLElement;

      const images = element.querySelectorAll("img");
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
          console.warn("Could not fetch image:", e);
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
          logging: false,
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
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading proposal...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || "Proposal not found"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            The proposal link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Proposal Review
        </h1>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={16} />
          {downloading ? "Generating..." : "Download PDF"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div ref={contentRef} className="max-w-4xl mx-auto space-y-8">
          {/* Cover Page */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 pdf-page" style={{ display: "flex", flexDirection: "column", minHeight: "800px" }}>
            <div className="relative h-[480px] bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {proposal.sections?.settings?.coverImage && (
                <img src={proposal.sections.settings.coverImage} alt="Cover" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-6 flex items-center justify-between flex-1">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {proposal.sections?.settings?.coverTitle || "Project Proposal"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {proposal.sections?.settings?.coverDate || new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {proposal.sections?.settings?.customerName || "Customer Name"}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mb-1">
                  {proposal.sections?.settings?.customerAddress || "Customer Address"}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mb-1">
                  {proposal.sections?.settings?.customerPhone || "(000) 000-0000"}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {proposal.sections?.settings?.customerEmail || "customer@email.com"}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {proposal.sections?.settings?.companyName || "Company Name"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {proposal.sections?.settings?.companyPhone || "(000) 000-0000"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {proposal.sections?.settings?.companyEmail || "company@email.com"}
                  </div>
                </div>
                {proposal.sections?.settings?.companyLogo && (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                    <img src={proposal.sections.settings.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estimate Page */}
          {proposal.sections?.items && proposal.sections.items.length > 0 && (
            <div className="bg-white dark:bg-gray-800 pdf-page" style={{ width: "816px", display: "flex", flexDirection: "column", padding: "32px" }}>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {proposal.sections?.settings?.optionTitle || "Option 1"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {proposal.sections?.settings?.optionDescription || ""}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {proposal.sections?.settings?.itemSectionTitle || "Item"}
                    </div>
                  </div>

                  {proposal.sections.items.filter((item: any) => item.visible).map((item: any) => (
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
                              <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {item.unitCost && <span>Unit Cost: ${item.unitCost}</span>}
                                {item.qty && <span>Qty: {item.qty}</span>}
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

                {proposal.sections?.upgrades && proposal.sections.upgrades.length > 0 && (
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                      {proposal.sections?.settings?.upgradesTitle || "Upgrades"}
                    </div>
                    {proposal.sections.upgrades.map((upgrade: any) => (
                      <div key={upgrade.id} className="mb-4 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="font-medium text-gray-900 dark:text-white mb-3">{upgrade.name}</div>
                        {upgrade.items.filter((item: any) => item.visible).map((item: any) => (
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
                )}
              </div>

              <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Company representative name</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {proposal.sections?.settings?.companyName || "Company Name"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {proposal.sections?.settings?.companyPhone || "(000) 000-0000"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {proposal.sections?.settings?.companyEmail || "company@email.com"}
                    </div>
                  </div>
                  {proposal.sections?.settings?.companyLogo && (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                      <img src={proposal.sections.settings.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Summary Page */}
          {proposal.sections?.items && proposal.sections.items.length > 0 && (
            <div className="bg-white dark:bg-gray-800 pdf-page" style={{ width: "816px", display: "flex", flexDirection: "column", padding: "32px" }}>
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Summary</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {proposal.sections?.settings?.optionTitle || "Option 1"}
                      </div>
                    </div>
                    <div className="space-y-2 py-2">
                      {(() => {
                        const subtotal = proposal.sections.items
                          .filter((item: any) => item.visible && !item.isHeading)
                          .reduce((sum: number, item: any) => sum + parseFloat(item.unitCost || "0") * parseFloat(item.qty || "0"), 0);
                        const margin = parseFloat(proposal.sections?.settings?.defaultMargin || "0");
                        const total = subtotal * (1 + margin / 100);
                        return (
                          <>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                              <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Margin ({margin}%)</span>
                              <span className="text-gray-900 dark:text-white">${(subtotal * margin / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="font-medium text-gray-900 dark:text-white">Total</span>
                              <span className="font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {proposal.sections?.upgrades && proposal.sections.upgrades.length > 0 && (
                    <div>
                      <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {proposal.sections?.settings?.upgradesTitle || "Upgrades"}
                        </div>
                      </div>
                      {proposal.sections.upgrades.map((upgrade: any) => {
                        const upgradeSubtotal = upgrade.items
                          .filter((item: any) => item.visible && !item.isHeading)
                          .reduce((sum: number, item: any) => sum + parseFloat(item.unitCost || "0") * parseFloat(item.qty || "0"), 0);
                        const margin = parseFloat(proposal.sections?.settings?.defaultMargin || "0");
                        const upgradeTotal = upgradeSubtotal * (1 + margin / 100);
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
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                    {(() => {
                      const estimateSubtotal = proposal.sections.items
                        .filter((item: any) => item.visible && !item.isHeading)
                        .reduce((sum: number, item: any) => sum + parseFloat(item.unitCost || "0") * parseFloat(item.qty || "0"), 0);
                      const upgradeSubtotal = (proposal.sections?.upgrades || []).reduce((sum: number, upgrade: any) => {
                        return sum + upgrade.items
                          .filter((item: any) => item.visible && !item.isHeading)
                          .reduce((itemSum: number, item: any) => itemSum + parseFloat(item.unitCost || "0") * parseFloat(item.qty || "0"), 0);
                      }, 0);
                      const margin = parseFloat(proposal.sections?.settings?.defaultMargin || "0");
                      const overallTotal = (estimateSubtotal + upgradeSubtotal) * (1 + margin / 100);
                      return (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">Overall Total</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">${overallTotal.toFixed(2)}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Company representative name</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {proposal.sections?.settings?.companyName || "Company Name"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {proposal.sections?.settings?.companyPhone || "(000) 000-0000"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {proposal.sections?.settings?.companyEmail || "company@email.com"}
                    </div>
                  </div>
                  {proposal.sections?.settings?.companyLogo && (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                      <img src={proposal.sections.settings.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
