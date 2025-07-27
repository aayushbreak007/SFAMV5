import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Organization, CustomField } from "@/lib/types";

export default function Settings() {
  const currentOrganization = useAppStore(state => state.currentOrganization);
  const updateOrganization = useAppStore(state => state.updateOrganization);
  
  const [orgSettings, setOrgSettings] = useState<Organization["settings"]>(
    currentOrganization?.settings || {
      requirePhotoCapture: false,
      requireNDA: false,
      notifyHost: true,
      customFields: [],
      autoDeleteVisitorData: 30
    }
  );
  
  const [orgDetails, setOrgDetails] = useState({
    name: currentOrganization?.name || "",
    primaryColor: currentOrganization?.primaryColor || "#0284c7"
  });
  
  const [newCustomField, setNewCustomField] = useState<Partial<CustomField>>({
    name: "",
    type: "text",
    required: false
  });

  const handleSettingsChange = <T extends keyof typeof orgSettings>(key: T, value: typeof orgSettings[T]) => {
    setOrgSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleOrgDetailsChange = (key: keyof typeof orgDetails, value: string) => {
    setOrgDetails(prev => ({ ...prev, [key]: value }));
  };

  const saveOrganizationDetails = () => {
    if (!currentOrganization) return;
    
    updateOrganization(currentOrganization.id, {
      name: orgDetails.name,
      primaryColor: orgDetails.primaryColor
    });
    
    toast.success("Organization details updated successfully");
  };

  const saveSettings = () => {
    if (!currentOrganization) return;
    
    updateOrganization(currentOrganization.id, {
      settings: orgSettings
    });
    
    toast.success("Settings updated successfully");
  };

  const addCustomField = () => {
    if (!newCustomField.name) {
      toast.error("Field name is required");
      return;
    }
    
    // Check for duplicate field names (case-insensitive)
    const fieldNameExists = orgSettings.customFields.some(
      field => field.name.toLowerCase() === newCustomField.name.toLowerCase()
    );
    
    if (fieldNameExists) {
      toast.error(`A field named "${newCustomField.name}" already exists`);
      return;
    }
    
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: newCustomField.name,
      type: newCustomField.type as CustomField["type"] || "text",
      required: newCustomField.required || false,
      options: newCustomField.type === "select" ? ["Option 1", "Option 2"] : undefined
    };
    
    setOrgSettings(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField]
    }));
    
    setNewCustomField({
      name: "",
      type: "text",
      required: false
    });
    
    toast.success(`Custom field "${newField.name}" added`);
  };

  const removeCustomField = (id: string) => {
    setOrgSettings(prev => ({
      ...prev,
      customFields: prev.customFields.filter(field => field.id !== id)
    }));
    
    toast.success("Custom field removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="visitors">Visitor Management</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={orgDetails.name}
                  onChange={(e) => handleOrgDetailsChange("name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    className="w-16 h-10 p-1"
                    value={orgDetails.primaryColor}
                    onChange={(e) => handleOrgDetailsChange("primaryColor", e.target.value)}
                  />
                  <Input
                    value={orgDetails.primaryColor}
                    onChange={(e) => handleOrgDetailsChange("primaryColor", e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This color will be used for branding elements throughout the application
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveOrganizationDetails}>
                Save Organization Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="visitors">
          <Card>
            <CardHeader>
              <CardTitle>Visitor Management Settings</CardTitle>
              <CardDescription>
                Configure how visitors are handled in your facility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Require Photo Capture</h3>
                  <p className="text-sm text-muted-foreground">
                    Require visitors to have their photo taken during check-in
                  </p>
                </div>
                <Switch
                  checked={orgSettings.requirePhotoCapture}
                  onCheckedChange={(value) => handleSettingsChange("requirePhotoCapture", value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Require NDA</h3>
                  <p className="text-sm text-muted-foreground">
                    Require visitors to sign an NDA during registration
                  </p>
                </div>
                <Switch
                  checked={orgSettings.requireNDA}
                  onCheckedChange={(value) => handleSettingsChange("requireNDA", value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notify Host</h3>
                  <p className="text-sm text-muted-foreground">
                    Send notification to host when their visitor arrives
                  </p>
                </div>
                <Switch
                  checked={orgSettings.notifyHost}
                  onCheckedChange={(value) => handleSettingsChange("notifyHost", value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auto-delete">Auto-delete Visitor Data (days)</Label>
                <Input
                  id="auto-delete"
                  type="number"
                  min={1}
                  max={365}
                  value={orgSettings.autoDeleteVisitorData}
                  onChange={(e) => handleSettingsChange("autoDeleteVisitorData", parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Number of days after which visitor data is automatically deleted
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>
                Save Visitor Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom-fields">
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Add custom fields to collect additional information from visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Current Custom Fields</h3>
                
                {orgSettings.customFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No custom fields added yet</p>
                ) : (
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Field Name</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Required</th>
                          <th className="text-right p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orgSettings.customFields.map((field) => (
                          <tr key={field.id} className="border-b">
                            <td className="p-2">{field.name}</td>
                            <td className="p-2 capitalize">{field.type}</td>
                            <td className="p-2">{field.required ? "Yes" : "No"}</td>
                            <td className="p-2 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeCustomField(field.id)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-sm font-medium">Add New Field</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-name">Field Name</Label>
                    <Input
                      id="field-name"
                      placeholder="e.g. Badge Number"
                      value={newCustomField.name}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="field-type">Field Type</Label>
                    <Select
                      value={newCustomField.type}
                      onValueChange={(value) => setNewCustomField(prev => ({ ...prev, type: value as CustomField["type"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="select">Select (Dropdown)</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    id="field-required"
                    checked={newCustomField.required}
                    onCheckedChange={(value) => setNewCustomField(prev => ({ ...prev, required: value }))}
                  />
                  <Label htmlFor="field-required">Required Field</Label>
                </div>
                
                <Button onClick={addCustomField}>
                  Add Field
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>
                Save Custom Fields
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}