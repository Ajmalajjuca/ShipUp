// src/App.tsx
import React, { JSX, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
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

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  return user ? children : <Navigate to="/login" />;
};
const PrivatePartnerRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { email } = useSelector((state: RootState) => state.driver);
  return email ? children : <Navigate to="/partner" />;
};

const AuthRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  return user ? <Navigate to="/home" /> : children;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeApp = async () => {
      const MIN_LOADING_TIME = 2000; // 2 seconds minimum loading time
      const startTime = Date.now();

      // Perform session restoration
      await restoreSession(dispatch);

      // Calculate elapsed time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_LOADING_TIME - elapsedTime;

      // Enforce minimum loading time if needed
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setIsSessionRestored(true);
    };

    initializeApp();
  }, [dispatch]);

  useEffect(() => {
    if (user && isSessionRestored) {
      window.history.pushState(null, '', window.location.href);
      const handleBackButton = (event: PopStateEvent) => {
        if (user) {
          window.history.pushState(null, '', window.location.href);
          navigate('/home');
        }
      };
      window.addEventListener('popstate', handleBackButton);
      return () => window.removeEventListener('popstate', handleBackButton);
    }
  }, [user, isSessionRestored, navigate]);

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
    <Routes>
      <Route path="/" element={<ShipUpHomepage />} />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <RegistrationForm />
          </AuthRoute>
        }
      />
      <Route
        path="/otp-verification"
        element={
          <AuthRoute>
            <OTPVerification />
          </AuthRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <AuthRoute>
            <PasswordReset />
          </AuthRoute>
        }
      />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <ShipUpApp />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/register"
        element={

          <PartnerReg />

        }
      />
      <Route
        path="/partner"
        element={

          <PartnerLog/>

        }
      />
      <Route
        path="/partner/dashboard"
        element={
          <PrivatePartnerRoute>
            <Verification/>
          </PrivatePartnerRoute>
        }
      />
      <Route
        path="/admin"
        element={
          
            <AdminLoginPage/>
          
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          
            <AdminDashboard/>
          
        }
      />
    </Routes>

  );
}

export default App;