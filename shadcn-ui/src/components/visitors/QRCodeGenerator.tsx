import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Visitor } from '@/lib/types';

interface QRCodeGeneratorProps {
  visitor: Visitor;
  onSendEmail: (visitor: Visitor, qrCodeBase64?: string) => Promise<void>;
}

export function QRCodeGenerator({ visitor, onSendEmail }: QRCodeGeneratorProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Generate QR code data - includes visitor ID and name for verification
  const qrCodeData = JSON.stringify({
    id: visitor.id,
    name: visitor.name,
    timestamp: new Date().toISOString()
  });
  
  // Download QR code as image
  const handleDownload = async () => {
    if (qrCodeRef.current) {
      try {
        const dataUrl = await toPng(qrCodeRef.current, { quality: 0.95 });
        const link = document.createElement('a');
        link.download = `qrcode-${visitor.name.replace(/\s+/g, '-')}.jpg`;
        link.href = dataUrl;
        link.click();
        toast.success('QR Code downloaded successfully');
      } catch (error) {
        toast.error('Failed to download QR Code');
        console.error('Error generating QR code image:', error);
      }
    }
  };
  
  // Send QR code via email
  const handleSendEmail = async () => {
    if (qrCodeRef.current) {
      try {
        const dataUrl = await toPng(qrCodeRef.current, { quality: 0.95 });
        await onSendEmail(visitor, dataUrl);
        toast.success('QR Code sent via email successfully');
      } catch (error) {
        toast.error('Failed to send QR Code via email');
        console.error('Error generating QR code for email:', error);
      }
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor QR Code</CardTitle>
        <CardDescription>
          Use this QR code for contactless check-in at the entrance
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div 
          ref={qrCodeRef}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="text-center mb-3">
            <h3 className="font-bold">{visitor.name}</h3>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
          </div>
          <QRCodeSVG
            value={qrCodeData}
            size={200}
            level="H"
            includeMargin
          />
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">Scan to check in</p>
            <p className="text-xs font-mono mt-1">{visitor.id.substring(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email to Visitor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}