export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'receptionist' | 'employee';
  organizationId: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  createdAt: string;
  subscription: 'free' | 'standard' | 'premium';
  settings: {
    requirePhotoCapture: boolean;
    requireNDA: boolean;
    notifyHost: boolean;
    customFields: CustomField[];
    autoDeleteVisitorData: number; // Days
  };
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  photoUrl?: string;
  hostId: string;
  purpose: string;
  status: 'expected' | 'checked-in' | 'checked-out';
  checkInTime?: string;
  checkOutTime?: string;
  organizationId: string;
  agreementSigned?: boolean;
  customFields?: Record<string, string | boolean>;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
  accessLevel: 'all' | 'limited' | 'restricted';
  organizationId: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
}

export interface Activity {
  id: string;
  type: 'visitor-checkin' | 'visitor-checkout' | 'employee-access' | 'system';
  description: string;
  userId?: string;
  visitorId?: string;
  timestamp: string;
  organizationId: string;
}