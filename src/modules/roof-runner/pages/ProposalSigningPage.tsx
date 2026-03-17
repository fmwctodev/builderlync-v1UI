import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Download, Loader, PenTool } from 'lucide-react';
import { proposalSharingApi } from '../services/proposalSharingApi';
import { eSignatureApi } from '../services/eSignatureApi';
import { SignatureCapture } from '@/shared/components';
import type { ProposalSignature, SignatureRequest, VerifyTokenResponse } from '../types/eSignature';
import { PdfPagesPreview } from '../components/proposals/PdfPagesPreview';

const PAGE_WIDTH = 816;
const PDF_PAGE_HEIGHT = 1028;
const COVER_PAGE_MIN_HEIGHT = 1056;
const CONTENT_PAGE_MIN_HEIGHT = 720;
const PAGE_PADDING = 32;

export default function ProposalSigningPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<any | null>(null);
  const [signatureRequest, setSignatureRequest] = useState<SignatureRequest | null>(null);
  const [signature, setSignature] = useState<any | null>(null);
  const [storedSignature, setStoredSignature] = useState<ProposalSignature | null>(null);
  const [submittingSignature, setSubmittingSignature] = useState(false);
  const [showSignatureForm, setShowSignatureForm] = useState(false);
  const [signatureSubmitted, setSignatureSubmitted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const sanitizeRichHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || '', 'text/html');
    const allowedTags = new Set([
      'P', 'BR', 'DIV', 'SPAN',
      'B', 'STRONG', 'I', 'EM', 'U',
      'UL', 'OL', 'LI',
      'H1', 'H2', 'H3',
      'A', 'MARK',
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
            if (el.tagName === 'A' && ['href', 'target', 'rel'].includes(attr.name)) {
              continue;
            }
            el.removeAttribute(attr.name);
          }

          if (el.tagName === 'A') {
            const href = el.getAttribute('href') || '';
            const safeHref =
              href.startsWith('http://') ||
              href.startsWith('https://') ||
              href.startsWith('mailto:') ||
              href.startsWith('tel:') ||
              href.startsWith('#');

            if (!safeHref) {
              el.removeAttribute('href');
            }

            if (el.getAttribute('target') === '_blank') {
              el.setAttribute('rel', 'noopener noreferrer');
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
    if (!value) return '';
    if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeRichHtml(value);
    return escapeHtml(value)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/==(.+?)==/g, '<mark>$1</mark>')
      .replace(/\n/g, '<br/>');
  };

  const waitForImagesToLoad = async (root: HTMLElement) => {
    const images = Array.from(root.querySelectorAll('img'));

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
    if (token) {
      loadProposal();
      return;
    }
    setError('Invalid proposal link');
    setLoading(false);
  }, [token]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const result: VerifyTokenResponse = await eSignatureApi.verifyToken(token!);
        setProposal(result.snapshot?.frozen_html ? { ...result.proposal, frozen_html: result.snapshot.frozen_html } : result.proposal);
        setSignatureRequest(result.request);
        setStoredSignature(result.signature || null);

        if (result.request.status === 'signed') {
          setSignatureSubmitted(true);
          setShowSignatureForm(false);
          return;
        }

        if (result.request.status === 'pending') {
          await eSignatureApi.markAsViewed(result.request.id);
          setSignatureRequest({ ...result.request, status: 'viewed', viewed_at: new Date().toISOString() });
        }
        return;
      } catch (verifyError) {
        console.warn('E-sign token verification failed, falling back to proposal share token:', verifyError);
      }

      const result = await proposalSharingApi.getProposalByToken(token!);
      setProposal(result);
      setSignatureRequest(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSubmit = async () => {
    if (!signature) return;
    if (!signatureRequest?.id) {
      setError('This proposal link does not have an active signature request.');
      return;
    }

    setSubmittingSignature(true);
    try {
      const submittedSignature = await eSignatureApi.submitSignature(signatureRequest.id, signature);
      setStoredSignature(submittedSignature || null);
      setSignatureSubmitted(true);
      setShowSignatureForm(false);
      setSignatureRequest({
        ...signatureRequest,
        status: 'signed',
        signed_at: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to submit signature: ' + (err as Error).message);
    } finally {
      setSubmittingSignature(false);
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    let originalImageSources: Array<{ img: HTMLImageElement; src: string }> = [];
    let originalPageStyles: Array<{
      page: HTMLElement;
      width: string;
      minHeight: string;
      height: string;
      boxSizing: string;
      overflow: string;
      marginBottom: string;
    }> = [];
    let hiddenSignatureDisplay = '';
    const signatureForm = element.querySelector<HTMLElement>('[data-pdf-exclude="signature-form"]');

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      if (signatureForm) {
        hiddenSignatureDisplay = signatureForm.style.display;
        signatureForm.style.display = 'none';
      }
      const images = Array.from(element.querySelectorAll<HTMLImageElement>('img'));
      originalImageSources = images.map((img) => ({
        img,
        src: img.src,
      }));

      const imagePromises = images.map(async (img) => {
        try {
          const originalSrc = img.src;
          if (!originalSrc || originalSrc.startsWith('data:')) return;

          const response = await fetch(originalSrc);
          if (!response.ok) return;

          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          img.src = dataUrl;
        } catch (error) {
          console.warn('Could not inline image for PDF export:', error);
        }
      });

      await Promise.all(imagePromises);
      await waitForImagesToLoad(element);
      const pdfPages = element.querySelectorAll<HTMLElement>('.pdf-page');
      originalPageStyles = Array.from(pdfPages).map((page) => ({
        page,
        width: page.style.width,
        minHeight: page.style.minHeight,
        height: page.style.height,
        boxSizing: page.style.boxSizing,
        overflow: page.style.overflow,
        marginBottom: page.style.marginBottom,
      }));

      pdfPages.forEach((page) => {
        page.style.width = `${PAGE_WIDTH}px`;
        page.style.minHeight = `${PDF_PAGE_HEIGHT}px`;
        page.style.height = `${PDF_PAGE_HEIGHT}px`;
        page.style.boxSizing = 'border-box';
        page.style.overflow = 'hidden';
        page.style.marginBottom = '0';
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter',
      });

      for (let index = 0; index < pdfPages.length; index += 1) {
        const page = pdfPages[index];
        const canvas = await html2canvas(page, {
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff',
          useCORS: true,
        });
        const imageData = canvas.toDataURL('image/jpeg', 0.98);

        if (index > 0) {
          pdf.addPage('letter', 'portrait');
        }

        pdf.addImage(imageData, 'JPEG', 0, 0, 612, 792);
      }

      pdf.save(`proposal-${proposal?.sections?.settings?.customerName || 'document'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      const pdfPages = element.querySelectorAll<HTMLElement>('.pdf-page');
      Array.from(pdfPages).forEach((page) => {
        const original = originalPageStyles.find((entry) => entry.page === page);
        if (!original) return;
        page.style.width = original.width;
        page.style.minHeight = original.minHeight;
        page.style.height = original.height;
        page.style.boxSizing = original.boxSizing;
        page.style.overflow = original.overflow;
        page.style.marginBottom = original.marginBottom;
      });
      originalImageSources.forEach(({ img, src }) => {
        img.src = src;
      });

      if (signatureForm) {
        signatureForm.style.display = hiddenSignatureDisplay;
      }
    }
  };

  const handleSignClick = () => {
    setShowSignatureForm(true);
    setTimeout(() => {
      signatureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const settings = proposal?.sections?.settings || {};
  const businessInfo = proposal?.business_info || null;
  const items = proposal?.sections?.items || [];
  const upgrades = proposal?.sections?.upgrades || [];
  const sectionsList = proposal?.sections?.sections || [];

  const getSubtotal = (rows: any[]) =>
    rows
      .filter((item: any) => item.visible && !item.isHeading)
      .reduce(
        (sum: number, item: any) =>
          sum + parseFloat(item.unitCost || '0') * parseFloat(item.qty || '0'),
        0,
      );

  const getMargin = () => parseFloat(settings.defaultMargin || '0');

  const getCompanyName = () =>
    businessInfo?.friendly_business_name ||
    businessInfo?.legal_business_name ||
    settings.companyName ||
    'Company Name';

  const getRepresentativeName = () => {
    const firstName = businessInfo?.representative_first_name?.trim?.() || '';
    const lastName = businessInfo?.representative_last_name?.trim?.() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || null;
  };

  const getCompanyPhone = () =>
    businessInfo?.business_phone ||
    businessInfo?.representative_phone ||
    settings.companyPhone ||
    '(000) 000-0000';

  const getCompanyEmail = () =>
    businessInfo?.business_email ||
    businessInfo?.representative_email ||
    settings.companyEmail ||
    'company@email.com';

  const getCompanyWebsite = () => {
    const directWebsite =
      businessInfo?.business_website ||
      businessInfo?.website ||
      settings.companyWebsite ||
      '';

    if (directWebsite) {
      return directWebsite
        .replace(/^https?:\/\//, '')
        .replace(/\/+$/, '');
    }

    const email = getCompanyEmail();
    if (email.includes('@')) {
      return email.split('@')[1];
    }

    return 'company.com';
  };

  const getCompanyLogo = () =>
    businessInfo?.business_logo ||
    settings.companyLogo ||
    null;

  const getClientDisplayName = () =>
    storedSignature?.signer_name ||
    signatureRequest?.signer_name ||
    settings.customerName ||
    'Client Name';

  const getClientPrintedName = () =>
    storedSignature?.signature_type === 'typed' && storedSignature?.typed_text
      ? storedSignature.typed_text
      : getClientDisplayName();

  const getFooter = () => (
    <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          {getRepresentativeName() && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {getRepresentativeName()}
            </div>
          )}
          <div className="font-semibold text-gray-900 dark:text-white">
            {getCompanyName()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {getCompanyPhone()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 break-all">
            {getCompanyEmail()}
          </div>
        </div>
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
          {getCompanyLogo() ? (
            <img src={getCompanyLogo()} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Logo</span>
          )}
        </div>
      </div>
    </div>
  );

  const getPageClassName = () =>
    'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 pdf-page';

  const getPageStyle = (
    minHeight: number = CONTENT_PAGE_MIN_HEIGHT,
    extra?: React.CSSProperties,
  ): React.CSSProperties => ({
    width: `${PAGE_WIDTH}px`,
    minHeight: `${minHeight}px`,
    padding: `${PAGE_PADDING}px`,
    display: 'flex',
    flexDirection: 'column',
    ...extra,
  });

  const renderAcceptancePage = () => (
    <div className={getPageClassName()} style={getPageStyle(900)}>
      <div className="flex-1">
        <div className="mb-8">
          <h2 className="text-[30px] font-bold tracking-tight text-gray-900 dark:text-white">
            Acceptance
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            By signing below, both parties agree to the terms, scope, deliverables, timeline,
            and pricing outlined in this proposal. This document shall serve as the binding
            agreement between both parties upon signature.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Client
            </div>
            <div className="space-y-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Signature
                </div>
                <div className="mt-2 min-h-[72px] border-b border-gray-300 pb-2 dark:border-gray-600 flex items-end">
                  {signatureRequest?.status === 'signed' && storedSignature?.signature_type === 'drawn' && storedSignature.signature_image_url ? (
                    <img
                      src={storedSignature.signature_image_url}
                      alt="Client signature"
                      className="max-h-[56px] object-contain"
                    />
                  ) : signatureRequest?.status === 'signed' && storedSignature?.signature_type === 'typed' && storedSignature.typed_text ? (
                    <div className="text-2xl italic text-gray-900 dark:text-white">
                      {storedSignature.typed_text}
                    </div>
                  ) : (
                    <div className="text-base text-gray-900 dark:text-white">&nbsp;</div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Printed Name
                </div>
                <div className="mt-2 border-b border-gray-300 pb-2 text-base font-medium text-gray-900 dark:border-gray-600 dark:text-white">
                  {getClientPrintedName()}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Title
                </div>
                <div className="mt-2 border-b border-gray-300 pb-2 text-base text-gray-900 dark:border-gray-600 dark:text-white">
                  &nbsp;
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Date
                </div>
                <div className="mt-2 border-b border-gray-300 pb-2 text-base font-medium text-gray-900 dark:border-gray-600 dark:text-white">
                  {signatureRequest?.signed_at
                    ? new Date(signatureRequest.signed_at).toLocaleDateString()
                    : new Date().toLocaleDateString()}
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
                  Title
                </div>
                <div className="mt-2 border-b border-gray-300 pb-2 text-base text-gray-900 dark:border-gray-600 dark:text-white">
                  &nbsp;
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
  );

  const renderProposalContent = () => {
    if (!proposal) return null;

    const subtotal = getSubtotal(items);
    const margin = getMargin();
    const total = subtotal * (1 + margin / 100);
    const upgradesTotal = upgrades.reduce((sum: number, upgrade: any) => {
      return sum + getSubtotal(upgrade.items || []) * (1 + margin / 100);
    }, 0);
    const overallTotal = total + upgradesTotal;

    return (
      <>
        <div
          className={getPageClassName()}
          style={getPageStyle(COVER_PAGE_MIN_HEIGHT, { padding: 0, overflow: 'hidden' })}
        >
          <div className="relative flex h-full flex-col">
            <div className="relative h-[520px] bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {settings.coverImage ? (
                <img src={settings.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between p-8">
              <div className="flex items-start justify-between gap-8">
                <div className="max-w-[55%]">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
                    {settings.coverTitle || 'Project Proposal'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.coverDate || new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="max-w-[35%] text-right text-sm">
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    {getClientDisplayName()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">
                    {settings.customerAddress || 'Customer Address'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">
                    {settings.customerPhone || '(000) 000-0000'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 break-all">
                    {settings.customerEmail || 'customer@email.com'}
                  </div>
                </div>
              </div>

              {getFooter()}
            </div>
          </div>
        </div>

        {(items.length > 0 || upgrades.length > 0) && (
          <div className={getPageClassName()} style={getPageStyle()}>
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {settings.optionTitle || 'Option 1'}
                </h2>
                {settings.optionDescription && settings.optionDescription !== 'Add description' && (
                  <div
                    className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: toRichHtml(settings.optionDescription) }}
                  />
                )}
              </div>

              <div className="space-y-8">
                {items.length > 0 && (
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {settings.itemSectionTitle || 'Item'}
                      </div>
                    </div>

                    {items
                      .filter((item: any) => item.visible)
                      .map((item: any) => (
                        <div key={item.id}>
                          {item.isHeading ? (
                            <>
                              <hr className="border-gray-300 dark:border-gray-600 my-3" />
                              <div className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</div>
                            </>
                          ) : (
                            <div className="mb-3 pl-3 text-sm">
                              <div className="flex justify-between items-start gap-6">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                  {item.description && (
                                    <div
                                      className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                                      dangerouslySetInnerHTML={{ __html: toRichHtml(item.description) }}
                                    />
                                  )}
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {item.unitCost && <span>Unit Cost: ${item.unitCost}</span>}
                                    {item.qty && <span>Qty: {item.qty}</span>}
                                    {item.unit && <span>Unit: {item.unit}</span>}
                                  </div>
                                </div>
                                {item.unitCost && item.qty && (
                                  <div className="font-medium text-gray-900 dark:text-white shrink-0">
                                    ${(parseFloat(item.unitCost) * parseFloat(item.qty)).toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {upgrades.length > 0 && (
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {settings.upgradesTitle || 'Upgrades'}
                      </div>
                    </div>

                    {upgrades.map((upgrade: any) => (
                      <div key={upgrade.id} className="mb-4 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                        <div className="font-medium text-gray-900 dark:text-white mb-3">{upgrade.name}</div>
                        {(upgrade.items || [])
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
                                  <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                      {item.description && (
                                        <div
                                          className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                                          dangerouslySetInnerHTML={{ __html: toRichHtml(item.description) }}
                                        />
                                      )}
                                    </div>
                                    {item.unitCost && item.qty && (
                                      <div className="font-medium text-gray-900 dark:text-white shrink-0">
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
            </div>

          </div>
        )}

        {(items.length > 0 || upgrades.length > 0) && (
          <div className={getPageClassName()} style={getPageStyle()}>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Summary</h2>

              <div className="space-y-6">
                {items.length > 0 && (
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {settings.optionTitle || 'Option 1'}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Margin ({margin}%)</span>
                        <span className="text-gray-900 dark:text-white">${(subtotal * margin / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">Total</span>
                        <span className="font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {upgrades.length > 0 && (
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg mb-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {settings.upgradesTitle || 'Upgrades'}
                      </div>
                    </div>

                    {upgrades.map((upgrade: any) => {
                      const upgradeSubtotal = getSubtotal(upgrade.items || []);
                      const upgradeTotal = upgradeSubtotal * (1 + margin / 100);

                      return (
                        <div key={upgrade.id} className="mb-4 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                          <div className="font-medium text-gray-900 dark:text-white mb-3">{upgrade.name}</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                              <span className="text-gray-900 dark:text-white">${upgradeSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Margin ({margin}%)</span>
                              <span className="text-gray-900 dark:text-white">
                                ${(upgradeSubtotal * margin / 100).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="font-medium text-gray-900 dark:text-white">Total</span>
                              <span className="font-medium text-gray-900 dark:text-white">${upgradeTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Overall Total</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${overallTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    By signing this document you agree to the statement of work provided by{' '}
                    {getCompanyName()} and any terms described within.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {sectionsList
          .filter((section: any) => section.active && section.type !== 'cover' && section.type !== 'estimate')
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((section: any) => {
            if (section.type === 'pdf' && section.content?.pdfs) {
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
              <div key={section.id} className={getPageClassName()} style={getPageStyle()}>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{section.name}</h2>

                  {section.type === 'photos' && section.content?.photos && (
                    <div className="grid grid-cols-3 gap-3">
                      {section.content.photos.map((photo: string, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                            <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400">
                            {`Photo ${idx + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(section.type === 'text' || !section.type) && (
                    <div
                      className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html: toRichHtml(section.content?.description || section.content?.text || 'Section content'),
                      }}
                    />
                  )}
                </div>

              </div>
            );
          })}

        {renderAcceptancePage()}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {error || 'Proposal not found'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                The proposal link may be invalid or expired.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Proposal Review
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            From: <strong>{getCompanyName()}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            onClick={handleSignClick}
            disabled={signatureSubmitted}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PenTool size={16} />
            {signatureSubmitted ? 'Signed' : 'Sign'}
          </button>
        </div>
      </div>

      {signatureSubmitted && (
        <div className="bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 rounded-lg px-6 py-4 mx-6 mt-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5" />
            <div>
              <div className="font-semibold">Signature received</div>
              <div className="text-sm text-emerald-700 dark:text-emerald-200">
                This proposal has already been signed. You can download a copy below.
              </div>
            </div>
          </div>
        </div>
      )}

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
          {renderProposalContent()}

          {showSignatureForm && !signatureSubmitted && (
            <div
              ref={signatureRef}
              data-pdf-exclude="signature-form"
              className={`${getPageClassName()} mt-8`}
              style={getPageStyle(760)}
            >
              <div className="flex-1">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Sign the Proposal
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Review the agreement, confirm your name, and add your signature below.
                  </p>
                </div>

                {!signatureRequest?.id && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    This link can preview the proposal, but it does not have an active e-signature request yet.
                  </div>
                )}

                <div className="space-y-6">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6">
                    <SignatureCapture
                      signerName={getClientDisplayName() || 'Signer'}
                      onSignatureChange={setSignature}
                    />
                  </div>

                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400 mb-4">
                      Signer Details
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer Name</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getClientDisplayName()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 break-all">
                          {settings.customerEmail || 'customer@email.com'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <button
                    onClick={handleSignatureSubmit}
                    disabled={!signature || submittingSignature || !signatureRequest?.id}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    {submittingSignature && <Loader className="w-4 h-4 animate-spin" />}
                    {submittingSignature
                      ? 'Submitting...'
                      : signatureRequest?.id
                        ? 'Submit Signature'
                        : 'No Active Signature Request'}
                  </button>

                  <button
                    onClick={() => {
                      setShowSignatureForm(false);
                      setSignature(null);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
