import React, { useState } from 'react';

interface DocumentUploadProps {
  documentType: string;
  onSubmit: (files: File[]) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  onSubmit,
}) => {
  const [files, setFiles] = useState<{ front?: File; back?: File }>({});
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate both files are uploaded
    if (!files.front || !files.back) {
      setErrors({
        front: !files.front ? 'Front side photo is required' : undefined,
        back: !files.back ? 'Back side photo is required' : undefined
      });
      return;
    }

    onSubmit([files.front, files.back]);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Header */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Upload focused photo of your {documentType} for faster verification
        </p>
      </div>

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
              />
              <label
                htmlFor="frontSide"
                className="inline-flex items-center px-3 py-1.5 text-xs text-red-500 cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload Photo
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
              />
              <label
                htmlFor="backSide"
                className="inline-flex items-center px-3 py-1.5 text-xs text-red-500 cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload Photo
              </label>
            </>
          )}
          
          {errors.back && (
            <p className="text-xs text-red-500 mt-1">{errors.back}</p>
          )}
        </div>

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