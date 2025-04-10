import React, { useState } from 'react';
import { s3Utils } from '../../../utils/s3Utils';
import { driverService } from '../../../services/driver.service';
import { sessionManager } from '../../../utils/sessionManager';

interface DocumentUploadProps {
  documentType: string;
  onSubmit: (files: { front?: string; back?: string }) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  onSubmit,
}) => {
  const [files, setFiles] = useState<{ front?: File; back?: File }>({});
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});
  const [uploading, setUploading] = useState<{ front?: boolean; back?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleFileChange = (side: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [side]: 'Please upload an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [side]: 'File size should be less than 5MB' }));
      return;
    }

    setFiles(prev => ({ ...prev, [side]: file }));
    setErrors(prev => ({ ...prev, [side]: undefined }));
    
    // Clear general error when user takes action
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate both files are uploaded
    if (!files.front || !files.back) {
      setErrors({
        front: !files.front ? 'Front side photo is required' : undefined,
        back: !files.back ? 'Back side photo is required' : undefined
      });
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);
    
    try {
      setUploading({ front: true, back: true });
      

      // Perform real S3 uploads
      try {
        console.log('Uploading files to S3...');
        const [frontKey, backKey] = await Promise.all([
          s3Utils.uploadImage(files.front, 'shipup-driver-documents', true, true),
          s3Utils.uploadImage(files.back, 'shipup-driver-documents', true, true)
        ]);
        
        console.log('S3 URLs received:');
        console.log('- Front:', frontKey);
        console.log('- Back:', backKey);
        
        // If driver is logged in, also update the document URLs in the database
        const { driverData } = sessionManager.getDriverSession();
        if (driverData?.partnerId) {
          try {
            // Create vehicleDocuments object with just this document type
            const vehicleDocuments = {
              [documentType]: {
                frontUrl: frontKey,
                backUrl: backKey
              }
            };
            
            // Update document URLs in the database
            await driverService.updateDocumentUrls(driverData.partnerId, vehicleDocuments);
            console.log('Document URLs updated in database');
          } catch (error) {
            console.error('Could not update document URLs in database:', error);
            // Continue even if this fails - we'll still return the URLs to the parent component
          }
        }
        
        onSubmit({ front: frontKey, back: backKey });
      } catch (error) {
        console.error('Error uploading documents:', error);
        throw error;
      }
      
    } catch (error: any) {
      console.error('Document upload error:', error);
      setGeneralError(error.message || 'Failed to upload documents. Please try again.');
      setErrors({
        front: 'Failed to upload',
        back: 'Failed to upload'
      });
    } finally {
      setUploading({});
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Header */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Upload focused photo of your {documentType} for faster verification
        </p>
      </div>

      {generalError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="text-sm font-medium">{generalError}</p>
          <p className="text-xs mt-1">Please try again or contact support if the issue persists.</p>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Front side upload */}
        <div className={`border-2 border-dashed rounded-lg p-4 text-center h-[160px] flex flex-col justify-center items-center
          ${errors.front ? 'border-red-500' : 'border-gray-300'}`}
        >
          <p className="text-xs text-gray-600 mb-2">
            Front side photo of your {documentType}
          </p>
          
          {files.front ? (
            <div className="relative w-full h-[90px]">
              <img
                src={URL.createObjectURL(files.front)}
                alt="Front side"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFiles(prev => ({ ...prev, front: undefined }))}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                disabled={uploading.front}
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                id="frontSide"
                accept="image/*"
                onChange={(e) => handleFileChange('front', e)}
                className="hidden"
                disabled={uploading.front}
                aria-label="Upload front side of document"
                title="Upload front side of document"
              />
              <label
                htmlFor="frontSide"
                className={`inline-flex items-center px-3 py-1.5 text-xs text-red-500 cursor-pointer ${uploading.front ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {uploading.front ? 'Uploading...' : 'Upload Photo'}
              </label>
            </>
          )}
          
          {errors.front && (
            <p className="text-xs text-red-500 mt-1">{errors.front}</p>
          )}
        </div>

        {/* Back side upload */}
        <div className={`border-2 border-dashed rounded-lg p-4 text-center h-[160px] flex flex-col justify-center items-center
          ${errors.back ? 'border-red-500' : 'border-gray-300'}`}
        >
          <p className="text-xs text-gray-600 mb-2">
            Back side photo of your {documentType}
          </p>
          
          {files.back ? (
            <div className="relative w-full h-[90px]">
              <img
                src={URL.createObjectURL(files.back)}
                alt="Back side"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFiles(prev => ({ ...prev, back: undefined }))}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                disabled={uploading.back}
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                id="backSide"
                accept="image/*"
                onChange={(e) => handleFileChange('back', e)}
                className="hidden"
                disabled={uploading.back}
                aria-label="Upload back side of document"
                title="Upload back side of document"
              />
              <label
                htmlFor="backSide"
                className={`inline-flex items-center px-3 py-1.5 text-xs text-red-500 cursor-pointer ${uploading.back ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {uploading.back ? 'Uploading...' : 'Upload Photo'}
              </label>
            </>
          )}
          
          {errors.back && (
            <p className="text-xs text-red-500 mt-1">{errors.back}</p>
          )}
        </div>

        <button
          type="submit"
          className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-indigo-900 hover:bg-indigo-800'} text-white py-3 px-4 rounded-lg transition-colors`}
          disabled={isSubmitting || uploading.front || uploading.back}
        >
          {isSubmitting ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}; 