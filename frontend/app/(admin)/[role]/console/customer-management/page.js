"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MagnifyingGlassIcon, EyeIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon, PhoneIcon } from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CustomerListPage() {
  const { role } = useParams();
  const [customers, setCustomers] = useState([]);
  console.log('Role param:', customers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/roles/users?role=Customer`);
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        (c.first_name && c.first_name.toLowerCase().includes(q)) ||
        (c.last_name && c.last_name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone_number && c.phone_number.toLowerCase().includes(q));
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.is_active) ||
        (statusFilter === "inactive" && !c.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [customers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-purple-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your customer accounts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Total Customers</p>
              <p className="text-3xl sm:text-4xl font-bold text-purple-700">{stats.total}</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-xl">
              <UserGroupIcon className="w-7 h-7 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">Active</p>
              <p className="text-3xl sm:text-4xl font-bold text-emerald-700">{stats.active}</p>
            </div>
            <div className="bg-emerald-200 p-3 rounded-xl">
              <CheckCircleIcon className="w-7 h-7 text-emerald-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-700">{stats.inactive}</p>
            </div>
            <div className="bg-gray-200 p-3 rounded-xl">
              <XCircleIcon className="w-7 h-7 text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Email</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Phone</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Joined Date</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.user_id} className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {c.first_name?.[0]}{c.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-gray-500">ID: {c.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">{c.email}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      {c.phone_number || '-'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
                      c.is_active 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        c.is_active ? 'bg-emerald-500' : 'bg-gray-500'
                      }`}></span>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : '-'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end">
                      <Link 
                        href={`/${role}/console/customer-management/${c.user_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium text-sm"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="xl:hidden divide-y divide-gray-100">
          {filtered.map((c) => (
            <div key={c.user_id} className="p-4 hover:bg-purple-50/30 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {c.first_name?.[0]}{c.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{c.first_name} {c.last_name}</p>
                  <p className="text-sm text-gray-500 truncate">{c.email}</p>
                  {c.phone_number && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <PhoneIcon className="w-3.5 h-3.5" />
                      {c.phone_number}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">ID: {c.user_id}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                  c.is_active 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    c.is_active ? 'bg-emerald-500' : 'bg-gray-500'
                  }`}></span>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Joined {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : '-'}
                </span>
                <Link 
                  href={`/${role}/console/customer-management/${c.user_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors font-medium text-sm"
                >
                  <EyeIcon className="w-4 h-4" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 px-4">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 font-semibold text-lg mb-1">No customers found</p>
            <p className="text-sm text-gray-400">
              {search ? 'Try adjusting your search terms' : 'No customers available yet'}
            </p>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filtered.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{customers.length}</span> customers
          </p>
        </div>
      )}
    </div>
  );
}
