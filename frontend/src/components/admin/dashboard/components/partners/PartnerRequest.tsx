import React from 'react';
import { Search } from 'lucide-react';

interface PartnerRequest {
  sl: number;
  name: string;
  contactInfo: string;
  branch: string;
  identityType: string;
  identityNumber: string;
  identityImage: string;
  status: string;
}

interface PartnerRequestProps {
  requests: PartnerRequest[];
}

const PartnerRequest: React.FC<PartnerRequestProps> = ({ requests }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          New Joining Request <span className="text-gray-500 font-normal">({requests.length})</span>
        </h2>
        <div className="flex space-x-2">
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200">
            Pending Delivery Man
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
            Denied Delivery Man
          </button>
        </div>
      </div>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by Name or Phone"
          className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
        <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <th className="py-3 px-4 text-left">SL</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Contact Info</th>
              <th className="py-3 px-4 text-left">Branch</th>
              <th className="py-3 px-4 text-left">Identity Type</th>
              <th className="py-3 px-4 text-left">Identity Number</th>
              <th className="py-3 px-4 text-left">Identity Image</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.sl} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{request.sl}</td>
                <td className="py-3 px-4">{request.name}</td>
                <td className="py-3 px-4">{request.contactInfo}</td>
                <td className="py-3 px-4">{request.branch}</td>
                <td className="py-3 px-4">{request.identityType}</td>
                <td className="py-3 px-4">{request.identityNumber}</td>
                <td className="py-3 px-4">{request.identityImage}</td>
                <td className="py-3 px-4">{request.status}</td>
                <td className="py-3 px-4">
                  <button className="text-blue-500 hover:text-blue-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnerRequest;