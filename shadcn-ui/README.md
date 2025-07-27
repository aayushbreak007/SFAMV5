# Smart Facility Access Management System (SFAM)

A multi-tenant SaaS application designed for smart facility access management, similar to "Envoy". It enables organizations to manage visitor profiles, employee access, and facility resources efficiently.

## Features

- SSO Authentication with Microsoft Azure AD
- Role-based access authorization
- Tenant onboarding and management
- Visitor management (registration, check-in, check-out)
- Employee management and access control
- Analytics dashboard
- Configurable settings

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Authentication**: Microsoft Authentication Library (MSAL)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Data Visualization**: Chart.js, React Chart.js 2
- **Routing**: React Router
- **Build Tool**: Vite

## Authentication

The application uses Microsoft Authentication Library (MSAL) for SSO authentication with Azure AD:

- **Client ID**: "415f2a31-80a1-4ed4-9ae7-b55ad3d6d1eb"
- **Authority**: "https://login.microsoftonline.com/common"
- **Redirect URI**: Application origin (e.g., http://localhost:5173)
- **Scope**: ["api://sfam-api/.default"]

## Role-Based Authorization

Access control is implemented based on Azure AD app roles:

- **SuperAdmin**: Full access to all features and tenants
- **TenantAdmin**: Full access to their tenant data and configuration
- **Receptionist**: Access to visitor management and limited employee data
- **Guard**: Access to check-in/check-out and limited visitor data
- **AdminApi.Caller**: API access for system integration

## API Endpoints

The application connects to backend services through APIM:

**Base URL**: `https://apim-sfam-core.azure-api.net/sfam/v1`

### Tenant Management

| Endpoint | Method | Description | Request Body/Params | 
|----------|--------|-------------|---------------------|
| `/tenants` | GET | Get all tenants | N/A |
| `/tenants` | POST | Create a new tenant | ```{ name: string, description?: string, address: string, city: string, state: string, zipCode: string, country: string, contactName: string, contactEmail: string, contactPhone: string, enableVisitorRegistration?: boolean, enableEmployeeAccess?: boolean, enableNotifications?: boolean }``` |
| `/tenants/{tenantId}` | GET | Get tenant by ID | Path param: tenantId |
| `/tenants/{tenantId}` | PUT | Update tenant | Path param: tenantId, Body: Same as POST |

### Visitor Management

| Endpoint | Method | Description | Request Body/Params |
|----------|--------|-------------|---------------------|
| `/visitors` | GET | Get all visitors | Query params: tenantId, status, fromDate, toDate, page, pageSize |
| `/visitors` | POST | Register a new visitor | ```{ tenantId: string, firstName: string, lastName: string, email: string, phone?: string, company?: string, purpose: string, hostId: string, visitDate: string, expectedArrival: string, expectedDeparture?: string }``` |
| `/visitors/{visitorId}` | GET | Get visitor by ID | Path param: visitorId |
| `/visitors/{visitorId}/check-in` | POST | Check-in a visitor | Path param: visitorId, Body: ```{ checkInTime: string, notes?: string, temperature?: number }``` |
| `/visitors/{visitorId}/check-out` | POST | Check-out a visitor | Path param: visitorId, Body: ```{ checkOutTime: string, notes?: string }``` |

### Employee Management

| Endpoint | Method | Description | Request Body/Params |
|----------|--------|-------------|---------------------|
| `/employees` | GET | Get all employees | Query params: tenantId, departmentId, status, page, pageSize |
| `/employees` | POST | Create a new employee | ```{ tenantId: string, firstName: string, lastName: string, email: string, phone?: string, department?: string, title?: string, accessLevel: string, startDate?: string, endDate?: string }``` |
| `/employees/{employeeId}` | GET | Get employee by ID | Path param: employeeId |
| `/employees/{employeeId}` | PUT | Update employee | Path param: employeeId, Body: Same as POST |

### Analytics

| Endpoint | Method | Description | Request Body/Params |
|----------|--------|-------------|---------------------|
| `/analytics/dashboard` | GET | Get dashboard statistics | Query params: tenantId |
| `/analytics/visitors` | GET | Get visitor statistics | Query params: tenantId, timeRange (daily, weekly, monthly, yearly) |
| `/analytics/employees` | GET | Get employee statistics | Query params: tenantId, timeRange (daily, weekly, monthly, yearly) |

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Build for production:
   ```bash
   pnpm build
   ```

## Configuration

The application can be configured via environment variables:

```
VITE_API_BASE_URL=https://apim-sfam-core.azure-api.net/sfam/v1
VITE_MSAL_CLIENT_ID=415f2a31-80a1-4ed4-9ae7-b55ad3d6d1eb
VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/common
VITE_MSAL_REDIRECT_URI=http://localhost:5173
```

## License

[MIT](LICENSE)