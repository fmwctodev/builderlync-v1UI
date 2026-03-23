export type DownloadResult = {
  success: boolean;
  error?: string;
};

function createDownloadLink(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadPdf(
  pdfUrl: string | null,
  orderId: string
): Promise<DownloadResult> {
  if (!pdfUrl) {
    return { success: false, error: 'PDF not available for this order' };
  }

  try {
    window.open(pdfUrl, '_blank');
    return { success: true };
  } catch (err) {
    console.error('Error opening PDF:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to open PDF',
    };
  }
}

export async function downloadJson(
  jsonUrl: string | null,
  jsonBody: Record<string, unknown> | null,
  orderId: string
): Promise<DownloadResult> {
  try {
    if (jsonUrl) {
      window.open(jsonUrl, '_blank');
      return { success: true };
    }

    if (jsonBody) {
      const jsonString = JSON.stringify(jsonBody, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const filename = `order_${orderId.substring(0, 8)}.json`;
      createDownloadLink(blob, filename);
      return { success: true };
    }

    return { success: false, error: 'JSON data not available for this order' };
  } catch (err) {
    console.error('Error downloading JSON:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to download JSON',
    };
  }
}

export async function downloadXml(
  xmlUrl: string | null,
  xmlBody: string | null,
  orderId: string
): Promise<DownloadResult> {
  try {
    if (xmlUrl) {
      window.open(xmlUrl, '_blank');
      return { success: true };
    }

    if (xmlBody) {
      const blob = new Blob([xmlBody], { type: 'application/xml' });
      const filename = `order_${orderId.substring(0, 8)}.xml`;
      createDownloadLink(blob, filename);
      return { success: true };
    }

    return { success: false, error: 'XML data not available for this order' };
  } catch (err) {
    console.error('Error downloading XML:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to download XML',
    };
  }
}

export function hasJsonOutput(
  jsonUrl: string | null,
  jsonBody: Record<string, unknown> | null
): boolean {
  return jsonUrl !== null || jsonBody !== null;
}

export function hasXmlOutput(
  xmlUrl: string | null,
  xmlBody: string | null
): boolean {
  return xmlUrl !== null || xmlBody !== null;
}

export function hasPdfOutput(pdfUrl: string | null): boolean {
  return pdfUrl !== null;
}
