import { msalConfig, loginRequest } from "./msal-config";
import { 
  PublicClientApplication, 
  AuthenticationResult, 
  InteractionRequiredAuthError,
  AccountInfo
} from "@azure/msal-browser";
import { useAuthStore } from "./auth-store";
import { jwtDecode } from "jwt-decode";

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

interface IdTokenClaims {
  roles?: string[];
  [key: string]: unknown;
}

export class AuthService {
  // Silent login - attempts to get token silently
  static async silentLogin(): Promise<AuthenticationResult | null> {
    const accounts = msalInstance.getAllAccounts();
    
    if (accounts.length === 0) {
      return null;
    }
    
    try {
      const silentRequest = {
        ...loginRequest,
        account: accounts[0]
      };
      
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      AuthService.handleLoginSuccess(response);
      return response;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        return null;
      }
      console.error("Silent login error:", error);
      return null;
    }
  }

  // Interactive login - opens login popup
  static async login(): Promise<AuthenticationResult | null> {
    try {
      const response = await msalInstance.loginPopup(loginRequest);
      AuthService.handleLoginSuccess(response);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  // Logout from application
  static logout(): void {
    const logoutRequest = {
      account: msalInstance.getActiveAccount() || undefined
    };
    
    msalInstance.logoutPopup(logoutRequest)
      .then(() => {
        useAuthStore.getState().reset();
      })
      .catch(error => {
        console.error("Logout error:", error);
      });
  }

  // Get access token for API calls
  static async getAccessToken(): Promise<string | null> {
    const currentToken = useAuthStore.getState().accessToken;
    
    if (currentToken) {
      return currentToken;
    }
    
    try {
      const accounts = msalInstance.getAllAccounts();
      
      if (accounts.length === 0) {
        return null;
      }
      
      const silentRequest = {
        ...loginRequest,
        account: accounts[0]
      };
      
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      useAuthStore.getState().setAccessToken(response.accessToken);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          useAuthStore.getState().setAccessToken(response.accessToken);
          return response.accessToken;
        } catch (err) {
          console.error("Error acquiring token:", err);
          return null;
        }
      }
      console.error("Error acquiring token silently:", error);
      return null;
    }
  }

  // Parse JWT token to extract roles
  private static extractRolesFromToken(token: string): string[] {
    try {
      const decodedToken = jwtDecode<IdTokenClaims>(token);
      return decodedToken.roles || [];
    } catch (error) {
      console.error("Error decoding token:", error);
      return [];
    }
  }

  // Handle successful login
  private static handleLoginSuccess(response: AuthenticationResult): void {
    const { account, accessToken } = response;
    
    if (account) {
      const roles = AuthService.extractRolesFromToken(accessToken);
      
      useAuthStore.getState().setAuthenticated(true);
      useAuthStore.getState().setAccount(account);
      useAuthStore.getState().setRoles(roles);
      useAuthStore.getState().setAccessToken(accessToken);
      
      msalInstance.setActiveAccount(account);
    }
  }

  // Initialize auth - call on app start
  static async initializeAuth(): Promise<void> {
    const accounts = msalInstance.getAllAccounts();
    
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
      await AuthService.silentLogin();
    }
  }

  // Check if user has specific role
  static hasRole(role: string): boolean {
    return useAuthStore.getState().hasRole(role);
  }

  // Check if user has any of the specified roles
  static hasAnyRole(roles: string[]): boolean {
    return useAuthStore.getState().hasAnyRole(roles);
  }
}