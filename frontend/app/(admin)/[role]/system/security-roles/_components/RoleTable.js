"use client";

import { useDispatch } from "react-redux";
import { updateUserRole } from "@/store/roleSlice";
import { useState } from "react";

export default function RoleTable({ users, roles }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  const handleRoleChange = (userId, roleId) => {
    dispatch(updateUserRole({ userId, roleId }));
  };

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
      {/* Search Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-purple-50 text-gray-700 text-sm">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Added On</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.user_id} className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-800">{u.first_name} {u.last_name}</div>
                </td>
                <td className="p-4 text-gray-600 text-sm">{u.email}</td>
                <td className="p-4">
                  <select
                    value={roles.find(r => r.role_name === u.role_name)?.role_id || ""}
                    onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {roles.map(role => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-gray-600 text-sm">
                  {new Date(u.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    u.is_active 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-red-100 text-red-600"
                  }`}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-100">
        {filteredUsers.map((u) => (
          <div key={u.user_id} className="p-4 hover:bg-purple-50/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-800">{u.first_name} {u.last_name}</div>
                <div className="text-sm text-gray-500 mt-0.5">{u.email}</div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                u.is_active 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-red-100 text-red-600"
              }`}>
                {u.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Role:</span>
                <select
                  value={roles.find(r => r.role_name === u.role_name)?.role_id || ""}
                  onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                  className="border border-gray-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {roles.map(role => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Added:</span>
                <span className="text-gray-700">
                  {new Date(u.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="pt-2">
                <button className="text-red-500 hover:text-red-700 text-sm font-medium">
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-medium">No members found</p>
          <p className="text-sm mt-1">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}
