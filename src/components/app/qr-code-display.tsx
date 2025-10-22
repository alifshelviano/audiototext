'use client';

import {QRCodeCanvas} from 'qrcode.react';

interface QRCodeDisplayProps {
  url: string;
}

export function QRCodeDisplay({url}: QRCodeDisplayProps) {
  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Join the Meeting</h2>
      <p className="mb-6 text-center text-gray-600">Scan the QR code or use the link below to join.</p>
      <div className="flex justify-center mb-6">
        <QRCodeCanvas value={url} size={256} fgColor="#3F72AF" />
      </div>
      <a href={url} className="text-blue-500 hover:underline block text-center truncate">{url}</a>
    </div>
  );
}
