'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface QRCodeDisplayProps {
  url: string;
}

export function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Check if Web Share API is supported
  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Meeting Room - LISN',
          text: 'Join my meeting room on LISN',
          url: url,
        });
      } catch (err) {
        // User cancelled share or error occurred
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Share2 className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Share Meeting</h3>
        <p className="text-gray-600 text-sm">Scan QR code to join the meeting</p>
      </div>
      
      <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-lg">
        <QRCodeCanvas 
          value={url} 
          size={200} 
          fgColor="#2563eb"
          bgColor="#ffffff"
          level="M"
        />
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm truncate"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2 min-w-[80px] justify-center"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        {canShare && (
          <button
            onClick={handleShare}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share via...
          </button>
        )}
      </div>
    </div>
  );
}