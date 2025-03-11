import React, { useState } from 'react';
import { DriverRegistrationData } from '../types';

interface VehicleDetailsFormProps {
  initialData: Partial<DriverRegistrationData>;
  onSubmit: (data: Partial<DriverRegistrationData>) => void;
  onBack: () => void;
}

export const VehicleDetailsForm: React.FC<VehicleDetailsFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<DriverRegistrationData>>(initialData);
  const [documents, setDocuments] = useState<{
    insurance?: File;
    pollution?: File;
  }>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const vehicleTypes = [
    { id: '2-wheeler', label: '2-Wheeler' },
    { id: 'mini-truck', label: 'Mini Truck' },
    { id: 'truck', label: 'Truck' },
    { id: 'pickup', label: 'Pickup' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'registrationNumber') {
      // Convert to uppercase and remove spaces
      const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      // Add spaces after every 2 characters
      let finalValue = '';
      for (let i = 0; i < formattedValue.length; i++) {
        if (i > 0 && i % 2 === 0 && i < 8) {
          finalValue += ' ';
        }
        finalValue += formattedValue[i];
      }
      
      // Limit to max length (10 chars + 3 spaces = 13)
      if (finalValue.length <= 13) {
        setFormData(prev => ({ ...prev, [name]: finalValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (documentType: 'insurance' | 'pollution', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check for PDF format
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, [documentType]: 'Please upload a PDF file' }));
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [documentType]: 'File size should be less than 5MB' }));
      return;
    }

    setDocuments(prev => ({ ...prev, [documentType]: file }));
    setErrors(prev => ({ ...prev, [documentType]: undefined }));
  };

  const validateRegistrationNumber = (number: string) => {
    // Remove spaces for validation
    const cleanNumber = number.replace(/\s/g, '');
    
    // Check format: 2 letters + 2 numbers + 2 letters + 4 numbers
    const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    
    if (!regex.test(cleanNumber)) {
      return 'Invalid format. Example: KA 01 AB 1234';
    }

    // Additional state-specific validations
    const state = cleanNumber.substring(0, 2);
    const validStates = ['KA', 'TN', 'AP', 'TS', 'KL', 'MH', 'DL']; // Add more states as needed
    
    if (!validStates.includes(state)) {
      return 'Invalid state code';
    }

    // Validate district code (01-99)
    const district = parseInt(cleanNumber.substring(2, 4));
    if (district < 1 || district > 99) {
      return 'Invalid district code';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Vehicle Type validation
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Vehicle type is required';
    }

    // Registration Number validation
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = 'Registration number is required';
    } else {
      const regError = validateRegistrationNumber(formData.registrationNumber);
      if (regError) {
        newErrors.registrationNumber = regError;
      }
    }

    // Document validations
    if (!documents.insurance) {
      newErrors.insurance = 'Insurance document is required';
    }
    if (!documents.pollution) {
      newErrors.pollution = 'Pollution certificate is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formData, insuranceDoc: documents.insurance, pollutionDoc: documents.pollution });
    }
  };

  const renderFileUpload = (type: 'insurance' | 'pollution', label: string) => (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className={`border-2 border-dashed rounded-lg p-4 text-center h-[120px] flex flex-col justify-center items-center
        ${errors[type] ? 'border-red-500' : 'border-gray-300'}`}
      >
        {documents[type] ? (
          <div className="relative w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div className="ml-2 text-left">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {documents[type]?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(documents[type]?.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDocuments(prev => ({ ...prev, [type]: undefined }))}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove ${type} document`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              id={type}
              accept=".pdf"
              onChange={(e) => handleFileChange(type, e)}
              className="hidden"
            />
            <label
              htmlFor={type}
              className="inline-flex flex-col items-center cursor-pointer"
            >
              <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-xs text-red-500">Upload PDF</span>
              <span className="text-xs text-gray-400 mt-1">Max size: 5MB</span>
            </label>
          </>
        )}
        {errors[type] && (
          <p className="text-xs text-red-500 mt-1">{errors[type]}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Vehicle Type */}
        <div>
          <label htmlFor="vehicleType" className="block text-xs text-gray-600 mb-1">Vehicle Type</label>
          <select
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.vehicleType ? 'border-red-500' : 'border-gray-200'
            } focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none transition-all`}
          >
            <option value="">Select vehicle type</option>
            {vehicleTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.vehicleType && (
            <p className="text-xs text-red-500 mt-1">{errors.vehicleType}</p>
          )}
        </div>

        {/* Updated Registration Number field */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Vehicle Registration Number</label>
          <div className="relative">
            <input
              type="text"
              name="registrationNumber"
              placeholder="KA 01 AB 1234"
              value={formData.registrationNumber || ''}
              onChange={handleChange}
              maxLength={13}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.registrationNumber ? 'border-red-500' : 'border-gray-200'
              } focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none transition-all uppercase`}
            />
            {formData.registrationNumber && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {!errors.registrationNumber ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {errors.registrationNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.registrationNumber}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Format: SS NN XX NNNN (S: State, N: Number, X: Letter)</p>
        </div>

        {/* Insurance Document */}
        {renderFileUpload('insurance', 'Vehicle Insurance Document (PDF')}

        {/* Pollution Certificate */}
        {renderFileUpload('pollution', 'Pollution Certificate (PDF')}

        <button
          type="submit"
          className="w-full mt-4 bg-indigo-900 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-800 transition-colors flex items-center justify-center text-sm"
        >
          Submit
          <span className="ml-2">→</span>
        </button>
      </form>
    </div>
  );
};