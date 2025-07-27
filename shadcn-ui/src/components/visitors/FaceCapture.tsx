import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Check, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ApiService } from '@/lib/api/api-service';
import { useAppStore } from '@/lib/store';

interface FaceCaptureProps {
  onCapture?: (imageBase64: string | null) => void;
  showPreview?: boolean;
  mode?: 'capture' | 'recognition';
  onSuccess?: (visitorId: string) => void;
  onCancel?: () => void;
}

export function FaceCapture({ 
  onCapture, 
  showPreview = true, 
  mode = 'capture',
  onSuccess,
  onCancel
}: FaceCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasUserConsent, setHasUserConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Request user consent to enable camera
  const requestConsent = () => {
    setHasUserConsent(true);
  };

  // Capture image from webcam
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
        if (imageSrc && onCapture) {
          onCapture(imageSrc);
        }
        setIsCapturing(false);
      } catch (error) {
        console.error("Error capturing image:", error);
        toast.error("Failed to capture image. Please try again.");
      }
    }
  }, [webcamRef, onCapture]);

  // Reset captured image
  const resetCapture = () => {
    setCapturedImage(null);
    if (onCapture) {
      onCapture(null);
    }
    setIsCapturing(true);
  };

  // Handle cancel operation
  const handleCancel = () => {
    setIsCapturing(false);
    setIsProcessing(false);
    if (onCancel) {
      onCancel();
    } else if (onCapture) {
      onCapture(null);
    }
  };

  // Handle submission of captured image
  const handleSubmit = async () => {
    if (!capturedImage) return;
    
    try {
      setIsProcessing(true);
      
      if (mode === 'recognition') {
        // In a real app, this would send the image to the backend for processing
        // Now we're actually sending it to our API
        const response = await ApiService.checkInVisitorByFaceRecognition(
          capturedImage,
          {
            checkInTime: new Date().toISOString(),
            method: 'face_recognition'
          }
        );
        
        if (response.data && response.data.visitor) {
          // Get updateVisitor function from the store
          const updateVisitor = useAppStore.getState().updateVisitor;
          
          // Update the visitor in the local state
          updateVisitor({
            ...response.data.visitor,
            status: 'checked-in'
          });
          
          toast.success(`${response.data.visitor.name} checked in with Face ID!`);
          
          // Call the success callback if provided
          if (onSuccess && response.data.visitor.id) {
            onSuccess(response.data.visitor.id);
          }
        } else {
          toast.success('Face ID processed successfully');
        }
      } else {
        // Just capture mode - notify user and pass the captured image
        if (onCapture) {
          onCapture(capturedImage);
        }
        toast.success('Photo captured successfully');
      }
      
      setIsProcessing(false);
    } catch (error: unknown) {
      console.error('Face recognition error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to process face ID');
      setIsProcessing(false);
    }
  };

  // Video constraints for the webcam
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  // If user hasn't given consent yet, show consent request
  if (!hasUserConsent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Face ID Capture</CardTitle>
          <CardDescription>
            Capture your face for faster check-in during future visits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Permission Required</AlertTitle>
            <AlertDescription>
              To use Face ID check-in, we need permission to access your camera. Your face data will be securely stored and used only for check-in purposes.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onCapture(null)}>Skip Face ID</Button>
          <Button onClick={requestConsent}>
            <Camera className="mr-2 h-4 w-4" />
            Enable Camera
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Face ID Capture</CardTitle>
        <CardDescription>
          {capturedImage 
            ? "Review your captured image" 
            : "Position your face in the center of the frame"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {isCapturing ? (
          <div className="relative rounded-lg overflow-hidden shadow-md border">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-auto"
            />
            <div className="absolute top-0 left-0 right-0 bottom-0 border-2 border-dashed border-yellow-400 m-8 rounded-full pointer-events-none"></div>
          </div>
        ) : capturedImage && showPreview ? (
          <div className="rounded-lg overflow-hidden shadow-md border">
            <img src={capturedImage} alt="Captured face" className="w-full h-auto" />
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isCapturing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={captureImage}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </>
        ) : capturedImage ? (
          <>
            <Button variant="outline" onClick={resetCapture}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => onCapture(null)}>Skip Face ID</Button>
            <Button onClick={() => setIsCapturing(true)}>
              <Camera className="mr-2 h-4 w-4" />
              Start Capture
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}