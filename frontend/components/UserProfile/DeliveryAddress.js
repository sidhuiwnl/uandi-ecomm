"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DeliveryAddress() {
  const user = useSelector((s) => s.auth.user);
  console.log('UserProfile DeliveryAddress user:', user);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // address object or null
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = {
    full_name: "",
    phone_number: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchAddresses = async () => {
    if (!user?.user_id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/address/user/${user.user_id}`, { withCredentials: true });
      setAddresses(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchAddresses();
  }, [isAuthenticated, user?.user_id]);

  const startCreate = () => {
    const first = user?.firstName || user?.first_name || "";
    const last = user?.lastName || user?.last_name || "";
    const phone = user?.phoneNumber || user?.phone_number || "";
    const full = `${first} ${last}`.trim();
    setEditing(null);
    setForm({ ...emptyForm, full_name: full, phone_number: phone });
    setShowForm(true);
  };

  const startEdit = (addr) => {
    setEditing(addr);
    setForm({
      full_name: addr.full_name,
      phone_number: addr.phone_number,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 || "",
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: !!addr.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (addr) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete Address?",
      text: "This address will be removed from your account.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`${API}/address/${addr.address_id}`, {
        withCredentials: true,
        data: { user_id: user.user_id },
      });
      setAddresses((prev) => prev.filter((a) => a.address_id !== addr.address_id));
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Delete failed" });
    }
  };

  const handleMakeDefault = async (addr) => {
    try {
      await axios.patch(`${API}/address/set-default`, { address_id: addr.address_id, user_id: user.user_id }, { withCredentials: true });
      // Refresh or optimistic update
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.address_id === addr.address_id }))
      );
      Swal.fire({ icon: "success", title: "Default updated", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed to set default" });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.user_id) return;
    setSubmitting(true);
    try {
      if (editing) {
        await axios.put(`${API}/address/${editing.address_id}`, { ...form, user_id: user.user_id }, { withCredentials: true });
        // Optimistic update
        setAddresses((prev) =>
          prev.map((a) => (a.address_id === editing.address_id ? { ...a, ...form } : a))
        );
        Swal.fire({ icon: "success", title: "Updated", timer: 1200, showConfirmButton: false });
      } else {
        const { data } = await axios.post(`${API}/address`, { ...form, user_id: user.user_id }, { withCredentials: true });
        const newId = data?.data?.address_id;
        const newAddress = { ...form, address_id: newId, user_id: user.user_id, is_active: 1 };
        if (form.is_default) {
          // Unset others locally
          setAddresses((prev) => prev.map((a) => ({ ...a, is_default: 0 })));
        }
        setAddresses((prev) => [newAddress, ...prev]);
        Swal.fire({ icon: "success", title: "Created", timer: 1200, showConfirmButton: false });
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Save failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Delivery Addresses</h2>
        {isAuthenticated && (
          <button
            onClick={startCreate}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-500 shadow"
          >
            Add Address
          </button>
        )}
      </div>
      {!isAuthenticated && (
        <p className="text-gray-600">Please log in to manage your delivery addresses.</p>
      )}
      {loading && <p className="text-sm text-gray-500">Loading addresses...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && isAuthenticated && addresses.length === 0 && (
        <p className="text-gray-600">No addresses saved yet.</p>
      )}

      <div className="grid gap-4 mt-4">
        {addresses.map((addr) => (
          <div
            key={addr.address_id}
            className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            {addr.is_default ? (
              <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-medium border border-emerald-200">
                Default
              </span>
            ) : null}
            <div className="text-sm text-gray-800 font-medium">{addr.full_name}</div>
            <div className="text-xs text-gray-500 mb-1">{addr.phone_number}</div>
            <div className="text-sm text-gray-700 leading-snug">
              {addr.address_line_1}
              {addr.address_line_2 ? `, ${addr.address_line_2}` : ""}, {addr.city}, {addr.state} - {addr.postal_code}, {addr.country}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => startEdit(addr)}
                className="px-3 py-1 text-xs font-medium rounded border border-gray-300 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(addr)}
                className="px-3 py-1 text-xs font-medium rounded border border-red-300 text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
              {!addr.is_default && (
                <button
                  onClick={() => handleMakeDefault(addr)}
                  className="px-3 py-1 text-xs font-medium rounded border border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Make Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 relative">
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editing ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleFormChange}
                  placeholder="Full Name"
                  required
                  className="input-field"
                />
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleFormChange}
                  placeholder="Phone Number"
                  required
                  className="input-field"
                />
              </div>
              <input
                name="address_line_1"
                value={form.address_line_1}
                onChange={handleFormChange}
                placeholder="Address Line 1"
                required
                className="input-field"
              />
              <input
                name="address_line_2"
                value={form.address_line_2}
                onChange={handleFormChange}
                placeholder="Address Line 2 (Optional)"
                className="input-field"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  name="city"
                  value={form.city}
                  onChange={handleFormChange}
                  placeholder="City"
                  required
                  className="input-field"
                />
                <input
                  name="state"
                  value={form.state}
                  onChange={handleFormChange}
                  placeholder="State"
                  required
                  className="input-field"
                />
                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleFormChange}
                  placeholder="Postal Code"
                  required
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <input
                  name="country"
                  value={form.country}
                  onChange={handleFormChange}
                  placeholder="Country"
                  required
                  className="input-field"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={form.is_default}
                    onChange={handleFormChange}
                    className="h-4 w-4"
                  />
                  Set as default
                </label>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 disabled:opacity-60"
                >
                  {submitting ? (editing ? "Updating..." : "Saving...") : editing ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); }}
                  className="px-5 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

