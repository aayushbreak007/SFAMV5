import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Organization, 
  Visitor, 
  Employee, 
  Activity 
} from './types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  currentUser: User | null;
  currentOrganization: Organization | null;
  organizations: Organization[];
  users: User[];
  visitors: Visitor[];
  employees: Employee[];
  activities: Activity[];

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Organization actions
  createOrganization: (data: Partial<Organization>) => Organization;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  
  // User actions
  createUser: (data: Partial<User>) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  
  // Visitor actions
  createVisitor: (data: Partial<Visitor>) => Visitor;
  updateVisitor: (id: string, data: Partial<Visitor>) => void;
  checkInVisitor: (id: string) => void;
  checkOutVisitor: (id: string) => void;
  
  // Employee actions
  createEmployee: (data: Partial<Employee>) => Employee;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  
  // Activity actions
  logActivity: (type: Activity['type'], description: string, options?: { userId?: string; visitorId?: string }) => void;
}

// Demo data to populate initial state
const mockOrganization: Organization = {
  id: 'org-1',
  name: 'Acme Corp',
  primaryColor: '#0284c7',
  createdAt: new Date().toISOString(),
  subscription: 'standard',
  settings: {
    requirePhotoCapture: true,
    requireNDA: true,
    notifyHost: true,
    customFields: [
      { id: 'cf-1', name: 'Purpose of Visit', type: 'select', required: true, options: ['Meeting', 'Interview', 'Delivery', 'Other'] }
    ],
    autoDeleteVisitorData: 30
  }
};

const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@acme.com',
    name: 'Admin User',
    role: 'admin',
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
  },
  {
    id: 'user-2',
    email: 'reception@acme.com',
    name: 'Front Desk',
    role: 'receptionist',
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4'
  }
];

const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john.doe@acme.com',
    department: 'Engineering',
    position: 'Senior Developer',
    phone: '+1-555-123-4567',
    accessLevel: 'all',
    organizationId: 'org-1',
    avatarUrl: 'https://avatars.githubusercontent.com/u/3?v=4',
    status: 'active'
  },
  {
    id: 'emp-2',
    name: 'Jane Smith',
    email: 'jane.smith@acme.com',
    department: 'Marketing',
    position: 'Marketing Director',
    phone: '+1-555-765-4321',
    accessLevel: 'limited',
    organizationId: 'org-1',
    avatarUrl: 'https://avatars.githubusercontent.com/u/4?v=4',
    status: 'active'
  }
];

// Create store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentOrganization: mockOrganization,
      organizations: [mockOrganization],
      users: mockUsers,
      visitors: [],
      employees: mockEmployees,
      activities: [],
      
      login: async (email, password) => {
        // In a real app, this would validate against a backend
        const user = get().users.find(u => u.email === email);
        if (user) {
          const org = get().organizations.find(o => o.id === user.organizationId);
          set({ currentUser: user, currentOrganization: org || null });
          
          // Log activity
          get().logActivity('system', `User ${user.name} logged in`);
          return true;
        }
        return false;
      },
      
      logout: () => {
        const user = get().currentUser;
        if (user) {
          get().logActivity('system', `User ${user.name} logged out`);
        }
        set({ currentUser: null });
      },
      
      createOrganization: (data) => {
        const newOrg: Organization = {
          id: `org-${uuidv4()}`,
          name: data.name || 'New Organization',
          primaryColor: data.primaryColor || '#0284c7',
          createdAt: new Date().toISOString(),
          subscription: data.subscription || 'free',
          settings: data.settings || {
            requirePhotoCapture: false,
            requireNDA: false,
            notifyHost: true,
            customFields: [],
            autoDeleteVisitorData: 30
          }
        };
        
        set(state => ({ 
          organizations: [...state.organizations, newOrg]
        }));
        
        return newOrg;
      },
      
      updateOrganization: (id, data) => {
        set(state => ({
          organizations: state.organizations.map(org => 
            org.id === id ? { ...org, ...data } : org
          ),
          currentOrganization: state.currentOrganization?.id === id 
            ? { ...state.currentOrganization, ...data } 
            : state.currentOrganization
        }));
      },
      
      createUser: (data) => {
        const newUser: User = {
          id: `user-${uuidv4()}`,
          email: data.email || '',
          name: data.name || '',
          role: data.role || 'employee',
          organizationId: data.organizationId || get().currentOrganization?.id || '',
          createdAt: new Date().toISOString(),
          avatarUrl: data.avatarUrl
        };
        
        set(state => ({ 
          users: [...state.users, newUser]
        }));
        
        get().logActivity('system', `User ${newUser.name} was created`);
        return newUser;
      },
      
      updateUser: (id, data) => {
        set(state => ({
          users: state.users.map(user => 
            user.id === id ? { ...user, ...data } : user
          ),
          currentUser: state.currentUser?.id === id 
            ? { ...state.currentUser, ...data } 
            : state.currentUser
        }));
      },
      
      createVisitor: (data) => {
        const newVisitor: Visitor = {
          id: `visitor-${uuidv4()}`,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone,
          company: data.company,
          photoUrl: data.photoUrl,
          hostId: data.hostId || '',
          purpose: data.purpose || '',
          status: data.status || 'expected',
          organizationId: data.organizationId || get().currentOrganization?.id || '',
          agreementSigned: data.agreementSigned,
          customFields: data.customFields
        };
        
        set(state => ({ 
          visitors: [...state.visitors, newVisitor]
        }));
        
        get().logActivity('system', `Visitor ${newVisitor.name} was registered`);
        return newVisitor;
      },
      
      updateVisitor: (id, data) => {
        set(state => ({
          visitors: state.visitors.map(visitor => 
            visitor.id === id ? { ...visitor, ...data } : visitor
          )
        }));
      },
      
      checkInVisitor: (id) => {
        const now = new Date().toISOString();
        
        set(state => ({
          visitors: state.visitors.map(visitor => 
            visitor.id === id ? { 
              ...visitor, 
              status: 'checked-in',
              checkInTime: now
            } : visitor
          )
        }));
        
        const visitor = get().visitors.find(v => v.id === id);
        if (visitor) {
          get().logActivity('visitor-checkin', `${visitor.name} checked in`, { visitorId: id });
        }
      },
      
      checkOutVisitor: (id) => {
        const now = new Date().toISOString();
        
        set(state => ({
          visitors: state.visitors.map(visitor => 
            visitor.id === id ? { 
              ...visitor, 
              status: 'checked-out',
              checkOutTime: now
            } : visitor
          )
        }));
        
        const visitor = get().visitors.find(v => v.id === id);
        if (visitor) {
          get().logActivity('visitor-checkout', `${visitor.name} checked out`, { visitorId: id });
        }
      },
      
      createEmployee: (data) => {
        const newEmployee: Employee = {
          id: `emp-${uuidv4()}`,
          name: data.name || '',
          email: data.email || '',
          department: data.department || '',
          position: data.position || '',
          phone: data.phone,
          accessLevel: data.accessLevel || 'limited',
          organizationId: data.organizationId || get().currentOrganization?.id || '',
          avatarUrl: data.avatarUrl,
          status: data.status || 'active'
        };
        
        set(state => ({ 
          employees: [...state.employees, newEmployee]
        }));
        
        get().logActivity('system', `Employee ${newEmployee.name} was added`);
        return newEmployee;
      },
      
      updateEmployee: (id, data) => {
        set(state => ({
          employees: state.employees.map(emp => 
            emp.id === id ? { ...emp, ...data } : emp
          )
        }));
      },
      
      logActivity: (type, description, options = {}) => {
        const { userId, visitorId } = options;
        const newActivity: Activity = {
          id: `act-${uuidv4()}`,
          type,
          description,
          userId,
          visitorId,
          timestamp: new Date().toISOString(),
          organizationId: get().currentOrganization?.id || ''
        };
        
        set(state => ({ 
          activities: [newActivity, ...state.activities].slice(0, 100) // Keep only the 100 most recent activities
        }));
      }
    }),
    {
      name: 'envoy-clone-storage'
    }
  )
);