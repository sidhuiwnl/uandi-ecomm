"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, fetchRoles, fetchCustomers, assignMember } from "@/store/roleSlice";
import Swal from "sweetalert2";
import RoleCard from "./_components/RoleCard";
import RoleTable from "./_components/RoleTable";
import CustomerSelectionModal from "./_components/CustomerSelectionModal";

export default function SecurityRoles() {
  const dispatch = useDispatch();
  const { users, roles, customers } = useSelector((state) => state.roles);
  const [showModal, setShowModal] = useState(false);
  
  const normalizeRole = (name) => {
    const n = (name || '').toString().toLowerCase().replace(/[_-]+/g, ' ').trim();
    if (n.includes('super') && n.includes('admin')) return 'superadmin';
    if (n.includes('admin')) return 'admin';
    return n;
  };

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleAssignClick = () => {
    setShowModal(true);
  };

  const handleCustomerSelect = async (customer) => {
    const roleOptions = roles
      .filter((r) => r.role_name !== "Customer")
      .map((r) => ({
        text: r.role_name,
        value: r.role_id,
      }));

    const { value: roleId } = await Swal.fire({
      title: "Assign Role",
      html: `<p class="text-sm text-gray-600 mb-4">Assigning role to ${customer.first_name} ${customer.last_name}</p>`,
      input: "select",
      inputOptions: Object.fromEntries(roleOptions.map(r => [r.value, r.text])),
      inputPlaceholder: "Choose role",
      showCancelButton: true,
      confirmButtonColor: "#8b5cf6",
      cancelButtonColor: "#6b7280",
    });

    if (!roleId) return;

    dispatch(assignMember({ userId: customer.user_id, roleId }));
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-purple-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Members</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage Admin Accounts and Permissions</p>
        </div>
        <button
          onClick={handleAssignClick}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium text-sm sm:text-base whitespace-nowrap"
        >
          + Assign Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <RoleCard 
          title="Total Members" 
          value={users.length}
          bgColor="bg-gradient-to-br from-purple-100 to-purple-50"
          textColor="text-purple-700"
        />
        <RoleCard 
          title="Active Members" 
          value={users.filter(u => u.is_active).length}
          bgColor="bg-gradient-to-br from-emerald-100 to-emerald-50"
          textColor="text-emerald-700"
        />
        <RoleCard 
          title="Super Admin" 
          value={users.filter(u => normalizeRole(u.role_name) === 'superadmin').length}
          bgColor="bg-gradient-to-br from-indigo-100 to-indigo-50"
          textColor="text-indigo-700"
        />
        <RoleCard 
          title="Admin" 
          value={users.filter(u => normalizeRole(u.role_name) === 'admin').length}
          bgColor="bg-gradient-to-br from-violet-100 to-violet-50"
          textColor="text-violet-700"
        />
      </div>

      {/* Table */}
      <RoleTable users={users} roles={roles} />

      {/* Customer Selection Modal */}
      {showModal && (
        <CustomerSelectionModal
          customers={customers}
          onSelect={handleCustomerSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
