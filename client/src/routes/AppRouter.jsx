import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Candidates from '../pages/Candidates';
import Cases from '../pages/Cases';
import Contracts from '../pages/Contracts';
import Freelancers from '../pages/Freelancers';
import DashboardLayout from '../layouts/DashboardLayout';
import ResetPassword from '../pages/ResetPassword';
import Profile from '../pages/Profile';
import RecruitmentPipeline from '../pages/RecruitmentPipeline';
import EmailTemplates from '../pages/EmailTemplates';
import ContractTemplates from '../pages/ContractTemplates';
import Mentors from '../pages/Mentors';
import Users from '../pages/Users';
import PrivateRoute from './PrivateRoute';
import Enquiries from '../pages/Enquiries';
import EnquiryDetail from '../pages/EnquiryDetail';
import Settings from '../pages/settings';
import FreelancerPublicForm from '../pages/FreelancerPublicForm';
import TrainingEvents from '../pages/TrainingEvents';
import PublicTrainingBooking from '../pages/PublicTrainingBooking';
import Certificates from '../pages/Certificates';
import Invoices from '../pages/Invoices';
import Calendar from '../pages/Calendar';
import EmailManagement from '../pages/EmailManagement';
import EmailAutomations from '../pages/EmailAutomations';
import GDPRManagement from '../pages/GDPRManagement';
import ContactManagement from '../pages/ContactManagement';
import Reports from '../pages/Reports';
import InitialAssessment from '../pages/InitialAssessment';
import FullAssessment from '../pages/FullAssessment';
import CaseClosure from '../pages/CaseClosure';


import PublicFeedback from '../pages/PublicFeedback';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route element={<PrivateRoute roles={["admin", "manager", "staff"]} />}>
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/pipeline" element={<RecruitmentPipeline />} />
              <Route path="/email-templates" element={<EmailTemplates />} />
              <Route path="/email-management" element={<EmailManagement />} />
              <Route path="/email-automations" element={<EmailAutomations />} />
              <Route path="/gdpr-management" element={<GDPRManagement />} />
              <Route path="/initial-assessment/:id" element={<InitialAssessment />} />
              <Route path="/full-assessment/:id" element={<FullAssessment />} />
              <Route path="/case-closure/:id" element={<CaseClosure />} />
              <Route path="/contract-templates" element={<ContractTemplates />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/freelancers" element={<Freelancers />} />
              <Route path="/training" element={<TrainingEvents />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/email-management" element={<EmailManagement />} />
              <Route path="/contact-management" element={<ContactManagement />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            <Route element={<PrivateRoute roles={["admin", "manager", "caseworker"]} />}>
              <Route path="/referrals" element={<Cases />} />
            </Route>

            <Route element={<PrivateRoute roles={["admin", "manager", "staff", "caseworker", "trainer"]} />}>
              <Route path="/calendar" element={<Calendar />} />
            </Route>
            <Route path="/profile" element={<Profile />} />
            {/* Admin-only routes */}
            <Route element={<PrivateRoute roles={["admin"]} />}>
              <Route path="/users" element={<Users />} />
            </Route>
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/enquiries/:id" element={<EnquiryDetail />} />
              <Route path="/settings" element={<Settings />} />

          </Route>
        </Route>
        <Route path="/freelancer-form/:token" element={<FreelancerPublicForm />} />
        <Route path="/training/:bookingLink" element={<PublicTrainingBooking />} />
        <Route path="/feedback/:bookingId" element={<PublicFeedback />} />
      </Routes>
    </BrowserRouter>
  );
}
