import React, { useState } from 'react';
import { Settings, LogOut, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCardProps {
  userData: {
    fullName: string;
    email: string;
    phone?: string;
    referralId?: string;
    profileImage?: string;
  };
  showControls?: boolean;
  onLogout?: () => void;
  isEditing?: boolean;
  children?: React.ReactNode;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  userData, 
  showControls = true, 
  onLogout,
  isEditing = false,
  children 
}) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState('');

  return (
    <div className="w-full md:w-1/3 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          {isEditing ? 'Edit Profile' : 'Profile'}
        </h2>
        
        <div className="flex flex-col items-center">
          {userData.profileImage ? (
            <img 
              src={userData.profileImage} 
              alt={userData.fullName}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-900 to-red-400 flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">
                {userData.fullName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
          
          <h3 className="text-xl font-semibold text-gray-800">{userData.fullName}</h3>
          <p className="text-gray-600 mt-1">{userData.email}</p>
          <p className="text-gray-600 mt-1">{userData.phone}</p>

          {userData.referralId && (
            <div className="mt-6 w-full bg-gray-100 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Referral Id:</span>
                <span className="font-mono font-medium">{userData.referralId}</span>
              </div>
            </div>
          )}

          {children} {/* Slot for additional content */}
        </div>
        
        {showControls && (
          <>
            <div className="mt-6 flex justify-center space-x-4">
              <button 
                onMouseEnter={() => setIsHovering('settings')}
                onMouseLeave={() => setIsHovering('')}
                onClick={() => navigate('/profile/edit')}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
              >
                <Settings size={20} className={`transition-all duration-300 ${isHovering === 'settings' ? 'rotate-90 text-red-400' : 'text-gray-600'}`} />
              </button>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  onMouseEnter={() => setIsHovering('logout')}
                  onMouseLeave={() => setIsHovering('')}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                >
                  <LogOut size={20} className={`transition-all duration-300 ${isHovering === 'logout' ? 'text-red-400 translate-x-1' : 'text-gray-600'}`} />
                </button>
              )}
            </div>
            
            <div className="mt-6">
              <button 
                className="w-full bg-indigo-900 text-white py-3 px-4 rounded-md hover:bg-indigo-800 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => navigate("/become-partner")}
              >
                <Truck size={20} />
                Become a Delivery Partner
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard; 