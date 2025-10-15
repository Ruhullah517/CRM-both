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
  BriefcaseIcon,
  BoltIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import img3 from '../../public/img3.png';
const navItems = [
  { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'staff', 'caseworker', 'freelancer'], icon: HomeIcon },

  // Recruitment & Foster Care Section
  { name: 'Enquiries', path: '/enquiries', roles: ['admin', 'staff'], icon: QuestionMarkCircleIcon, section: 'recruitment' },
  { name: 'Recruitment Pipeline', path: '/recruitment', roles: ['admin', 'staff'], icon: UserGroupIcon, section: 'recruitment' },
  { name: 'Foster Carers', path: '/candidates', roles: ['admin', 'staff'], icon: UserGroupIcon, section: 'recruitment' },

  // Advocacy & Case Management Section
  { name: 'Case Management', path: '/cases', roles: ['admin', 'staff', 'caseworker', 'manager'], icon: FolderOpenIcon, section: 'advocacy' },

  // Contract Management Section
  { name: 'Contracts', path: '/contracts', roles: ['admin', 'staff'], icon: DocumentTextIcon, section: 'contract' },
  { name: 'Contract Templates', path: '/contract-templates', roles: ['admin', 'staff'], icon: ClipboardDocumentListIcon, section: 'contract' },

  // Training & Development Section
  { name: 'Training Events', path: '/training', roles: ['admin', 'staff'], icon: TrainingIcon, section: 'training' },
  { name: 'Certificates', path: '/certificates', roles: ['admin', 'staff'], icon: AcademicCapIcon, section: 'training' },
  { name: 'Invoices', path: '/invoices', roles: ['admin', 'staff'], icon: DocumentTextIcon, section: 'training' },
  { name: 'Calendar', path: '/calendar', roles: ['admin', 'staff'], icon: CalendarIcon, section: 'training' },

  // Staff & Resources Section
  { name: '👥 HR Module', path: '/hr-module', roles: ['admin', 'staff', 'manager'], icon: UserGroupIcon, section: 'staff', primary: true },
  // { name: 'Mentor Management', path: '/mentors', roles: ['admin', 'staff'], icon: AcademicCapIcon, section: 'staff' }, // DEPRECATED: Mentors are now managed as Freelancers in HR Module
  { name: 'User Management', path: '/users', roles: ['admin'], icon: UserGroupIcon, section: 'staff' },

  // Communication Section
  { name: '📊 Sales & Communication', path: '/sales-communication', roles: ['admin', 'staff', 'manager'], icon: BriefcaseIcon, section: 'communication', primary: true },
  { name: '⚙️ Email Templates', path: '/email-templates', roles: ['admin', 'staff'], icon: DocumentTextIcon, section: 'communication' },
  { name: '⚙️ Email Automations', path: '/email-automations', roles: ['admin', 'staff'], icon: BoltIcon, section: 'communication' },
  // Legacy pages - can be removed if not needed
  // { name: 'Email Management', path: '/email-management', roles: ['admin', 'staff'], icon: EnvelopeIcon, section: 'communication' },
  // { name: 'Contact Management', path: '/contact-management', roles: ['admin', 'staff'], icon: UserGroupIcon, section: 'communication' },

  // Operations Section

  { name: 'Reports', path: '/reports', roles: ['admin', 'staff'], icon: ClipboardDocumentListIcon, section: 'operations' },
  { name: 'GDPR Management', path: '/gdpr-management', roles: ['admin', 'manager'], icon: ShieldCheckIcon, section: 'operations' },

  // Freelancer-specific items
  { name: 'My Cases', path: '/my-cases', roles: ['freelancer'], icon: BriefcaseIcon, section: 'personal' },
  { name: 'My Profile', path: '/my-profile', roles: ['freelancer'], icon: UserCircleIcon, section: 'personal' },

  // Mentor-specific items  
  { name: 'My Cases', path: '/my-cases', roles: ['mentor'], icon: BriefcaseIcon, section: 'personal' },
  { name: 'My Profile', path: '/my-profile', roles: ['mentor'], icon: UserCircleIcon, section: 'personal' },

  // { name: 'Settings', path: '/settings', roles: ['admin', 'staff'], icon: Cog6ToothIcon },
];

export default function Sidebar({ onClose }) {
  const { role } = useAuth();

  // Group items by section
  const groupedItems = navItems
    .filter(item => role && item.roles.includes(role))
    .reduce((groups, item) => {
      const section = item.section || 'other';
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(item);
      return groups;
    }, {});

  // Section titles
  const sectionTitles = {
    recruitment: 'Recruitment & Foster Care',
    advocacy: 'Advocacy & Case Management',
    contract: 'Contract Management',
    training: 'Training & Development',
    staff: 'Staff & Resources',
    communication: 'Communication',
    operations: 'Operations',
    personal: 'Personal'
  };

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

      <nav className="flex flex-col gap-2">
        {Object.entries(groupedItems).map(([sectionKey, items]) => (
          <div key={sectionKey} className="mb-4">
            {/* Section Header */}
            {sectionTitles[sectionKey] && (
              <div className="px-2 py-1 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {sectionTitles[sectionKey]}
                </h3>
              </div>
            )}

            {/* Section Items */}
            <div className="flex flex-col gap-0.5">
              {items.map((item) => {
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
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
