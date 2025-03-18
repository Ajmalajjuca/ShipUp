import React, { useState, useEffect } from 'react';
import { Search, Edit2, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';
import { sessionManager } from '../../../../../utils/sessionManager';
import { toast } from 'react-hot-toast';
import Pagination from '../../../../common/Pagination';

interface Partner {
  partnerId: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  status: boolean;
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalAmount?: number;
  availablePoints?: number;
  bankDetailsCompleted: boolean;
  personalDocumentsCompleted: boolean;
  vehicleDetailsCompleted: boolean;
}

const PartnerList: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { token } = sessionManager.getSession();
      const response = await axios.get('http://localhost:3003/api/drivers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter only fully verified partners
      const verifiedPartners = (response.data.partners || []).filter((partner: Partner) => 
        partner.bankDetailsCompleted === true && 
        partner.personalDocumentsCompleted === true && 
        partner.vehicleDetailsCompleted === true
      );
      
      setPartners(verifiedPartners);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to fetch partners');
      setLoading(false);
    }
  };

  const handleStatusToggle = async (partnerId: string, currentStatus: boolean) => {
    try {
      const { token } = sessionManager.getSession();
      await axios.put(
        `http://localhost:3003/api/drivers/${partnerId}/status`,
        { status: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPartners(partners.map(partner => 
        partner.partnerId === partnerId ? {...partner, status: !currentStatus} : partner
      ));
      toast.success('Status updated successfully');
    } catch (err) {
      console.error('Error updating partner status:', err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (partnerId: string) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;

    try {
      const { token } = sessionManager.getSession();
      await axios.delete(`http://localhost:3003/api/drivers/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPartners(partners.filter(partner => partner.partnerId !== partnerId));
      toast.success('Partner deleted successfully');
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Failed to delete partner');
    }
  };

  const filteredPartners = partners.filter(partner => 
    partner.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone?.includes(searchTerm) ||
    partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 md:mb-0">
          Verified Partners <span className="text-gray-500 font-normal">({partners.length})</span>
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Name, Email or Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <th className="py-3 px-4 text-left">Sl No</th>
              <th className="py-3 px-4 text-left">Partner Name</th>
              <th className="py-3 px-4 text-left">Contact Info</th>
              <th className="py-3 px-4 text-left">Total Orders</th>
              <th className="py-3 px-4 text-left">Completed</th>
              <th className="py-3 px-4 text-left">Canceled</th>
              <th className="py-3 px-4 text-left">Total Amount</th>
              <th className="py-3 px-4 text-left">Points</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((partner, index) => (
              <tr key={partner.partnerId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {partner.profileImage ? (
                      <img 
                        src={partner.profileImage} 
                        alt={partner.fullName} 
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        <span className="text-gray-600 text-sm">
                          {partner.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {partner.fullName}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="text-sm">{partner.email}</div>
                    <div className="text-sm text-gray-500">{partner.phone}</div>
                  </div>
                </td>
                <td className="py-3 px-4">{partner.totalOrders || 0}</td>
                <td className="py-3 px-4">
                  <span className="text-green-600">{partner.completedOrders || 0}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-red-600">{partner.canceledOrders || 0}</span>
                </td>
                <td className="py-3 px-4">₹{(partner.totalAmount || 0).toFixed(2)}</td>
                <td className="py-3 px-4">{partner.availablePoints || 0}</td>
                <td className="py-3 px-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={partner.status} 
                      onChange={() => handleStatusToggle(partner.partnerId, partner.status)}
                      className="hidden" 
                      title="Toggle partner status"
                    />
                    <span 
                      className={`w-10 h-5 flex items-center rounded-full p-1 ${
                        partner.status ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      <span 
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          partner.status ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </span>
                  </label>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-3">
                    
                    <button 
                      className="text-green-500 hover:text-green-700 transition-colors"
                      title="View details"
                      onClick={() => {/* Add view handler */}}
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete partner"
                      onClick={() => handleDelete(partner.partnerId)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PartnerList;