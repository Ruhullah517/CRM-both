import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const userDropdownRef = useRef(null);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function confirmLogout() {
    setShowLogoutModal(true);
    setUserDropdownOpen(false);
  }

  function handleLogoutConfirm() {
    setShowLogoutModal(false);
    handleLogout();
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <UserCircleIcon className="w-8 h-8 text-green-700 bg-green-100 rounded-full p-1 border" />
              </button>
              
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg border p-3 min-w-[200px] z-50">
                  <div className="mb-3 pb-2 border-b border-gray-200">
                    <div className="font-semibold text-sm text-gray-900">{userInfo.name}</div>
                    <div className="text-xs text-gray-600">{userInfo.role}</div>
                    <div className="text-xs text-gray-500 truncate">{userInfo.email}</div>
                  </div>
                  <div className="space-y-1">
                    <Link 
                      to="/profile" 
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={confirmLogout}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Mobile dropdown menu */}
        {userInfo && menuOpen && (
          <div className="absolute top-16 right-2 bg-white shadow-lg rounded p-4 flex flex-col gap-3 z-50 w-48 sm:hidden animate-fade-in">
            <div className="mb-2 pb-2 border-b border-gray-200">
              <div className="font-semibold text-sm text-gray-900">{userInfo.name}</div>
              <div className="text-xs text-gray-600">{userInfo.role}</div>
              <div className="text-xs text-gray-500 truncate">{userInfo.email}</div>
            </div>
            <Link to="/profile" className="text-gray-600 hover:underline text-sm" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
            <button
              onClick={() => { setMenuOpen(false); confirmLogout(); }}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm text-left"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-600">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
