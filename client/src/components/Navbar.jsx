import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="w-full h-16 bg-white shadow flex items-center justify-between px-4 sm:px-6">
      <div className="text-lg font-semibold truncate max-w-[60vw]">Welcome to BFCA CRM</div>
      <div className="flex items-center gap-4">
        {/* Hamburger for mobile */}
        {userInfo && (
          <div className="flex items-center gap-2 sm:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded hover:bg-gray-100">
              {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        )}
        {/* Desktop menu */}
        {userInfo && (
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/profile" className="text-gray-600 hover:underline text-sm">
              Profile
            </Link>
            <span className="text-gray-600 truncate max-w-[120px] text-xs md:text-sm">{userInfo.name} ({userInfo.role})</span>
            <button
              onClick={handleLogout}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
            >
              Logout
            </button>
            <UserCircleIcon className="w-8 h-8 text-green-700 bg-green-100 rounded-full p-1 border" />
          </div>
        )}
        {/* Mobile dropdown menu */}
        {userInfo && menuOpen && (
          <div className="absolute top-16 right-2 bg-white shadow-lg rounded p-4 flex flex-col gap-3 z-50 w-48 sm:hidden animate-fade-in">
            <Link to="/profile" className="text-gray-600 hover:underline text-sm" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
            <span className="text-gray-600 truncate max-w-[120px] text-xs">{userInfo.name} ({userInfo.role})</span>
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm text-left"
            >
              Logout
            </button>
            <UserCircleIcon className="w-8 h-8 text-green-700 bg-green-100 rounded-full p-1 border self-center" />
          </div>
        )}
      </div>
    </header>
  );
}
