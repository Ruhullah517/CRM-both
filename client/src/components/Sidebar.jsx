import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  Squares2X2Icon,
  UserGroupIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  UserCircleIcon,
  IdentificationIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  AcademicCapIcon as TrainingIcon,
  CalendarIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import img3 from '../../public/img3.png';
const navItems = [
  { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'staff', 'caseworker', 'freelancer'], icon: HomeIcon },
  // { name: 'Recruitment Pipeline', path: '/pipeline', roles: ['admin', 'staff'], icon: Squares2X2Icon },
  { name: 'Foster Carers', path: '/candidates', roles: ['admin', 'staff'], icon: UserGroupIcon },
  { name: 'referrals', path: '/referrals', roles: ['admin', 'staff', 'caseworker'], icon: FolderOpenIcon },
  { name: 'Contracts', path: '/contracts', roles: ['admin', 'staff'], icon: DocumentTextIcon },
          { name: 'Freelancers', path: '/freelancers', roles: ['admin', 'staff', 'freelancer'], icon: UserCircleIcon },
        { name: 'Contacts', path: '/contacts', roles: ['admin', 'staff'], icon: IdentificationIcon },
        { name: 'Training Events', path: '/training', roles: ['admin', 'staff'], icon: TrainingIcon },

        { name: 'Certificates', path: '/certificates', roles: ['admin', 'staff'], icon: AcademicCapIcon },
        { name: 'Invoices', path: '/invoices', roles: ['admin', 'staff'], icon: DocumentTextIcon },
        { name: 'Calendar', path: '/calendar', roles: ['admin', 'staff'], icon: CalendarIcon },

  { name: 'Email Templates', path: '/email-templates', roles: ['admin', 'staff'], icon: EnvelopeIcon },
  { name: 'Email Management', path: '/email-management', roles: ['admin', 'staff'], icon: EnvelopeIcon },
  { name: 'Email Automations', path: '/email-automations', roles: ['admin', 'staff'], icon: EnvelopeIcon },
  { name: 'GDPR Management', path: '/gdpr-management', roles: ['admin', 'manager'], icon: ShieldCheckIcon },
  { name: 'Contact Management', path: '/contact-management', roles: ['admin', 'staff'], icon: UserGroupIcon },
  { name: 'Reports', path: '/reports', roles: ['admin', 'staff'], icon: ClipboardDocumentListIcon },
  { name: 'Contract Templates', path: '/contract-templates', roles: ['admin', 'staff'], icon: ClipboardDocumentListIcon },
  { name: 'Mentor Management', path: '/mentors', roles: ['admin', 'staff'], icon: AcademicCapIcon },
  { name: 'Enquiries', path: '/enquiries', roles: ['admin', 'staff'], icon: QuestionMarkCircleIcon },
  { name: 'User Management', path: '/users', roles: ['admin'], icon: UserGroupIcon },
  // { name: 'Settings', path: '/settings', roles: ['admin', 'staff'], icon: Cog6ToothIcon },
];

export default function Sidebar({ onClose }) {
  const { role } = useAuth();

  return (
    <aside className="h-screen w-64 bg-black text-white flex flex-col py-6 px-4 transition-all duration-200 overflow-y-auto flex-shrink-0">
      <div className="relative w-full flex justify-between items-center mb-8">
        <img
          src={img3}
          alt="BFCA Logo"
          className="w-14 h-14 object-cover"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden text-white hover:text-gray-300 focus:outline-none"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      {/* <div className="mb-8 text-2xl font-bold text-center hidden md:block">BFCA CRM</div> */}
      <nav className="flex flex-col gap-0.5">
        {navItems
          .filter(item => role && item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg hover:bg-green-700 text-sm transition flex items-center gap-3 ${isActive ? 'bg-[#2EAB2C] font-semibold' : ''}`
                }
                onClick={() => {
                  // Close mobile sidebar when navigating
                  if (onClose) onClose();
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
}
