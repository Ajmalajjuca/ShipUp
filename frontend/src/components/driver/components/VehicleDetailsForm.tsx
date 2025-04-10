import React, { useState } from 'react';
import { DriverRegistrationData } from '../types';
import { s3Utils } from '../../../utils/s3Utils';

// Define interface for document URLs
interface DocumentUrls {
  frontUrl?: string;
  backUrl?: string;
}

interface VehicleDetailsFormProps {
  initialData: Partial<DriverRegistrationData>;
  onSubmit: (data: Partial<DriverRegistrationData>) => void;
  onBack: () => void;
}

export const VehicleDetailsForm: React.FC<VehicleDetailsFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<DriverRegistrationData>>({
    vehicleType: initialData.vehicleType || '',
    registrationNumber: initialData.registrationNumber || '',
    vehicleMake: initialData.vehicleMake || '',
    vehicleModel: initialData.vehicleModel || '',
    manufacturingYear: initialData.manufacturingYear || '',
  });
  
  // Track front and back files for each document type
  const [documents, setDocuments] = useState<{
    insurance: { front?: File; back?: File };
    pollution: { front?: File; back?: File };
    registration: { front?: File; back?: File };
    permit: { front?: File; back?: File };
    license: { front?: File; back?: File };
  }>({
    insurance: {},
    pollution: {},
    registration: {},
    permit: {},
    license: {}
  });
  
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = (
    documentType: 'insurance' | 'pollution' | 'registration' | 'permit' | 'license',
    side: 'front' | 'back',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check for acceptable formats (PDF or image)
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [`${documentType}-${side}`]: 'Please upload a PDF or image file' }));
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [`${documentType}-${side}`]: 'File size should be less than 5MB' }));
      return;
    }

    setDocuments(prev => ({
      ...prev, 
      [documentType]: {
        ...prev[documentType],
        [side]: file
      }
    }));
    
    setErrors(prev => ({ ...prev, [`${documentType}-${side}`]: undefined }));
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

    // Document validations - check both front and back files
    if (!documents.insurance.front || !documents.insurance.back) {
      newErrors['insurance'] = 'Both front and back insurance documents are required';
    }
    
    if (!documents.pollution.front || !documents.pollution.back) {
      newErrors['pollution'] = 'Both front and back pollution certificate are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsUploading(true);
      const vehicleDocuments: Record<string, DocumentUrls> = {};
      
      // Upload insurance documents to S3
      if (documents.insurance.front && documents.insurance.back) {
        console.log('Uploading insurance documents to S3...');
        
        const [frontUrl, backUrl] = await Promise.all([
          s3Utils.uploadImage(documents.insurance.front, 'shipup-driver-documents', true, true),
          s3Utils.uploadImage(documents.insurance.back, 'shipup-driver-documents', true, true)
        ]);
        
        vehicleDocuments.insurance = { frontUrl, backUrl };
      }
      
      // Upload pollution documents to S3
      if (documents.pollution.front && documents.pollution.back) {
        console.log('Uploading pollution documents to S3...');
        
        const [frontUrl, backUrl] = await Promise.all([
          s3Utils.uploadImage(documents.pollution.front, 'shipup-driver-documents', true, true),
          s3Utils.uploadImage(documents.pollution.back, 'shipup-driver-documents', true, true)
        ]);
        
        vehicleDocuments.pollution = { frontUrl, backUrl };
      }
      
      // Submit the form with the updated data structure
      onSubmit({
        ...formData,
        vehicleDocuments: {
          ...initialData.vehicleDocuments,
          ...vehicleDocuments
        }
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      setErrors({ form: 'Failed to upload documents. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const renderFileUpload = (
    type: 'insurance' | 'pollution' | 'registration' | 'permit' | 'license',
    label: string
  ) => (
    <div className="mb-4">
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      
      {/* Front side upload */}
      <div className={`border-2 border-dashed rounded-lg p-3 mb-2 text-center flex flex-col justify-center items-center
        ${errors[`${type}-front`] ? 'border-red-500' : 'border-gray-300'}`}
      >
        <p className="text-xs text-gray-600 mb-1">Front side</p>
        
        {documents[type].front ? (
          <div className="relative w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div className="ml-2 text-left">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {documents[type].front?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(documents[type].front?.size ? (documents[type].front.size / 1024 / 1024).toFixed(2) : '0')} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDocuments(prev => ({ 
                ...prev, 
                [type]: { ...prev[type], front: undefined } 
              }))}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove ${type} front document`}
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
              id={`${type}-front`}
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(type, 'front', e)}
              className="hidden"
            />
            <label
              htmlFor={`${type}-front`}
              className="inline-flex flex-col items-center cursor-pointer"
            >
              <svg className="w-6 h-6 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-xs text-red-500">Upload</span>
            </label>
          </>
        )}
        
        {errors[`${type}-front`] && (
          <p className="text-xs text-red-500 mt-1">{errors[`${type}-front`]}</p>
        )}
      </div>
      
      {/* Back side upload */}
      <div className={`border-2 border-dashed rounded-lg p-3 text-center flex flex-col justify-center items-center
        ${errors[`${type}-back`] ? 'border-red-500' : 'border-gray-300'}`}
      >
        <p className="text-xs text-gray-600 mb-1">Back side</p>
        
        {documents[type].back ? (
          <div className="relative w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div className="ml-2 text-left">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {documents[type].back?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(documents[type].back?.size ? (documents[type].back.size / 1024 / 1024).toFixed(2) : '0')} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDocuments(prev => ({ 
                ...prev, 
                [type]: { ...prev[type], back: undefined } 
              }))}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove ${type} back document`}
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
              id={`${type}-back`}
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(type, 'back', e)}
              className="hidden"
            />
            <label
              htmlFor={`${type}-back`}
              className="inline-flex flex-col items-center cursor-pointer"
            >
              <svg className="w-6 h-6 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-xs text-red-500">Upload</span>
            </label>
          </>
        )}
        
        {errors[`${type}-back`] && (
          <p className="text-xs text-red-500 mt-1">{errors[`${type}-back`]}</p>
        )}
      </div>
      
      {errors[type] && (
        <p className="text-xs text-red-500 mt-1">{errors[type]}</p>
      )}
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
            disabled={isUploading}
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
              disabled={isUploading}
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
        {renderFileUpload('insurance', 'Vehicle Insurance Document')}

        {/* Pollution Certificate */}
        {renderFileUpload('pollution', 'Pollution Certificate')}

        {errors.form && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-500">{errors.form}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className={`w-full mt-4 ${isUploading ? 'bg-gray-500' : 'bg-indigo-900 hover:bg-indigo-800'} text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center text-sm`}
        >
          {isUploading ? 'Uploading Documents...' : 'Submit'}
          {!isUploading && <span className="ml-2">→</span>}
        </button>
      </form>
    </div>
  );
};