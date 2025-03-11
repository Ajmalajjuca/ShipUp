// src/components/Login/RegistrationForm.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../../Redux/slices/authSlice';
import FormContainer from '../../common/FormContainer';
import { RootState } from '../../../Redux/store';

interface FormData {
  fullName?: string;
  phone?: string;
  email: string;
  password: string;
}

const RegistrationForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [initialStage, setInitialStage] = useState<'Sign in' | 'Sign up'>('Sign in');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const endpoint = initialStage === 'Sign up' ? 'http://localhost:3001/auth/register' : 'http://localhost:3001/auth/login';

    try {
      dispatch(loginStart());
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      const { user, token } = response.data;

      if (initialStage === 'Sign up') {
        
        localStorage.setItem('token', token); 
        localStorage.setItem('pendingUser', JSON.stringify(user)); 
        navigate('/otp-verification', { state: { email: formData.email } });
      } else {
        dispatch(loginSuccess({ user, token }));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/home');
      }
      alert(`Success: ${response.data.message}`);
    } catch (error: any) {
      console.error('Submission Error:', error);
      dispatch(loginFailure(error.response?.data?.error || 'Login failed'));
      alert(`Error: ${error.response?.data?.error || 'Something went wrong!'}`);
    }
  };

  const handleGoogleAuth = () => {
    console.log('Google Auth clicked');
  };

  const footer = (
    <>
      {initialStage === 'Sign in' ? (
        <>
          Don't have an account?{' '}
          <button onClick={() => setInitialStage('Sign up')} className="text-blue-600 hover:underline font-medium">
            Sign up!
          </button>
        </>
      ) : (
        <>
          Already have an account?{' '}
          <button onClick={() => setInitialStage('Sign in')} className="text-blue-600 hover:underline font-medium">
            Sign in!
          </button>
        </>
      )}
    </>
  );

  return (
    <FormContainer
      title={initialStage === 'Sign up' ? 'Create an Account' : 'Sign In'}
      onSubmit={handleSubmit}
      footer={footer}
      showGoogleAuth={true}
      onGoogleAuthClick={handleGoogleAuth}
    >
      {initialStage === 'Sign up' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              name="fullName"
              className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+91"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="example.email@gmail.com"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter at least 8+ characters"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-900 text-white py-2 px-4 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium text-lg"
      >
        {initialStage}
      </button>
    </FormContainer>
  );
};

export default RegistrationForm;