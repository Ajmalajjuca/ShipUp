// src/components/OTPVerification.tsx
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import FormContainer from '../common/FormContainer';
import { loginSuccess } from '../../Redux/slices/authSlice';

interface OTPVerificationProps {
  length?: number;
  onComplete?: (otp: string) => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ length = 6, onComplete = () => {} }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(length).fill(null));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const email = location.state?.email || '';

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (newOtp.every((digit) => digit !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    if (pasteData.length === length && /^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[length - 1]?.focus();
      verifyOtp(pasteData);
    }
  };

  const verifyOtp = async (otpValue: string) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/verify-otp', {
        email,
        otp: otpValue,
      });
      const token = localStorage.getItem('token');
      const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');

      if (!token) {
        throw new Error('No token found');
      }

      // Dispatch loginSuccess with proper types
      dispatch(loginSuccess({ user: pendingUser, token }));
      localStorage.setItem('user', JSON.stringify(pendingUser));
      localStorage.removeItem('pendingUser');

      alert(`Success: ${response.data.message}`);
      navigate('/home');
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      alert(`Error: ${error.response?.data?.error || 'Invalid OTP'}`);
    }
  };

  const footer = (
    <p className="text-sm text-gray-600">
      Back to{' '}
      <a href="/login" className="text-blue-500">
        Sign In
      </a>
    </p>
  );

  return (
    <FormContainer title="OTP Verification" footer={footer}>
      <p className="text-gray-700 mb-4">Enter the OTP sent to {email}</p>
      <div className="flex gap-2 mb-6" onPaste={handlePaste}>
        {Array.from({ length }, (_, index) => (
          <input
            title="otp"
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            ref={(el) => {
              inputRefs.current[index] = el; // Assign the element to the ref array
            }}
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-12 rounded-full bg-gray-100 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="one-time-code"
          />
        ))}
      </div>
      <button
        className="w-full py-3 bg-indigo-900 text-white rounded-full font-medium hover:bg-indigo-800 transition"
        onClick={() => {
          if (otp.every((digit) => digit !== '')) {
            verifyOtp(otp.join(''));
          }
        }}
      >
        Verify
      </button>
    </FormContainer>
  );
};

export default OTPVerification;