import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sessionManager } from '../../utils/sessionManager';
import { LogOut, Truck, Package, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { RootState } from '../../Redux/store';

const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const driverData = useSelector((state: RootState) => state.driver.driverData);

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Partner Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="w-10 h-10 text-indigo-600" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Total Deliveries</h2>
                <p className="text-3xl font-bold text-indigo-600">0</p>
              </div>
            </div>
          </div>

          {/* Add more dashboard content as needed */}
        </div>
      </main>
    </div>
  );
};

export default PartnerDashboard; 