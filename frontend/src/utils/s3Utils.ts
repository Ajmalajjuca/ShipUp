import axios from 'axios';
import { sessionManager } from './sessionManager';

const USER_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002';
const PARTNER_URL = import.meta.env.VITE_PARTNER_SERVICE_UR || 'http://localhost:3003';
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001';

export const s3Utils = {
  getImageUrl: (key: string | null | undefined, bucket: string): string => {
    if (!key) return '';
    return `${USER_URL}/api/s3/${bucket}/${key}`;
  },

  // Get a temporary token for document uploads
  getTemporaryToken: async (): Promise<string> => {
    try {
      console.log('Requesting temporary token with data:', {
        purpose: 'document-upload',
        role: 'driver'
      });
      
      const data = {
        purpose: 'document-upload',
        role: 'driver'
      };
      
      const response = await axios({
        method: 'post',
        url: `${AUTH_URL}/auth/temp-token`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      });
      
      console.log('Temporary token response:', response.data);
      
      if (!response.data) {
        throw new Error('No response data received');
      }

      if (!response.data.success || !response.data.token) {
        throw new Error(response.data.error || 'Failed to get temporary token');
      }

      return response.data.token;
    } catch (error: any) {
      console.error('Error getting temporary token:', error.response?.data?.error || error.message);
      if (error.response) {
        console.error('Full error response:', error.response.data);
        console.error('Status code:', error.response.status);
        console.error('Headers:', error.response.headers);
      }
      throw new Error(error.response?.data?.error || 'Failed to get temporary token');
    }
  },

  uploadImage: async (file: File, bucket: string, isDriver: boolean = false, isTemporaryUpload: boolean = false): Promise<string> => {
    try {
      let token;
      
      // For temporary uploads during registration, always try to get a temporary token first
      if (isTemporaryUpload) {
        try {
          console.log('Attempting to get temporary token for file upload');
          token = await s3Utils.getTemporaryToken();
          console.log('Successfully obtained temporary token for upload');
        } catch (error) {
          console.error('Failed to get temporary token:', error);
          // Only fall back to session token if not a temporary upload
          if (!isTemporaryUpload) {
            console.log('Falling back to session token');
            if (isDriver) {
              const { token: driverToken } = sessionManager.getDriverSession();
              token = driverToken;
            } else {
              const { token: userToken } = sessionManager.getSession();
              token = userToken;
            }
          } else {
            throw error; // Re-throw for temporary uploads
          }
        }
      } else {
        // For non-temporary uploads, use session token
        if (isDriver) {
          const { token: driverToken } = sessionManager.getDriverSession();
          token = driverToken;
        } else {
          const { token: userToken } = sessionManager.getSession();
          token = userToken;
        }
      }

      if (!token) {
        throw new Error('No authentication token available. Please ensure you are logged in or try again.');
      }

      const formData = new FormData();
      
      // Check if this is a profile picture upload
      const isProfilePicture = file.name.includes('profile') || file.size < 200 * 1024;
      
      // Use the appropriate field name based on the file type
      if (isProfilePicture) {
        console.log('Detected profile picture upload');
        formData.append('profileImage', file); // Use profileImage field for profile pictures
      } else {
        formData.append('file', file);  // Use file field for regular documents
      }
      
      // Log file details
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        bucket: bucket,
        isProfilePicture: isProfilePicture
      });

      // Use partner service URL for driver uploads
      let uploadUrl = isDriver ? 
        `${PARTNER_URL}/api/s3/upload` : 
        `${USER_URL}/api/s3/upload`;
        
      // Add query parameter to indicate profile image if needed
      if (isProfilePicture) {
        uploadUrl += '?type=profile';
      }
        
      console.log('Uploading to URL:', uploadUrl);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        return response.data.fileUrl;
      }
      throw new Error(response.data.error || 'Failed to upload image');
    } catch (error: any) {
      console.error('Error uploading image:', error.response?.data?.error || error.message);
      if (error.response) {
        console.error('Full error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      throw new Error(error.response?.data?.error || 'Failed to upload image');
    }
  }
}; 