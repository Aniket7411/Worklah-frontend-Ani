# WorkLah Admin Panel - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup & Installation](#setup--installation)
5. [Configuration](#configuration)
6. [Features & Modules](#features--modules)
7. [API Integration](#api-integration)
8. [Routing](#routing)
9. [Authentication](#authentication)
10. [Components](#components)
11. [Pages](#pages)
12. [Common Issues & Fixes](#common-issues--fixes)
13. [Development Guidelines](#development-guidelines)
14. [Deployment](#deployment)

---

## Project Overview

**WorkLah Admin Panel** is a comprehensive administrative dashboard for managing employers, job postings, candidates (Hustle Heroes), payments, and support feedback. The application provides a complete solution for admin users to oversee and manage all aspects of the WorkLah platform.

### Key Features
- **Job Management**: Create, modify, and manage job postings with shifts, penalties, and requirements
- **Employer Management**: Add, edit, and manage employer profiles with outlets and contact information
- **Candidate Management**: View and edit candidate profiles, manage Hustle Heroes
- **Payment Management**: Track employee payments and withdrawals
- **Support & Feedback**: Manage support tickets and feedback
- **QR Code Management**: Generate and manage QR codes
- **Dashboard Analytics**: View statistics and charts for jobs, applications, and revenue

---

## Technology Stack

### Frontend
- **React 18.3.1**: UI library
- **TypeScript 5.5.3**: Type safety
- **Vite 5.4.2**: Build tool and dev server
- **React Router DOM 6.22.3**: Client-side routing
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Axios 1.7.9**: HTTP client
- **React Hot Toast 2.5.1**: Toast notifications
- **Lucide React 0.344.0**: Icon library
- **Recharts 2.13.3**: Chart library
- **js-cookie 3.0.5**: Cookie management
- **date-fns 3.3.1**: Date manipulation
- **React Datepicker 7.5.0**: Date picker component

### Development Tools
- **ESLint**: Code linting
- **TypeScript ESLint**: TypeScript-specific linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## Project Structure

```
WorkLah-admin-panel/
├── public/
│   └── assets/          # Static assets (images, logos, icons)
├── src/
│   ├── components/      # Reusable React components
│   │   ├── dashboard/   # Dashboard-specific components
│   │   ├── employerDetail/ # Employer detail components
│   │   ├── Filter/      # Filter components
│   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   └── payments/    # Payment-related components
│   ├── context/         # React Context providers
│   │   └── AuthContext.tsx
│   ├── lib/             # Utility libraries
│   │   ├── authInstances.ts  # Axios instance with auth
│   │   └── utils.ts     # Helper functions
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── employers/   # Employer management pages
│   │   ├── jobManagemant/ # Job management pages
│   │   ├── hustleHeroes/ # Candidate management
│   │   ├── payments/    # Payment pages
│   │   ├── qrCode/      # QR code pages
│   │   └── support/     # Support pages
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment config
```

---

## Setup & Installation

### Prerequisites
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)

### Installation Steps

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd WorkLah-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory (if needed)
   - Configure API base URL in `src/lib/authInstances.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open browser to `http://localhost:5173`
   - Default login credentials (check with backend team)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Configuration

### API Configuration

The API base URL is configured in `src/lib/authInstances.ts`:

```typescript
const API_BASE_URL = "http://localhost:3000/api"  // Development
// const API_BASE_URL = "https://worklah-updated-dec.onrender.com/api"  // Production
```

**Note**: Update this URL based on your environment.

### Image Base URL

Image base URL is configured in components that display images:
```typescript
const IMAGE_BASE_URL = "https://worklah.onrender.com";
```

### Authentication

Authentication uses JWT tokens stored in cookies:
- Token is stored in cookie named `authToken`
- Token expires after 7 days
- Token is automatically included in all API requests via Axios interceptor

---

## Features & Modules

### 1. Dashboard (`/`)
- Overview statistics (Active Jobs, Completed Jobs, Cancelled Jobs, Total Revenue)
- Job posting chart
- Revenue chart
- New applications list
- Recent activity

### 2. Job Management (`/jobs/job-management`)
- View all jobs with filtering and pagination
- Filter by status (Active, Upcoming, Completed, Cancelled)
- Filter by employer, date range, outlet
- View job details
- Create new jobs
- Modify existing jobs

### 3. Create Job (`/jobs/create-job`)
- Select employer and outlet
- Configure job details (title, description, requirements)
- Set up shifts with timing and rates
- Configure penalties
- Set job requirements (Food Hygiene Cert, etc.)

### 4. Job Details (`/jobs/:jobId`)
- View complete job information
- Manage shifts
- View candidates and applications
- Track attendance
- View job statistics

### 5. Employer Management (`/employers`)
- List all employers with pagination
- Add new employers
- Edit employer details
- View employer job postings
- View outlet details

### 6. Add Employer (`/employers/add-employer`)
- Company information (name, logo, legal name)
- Contact information
- Address details
- Industry type
- ACRA Bizfile certificate
- Outlets management
- Contact persons

### 7. Edit Employer (`/employers/:id/edit`)
- Modify all employer information
- Update outlets
- Update contact persons

### 8. Candidate Profile (`/jobs/:jobId/candidates/:id`)
- View candidate details
- Job history
- Work history
- Documents and certificates
- E-wallet information

### 9. Edit Candidate Profile (`/edit-candidate-profile/:id`)
- **FIXED**: Previously caused blank page due to array mapping issue
- Edit personal information
- Update documents (NRIC, PLOC, Student Pass)
- Modify e-wallet amount
- View job and work history
- Delete candidate profile

### 10. Hustle Heroes (`/hustle-heroes`)
- List all candidates/Hustle Heroes
- Filter and search
- View profiles
- Manage candidates

### 11. Payments (`/payments`)
- View employee payments
- Track withdrawals
- Generate reports
- Filter by date, status, employee

### 12. Support & Feedback (`/support`)
- View support tickets
- Manage feedback
- Respond to queries

### 13. QR Code Management (`/qrCode`)
- Generate QR codes
- Manage QR codes
- View QR code details

---

## API Integration

### Axios Instance Configuration

Located in `src/lib/authInstances.ts`:

- **Base URL**: Configurable (development/production)
- **Timeout**: 10 seconds
- **Credentials**: Included in requests
- **Interceptors**:
  - **Request**: Automatically adds JWT token from cookies
  - **Response**: Handles errors, 401 redirects, success field checks

### API Response Format

All API responses should follow this format:
```typescript
{
  success: boolean,
  message?: string,
  data?: any,
  // ... other fields
}
```

### Error Handling

- **401 Unauthorized**: Automatically redirects to login
- **403 Forbidden**: Shows permission error
- **404 Not Found**: Shows resource not found error
- **500+ Server Errors**: Shows server error message
- **Network Errors**: Shows connection error
- **Timeout Errors**: Shows timeout message

### Common API Endpoints

#### Authentication
- `POST /api/user/login` - Login
- `POST /api/user/register` - Register
- `POST /api/user/logout` - Logout
- `GET /api/user/me` - Get current user

#### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:jobId` - Get job details
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:jobId` - Update job
- `DELETE /api/jobs/:jobId` - Delete job

#### Employers
- `GET /api/employers` - List employers
- `GET /api/employers/:id` - Get employer details
- `POST /api/employers` - Create employer
- `PUT /api/employers/:id` - Update employer
- `DELETE /api/employers/:id` - Delete employer

#### Candidates
- `GET /api/admin/candidates` - List candidates
- `GET /api/admin/candidates/:id` - Get candidate details
- `PUT /api/admin/candidates/:id` - Update candidate
- `DELETE /api/admin/candidates/:id` - Delete candidate

---

## Routing

### Route Structure

All routes are defined in `src/App.tsx`:

```typescript
<Routes>
  {/* Public Routes */}
  <Route path="login" element={<SignIn />} />
  <Route path="forgot-password" element={<ForgotPassword />} />

  {/* Protected Routes */}
  <Route element={<PrivateRoute />}>
    <Route path="/" element={<Layout />}>
      {/* Dashboard */}
      <Route index element={<Dashboard />} />
      
      {/* Job Management */}
      <Route path="jobs/job-management" element={<JobManagement />} />
      <Route path="jobs/create-job" element={<NewJob />} />
      <Route path="jobs/:jobId" element={<JobDetailsPage />} />
      <Route path="jobs/:jobId/modify" element={<ModifyJob />} />
      <Route path="jobs/:jobId/candidates" element={<CandidatesTable />} />
      <Route path="jobs/:jobId/candidates/:id" element={<CandidateProfile />} />
      <Route path="edit-candidate-profile/:id" element={<EditCandidateProfile />} />
      
      {/* Employers */}
      <Route path="employers" element={<EmployerTable />} />
      <Route path="employers/add-employer" element={<AddEmployer />} />
      <Route path="employers/:id" element={<ActiveJobPosting />} />
      <Route path="employers/:id/edit" element={<EditEmployer />} />
      <Route path="employers/:id/outletDetails" element={<OutletDetail />} />
      
      {/* Other Routes */}
      <Route path="hustle-heroes" element={<HustleHeroesList />} />
      <Route path="payments" element={<EmployeePayments />} />
      <Route path="support" element={<SupportFeedback />} />
      <Route path="qrCode" element={<QRCodeManagement />} />
    </Route>
  </Route>
</Routes>
```

### Private Routes

Protected by `PrivateRoute` component:
- Checks authentication status
- Redirects to `/login` if not authenticated
- Uses `AuthContext` for authentication state

---

## Authentication

### AuthContext

Located in `src/context/AuthContext.tsx`:

**Features**:
- Manages authentication state
- Provides login, signup, logout functions
- Checks authentication on app load
- Stores user information

**Usage**:
```typescript
import { useAuth } from '../context/AuthContext';

const { isAuthenticated, user, login, logout } = useAuth();
```

### User Roles

- **ADMIN**: Full access to all features
- **USER**: Limited access (if applicable)
- **EMPLOYER**: Employer-specific access (if applicable)

### Token Management

- Stored in cookies (7-day expiration)
- Automatically included in API requests
- Removed on logout or 401 error

---

## Components

### Layout Components

#### Layout (`src/components/layout/Layout.tsx`)
- Main layout wrapper
- Includes Sidebar and Header
- Renders `<Outlet />` for nested routes

#### Sidebar (`src/components/layout/Sidebar.tsx`)
- Navigation menu
- Responsive (collapsible on mobile)
- Active route highlighting

#### Header (`src/components/layout/Header.tsx`)
- Top navigation bar
- User profile menu
- Logout functionality

### Reusable Components

#### Loader (`src/components/Loader.jsx`)
- Loading spinner component
- Used during data fetching

#### ConfirmationModal (`src/components/ConfirmationModal.tsx`)
- Modal for confirmations (delete, etc.)
- Supports different types (danger, warning, info)
- Loading state support

#### Pagination (`src/components/Pagination.tsx`)
- Pagination controls
- Used in tables and lists

### Dashboard Components

- **StatCard**: Statistics display card
- **JobPostChart**: Job posting chart
- **RevenueChart**: Revenue chart
- **NewApplications**: New applications list

### Employer Detail Components

- **JobHistory**: Displays job history statistics
- **WorkHistory**: Displays work history table
- **AttendanceChart**: Attendance visualization
- **EmployeeStatCard**: Employee statistics card

---

## Pages

### Authentication Pages

#### SignIn (`src/pages/auth/SignIn.tsx`)
- Login form
- Email and password input
- Role selection (Admin)
- Error handling
- Redirects to dashboard on success

#### ForgotPassword (`src/pages/auth/ForgotPassword.tsx`)
- Password reset form
- Email input
- Reset link request

### Job Management Pages

#### JobManagement (`src/pages/JobManagement.tsx`)
- Main job listing page
- Filters and search
- Status tabs
- Pagination
- Job actions (view, edit, delete)

#### NewJob (`src/pages/jobManagemant/NewJob.tsx`)
- Create new job form
- Multi-step form
- Employer and outlet selection
- Shift configuration
- Penalties setup
- Requirements selection

#### ModifyJob (`src/pages/jobManagemant/ModifyJob.tsx`)
- Edit existing job
- Similar to NewJob but pre-filled
- Update shifts, penalties, requirements

#### JobDetailsPage (`src/pages/jobManagemant/JobDetailsPage.tsx`)
- View job details
- Manage shifts
- View candidates
- Track attendance
- Job statistics

#### CandidateProfile (`src/pages/jobManagemant/CandidateProfile.tsx`)
- View candidate details
- Job history
- Work history
- Documents

#### EditCandidateProfile (`src/pages/jobManagemant/EditCandidateProfile.tsx`)
- **FIXED**: Blank page issue resolved
- Edit candidate information
- Update documents
- Manage e-wallet
- Delete candidate

**Key Fix Applied**:
- Fixed array mapping issue in WorkHistory component
- Added null/undefined checks
- Ensured workHistory is always an array before mapping

### Employer Pages

#### Employers (`src/pages/employers/Employers.tsx`)
- Employer listing
- Search and filter
- Pagination
- Actions (view, edit, delete)

#### AddEmployer (`src/pages/employers/AddEmployer.tsx`)
- Create employer form
- Company information
- Contact details
- Outlets management
- Document upload

#### EditEmployer (`src/pages/employers/EditEmployer.tsx`)
- Edit employer form
- Similar to AddEmployer but pre-filled

#### ActiveJobPosting (`src/pages/employers/ActiveJobPosting.tsx`)
- View employer's active job postings
- Outlets list
- Tabs for jobs and outlets

#### OutletDetail (`src/pages/employers/OutletDetail.tsx`)
- View outlet details
- Outlet-specific information

---

## Common Issues & Fixes

### Issue 1: Blank Page on Edit Candidate Profile

**Problem**: Page shows blank when navigating to `/edit-candidate-profile/:id`

**Root Cause**: 
- `WorkHistory` component expected an array but received an object
- Component tried to call `.map()` on non-array data
- This caused a runtime error that crashed the component

**Solution Applied**:
1. Added array check in `WorkHistory` component:
   ```typescript
   const safeWorkHistory = Array.isArray(workHistory) ? workHistory : [];
   ```

2. Fixed data being passed from `EditCandidateProfile`:
   ```typescript
   <WorkHistory workHistory={Array.isArray(userData.workHistory) ? userData.workHistory : []} />
   ```

3. Added empty state handling:
   ```typescript
   {safeWorkHistory.length === 0 ? (
     <tr>
       <td colSpan={16} className="py-8 text-center text-gray-500">
         No work history available
       </td>
     </tr>
   ) : (
     safeWorkHistory.map((job, index) => (...))
   )}
   ```

### Issue 2: API Timeout Errors

**Problem**: Requests timing out

**Solution**:
- Timeout is set to 10 seconds in `authInstances.ts`
- Can be adjusted if needed
- Error handling shows user-friendly timeout message

### Issue 3: Authentication Redirect Loop

**Problem**: Infinite redirect between login and dashboard

**Solution**:
- Check `AuthContext` loading state
- Ensure token is properly stored in cookies
- Verify API `/user/me` endpoint returns correct format

### Issue 4: Image Not Loading

**Problem**: Images not displaying

**Solution**:
- Check `IMAGE_BASE_URL` constant
- Ensure image paths are correct
- Verify CORS settings on image server
- Check if image path starts with `http` (absolute) or needs base URL

### Issue 5: Form Validation Errors

**Problem**: Forms not validating correctly

**Solution**:
- Check required fields are marked with `required` attribute
- Verify validation functions are called
- Check error messages are displayed via toast

---

## Development Guidelines

### Code Style

1. **TypeScript**: Use TypeScript for all components
2. **Naming Conventions**:
   - Components: PascalCase (e.g., `EditCandidateProfile`)
   - Files: Match component name
   - Functions: camelCase (e.g., `handleSubmit`)
   - Constants: UPPER_SNAKE_CASE (e.g., `IMAGE_BASE_URL`)

3. **Component Structure**:
   ```typescript
   // Imports
   import React, { useState, useEffect } from 'react';
   
   // Types/Interfaces
   interface Props { ... }
   
   // Component
   const Component: React.FC<Props> = () => {
     // Hooks
     // State
     // Effects
     // Handlers
     // Render
   };
   
   export default Component;
   ```

### Best Practices

1. **Error Handling**:
   - Always wrap API calls in try-catch
   - Show user-friendly error messages
   - Log errors to console for debugging

2. **Loading States**:
   - Show loader during data fetching
   - Disable buttons during submission
   - Provide feedback to users

3. **Form Handling**:
   - Validate inputs before submission
   - Show validation errors
   - Prevent double submission

4. **State Management**:
   - Use `useState` for local state
   - Use `useContext` for global state (auth)
   - Avoid prop drilling

5. **API Calls**:
   - Use `axiosInstance` from `authInstances.ts`
   - Check `success` field in responses
   - Handle all error cases

6. **Array Operations**:
   - Always check if data is array before mapping
   - Provide fallback empty arrays
   - Handle null/undefined cases

### Testing Checklist

Before deploying:
- [ ] All routes are accessible
- [ ] Forms validate correctly
- [ ] API calls handle errors gracefully
- [ ] Loading states work properly
- [ ] Images load correctly
- [ ] Authentication works (login, logout)
- [ ] Protected routes redirect when not authenticated
- [ ] No console errors
- [ ] Responsive design works on mobile
- [ ] All buttons and links work

---

## Deployment

### Vercel Deployment

The project includes `vercel.json` for Vercel deployment:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures all routes are handled by React Router.

### Build Process

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Test production build locally**:
   ```bash
   npm run preview
   ```

3. **Deploy to Vercel**:
   - Connect GitHub repository
   - Vercel will auto-detect Vite
   - Set environment variables if needed
   - Deploy

### Environment Variables

If needed, create `.env` file:
```
VITE_API_BASE_URL=https://your-api-url.com/api
```

Access in code:
```typescript
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

### Production Checklist

- [ ] Update API base URL to production
- [ ] Update image base URL if needed
- [ ] Test all features in production
- [ ] Verify authentication works
- [ ] Check CORS settings
- [ ] Verify all API endpoints are accessible
- [ ] Test on different browsers
- [ ] Test on mobile devices

---

## API Documentation References

- **API_SPECIFICATION.md**: Complete API specification
- **EMPLOYER_API_FORMAT.md**: Employer-specific API format

---

## Support & Maintenance

### Common Tasks

1. **Update Dependencies**:
   ```bash
   npm update
   ```

2. **Check for Security Vulnerabilities**:
   ```bash
   npm audit
   ```

3. **Fix Security Issues**:
   ```bash
   npm audit fix
   ```

### Debugging

1. **Check Browser Console**: Look for errors
2. **Check Network Tab**: Verify API calls
3. **Check React DevTools**: Inspect component state
4. **Check Cookies**: Verify auth token is stored

### Getting Help

- Check this documentation first
- Review API documentation files
- Check component code for examples
- Review error messages in console

---

## Changelog

### Recent Fixes

**2024-01-XX**: Fixed blank page issue on Edit Candidate Profile
- Fixed WorkHistory component array mapping
- Added null/undefined checks
- Improved error handling

---

## License

[Add license information if applicable]

---

## Contact

[Add contact information if applicable]

---

**Last Updated**: January 2024
**Version**: 1.0.0

