'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, VideoCameraIcon, TrashIcon } from '@heroicons/react/24/outline';
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

  // Image and video state
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [uploading, setUploading] = useState(false);

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

  // Handle image selection (max 4)
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 4 - imageFiles.length;
    const filesToAdd = files.slice(0, availableSlots);
    
    if (files.length > availableSlots) {
      Swal.fire({
        title: 'Too many images',
        text: `You can only upload ${availableSlots} more image(s). Maximum is 4 images per variant.`,
        icon: 'warning',
        confirmButtonColor: '#ec4899'
      });
    }

    // Validate file types
    const validFiles = filesToAdd.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== filesToAdd.length) {
      Swal.fire({
        title: 'Invalid file type',
        text: 'Please select only image files',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    }

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);

    e.target.value = '';
  };

  // Remove image
  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle video selection
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      Swal.fire({
        title: 'Invalid file type',
        text: 'Please select a video file',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
      e.target.value = '';
      return;
    }

    // Check file size (200MB limit)
    if (file.size > 200 * 1024 * 1024) {
      Swal.fire({
        title: 'File too large',
        text: 'Video must be less than 200MB',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
      e.target.value = '';
      return;
    }

    // Revoke old preview if exists
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    const preview = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreview(preview);

    e.target.value = '';
  };

  // Remove video
  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
  };

  // Upload media files
  const uploadMedia = async () => {
    if (imageFiles.length === 0 && !videoFile) {
      return { images: [], video: null };
    }

    const formData = new FormData();

    // Append images
    imageFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    // Append video
    if (videoFile) {
      formData.append('video', videoFile);
    }

    try {
      const response = await fetch(`${API_URL}/products/upload-media`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload media');
      }

      return result.data; // { images: [...urls], video: url }
    } catch (error) {
      throw new Error(`Media upload failed: ${error.message}`);
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

    setUploading(true);

    try {
      // 1. Create variant
      const response = await fetch(`${API_URL}/products/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, product_id: productId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create variant');
      }

      const variantId = data.data.variant_id;

      // 2. Upload media files
      const mediaUrls = await uploadMedia();

      // 3. Save image URLs to database
      for (let i = 0; i < mediaUrls.images.length; i++) {
        const url = mediaUrls.images[i];
        await fetch(`${API_URL}/products/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            variant_id: variantId,
            image_url: url,
            is_main: i === 0, // First image is main
            is_video: 0
          })
        });
      }

      // 4. Save video URL to database
      if (mediaUrls.video) {
        await fetch(`${API_URL}/products/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            variant_id: variantId,
            image_url: mediaUrls.video,
            is_main: false,
            is_video: 1
          })
        });
      }

      // Cleanup preview URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);

      Swal.fire({
        title: 'Success!',
        text: 'Variant added successfully',
        icon: 'success',
        confirmButtonColor: '#ec4899',
        timer: 2000,
        showConfirmButton: false
      });
      
      onSuccess();
    } catch (error) {
      console.error('Add variant error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to add variant',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    } finally {
      setUploading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Add New Variant</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Fields */}
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
                disabled={uploading}
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
                disabled={uploading}
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
                disabled={uploading}
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
                disabled={uploading}
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
                disabled={uploading}
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
                disabled={uploading}
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
                disabled={uploading}
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
                disabled={uploading}
              >
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="l">l</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
          </div>

          {/* GST Included Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="gst_included"
              checked={formData.gst_included}
              onChange={handleChange}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              disabled={uploading}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              GST Included in Price
            </label>
          </div>

          {/* Price Summary */}
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

          {/* Images Section */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5" />
                  Product Images ({imageFiles.length}/4)
                </p>
                <p className="text-xs text-gray-500 mt-1">Upload up to 4 images (first will be main)</p>
              </div>
              {imageFiles.length < 4 && (
                <label className="btn-secondary flex items-center gap-2 text-xs cursor-pointer">
                  <PhotoIcon className="w-4 h-4" />
                  Add Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-green-400"
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 text-xs text-white font-medium px-2 py-1 bg-pink-600 rounded-full">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      disabled={uploading}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate px-1">
                      {imageFiles[index]?.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">No images added yet</p>
              </div>
            )}
          </div>

          {/* Video Section */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  <VideoCameraIcon className="w-5 h-5" />
                  Product Video {videoFile && '(1/1)'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Upload one video (max 200MB)</p>
              </div>
              {!videoFile && (
                <label className="btn-secondary flex items-center gap-2 text-xs cursor-pointer">
                  <VideoCameraIcon className="w-4 h-4" />
                  Add Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {videoPreview ? (
              <div className="relative group">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-64 rounded-lg border-2 border-green-400"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  disabled={uploading}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
                <p className="text-xs text-gray-600 mt-2 truncate px-1">
                  {videoFile?.name} ({(videoFile?.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <VideoCameraIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">No video added yet</p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating...
                </>
              ) : (
                'Add Variant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
