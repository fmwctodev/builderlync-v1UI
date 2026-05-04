import React, { useState } from 'react';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';
import { buildAffiliateLink } from '../../services/affiliates-service';

interface AffiliateLinkButtonProps {
  referralCode: string;
  variant?: 'inline' | 'compact';
}

export const AffiliateLinkButton: React.FC<AffiliateLinkButtonProps> = ({
  referralCode,
  variant = 'inline',
}) => {
  const [copied, setCopied] = useState(false);
  const link = buildAffiliateLink(referralCode);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={link}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied' : 'Copy link'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
      <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <code className="flex-1 text-xs text-gray-700 truncate font-mono">{link}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
};
