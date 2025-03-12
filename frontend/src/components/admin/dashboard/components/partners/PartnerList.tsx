import React from 'react';
import { Search, Calendar } from 'lucide-react';

interface Partner {
  sl: number;
  name: string;
  contactInfo: string;
  joiningDate: string;
  totalOrders: number;
  ongoing: number;
  canceled: number;
  completed: number;
}

interface PartnerListProps {
  partners: Partner[];
}

const PartnerList: React.FC<PartnerListProps> = ({ partners }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 md:mb-0">
          Deliveryman List <span className="text-gray-500 font-normal">({partners.length})</span>
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email or phone"
              className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48"
            />
            <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200">
            Export
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200">
            + Add Deliveryman
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <th className="py-3 px-4 text-left">SL</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Contact Info</th>
              <th className="py-3 px-4 text-left">Joining Date</th>
              <th className="py-3 px-4 text-left">Total Orders</th>
              <th className="py-3 px-4 text-left">Ongoing</th>
              <th className="py-3 px-4 text-left">Cancel</th>
              <th className="py-3 px-4 text-left">Completed</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.sl} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{partner.sl}</td>
                <td className="py-3 px-4">{partner.name}</td>
                <td className="py-3 px-4">{partner.contactInfo}</td>
                <td className="py-3 px-4">{partner.joiningDate}</td>
                <td className="py-3 px-4">{partner.totalOrders}</td>
                <td className="py-3 px-4">{partner.ongoing}</td>
                <td className="py-3 px-4">{partner.canceled}</td>
                <td className="py-3 px-4">{partner.completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnerList;