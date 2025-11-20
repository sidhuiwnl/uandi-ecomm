"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CustomerDetailsPage() {
  const params = useParams();
  const role = params.role;
  const id = params.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Backend doesn't expose single-customer endpoint; fetch list and filter
        const res = await fetch(`${API_URL}/roles/users?role=Customer`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const found = list.find((u) => String(u.user_id) === String(id));
        setCustomer(found || null);
      } catch (e) {
        setError("Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4 p-6">
        <Link href={`/${role}/console/customer-management`} className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Customers
        </Link>
        <p className="text-red-600">{error || "Customer not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${role}/console/customer-management`} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.first_name} {customer.last_name}</h1>
            <p className="text-gray-500 mt-1">Customer details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-800">{customer.first_name} {customer.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-800">{customer.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div>
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${customer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Joined</label>
              <p className="text-gray-800">{customer.created_at ? new Date(customer.created_at).toLocaleString() : '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-gray-800">{customer.role_name || 'Customer'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity</h2>
          <p className="text-sm text-gray-500">No activity data available.</p>
        </div>
      </div>
    </div>
  );
}
