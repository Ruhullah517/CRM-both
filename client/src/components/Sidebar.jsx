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
  { name: 'Contract Templates', path: '/contract-templates', roles: ['admin', 'staff'], icon: ClipboardDocumentListIcon },
  { name: 'Mentor Management', path: '/mentors', roles: ['admin', 'staff'], icon: AcademicCapIcon },
  { name: 'Enquiries', path: '/enquiries', roles: ['admin', 'staff'], icon: QuestionMarkCircleIcon },
  { name: 'User Management', path: '/users', roles: ['admin'], icon: UserGroupIcon },
  // { name: 'Settings', path: '/settings', roles: ['admin', 'staff'], icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const { role } = useAuth();

  return (
    <aside className="h-screen w-20 md:w-56 bg-black text-white flex flex-col py-6 px-2 md:px-4 transition-all duration-200 overflow-y-auto flex-shrink-0">
      <div className="relative w-full flex justify-center items-center mb-8">
        <img
          src={img3}
          alt=""
          className="w-6 h-6 md:w-14 md:h-14 object-cover md:rounded-none"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
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
                  `px-4 py-2 rounded hover:bg-green-700 text-[15px] transition flex items-center gap-2 justify-center md:justify-start ${isActive ? 'bg-[#2EAB2C] font-semibold' : ''}`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline-block">{item.name}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
}
