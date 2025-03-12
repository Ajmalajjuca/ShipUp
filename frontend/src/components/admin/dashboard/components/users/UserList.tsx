import React from 'react';
import { Search } from 'lucide-react';

interface User {
  sl: number;
  name: string;
  contactInfo: string;
  totalOrders: number;
  totalAmount: number;
  availablePoints: number;
  status: boolean;
}

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Customers <span className="text-gray-500 font-normal">({users.length})</span></h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Name or Phone"
            className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
          <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <th className="py-3 px-4 text-left">SL</th>
              <th className="py-3 px-4 text-left">Customer Name</th>
              <th className="py-3 px-4 text-left">Customer Info</th>
              <th className="py-3 px-4 text-left">Total Orders</th>
              <th className="py-3 px-4 text-left">Total Order Amount</th>
              <th className="py-3 px-4 text-left">Available Points</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.sl} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.sl}</td>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.contactInfo}</td>
                <td className="py-3 px-4">{user.totalOrders}</td>
                <td className="py-3 px-4">{user.totalAmount}</td>
                <td className="py-3 px-4">{user.availablePoints}</td>
                <td className="py-3 px-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={user.status} className="hidden" readOnly />
                    <span className={`w-10 h-5 flex items-center rounded-full p-1 ${user.status ? 'bg-green-500' : 'bg-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${user.status ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </span>
                  </label>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button className="text-green-500 hover:text-green-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;