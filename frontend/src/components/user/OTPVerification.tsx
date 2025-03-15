import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import FormContainer from '../common/FormContainer';
import { loginSuccess } from '../../Redux/slices/authSlice';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const email = location.state?.email || '';
  
  // Start countdown on component mount
  useEffect(() => {
    setCountdown(60);
  }, []);
  
  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasteData.length === 6) {
      setOtp(pasteData.split(''));
      verifyOtp(pasteData);
    }
  };

  const verifyOtp = async (otpValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3001/auth/verify-otp', {
        email,
        otp: otpValue,
      });
      
      const token = localStorage.getItem('token');
      const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');

      if (!token) throw new Error('Authentication token not found');

      dispatch(loginSuccess({ user: pendingUser, token }));
      localStorage.setItem('user', JSON.stringify(pendingUser));
      localStorage.removeItem('pendingUser');
      localStorage.removeItem('token'); // Clean up temporary token
      
      navigate('/home');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3001/auth/send-otp', { email });
      
      if (response.data.success) {
        setCountdown(60); // Reset countdown
        alert('OTP resent successfully');
      } else {
        throw new Error(response.data.message);
      }
      
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <FormContainer title="OTP Verification">
      <p className="text-gray-700 mb-6 text-center">Enter the OTP sent to {email}</p>
      
      <div className="flex justify-center mb-8" onPaste={handlePaste}>
        <div className="flex gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 rounded-lg bg-gray-50 text-center text-xl font-bold border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={loading || resending}
            />
          ))}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <button
        className={`w-full py-3 bg-indigo-900 text-white rounded-full font-medium hover:bg-indigo-800 transition ${(loading || resending) ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => otp.every(d => d) && verifyOtp(otp.join(''))}
        disabled={loading || resending || !otp.every(d => d)}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      
      {countdown > 0 ? (
        <button className="w-full py-3 text-gray-500 font-medium mt-4 cursor-not-allowed">
          Resend OTP in {countdown}s
        </button>
      ) : (
        <button
          className={`w-full py-3 text-indigo-900 font-medium mt-4 ${resending ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-700'}`}
          onClick={resendOtp}
          disabled={resending || loading}
        >
          {resending ? 'Resending...' : 'Resend OTP'}
        </button>
      )}
    </FormContainer>
  );
};

export default OTPVerification;