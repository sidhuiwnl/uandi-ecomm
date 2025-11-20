'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, VideoCameraIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EditVariantModal({ variant, productId, images = [], onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    variant_name: variant.variant_name || '',
    sku: variant.sku || '',
    mrp_price: variant.mrp_price || '',
    price: variant.price || '',
    gst_percentage: variant.gst_percentage || 18,
    gst_included: variant.gst_included !== undefined ? variant.gst_included : true,
    stock: variant.stock || 0,
    weight: variant.weight || '',
    unit: variant.unit || 'ml'
  });

  // Separate images and video from existing media
  const initialVariantImages = Array.isArray(images)
    ? images.filter(img => img.variant_id === variant.variant_id && !img.is_video)
    : [];
  const initialVariantVideo = Array.isArray(images)
    ? images.find(img => img.variant_id === variant.variant_id && img.is_video)
    : null;

  const [existingImages, setExistingImages] = useState(initialVariantImages);
  const [existingVideo, setExistingVideo] = useState(initialVariantVideo);

  // Track individual image replacements: { index: { file, preview, imageId, oldUrl } }
  const [imageReplacements, setImageReplacements] = useState({});
  
  // New images to add (not replacements)
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  
  // Video replacement or new video
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newVideoPreview, setNewVideoPreview] = useState(null);

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

  // Replace individual existing image
  const handleReplaceImage = (e, imageIndex, imageId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: 'Invalid file type',
        text: 'Please select an image file',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
      e.target.value = '';
      return;
    }

    // Clean up old preview if exists
    if (imageReplacements[imageIndex]) {
      URL.revokeObjectURL(imageReplacements[imageIndex].preview);
    }

    const preview = URL.createObjectURL(file);
    
    setImageReplacements(prev => ({
      ...prev,
      [imageIndex]: {
        file,
        preview,
        imageId,
        oldUrl: existingImages[imageIndex].image_url
      }
    }));

    e.target.value = '';
  };

  // Cancel image replacement
  const cancelReplacement = (imageIndex) => {
    if (imageReplacements[imageIndex]) {
      URL.revokeObjectURL(imageReplacements[imageIndex].preview);
      const newReplacements = { ...imageReplacements };
      delete newReplacements[imageIndex];
      setImageReplacements(newReplacements);
    }
  };

  // Handle new image addition (not replacement)
  const handleAddNewImages = (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = existingImages.length + newImageFiles.length;
    const availableSlots = 4 - currentTotal;
    
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
    
    setNewImageFiles(prev => [...prev, ...validFiles]);
    setNewImagePreviews(prev => [...prev, ...newPreviews]);

    e.target.value = '';
  };

  // Remove new image before upload
  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Delete existing image from database and R2
  const handleDeleteExistingImage = async (imageId, imageIndex) => {
    const result = await Swal.fire({
      title: 'Delete Image?',
      text: 'This will permanently delete the image from storage.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/products/images/${imageId}`, { 
        method: 'DELETE' 
      });
      const json = await res.json();
      
      if (!json?.success) throw new Error(json?.message || 'Failed to delete image');
      
      // Remove from existing images
      setExistingImages(imgs => imgs.filter(img => img.image_id !== imageId));
      
      // Clean up any replacement for this image
      if (imageReplacements[imageIndex]) {
        URL.revokeObjectURL(imageReplacements[imageIndex].preview);
        const newReplacements = { ...imageReplacements };
        delete newReplacements[imageIndex];
        setImageReplacements(newReplacements);
      }
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Image removed successfully',
        icon: 'success',
        confirmButtonColor: '#ec4899',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ 
        title: 'Error', 
        text: err?.message || 'Failed to remove image', 
        icon: 'error', 
        confirmButtonColor: '#ec4899' 
      });
    }
  };

  // Handle video selection/replacement
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    if (newVideoPreview) {
      URL.revokeObjectURL(newVideoPreview);
    }

    const preview = URL.createObjectURL(file);
    setNewVideoFile(file);
    setNewVideoPreview(preview);

    e.target.value = '';
  };

  const removeNewVideo = () => {
    if (newVideoPreview) {
      URL.revokeObjectURL(newVideoPreview);
    }
    setNewVideoFile(null);
    setNewVideoPreview(null);
  };

  const handleDeleteExistingVideo = async () => {
    if (!existingVideo) return;

    const result = await Swal.fire({
      title: 'Delete Video?',
      text: 'This will permanently delete the video from storage.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/products/images/${existingVideo.image_id}`, { 
        method: 'DELETE' 
      });
      const json = await res.json();
      
      if (!json?.success) throw new Error(json?.message || 'Failed to delete video');
      
      setExistingVideo(null);
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Video removed successfully',
        icon: 'success',
        confirmButtonColor: '#ec4899',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ 
        title: 'Error', 
        text: err?.message || 'Failed to remove video', 
        icon: 'error', 
        confirmButtonColor: '#ec4899' 
      });
    }
  };

  // Upload individual replacement images
  const uploadReplacementImages = async () => {
    const replacements = Object.values(imageReplacements);
    if (replacements.length === 0) return [];

    const results = [];

    for (const replacement of replacements) {
      const formData = new FormData();
      formData.append('image', replacement.file);
      formData.append('image_id', replacement.imageId);
      formData.append('old_url', replacement.oldUrl);
      formData.append('variant_id', variant.variant_id);
      formData.append('product_id', productId);

      try {
        const response = await fetch(`${API_URL}/products/replace-single-image`, {
          method: 'POST',
          body: formData
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned invalid response. Check backend endpoint.');
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to replace image');
        }

        results.push(result);
        console.log(`Successfully replaced image ${replacement.imageId}`);
      } catch (error) {
        console.error('Replacement error:', error);
        throw new Error(`Image replacement failed: ${error.message}`);
      }
    }

    return results;
  };

  // Upload new images (not replacements)
  const uploadNewImages = async () => {
    if (newImageFiles.length === 0) return [];

    const formData = new FormData();
    
    newImageFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    try {
      const response = await fetch(`${API_URL}/products/upload-media`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload images');
      }

      return result.data.images || [];
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  // Replace existing video
  const replaceExistingVideo = async () => {
    if (!newVideoFile || !existingVideo) return null;

    const formData = new FormData();
    formData.append('video', newVideoFile);
    formData.append('video_id', existingVideo.image_id);
    formData.append('old_url', existingVideo.image_url);
    formData.append('variant_id', variant.variant_id);
    formData.append('product_id', productId);

    try {
      const response = await fetch(`${API_URL}/products/replace-single-video`, {
        method: 'POST',
        body: formData
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response. Check backend endpoint.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to replace video');
      }

      console.log(`Successfully replaced video ${existingVideo.image_id}`);
      return result.data.new_url;
    } catch (error) {
      console.error('Video replacement error:', error);
      throw new Error(`Video replacement failed: ${error.message}`);
    }
  };

  // Upload new video
  const uploadNewVideo = async () => {
    if (!newVideoFile) return null;

    const formData = new FormData();
    formData.append('video', newVideoFile);

    try {
      const response = await fetch(`${API_URL}/products/upload-media`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload video');
      }

      return result.data.video;
    } catch (error) {
      throw new Error(`Video upload failed: ${error.message}`);
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
      // 1. Update variant details
      const response = await fetch(`${API_URL}/products/variants/${variant.variant_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to update variant');
      }

      // 2. Replace individual images (backend handles deletion and update)
      await uploadReplacementImages();

      // 3. Upload and insert new images
      const newImageUrls = await uploadNewImages();
      for (const url of newImageUrls) {
        await fetch(`${API_URL}/products/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            variant_id: variant.variant_id,
            image_url: url,
            is_main: false,
            is_video: 0
          })
        });
      }

      // 4. Handle video replacement or new upload
      if (newVideoFile) {
        if (existingVideo) {
          // Replace existing video (backend handles deletion and update)
          await replaceExistingVideo();
        } else {
          // Upload new video
          const videoUrl = await uploadNewVideo();
          if (videoUrl) {
            await fetch(`${API_URL}/products/images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_id: productId,
                variant_id: variant.variant_id,
                image_url: videoUrl,
                is_main: false,
                is_video: 1
              })
            });
          }
        }
      }

      // Cleanup preview URLs
      Object.values(imageReplacements).forEach(r => URL.revokeObjectURL(r.preview));
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (newVideoPreview) URL.revokeObjectURL(newVideoPreview);

      Swal.fire({
        title: 'Success!',
        text: 'Variant updated successfully',
        icon: 'success',
        confirmButtonColor: '#ec4899',
        timer: 2000,
        showConfirmButton: false
      });
      
      onSuccess();
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update variant',
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
      Object.values(imageReplacements).forEach(r => URL.revokeObjectURL(r.preview));
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (newVideoPreview) URL.revokeObjectURL(newVideoPreview);
    };
  }, []);

  const totalImageCount = existingImages.length + newImageFiles.length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Edit Variant</h2>
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
                  Product Images ({totalImageCount}/4)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click 🔄 to replace individual images
                </p>
              </div>
              {totalImageCount < 4 && (
                <label className="btn-secondary flex items-center gap-2 text-xs cursor-pointer">
                  <PhotoIcon className="w-4 h-4" />
                  Add More
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddNewImages}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Existing Images with Individual Replace */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2 font-medium">Current Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {existingImages.map((img, index) => (
                    <div key={img.image_id} className="relative group">
                      {/* Show replacement preview or current image */}
                      <img
                        src={imageReplacements[index] ? imageReplacements[index].preview : img.image_url}
                        alt="Variant"
                        className={`w-full h-24 object-cover rounded-lg border-2 ${
                          imageReplacements[index] ? 'border-orange-400' : 'border-gray-200'
                        }`}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      
                      {/* Replacement badge */}
                      {imageReplacements[index] && (
                        <span className="absolute top-1 left-1 text-xs text-white font-medium px-2 py-1 bg-orange-600 rounded-full">
                          New
                        </span>
                      )}

                      {/* Action buttons */}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {imageReplacements[index] ? (
                          <button
                            type="button"
                            onClick={() => cancelReplacement(index)}
                            className="p-1.5 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                            disabled={uploading}
                            title="Cancel replacement"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <label className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer" title="Replace image">
                              <ArrowPathIcon className="w-4 h-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleReplaceImage(e, index, img.image_id)}
                                className="hidden"
                                disabled={uploading}
                              />
                            </label>
                            {/* <button
                              type="button"
                              onClick={() => handleDeleteExistingImage(img.image_id, index)}
                              className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                              disabled={uploading}
                              title="Delete image"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button> */}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images to Add */}
            {newImagePreviews.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2 font-medium">New Images to Add</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-400"
                      />
                      <span className="absolute top-1 left-1 text-xs text-white font-medium px-2 py-1 bg-green-600 rounded-full">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        disabled={uploading}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate px-1">
                        {newImageFiles[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalImageCount === 0 && (
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
                  Product Video {(existingVideo || newVideoFile) && '(1/1)'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Click 🔄 to replace video (max 200MB)</p>
              </div>
              {!existingVideo && !newVideoFile && (
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

            {/* Existing Video */}
            {existingVideo && !newVideoFile && (
              <div>
                <p className="text-xs text-gray-600 mb-2 font-medium">Current Video</p>
                <div className="relative group">
                  <video
                    src={existingVideo.image_url}
                    controls
                    className="w-full max-h-64 rounded-lg border-2 border-gray-200"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer" title="Replace video">
                      <ArrowPathIcon className="w-5 h-5" />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {/* <button
                      type="button"
                      onClick={handleDeleteExistingVideo}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      disabled={uploading}
                      title="Delete video"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button> */}
                  </div>
                </div>
              </div>
            )}

            {/* New Video */}
            {newVideoPreview && (
              <div>
                <p className="text-xs text-gray-600 mb-2 font-medium">
                  {existingVideo ? 'New Video (Will Replace)' : 'New Video'}
                </p>
                <div className="relative group">
                  <video
                    src={newVideoPreview}
                    controls
                    className="w-full max-h-64 rounded-lg border-2 border-orange-400"
                  />
                  <span className="absolute top-2 left-2 text-xs text-white font-medium px-2 py-1 bg-orange-600 rounded-full">
                    {existingVideo ? 'Replace' : 'New'}
                  </span>
                  <button
                    type="button"
                    onClick={removeNewVideo}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    disabled={uploading}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <p className="text-xs text-gray-600 mt-2 truncate px-1">
                    {newVideoFile?.name} ({(newVideoFile?.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            )}

            {!existingVideo && !newVideoFile && (
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
                  Updating...
                </>
              ) : (
                'Update Variant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
