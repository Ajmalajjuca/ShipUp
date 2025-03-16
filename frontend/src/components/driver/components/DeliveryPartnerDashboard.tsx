// File: DeliveryPartnerDashboard.tsx
import React, { useState } from 'react';
import { Bell, Package, DollarSign, LogOut, Truck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '../../../utils/sessionManager';
import { toast } from 'react-hot-toast';

// Stats Card Component
const StatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}> = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
      color === 'blue' ? 'bg-blue-100 text-blue-600' :
      color === 'green' ? 'bg-green-100 text-green-600' :
      color === 'orange' ? 'bg-orange-100 text-orange-600' :
      'bg-purple-100 text-purple-600'
    }`}>
      {icon}
    </div>
    <h3 className="text-gray-500 text-sm mb-2">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

// Online Toggle Component
const OnlineToggle: React.FC<{ isOnline: boolean; onToggle: () => void }> = ({ isOnline, onToggle }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold mb-2">Delivery Status</h2>
        <p className="text-gray-600">You are currently {isOnline ? 'Online' : 'Offline'}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-8 w-16 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-200 ${
          isOnline ? 'bg-green-500' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform ${
          isOnline ? 'translate-x-9' : 'translate-x-1'
        }`} />
      </button>
    </div>
  </div>
);

// Main Dashboard Component
const DeliveryPartnerDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      sessionManager.clearDriverSession();
      toast.success('Logged out successfully');
      navigate('/partner');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Partner Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} className="text-gray-600" />
              </button>
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Online Toggle */}
          <OnlineToggle isOnline={isOnline} onToggle={() => setIsOnline(!isOnline)} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              icon={<Package size={24} />}
              title="Today's Deliveries"
              value={isOnline ? "5" : "0"}
              color="blue"
            />
            <StatsCard 
              icon={<DollarSign size={24} />}
              title="Today's Earnings"
              value={isOnline ? "₹550" : "₹0"}
              color="green"
            />
            <StatsCard 
              icon={<Truck size={24} />}
              title="Total Deliveries"
              value="125"
              color="orange"
            />
            <StatsCard 
              icon={<Star size={24} />}
              title="Rating"
              value="4.8"
              color="purple"
            />
          </div>

          {/* Performance Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              {[
                { label: 'On-time Delivery', value: '96%', color: 'bg-green-500' },
                { label: 'Customer Rating', value: '4.8/5', color: 'bg-blue-500' },
                { label: 'Acceptance Rate', value: '92%', color: 'bg-orange-500' }
              ].map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{metric.label}</span>
                    <span className="font-medium">{metric.value}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${metric.color}`} 
                      style={{ width: metric.value.replace('%', '') + '%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryPartnerDashboard;