import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeScanner } from "@/components/visitors/QRCodeScanner";
import { VisitorLookup } from "@/components/visitors/VisitorLookup";
import { FaceCapture } from "@/components/visitors/FaceCapture";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Visitor } from "@/lib/types";
import { useAppStore } from "@/lib/store";

const QRCheckIn = () => {
  const [activeTab, setActiveTab] = useState("qr-code");
  const navigate = useNavigate();
  const updateVisitor = useAppStore(state => state.updateVisitor);
  
  // Handle successful check-in from any method
  const handleCheckInSuccess = (visitorId: string) => {
    toast.success("Visitor checked in successfully!");
    // Navigate to visitor detail page or somewhere else
    navigate(`/visitors/${visitorId}`);
  };
  
  // Handle cancel action for all components
  const handleCancel = () => {
    // Just reset the current view, no navigation needed
    toast.info("Check-in canceled");
  };
  
  // Handle visitor selection from manual lookup
  const handleVisitorSelect = (visitorData: Partial<Visitor>) => {
    try {
      if (!visitorData.email) {
        toast.error("Invalid visitor data");
        return;
      }
      
      // Display purpose of visit in the notification if available
      if (visitorData.purpose) {
        toast.success(
          <div>
            <p><strong>{visitorData.name || 'Visitor'}</strong> selected</p>
            <p className="text-sm mt-1"><strong>Purpose:</strong> {visitorData.purpose}</p>
          </div>
        );
      } else {
        toast.success(`${visitorData.name || 'Visitor'} selected`);
      }
      
      // Find the visitor in the store and check them in
      if (visitorData.id) {
        handleCheckInSuccess(visitorData.id);
      } else {
        // Create new check-in with complete data for pre-filling the form
        navigate('/visitors/new', { 
          state: { 
            prefillData: {
              name: visitorData.name || "",
              email: visitorData.email || "",
              phone: visitorData.phone || "",
              company: visitorData.company || "",
              photoUrl: visitorData.photoUrl || null,
              hostId: visitorData.hostId || "",
              purpose: visitorData.purpose || "",
              customFields: visitorData.customFields || {},
              agreementSigned: visitorData.agreementSigned || false
            } 
          }
        });
      }
    } catch (error) {
      console.error("Error handling visitor selection:", error);
      toast.error("Failed to process visitor information");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Visitor Check-in</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="qr-code">QR Code Check-in</TabsTrigger>
          <TabsTrigger value="face-recognition">Face Recognition</TabsTrigger>
          <TabsTrigger value="manual-lookup">Manual Lookup</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="qr-code">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Check-in</CardTitle>
                <CardDescription>
                  Scan a visitor's QR code to quickly check them in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QRCodeScanner 
                  onSuccess={handleCheckInSuccess} 
                  onClose={handleCancel} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="face-recognition">
            <Card>
              <CardHeader>
                <CardTitle>Face Recognition Check-in</CardTitle>
                <CardDescription>
                  Use face recognition to identify and check in returning visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FaceCapture 
                  mode="recognition" 
                  onSuccess={handleCheckInSuccess} 
                  onCancel={handleCancel} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manual-lookup">
            <Card>
              <CardHeader>
                <CardTitle>Manual Lookup</CardTitle>
                <CardDescription>
                  Look up a visitor by email to check them in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VisitorLookup 
                  onSelect={handleVisitorSelect} 
                  onCancel={handleCancel} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default QRCheckIn;