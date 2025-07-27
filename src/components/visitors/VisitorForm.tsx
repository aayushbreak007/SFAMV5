import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Visitor, CustomField } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { UserRoundPlus, UserRoundSearch, Camera, QrCode } from "lucide-react";
import { FaceCapture } from "./FaceCapture";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { VisitorLookup } from "./VisitorLookup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type VisitorFormProps = {
  existingVisitor?: Visitor;
};

export function VisitorForm({ existingVisitor }: VisitorFormProps) {
  const navigate = useNavigate();
  const createVisitor = useAppStore(state => state.createVisitor);
  const updateVisitor = useAppStore(state => state.updateVisitor);
  const employees = useAppStore(state => state.employees);
  const currentOrganization = useAppStore(state => state.currentOrganization);
  const customFields = currentOrganization?.settings.customFields || [];
  const requireNDA = currentOrganization?.settings.requireNDA || false;
  
  const [formData, setFormData] = useState<Partial<Visitor>>(
    existingVisitor || {
      name: "",
      email: "",
      phone: "",
      company: "",
      hostId: "",
      purpose: "",
      status: "expected",
      agreementSigned: false,
      customFields: {}
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("form");
  const [photoUrl, setPhotoUrl] = useState<string | null>(formData.photoUrl || null);
  const [showFaceCapture, setShowFaceCapture] = useState<boolean>(false);
  const [showLookupModal, setShowLookupModal] = useState<boolean>(false);
  const [createdVisitor, setCreatedVisitor] = useState<Visitor | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleCustomFieldChange = (fieldId: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...(prev.customFields || {}),
        [fieldId]: value
      }
    }));
  };

  // Handle captured face image
  const handleFaceCapture = (imageBase64: string | null) => {
    setPhotoUrl(imageBase64);
    setFormData(prev => ({ ...prev, photoUrl: imageBase64 || undefined }));
    setShowFaceCapture(false);
  };

  // Handle returning visitor data
  const handleVisitorLookup = (previousVisitor: Partial<Visitor>) => {
    setFormData(prev => ({ 
      ...prev, 
      ...previousVisitor,
      // Keep the current status
      status: prev.status || 'expected'
    }));
    setShowLookupModal(false);
    
    // If the visitor had a photo, set it
    if (previousVisitor.photoUrl) {
      setPhotoUrl(previousVisitor.photoUrl);
    }
    
    toast.success("Visitor information loaded successfully");
  };

  // Simulate sending email with QR code
  const handleSendQREmail = async (visitor: Visitor, qrCodeBase64?: string) => {
    // In a real app, this would call an API to send the email
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`QR code sent to ${visitor.email}`);
    return true;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.hostId) newErrors.hostId = "Host is required";
    if (!formData.purpose) newErrors.purpose = "Purpose is required";
    
    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate custom fields that are required
    customFields.forEach(field => {
      if (field.required) {
        const value = formData.customFields?.[field.id];
        if (!value && value !== false) {
          newErrors[`custom_${field.id}`] = `${field.name} is required`;
        }
      }
    });

    // Validate NDA if required
    if (requireNDA && !formData.agreementSigned) {
      newErrors.agreementSigned = "NDA agreement must be signed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      let newVisitor;
      
      if (existingVisitor) {
        updateVisitor(existingVisitor.id, formData);
        toast.success("Visitor updated successfully");
        navigate("/visitors");
      } else {
        newVisitor = createVisitor(formData);
        setCreatedVisitor(newVisitor);
        toast.success("Visitor registered successfully");
        // Navigate to QR tab if registration was successful
        setActiveTab("qr");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  // If showing lookup modal, render it
  if (showLookupModal) {
    return <VisitorLookup onSelect={handleVisitorLookup} onCancel={() => setShowLookupModal(false)} />;
  }

  // If showing face capture, render it
  if (showFaceCapture) {
    return <FaceCapture onCapture={handleFaceCapture} />;
  }

  // If we have created a visitor and are showing QR code
  if (createdVisitor && activeTab === "qr") {
    return (
      <div className="space-y-6">
        <QRCodeGenerator visitor={createdVisitor} onSendEmail={handleSendQREmail} />
        <div className="flex justify-end">
          <Button onClick={() => navigate("/visitors")}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{existingVisitor ? "Edit Visitor" : "Register New Visitor"}</CardTitle>
          <CardDescription>
            {existingVisitor 
              ? "Update visitor information" 
              : "Register a new visitor to your facility"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowLookupModal(true)}
              className="mb-4"
            >
              <UserRoundSearch className="mr-2 h-4 w-4" />
              Find Returning Visitor
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visitor Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Acme Inc."
                  value={formData.company || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="photo">Visitor Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt="Visitor" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowFaceCapture(true)}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {photoUrl ? "Change Photo" : "Capture Photo"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visit Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hostId">Host</Label>
                <Select
                  value={formData.hostId}
                  onValueChange={(value) => handleSelectChange("hostId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a host" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.status === "active")
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.department}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.hostId && <p className="text-sm text-red-500">{errors.hostId}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Textarea
                  id="purpose"
                  name="purpose"
                  placeholder="Describe the purpose of your visit..."
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                />
                {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
              </div>
            </div>
            
            {/* Custom fields */}
            {customFields.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-medium">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`custom_${field.id}`}>{field.name}</Label>
                      
                      {field.type === 'text' && (
                        <Input
                          id={`custom_${field.id}`}
                          value={formData.customFields?.[field.id] as string || ""}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        />
                      )}
                      
                      {field.type === 'select' && field.options && (
                        <Select
                          value={formData.customFields?.[field.id] as string || ""}
                          onValueChange={(value) => handleCustomFieldChange(field.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.name}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {field.type === 'checkbox' && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`custom_${field.id}`}
                            checked={Boolean(formData.customFields?.[field.id])}
                            onCheckedChange={(checked) => 
                              handleCustomFieldChange(field.id, Boolean(checked))
                            }
                          />
                          <Label htmlFor={`custom_${field.id}`}>Yes</Label>
                        </div>
                      )}
                      
                      {errors[`custom_${field.id}`] && (
                        <p className="text-sm text-red-500">{errors[`custom_${field.id}`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* NDA Agreement */}
            {requireNDA && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">Non-Disclosure Agreement</h3>
                
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">
                    By checking this box, I acknowledge that I have read and agree to the 
                    Non-Disclosure Agreement (NDA) of {currentOrganization?.name}. I understand 
                    that I may be exposed to confidential information during my visit and 
                    agree not to disclose any such information to third parties.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreementSigned"
                    checked={formData.agreementSigned}
                    onCheckedChange={(checked) => handleCheckboxChange("agreementSigned", Boolean(checked))}
                  />
                  <Label htmlFor="agreementSigned">
                    I agree to the Non-Disclosure Agreement
                  </Label>
                </div>
                
                {errors.agreementSigned && (
                  <p className="text-sm text-red-500">{errors.agreementSigned}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/visitors")}
          >
            Cancel
          </Button>
          <Button type="submit">
            <UserRoundPlus className="mr-2 h-4 w-4" />
            {existingVisitor ? "Update Visitor" : "Register Visitor"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}