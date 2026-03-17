import React, { CSSProperties, useEffect, useState } from "react";

declare global {
  interface Window {
    pdfjsLib?: any;
    __builderlyncPdfJsPromise?: Promise<any>;
  }
}

type PdfPagesPreviewProps = {
  url: string;
  title: string;
  variant?: "editor" | "proposal";
  sectionTitle?: string;
  showSectionTitle?: boolean;
  pageClassName?: string;
  pageStyle?: CSSProperties;
};

const PDF_JS_SRC = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js";
const PDF_JS_WORKER_SRC = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://builderlyncapi.testenvapp.com/api";

const getFallbackPreviewUrl = (url: string) => {
  if (!url) return url;

  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return `${url}#toolbar=0&navpanes=0&scrollbar=1`;
  }

  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
};

const loadPdfJs = async () => {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "";
    return window.pdfjsLib;
  }

  if (!window.__builderlyncPdfJsPromise) {
    window.__builderlyncPdfJsPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[data-pdfjs-src="${PDF_JS_SRC}"]`
      ) as HTMLScriptElement | null;

      if (existingScript) {
        if (window.pdfjsLib) {
          resolve(window.pdfjsLib);
          return;
        }

        existingScript.addEventListener("load", () => resolve(window.pdfjsLib), {
          once: true,
        });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load pdf.js")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = PDF_JS_SRC;
      script.async = true;
      script.dataset.pdfjsSrc = PDF_JS_SRC;
      script.onload = () => resolve(window.pdfjsLib);
      script.onerror = () => reject(new Error("Failed to load pdf.js"));
      document.body.appendChild(script);
    });
  }

  const pdfjsLib = await window.__builderlyncPdfJsPromise;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";
  return pdfjsLib;
};

const dataUrlToUint8Array = (dataUrl: string) => {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

const getPdfSource = async (url: string): Promise<string | Uint8Array> => {
  if (!url) {
    return url;
  }

  if (url.startsWith("data:")) {
    return dataUrlToUint8Array(url);
  }

  if (url.startsWith("blob:")) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  if (!token) {
    return url;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/proposals/proxy-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageUrl: url }),
    });

    if (!response.ok) {
      return url;
    }

    const data = await response.json();
    if (data?.data?.base64) {
      return dataUrlToUint8Array(data.data.base64);
    }

    return url;
  } catch (error) {
    console.warn("Failed to proxy PDF for preview:", error);
    return url;
  }
};

export function PdfPagesPreview({
  url,
  title,
  variant = "editor",
  sectionTitle,
  showSectionTitle = false,
  pageClassName,
  pageStyle,
}: PdfPagesPreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fallbackPreviewUrl = getFallbackPreviewUrl(url);

  useEffect(() => {
    let active = true;

    const renderPdfPages = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdfjsLib = await loadPdfJs();
        const pdfSource = await getPdfSource(url);
        const loadingTask =
          typeof pdfSource === "string"
            ? pdfjsLib.getDocument({
                url: pdfSource,
                disableWorker: true,
                isEvalSupported: false,
                useSystemFonts: true,
              })
            : pdfjsLib.getDocument({
                data: pdfSource,
                disableWorker: true,
                isEvalSupported: false,
                useSystemFonts: true,
              });
        const pdf = await loadingTask.promise;
        const renderedPages: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Canvas rendering is not available");
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          renderedPages.push(canvas.toDataURL("image/png"));
        }

        if (!active) return;
        setPages(renderedPages);
      } catch (renderError) {
        console.error("Failed to render PDF preview:", renderError);
        if (!active) return;
        setError("Preview unavailable");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    renderPdfPages();

    return () => {
      active = false;
    };
  }, [url]);

  if (variant === "proposal") {
    if (loading || error || pages.length === 0) {
      return (
        <div
          className={pageClassName || "bg-white dark:bg-gray-800 pdf-page"}
          style={
            pageStyle || {
              width: "816px",
              minHeight: "1056px",
              padding: "32px",
              position: "relative",
            }
          }
        >
          {showSectionTitle && (
            <div className="mb-4">
              {sectionTitle && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sectionTitle}
                </h2>
              )}
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {title}
              </div>
            </div>
          )}
          <div className="rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
            <iframe
              src={fallbackPreviewUrl}
              className="w-full h-[900px] bg-white"
              title={title}
              frameBorder="0"
            />
          </div>
        </div>
      );
    }

    return (
      <>
        {pages.map((pageSrc, index) => (
          <div
            key={`${title}-${index + 1}`}
            className={pageClassName || "bg-white dark:bg-gray-800 pdf-page"}
            style={
              pageStyle || {
                width: "816px",
                minHeight: "1056px",
                padding: "32px",
                position: "relative",
              }
            }
          >
            {showSectionTitle && index === 0 && (
              <div className="mb-4">
                {sectionTitle && (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {sectionTitle}
                  </h2>
                )}
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {title}
                </div>
              </div>
            )}
            <img
              src={pageSrc}
              alt={`${title} page ${index + 1}`}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        ))}
      </>
    );
  }

  if (loading || error || pages.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden dark:border-gray-600">
        <iframe
          src={fallbackPreviewUrl}
          className="w-full h-[600px] bg-white"
          title={title}
          frameBorder="0"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pages.map((pageSrc, index) => (
        <div
          key={`${title}-${index + 1}`}
          className={
            pageClassName || "overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600"
          }
          style={pageStyle}
        >
          <img
            src={pageSrc}
            alt={`${title} page ${index + 1}`}
            className="w-full bg-white"
          />
        </div>
      ))}
    </div>
  );
}
