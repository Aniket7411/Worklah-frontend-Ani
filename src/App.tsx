import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import JobManagement from "./pages/JobManagement";
import EmployerDetailPage from "./pages/employers/EmployerDetailPage";
import CandidatesTable from "./pages/employers/CandidatesTable";
import JobDetailsPage from "./pages/jobManagemant/JobDetailsPage";
import CandidateProfile from "./pages/jobManagemant/CandidateProfile";
import EmployerTable from "./pages/employers/Employers";
import ActiveJobPosting from "./pages/employers/ActiveJobPosting";
import HustleHeroesList from "./pages/hustleHeroes/HustleHeroesList";
import EditCandidateProfile from "./pages/jobManagemant/EditCandidateProfile";
import EmployeePayments from "./pages/payments/EmployeePayments";
import EmployerPayments from "./pages/payments/EmployerPayments";
import SignIn from "./pages/auth/SignIn";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import { AuthProvider } from "./context/AuthContext";
import NewJob from "./pages/jobManagemant/NewJob";
import ModifyJob from "./pages/jobManagemant/ModifyJob";
import AddEmployer from "./pages/employers/AddEmployer";
import EditEmployer from "./pages/employers/EditEmployer";
import QRCodeManagement from "./pages/qrCode/QrCode";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SupportFeedback from "./pages/support/SupportFeedback";
// @ts-ignore
import SendNotification from "./pages/notifications/SendNotification";
// @ts-ignore
import TimesheetManagement from "./pages/timesheet/TimesheetManagement";
// @ts-ignore
import CreateUser from "./pages/admin/CreateUser";
import ApplicationsList from "./pages/applications/ApplicationsList";
import ApplicationDetail from "./pages/applications/ApplicationDetail";
import PenaltyManagement from "./pages/settings/PenaltyManagement";

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<SignIn />} />
      <Route path="forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* Job Management */}
          <Route path="jobs/job-management" element={<JobManagement />} />
          <Route path="jobs/create-job" element={<NewJob />} />
          <Route path="jobs/:jobId/outlet-attendance" element={<EmployerDetailPage />} />
          <Route path="jobs/:jobId/candidates" element={<CandidatesTable />} />
          <Route path="jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="jobs/:jobId/modify" element={<ModifyJob />} />
          <Route path="jobs/:jobId/candidates/:id" element={<CandidateProfile />} />
          <Route path="edit-candidate-profile/:id" element={<EditCandidateProfile />} />
          <Route path="applications" element={<ApplicationsList />} />
          <Route path="applications/:applicationId" element={<ApplicationDetail />} />

          {/* Employers pages */}
          <Route path="employers" element={<EmployerTable />} />
          <Route path="employers/add-employer" element={<AddEmployer />} />
          <Route path="employers/:id/edit" element={<EditEmployer />} />
          <Route path="employers/:id" element={<ActiveJobPosting />} />

          <Route path="hustle-heroes" element={<HustleHeroesList />} />
          <Route path="payments" element={<EmployeePayments />} />
          <Route path="employer-payments" element={<EmployerPayments />} />
          <Route path="support" element={<SupportFeedback />} />
          <Route path="qrCode" element={<QRCodeManagement />} />
          <Route path="notifications/send" element={<SendNotification />} />
          <Route path="timesheet" element={<TimesheetManagement />} />
          <Route path="admin/create-user" element={<CreateUser />} />
          <Route path="settings/penalties" element={<PenaltyManagement />} />

        </Route>
      </Route>
    </Routes>
  );
};

/*************  ✨ Codeium Command ⭐  *************/
/**
 * The main app component, which renders the AuthProvider and Router
/******  f561d04b-a663-47e8-8b66-0364932f600c  *******/const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
