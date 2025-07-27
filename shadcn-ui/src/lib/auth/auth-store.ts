import { create } from 'zustand';
import { AccountInfo } from '@azure/msal-browser';

export interface UserRole {
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  account: AccountInfo | null;
  roles: string[];
  accessToken: string | null;
  setAuthenticated: (authenticated: boolean) => void;
  setAccount: (account: AccountInfo | null) => void;
  setRoles: (roles: string[]) => void;
  setAccessToken: (token: string | null) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  account: null,
  roles: [],
  accessToken: null,
  
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setAccount: (account) => set({ account }),
  setRoles: (roles) => set({ roles }),
  setAccessToken: (accessToken) => set({ accessToken }),
  
  hasRole: (role) => {
    return get().roles.includes(role);
  },
  
  hasAnyRole: (roles) => {
    return get().roles.some(role => roles.includes(role));
  },
  
  reset: () => set({
    isAuthenticated: false,
    account: null,
    roles: [],
    accessToken: null
  })
}));