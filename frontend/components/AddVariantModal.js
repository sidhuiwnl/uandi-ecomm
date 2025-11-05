// frontend/components/AddVariantModal.js
'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AddVariantModal({ productId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    variant_name: '',
    sku: '',
    mrp_price: '',
    price: '',
    gst_percentage: 18,
    gst_included: true,
    stock: 0,
    weight: '',
    unit: 'ml'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateFinalPrice = () => {
    if (!formData.price) return 0;
    const price = parseFloat(formData.price);
    const gst = parseFloat(formData.gst_percentage);
    
    if (formData.gst_included) {
      return price;
    } else {
      return price + (price * gst / 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.price) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter selling price',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, product_id: productId })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Variant added successfully',
          icon: 'success',
          confirmButtonColor: '#ec4899',
          timer: 2000,
          showConfirmButton: false
        });
        onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to add variant',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-60">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Add New Variant</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant Name
              </label>
              <input
                type="text"
                name="variant_name"
                value={formData.variant_name}
                onChange={handleChange}
                placeholder="e.g., 50ml, 100g"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Product SKU"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MRP Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="mrp_price"
                value={formData.mrp_price}
                onChange={handleChange}
                placeholder="0.00"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="gst_percentage"
                value={formData.gst_percentage}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight/Volume
              </label>
              <input
                type="number"
                step="0.01"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 50, 100"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input-field"
              >
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="l">l</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="gst_included"
              checked={formData.gst_included}
              onChange={handleChange}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              GST Included in Price
            </label>
          </div>

          {formData.price && (
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Final Price:</span>
                <span className="text-lg font-bold text-pink-600">
                  ₹{calculateFinalPrice().toFixed(2)}
                </span>
              </div>
              {formData.mrp_price && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-500">Discount:</span>
                  <span className="text-sm text-green-600 font-medium">
                    {(((parseFloat(formData.mrp_price) - calculateFinalPrice()) / parseFloat(formData.mrp_price)) * 100).toFixed(1)}% off
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Variant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
