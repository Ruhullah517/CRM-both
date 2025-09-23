import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthGuard = ({ children }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user exists in context
      if (!user) {
        // Check localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          navigate('/');
          return;
        }
        
        try {
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser.token) {
            localStorage.removeItem('user');
            navigate('/');
            return;
          }
        } catch (error) {
          localStorage.removeItem('user');
          navigate('/');
          return;
        }
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [user, navigate]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
};

export default AuthGuard;
