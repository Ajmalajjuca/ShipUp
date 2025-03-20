import React, { JSX, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sessionManager } from '../utils/sessionManager';

const PrivatePartnerRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPartnerSession = async () => {
      try {
        const isValid = await sessionManager.verifyPartnerToken();
        setIsAuthenticated(isValid);
        
        if (!isValid) {
          navigate('/partner', { replace: true });
        }
      } catch (error) {
        console.error('Partner session verification failed:', error);
        setIsAuthenticated(false);
        navigate('/partner', { replace: true });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPartnerSession();
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default PrivatePartnerRoute; 