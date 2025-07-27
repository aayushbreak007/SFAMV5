import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, QrCode, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppStore } from '@/lib/store';
import { ApiService } from '@/lib/api/api-service';

// This is a simulated QR code scanner since we can't actually decode QR codes with just react-webcam
// In a real app, you would use a library like jsQR or html5-qrcode with the webcam feed

interface QRCodeScannerProps {
  onSuccess: (visitorId: string) => void;
  onClose: () => void;
}

export function QRCodeScanner({ onSuccess, onClose }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasUserConsent, setHasUserConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visitors = useAppStore(state => state.visitors);
  const updateVisitor = useAppStore(state => state.updateVisitor);
  
  // Request camera access
  const requestConsent = () => {
    setHasUserConsent(true);
    setIsScanning(true);
  };
  
  // Process QR code data and check in visitor via API
  const processQRCodeData = async (qrCodeData: string, visitorId: string) => {
    try {
      setIsProcessing(true);
      
      // Send to backend for processing
      const response = await ApiService.checkInVisitorByQRCode(qrCodeData, {
        checkInTime: new Date().toISOString(),
        method: 'qr_code'
      });
      
      // Update local state with the visitor that was checked in
      if (response.data && response.data.visitor) {
        updateVisitor({
          ...response.data.visitor,
          status: 'checked-in'
        });
        
        toast.success(`${response.data.visitor.name} has been checked in successfully!`);
        
        // Notify parent component
        onSuccess(response.data.visitor.id);
      }
    } catch (error: unknown) {
      console.error('Error checking in visitor with QR code:', error);
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Failed to check in visitor with QR code');
      toast.error('QR code check-in failed');
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
    }
  };

  // Simulate QR code scanning
  useEffect(() => {
    if (isScanning && !isProcessing) {
      let scanTimeout: NodeJS.Timeout;
      
      const simulateScan = () => {
        setIsProcessing(true);
        
        // In a real app, this would process video frames to detect QR codes
        // For demo purposes, we'll simulate finding a random visitor after 2-3 seconds
        scanTimeout = setTimeout(() => {
          const expectedVisitors = visitors.filter(v => v.status === 'expected');
          if (expectedVisitors.length > 0) {
            // Pick a random visitor for demo purposes
            const randomIndex = Math.floor(Math.random() * expectedVisitors.length);
            const randomVisitor = expectedVisitors[randomIndex];
            
            // Generate fake QR code data that would typically contain visitor information
            const qrCodeData = JSON.stringify({
              id: randomVisitor.id,
              name: randomVisitor.name,
              email: randomVisitor.email,
              timestamp: new Date().toISOString()
            });
            
            try {
              // Process the QR code data with API integration
              processQRCodeData(qrCodeData, randomVisitor.id);
            } catch (error) {
              // Fallback to direct callback in case API fails
              onSuccess(randomVisitor.id);
              setIsProcessing(false);
            }
          } else {
            setError('No visitors available for check-in');
            setIsScanning(false);
            setIsProcessing(false);
          }
        }, 2000 + Math.random() * 1000);
      };
      
      simulateScan();
      
      return () => {
        clearTimeout(scanTimeout);
      };
    }
  }, [isScanning, isProcessing, visitors]);

  // Render consent request if needed
  if (!hasUserConsent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>
            Scan visitor's QR code for quick check-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <QrCode className="h-4 w-4 mr-2" />
            <AlertTitle>Camera Permission Required</AlertTitle>
            <AlertDescription>
              We need access to your camera to scan QR codes. Please allow access when prompted.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={requestConsent}>
            <Camera className="mr-2 h-4 w-4" />
            Enable Camera
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Handle cancel button click - stop scanning and close
  const handleCancel = () => {
    setIsScanning(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          {isProcessing ? 'Scanning QR code...' : 'Position QR code in the center of the frame'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg overflow-hidden shadow-md border">
          <Webcam
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-auto"
          />
          {!isProcessing && (
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <div className="border-2 border-dashed border-primary w-48 h-48 rounded-md flex items-center justify-center">
                <QrCode className="h-8 w-8 text-primary opacity-50" />
              </div>
            </div>
          )}
          {isProcessing && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <X className="h-4 w-4 mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        {!isScanning ? (
          <Button onClick={() => setIsScanning(true)} disabled={isProcessing}>
            <QrCode className="mr-2 h-4 w-4" />
            Start Scanning
          </Button>
        ) : (
          <Button 
            variant="destructive" 
            onClick={() => setIsScanning(false)} 
            disabled={isProcessing}
          >
            <X className="mr-2 h-4 w-4" />
            Stop Scanning
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}