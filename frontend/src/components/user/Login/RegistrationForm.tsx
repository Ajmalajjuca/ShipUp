import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../../Redux/slices/authSlice';
import FormContainer from '../../common/FormContainer';
import { RootState } from '../../../Redux/store';
import { toast } from 'react-hot-toast';
import { sessionManager } from '../../../utils/sessionManager';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

const RegistrationForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [initialStage, setInitialStage] = useState<'Sign in' | 'Sign up'>('Sign in');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.auth);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) return false;
    if (initialStage === 'Sign up' && (!formData.fullName || !formData.phone)) return false;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    const requestData = { ...formData, role: 'user' };
    const endpoint = initialStage === 'Sign up'
      ? 'http://localhost:3001/auth/register'
      : 'http://localhost:3001/auth/login';

    try {
      dispatch(loginStart());
      const response = await axios.post(endpoint, requestData);

      const { user, token } = response.data;

      if (initialStage === 'Sign up') {
        sessionManager.setTempSession(user, token);
        navigate('/otp-verification', { state: { email: formData.email } });
      } else {
        sessionManager.setSession(user, token);
        navigate('/');
      }
    } catch (error: any) {
      dispatch(loginFailure(error.response?.data?.error || 'Authentication failed'));
      toast.error(error.response?.data?.error || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Implement Google Auth logic here
  };

  const footer = (
    <div className="text-sm">
      {initialStage === 'Sign in' ? (
        <>Don't have an account? <button onClick={() => setInitialStage('Sign up')} className="text-blue-600 hover:underline font-medium">Sign up!</button></>
      ) : (
        <>Already have an account? <button onClick={() => setInitialStage('Sign in')} className="text-blue-600 hover:underline font-medium">Sign in!</button></>
      )}
    </div>
  );

  return (
    <FormContainer
      title={initialStage}
      subtitle={initialStage === 'Sign in' ? "Welcome back! Please enter your details." : "Create your account"}
      toggleText={initialStage === 'Sign in' ? "Don't have an account?" : "Already have an account?"}
      toggleAction={() => setInitialStage(initialStage === 'Sign in' ? 'Sign up' : 'Sign in')}
      toggleButtonText={initialStage === 'Sign in' ? 'Sign up' : 'Sign in'}
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
              required
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
              required
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
          required
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
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-indigo-900 text-white py-2 px-4 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium text-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Loading...' : initialStage}
      </button>

      <div className="flex justify-between items-center w-full mt-4">
        {initialStage === 'Sign in' && (
          <button
            type="button"
            onClick={() => navigate('/reset-password')}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Forgot Password?
          </button>
        )}
        <Link
          to="/partner"
          className="text-indigo-900 hover:text-indigo-700 text-sm font-medium ml-auto"
        >
          Back to Partner Login
        </Link>
      </div>
    </FormContainer>
  );
};

export default RegistrationForm;