// src/App.tsx
import React, { JSX, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import RegistrationForm from './components/user/Login/RegistrationForm';
import ShipUpHomepage from './components/user/Landing/Homepage';
import ShipUpApp from './components/user/Home/Home';
import Profile from './components/user/Profile/Profile';
import PasswordReset from './components/user/PasswordReset';
import OTPVerification from './components/user/OTPVerification';
import { restoreSession } from './Redux/services/authService';
import { AppDispatch, RootState } from './Redux/store';
import PartnerReg from './components/driver/PartnerReg';
import PartnerLog from './components/driver/PartnerLog';
import Verification from './components/driver/Verification';
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import { Toaster } from 'react-hot-toast';
import { sessionManager } from './utils/sessionManager';
import axios from 'axios';
import { loginSuccess } from './Redux/slices/authSlice';
import EditProfile from './components/user/Profile/ProfileComponents/EditProfile';
import ProtectedRoute from './components/driver/ProtectedRoute';


const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      const isValidToken = await sessionManager.verifyToken();
      setIsValid(isValidToken);
      setIsVerifying(false);
    };
    verifySession();
  }, []);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  return isValid ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

const PrivatePartnerRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { email } = useSelector((state: RootState) => state.driver);
  return email ? children : <Navigate to="/partner" />;
};

const AuthRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  return !user ? children : null;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeApp = async () => {
      const MIN_LOADING_TIME = 2000;
      const startTime = Date.now();

      try {
        const { token, user } = sessionManager.getSession();
        if (token && user) {
          const isValid = await sessionManager.verifyToken();
          if (isValid) {
            const updatedSession = sessionManager.getSession();
            dispatch(loginSuccess({ user: updatedSession.user, token }));
          } else {
            sessionManager.clearSession();
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Session restoration error:', error);
        sessionManager.clearSession();
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_LOADING_TIME - elapsedTime;
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setIsSessionRestored(true);
    };

    initializeApp();
  }, [dispatch, navigate]);

  if (!isSessionRestored) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-w-md"
          src="/loading-video.mp4"
          onError={(e) => console.error('Video loading error:', e)}
        >
          <source src="/loading-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<ShipUpHomepage />} />
        <Route path="/login" element={<AuthRoute><RegistrationForm /></AuthRoute>} />
        <Route path="/reset-password" element={<AuthRoute><PasswordReset /></AuthRoute>} />
        <Route path="/otp-verification" element={<AuthRoute><OTPVerification /></AuthRoute>} />
        
        {/* Protected Routes */}
        <Route path="/home" element={<PrivateRoute><ShipUpApp /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/edit" element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        } />
        
        {/* Partner Routes */}
        <Route path="/register" element={<PartnerReg />} />
        <Route path="/partner" element={<PartnerLog />} />
        <Route 
          path="/partner/dashboard" 
          element={
            <ProtectedRoute>
              <Verification />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={
          <PrivateRoute><AdminDashboard /></PrivateRoute>
        } />
      </Routes>
    </>
  );
}

export default App;