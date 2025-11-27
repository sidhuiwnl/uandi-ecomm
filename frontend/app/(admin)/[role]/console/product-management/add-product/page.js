'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { createProduct, getAllTags } from '@/store/productsSlice';
import { createProductAttributes } from '@/store/productAttributesSlice';
import { fetchCategories } from '@/store/categoriesSlice';
import Swal from 'sweetalert2';
import { PlusIcon, TrashIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AddProductPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { role } = useParams();

  const { categories } = useSelector(state => state.categories);
  const tags = useSelector(state => state.products.tags || []);

  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    tag_id: '',
    description: '',
    is_active: true
  });

  // Additional Information (attributes)
  const [attributes, setAttributes] = useState({
    key_ingredients: '',
    know_about_product: '', // Can include YouTube URL
    benefits: [
      { benefit_title: '', benefit_description: '' }
    ]
  });

  // Variants with file objects for images and video
  const [variants, setVariants] = useState([{
    variant_name: '',
    sku: '',
    mrp_price: '',
    price: '',
    gst_percentage: 18,
    gst_included: false,
    stock: 0,
    weight: '',
    unit: 'kg',
    imageFiles: [], // Array of File objects (max 4)
    imagePreviews: [], // Array of preview URLs
    videoFile: null, // Single File object
    videoPreview: null // Single preview URL
  }]);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(getAllTags());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

   const calculateFinalPrice = (v) => {
          if (!v?.price) return 0;
          const price = parseFloat(v.price);
          const gst = parseFloat(v.gst_percentage);
          return v.gst_included ? price : price + (price * gst) / 100;
      };

  // Variant helpers
  const addVariant = () => {
    setVariants(vs => ([...vs, {
      variant_name: '', sku: '', mrp_price: '', price: '',
      gst_percentage: 18, gst_included: false, stock: 0,
      weight: '', unit: 'kg',
      imageFiles: [],
      imagePreviews: [],
      videoFile: null,
      videoPreview: null
    }]));
  };

  const removeVariant = (index) => {
    if (variants.length <= 1) return;
    
    // Cleanup preview URLs
    const variant = variants[index];
    variant.imagePreviews.forEach(url => URL.revokeObjectURL(url));
    if (variant.videoPreview) URL.revokeObjectURL(variant.videoPreview);
    
    setVariants(vs => vs.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(vs => vs.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  // Handle image file selection (max 4)
  const handleImageSelect = (vIndex, e) => {
    const files = Array.from(e.target.files);
    const variant = variants[vIndex];
    
    // Limit to 4 images total
    const availableSlots = 4 - variant.imageFiles.length;
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

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setVariants(vs => vs.map((v, i) => {
      if (i !== vIndex) return v;
      return {
        ...v,
        imageFiles: [...v.imageFiles, ...validFiles],
        imagePreviews: [...v.imagePreviews, ...newPreviews]
      };
    }));

    // Clear input
    e.target.value = '';
  };

  // Remove single image
  const removeImage = (vIndex, imgIndex) => {
    setVariants(vs => vs.map((v, i) => {
      if (i !== vIndex) return v;
      
      // Revoke preview URL
      URL.revokeObjectURL(v.imagePreviews[imgIndex]);
      
      return {
        ...v,
        imageFiles: v.imageFiles.filter((_, ii) => ii !== imgIndex),
        imagePreviews: v.imagePreviews.filter((_, ii) => ii !== imgIndex)
      };
    }));
  };

  // Handle video file selection (max 1)
  const handleVideoSelect = (vIndex, e) => {
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

    // Check file size (200MB limit as per backend)
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

    const variant = variants[vIndex];
    
    // Revoke old preview if exists
    if (variant.videoPreview) {
      URL.revokeObjectURL(variant.videoPreview);
    }

    const preview = URL.createObjectURL(file);
    
    setVariants(vs => vs.map((v, i) => {
      if (i !== vIndex) return v;
      return {
        ...v,
        videoFile: file,
        videoPreview: preview
      };
    }));

    // Clear input
    e.target.value = '';
  };

  // Attribute helpers
  const handleAttributeField = (field, value) => {
    setAttributes(prev => ({ ...prev, [field]: value }));
  };
  const handleBenefitChange = (idx, field, value) => {
    setAttributes(prev => {
      const arr = prev.benefits.map((b, i) => i === idx ? { ...b, [field]: value } : b);
      return { ...prev, benefits: arr };
    });
  };
  const addBenefit = () => setAttributes(prev => ({ ...prev, benefits: [...prev.benefits, { benefit_title: '', benefit_description: '' }] }));
  const removeBenefit = (idx) => setAttributes(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== idx) }));

  // Remove video
  const removeVideo = (vIndex) => {
    setVariants(vs => vs.map((v, i) => {
      if (i !== vIndex) return v;
      
      // Revoke preview URL
      if (v.videoPreview) URL.revokeObjectURL(v.videoPreview);
      
      return {
        ...v,
        videoFile: null,
        videoPreview: null
      };
    }));
  };

  // Upload media files for a variant
  const uploadVariantMedia = async (vIndex) => {
    const variant = variants[vIndex];
    
    if (variant.imageFiles.length === 0 && !variant.videoFile) {
      return { images: [], video: null };
    }

    const formData = new FormData();

    // Append images (max 4)
    variant.imageFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    // Append video (only 1)
    if (variant.videoFile) {
      formData.append('video', variant.videoFile);
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

    if (!formData.product_name || !formData.category_id) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
      return;
    }

    // Validate at least one variant
    if (!variants.length || !variants[0].variant_name) {
      await Swal.fire({
        title: 'Missing variant',
        text: 'Please add at least one variant with a name.',
        icon: 'warning',
        confirmButtonColor: '#ec4899'
      });
      return;
    }

    setUploading(true);

    try {
      // Create product
      const productResult = await dispatch(createProduct(formData)).unwrap();
      const productId = productResult?.data?.product_id ?? productResult?.product_id;
      if (!productId) {
        throw new Error(productResult?.message || 'Product creation failed');
      }

      // Persist attributes (ignore if all empty)
      const benefitsClean = attributes.benefits.filter(b => (b.benefit_title.trim() || b.benefit_description.trim()));
      const hasAnyAttr = attributes.key_ingredients.trim() || attributes.know_about_product.trim() || benefitsClean.length;
      if (hasAnyAttr) {
        try {
          await dispatch(createProductAttributes({
            product_id: productId,
            key_ingredients: attributes.key_ingredients,
            know_about_product: attributes.know_about_product,
            benefits: benefitsClean
          })).unwrap();
        } catch (attrErr) {
          console.warn('Attribute create failed:', attrErr);
        }
      }

      // Create variants with media
      for (let vIndex = 0; vIndex < variants.length; vIndex++) {
        const v = variants[vIndex];
        
        // Upload media files first
        const mediaUrls = await uploadVariantMedia(vIndex);

        // Create variant
        const variantPayload = {
          product_id: productId,
          variant_name: v.variant_name,
          sku: v.sku,
          mrp_price: v.mrp_price ? Number(v.mrp_price) : 0,
          price: v.price ? Number(v.price) : 0,
          gst_percentage: v.gst_percentage ? Number(v.gst_percentage) : 0,
          gst_included: Boolean(v.gst_included),
          stock: v.stock ? Number(v.stock) : 0,
          weight: v.weight,
          unit: v.unit || 'kg'
        };

        const variantRes = await fetch(`${API_URL}/products/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(variantPayload)
        });
        
        const variantJson = await variantRes.json();
        if (!variantJson?.success) {
          throw new Error(variantJson?.message || 'Failed to create variant');
        }
        const variantId = variantJson.data.variant_id;

        // Save image URLs to database
        for (let i = 0; i < mediaUrls.images.length; i++) {
          const url = mediaUrls.images[i];
          await fetch(`${API_URL}/products/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: productId,
              variant_id: variantId,
              image_url: url,
              is_main: vIndex === 0 && i === 0, // First image of first variant as main
              is_video: 0
            })
          });
        }

        // Save video URL to database
        if (mediaUrls.video) {
          await fetch(`${API_URL}/products/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: productId,
              variant_id: variantId,
              image_url: mediaUrls.video,
              is_main: 0,
              is_video: 1
            })
          });
        }
      }

      // Cleanup all preview URLs
      variants.forEach(v => {
        v.imagePreviews.forEach(url => URL.revokeObjectURL(url));
        if (v.videoPreview) URL.revokeObjectURL(v.videoPreview);
      });

      await Swal.fire({
        title: 'Success!',
        text: 'Product and variants created successfully.',
        icon: 'success',
        confirmButtonColor: '#ec4899'
      });

      router.push(`/${role}/console/product-management/product-details/${productId}`);
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({
        title: 'Error!',
        text: error?.message || 'Failed to create product',
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
      variants.forEach(v => {
        v.imagePreviews.forEach(url => URL.revokeObjectURL(url));
        if (v.videoPreview) URL.revokeObjectURL(v.videoPreview);
      });
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-500 mt-1">Create a new product and add variants with images & video</p>
        </div>
        <Link href={`/${role}/console/product-management/all-products`}>
          <button className="btn-secondary" disabled={uploading}>Cancel</button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className="input-field"
                required
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="input-field"
                required
                disabled={uploading}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag
              </label>
              <select
                name="tag_id"
                value={formData.tag_id}
                onChange={handleInputChange}
                className="input-field"
                disabled={uploading}
              >
                <option value="">Select Tag</option>
                {tags.map(tag => (
                  <option key={tag.tag_id} value={tag.tag_id}>
                    {tag.tag_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="input-field"
              placeholder="Enter product description..."
              disabled={uploading}
            ></textarea>
          </div>

          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              disabled={uploading}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active Product
            </label>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Ingredients</label>
              <textarea
                rows={3}
                value={attributes.key_ingredients}
                onChange={(e) => handleAttributeField('key_ingredients', e.target.value)}
                className="input-field"
                placeholder="e.g., Aloe Vera, Vitamin C"
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Know About Product (YouTube URL allowed)</label>
              <textarea
                rows={3}
                value={attributes.know_about_product}
                onChange={(e) => handleAttributeField('know_about_product', e.target.value)}
                className="input-field"
                placeholder="Brief info customers should know. Include a YouTube URL if desired."
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
              <div className="space-y-2">
                {attributes.benefits.map((b, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 border rounded">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={b.benefit_title}
                        onChange={(e) => handleBenefitChange(idx, 'benefit_title', e.target.value)}
                        className="input-field"
                        placeholder="Benefit Title"
                        disabled={uploading}
                      />
                    </div>
                    <div className="md:col-span-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={b.benefit_description}
                        onChange={(e) => handleBenefitChange(idx, 'benefit_description', e.target.value)}
                        className="input-field flex-1"
                        placeholder="Benefit Description"
                        disabled={uploading}
                      />
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={uploading || attributes.benefits.length === 1}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBenefit}
                  className="btn-secondary flex items-center gap-2 text-sm"
                  disabled={uploading}
                >
                  <PlusIcon className="w-4 h-4" /> Add Benefit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Variants</h2>
            <button 
              type="button" 
              onClick={addVariant} 
              className="btn-secondary flex items-center gap-2 text-sm"
              disabled={uploading}
            >
              <PlusIcon className="w-4 h-4" /> Add Variant
            </button>
          </div>

          <div className="space-y-6">
            {variants.map((v, vIndex) => (
              <div key={vIndex} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800">Variant {vIndex + 1}</h3>
                  {variants.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeVariant(vIndex)} 
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                      disabled={uploading}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

               {/* Variant Fields */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Variant Name *</label>
    <input 
      type="text" 
      value={v.variant_name} 
      onChange={(e) => handleVariantChange(vIndex, 'variant_name', e.target.value)} 
      className="input-field" 
      required 
      disabled={uploading}
      placeholder="e.g., 50ml, 100g"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
    <input 
      type="text" 
      value={v.sku} 
      onChange={(e) => handleVariantChange(vIndex, 'sku', e.target.value)} 
      className="input-field" 
      disabled={uploading}
      placeholder="Product SKU"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
    <input 
      type="number" 
      min="0" 
      value={v.stock} 
      onChange={(e) => handleVariantChange(vIndex, 'stock', e.target.value)} 
      className="input-field"
      required
      disabled={uploading}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">MRP Price (₹)</label>
    <input 
      type="number" 
      min="0" 
      step="0.01" 
      value={v.mrp_price} 
      onChange={(e) => handleVariantChange(vIndex, 'mrp_price', e.target.value)} 
      className="input-field" 
      disabled={uploading}
      placeholder="0.00"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
    <input 
      type="number" 
      min="0" 
      step="0.01" 
      value={v.price} 
      onChange={(e) => handleVariantChange(vIndex, 'price', e.target.value)} 
      className="input-field"
      required
      disabled={uploading}
      placeholder="0.00"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">GST (%)</label>
    <input 
      type="number" 
      min="0" 
      step="0.01" 
      value={v.gst_percentage} 
      onChange={(e) => handleVariantChange(vIndex, 'gst_percentage', e.target.value)} 
      className="input-field" 
      disabled={uploading}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Weight/Volume</label>
    <input 
      type="text" 
      value={v.weight} 
      onChange={(e) => handleVariantChange(vIndex, 'weight', e.target.value)} 
      className="input-field" 
      placeholder="e.g., 50, 100" 
      disabled={uploading}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
    <select 
      value={v.unit} 
      onChange={(e) => handleVariantChange(vIndex, 'unit', e.target.value)} 
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
  <div className="flex items-end">
    <div className="flex items-center gap-2 h-12">
      <input 
        id={`gstinc-${vIndex}`} 
        type="checkbox" 
        checked={v.gst_included} 
        onChange={(e) => handleVariantChange(vIndex, 'gst_included', e.target.checked)} 
        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
        disabled={uploading}
      />
      <label htmlFor={`gstinc-${vIndex}`} className="text-sm font-medium text-gray-700">
        GST Included in Price
      </label>
    </div>
  </div>
</div>

{v.price && (
                            <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                                <div className="flex justify-between text-gray-700">
                                    <span>Final Price:</span>
                                    <span className="font-bold text-pink-600">
                                        ₹{calculateFinalPrice(v).toFixed(2)}
                                    </span>
                                </div>
                                {v.mrp_price && (
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm text-gray-500">Discount:</span>
                                        <span className="text-sm text-green-600 font-medium">
                                            {(((parseFloat(v.mrp_price) - calculateFinalPrice(v)) / parseFloat(v.mrp_price)) * 100).toFixed(1)}% off
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}


                

                {/* Images Section */}
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <PhotoIcon className="w-5 h-5" />
                        Product Images ({v.imageFiles.length}/4)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {vIndex === 0 ? 'First image will be the main product image' : 'Upload up to 4 images'}
                      </p>
                    </div>
                    {v.imageFiles.length < 4 && (
                      <label className="btn-secondary flex items-center gap-2 text-xs cursor-pointer">
                        <PhotoIcon className="w-4 h-4" />
                        Add Images
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageSelect(vIndex, e)}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>

                  {v.imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {v.imagePreviews.map((preview, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${imgIndex + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          {vIndex === 0 && imgIndex === 0 && (
                            <span className="absolute top-2 left-2 text-xs text-white font-medium px-2 py-1 bg-pink-600 rounded-full">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(vIndex, imgIndex)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            disabled={uploading}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {v.imageFiles[imgIndex]?.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {v.imagePreviews.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">No images added yet</p>
                    </div>
                  )}
                </div>

                {/* Video Section */}
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <VideoCameraIcon className="w-5 h-5" />
                        Product Video {v.videoFile && '(1/1)'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload one video (max 200MB)
                      </p>
                    </div>
                    {!v.videoFile && (
                      <label className="btn-secondary flex items-center gap-2 text-xs cursor-pointer">
                        <VideoCameraIcon className="w-4 h-4" />
                        Add Video
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoSelect(vIndex, e)}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>

                  {v.videoPreview ? (
                    <div className="relative group">
                      <video
                        src={v.videoPreview}
                        controls
                        className="w-full max-h-64 rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(vIndex)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        disabled={uploading}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {v.videoFile?.name} ({(v.videoFile?.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <VideoCameraIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">No video added yet</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href={`/${role}/console/product-management/all-products`}>
            <button type="button" className="btn-secondary" disabled={uploading}>
              Cancel
            </button>
          </Link>
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating Product...
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
