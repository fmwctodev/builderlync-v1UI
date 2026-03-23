import jsPDF from 'jspdf';
import type { ProposalWithLineItems, ProposalLineItem } from '../types/proposalIntegration';

export interface GeneratePdfOptions {
  includeSignatureBlock?: boolean;
  companyName?: string;
  companyLogo?: string;
}

export async function generateProposalPdf(
  proposal: ProposalWithLineItems,
  options: GeneratePdfOptions = {}
): Promise<Blob> {
  const { includeSignatureBlock = true, companyName = 'Your Company' } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(proposal.title, margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Status: ${proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}`, margin, yPosition);
  yPosition += 10;

  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  if (proposal.property_address) {
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Property Address', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(proposal.property_address, margin, yPosition);
    yPosition += 12;
  }

  if (proposal.content?.projectSummary) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Summary', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(proposal.content.projectSummary.replace(/[#*]/g, ''), contentWidth);
    doc.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 5 + 10;
  }

  if (proposal.line_items && proposal.line_items.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Line Items', margin, yPosition);
    yPosition += 8;

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 4, contentWidth, 8, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60);
    doc.text('Item', margin + 2, yPosition);
    doc.text('Qty', margin + 80, yPosition);
    doc.text('Unit', margin + 100, yPosition);
    doc.text('Unit Price', margin + 120, yPosition);
    doc.text('Total', margin + 150, yPosition, { align: 'right' });
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    let subtotal = 0;
    for (const item of proposal.line_items) {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;

      if (yPosition > 260) {
        doc.addPage();
        yPosition = margin;
      }

      const itemName = item.name || item.item_name || 'Unnamed item';
      doc.text(itemName.substring(0, 30), margin + 2, yPosition);
      doc.text(item.quantity.toString(), margin + 80, yPosition);
      doc.text(item.unit || '', margin + 100, yPosition);
      doc.text(`$${item.unit_price.toFixed(2)}`, margin + 120, yPosition);
      doc.text(`$${itemTotal.toFixed(2)}`, margin + 150, yPosition, { align: 'right' });
      yPosition += 6;
    }

    yPosition += 4;
    doc.line(margin + 100, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Total:', margin + 120, yPosition);
    doc.text(`$${subtotal.toFixed(2)}`, margin + 150, yPosition, { align: 'right' });
    yPosition += 15;
  }

  const assumptions = proposal.content?.sections?.find(s => s.type === 'assumptions');
  if (assumptions?.content) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Assumptions', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const assumptionLines = doc.splitTextToSize(assumptions.content, contentWidth);
    doc.text(assumptionLines, margin, yPosition);
    yPosition += assumptionLines.length * 4 + 10;
  }

  if (includeSignatureBlock) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = margin;
    }

    yPosition = doc.internal.pageSize.getHeight() - 60;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Acceptance', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('By signing below, I accept this proposal and authorize the work to begin.', margin, yPosition);
    yPosition += 15;

    doc.line(margin, yPosition, margin + 80, yPosition);
    doc.text('Customer Signature', margin, yPosition + 5);

    doc.line(margin + 100, yPosition, margin + 150, yPosition);
    doc.text('Date', margin + 100, yPosition + 5);
    yPosition += 15;

    doc.line(margin, yPosition, margin + 80, yPosition);
    doc.text('Printed Name', margin, yPosition + 5);
  }

  return doc.output('blob');
}

export async function downloadProposalPdf(
  proposal: ProposalWithLineItems,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const blob = await generateProposalPdf(proposal, options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${proposal.title.replace(/[^a-z0-9]/gi, '_')}_proposal.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function getProposalPdfUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
