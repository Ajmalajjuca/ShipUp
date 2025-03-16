import  { useState } from 'react';
import { User, Settings, LogOut,  Truck, MapPin, CreditCard, Bell, LifeBuoy, History,  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';
import { logoutUser } from '../../../../Redux/services/authService';

interface ModernProfilePageProps {
    onLogout: () => void;
}

const ModernProfilePage: React.FC<ModernProfilePageProps> = ({ onLogout }) => {
    const dispatch = useDispatch();
  const [isHovering, setIsHovering] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  
  // Sample user data (use actual data from Redux in production)
  const userData = user || {
    fullName: "John Doe",
    email: "John.Doe@Gmail.Com",
    phone: "9887654321",
    referralId: "RF87534"
  };
  
  // Menu items expanded for a shipping profile
  const menuItems = [
    { id: 'edit', label: 'Edit Your Profile', icon: <User size={20} /> },
    { id: 'address', label: 'Address Book', icon: <MapPin size={20} /> },
    { id: 'tracking', label: 'Track Shipments', icon: <Truck size={20} /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={20} /> },
    { id: 'history', label: 'Order History', icon: <History size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'support', label: 'Get Support', icon: <LifeBuoy size={20} /> },
  ];
  

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 p-6 max-w-6xl mx-auto bg-gray-50 rounded-lg shadow-sm">
      {/* Left Column - User Profile Card */}
      <div className="w-full md:w-1/3 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">
             Profile
          </h2>
          
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-900 to-red-400 flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">
                {userData.fullName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800">{userData.fullName}</h3>
            <p className="text-gray-600 mt-1">{userData.email}</p>
            <p className="text-gray-600 mt-1">{userData?.phone}</p>

            
            
            <div className="mt-6 w-full bg-gray-100 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Referral Id:</span>
                <span className="font-mono font-medium">{userData?.referralId}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-4">
            <button 
              onMouseEnter={() => setIsHovering('settings')}
              onMouseLeave={() => setIsHovering('')}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
            >
              <Settings size={20} className={`transition-all duration-300 ${isHovering === 'settings' ? 'rotate-90 text-red-400' : 'text-gray-600'}`} />
            </button>
            <button 
            onClick={onLogout}
              onMouseEnter={() => setIsHovering('logout')}
              onMouseLeave={() => setIsHovering('')}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
            >
              <LogOut size={20} className={`transition-all duration-300 ${isHovering === 'logout' ? 'text-red-400 translate-x-1' : 'text-gray-600'}`} />
            </button>
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
        </div>
      </div>
      
      {/* Right Column - Menu Items */}
      <div className="w-full md:w-2/3 space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onMouseEnter={() => setIsHovering(item.id)}
            onMouseLeave={() => setIsHovering('')}
            className="w-full bg-white hover:bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group"
            onClick={() => navigate(`/${item.id}`)}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
                isHovering === item.id 
                  ? 'bg-red-100 text-red-400' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {item.icon}
              </div>
              <span className={`font-medium transition-all duration-300 ${
                isHovering === item.id 
                  ? 'text-red-400' 
                  : 'text-gray-800'
              }`}>
                {item.label}
              </span>
            </div>
            <svg 
              className={`w-5 h-5 transition-all duration-300 ${
                isHovering === item.id 
                  ? 'transform translate-x-1 text-red-400' 
                  : 'text-gray-400'
              }`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModernProfilePage;