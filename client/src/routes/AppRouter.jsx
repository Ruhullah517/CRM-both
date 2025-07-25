import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Candidates from '../pages/Candidates';
import Cases from '../pages/Cases';
import Contracts from '../pages/Contracts';
import Freelancers from '../pages/Freelancers';
import Contacts from '../pages/Contacts';
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
import AdobeCallback from '../pages/AdobeCallback';
import Settings from '../pages/settings';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/freelancers" element={<Freelancers />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pipeline" element={<RecruitmentPipeline />} />
            <Route path="/email-templates" element={<EmailTemplates />} />
            <Route path="/contract-templates" element={<ContractTemplates />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/users" element={<Users />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/enquiries/:id" element={<EnquiryDetail />} />
            <Route path="/adobe/callback" element={<AdobeCallback />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
