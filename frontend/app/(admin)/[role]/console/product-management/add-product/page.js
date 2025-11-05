'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { createProduct,getAllTags } from '@/store/productsSlice';
import { fetchCategories } from '@/store/categoriesSlice';
import Swal from 'sweetalert2';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
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

  // Variants with per-variant images
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
    images: ['']
  }]);

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

  // Variant helpers
  const addVariant = () => {
    setVariants(vs => ([...vs, {
      variant_name: '', sku: '', mrp_price: '', price: '',
      gst_percentage: 18, gst_included: false, stock: 0,
      weight: '', unit: 'kg', images: ['']
    }]));
  };

  const removeVariant = (index) => {
    setVariants(vs => vs.length > 1 ? vs.filter((_, i) => i !== index) : vs);
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(vs => vs.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleVariantImageChange = (vIndex, imgIndex, value) => {
    setVariants(vs => vs.map((v, i) => {
      if (i !== vIndex) return v;
      const imgs = [...v.images];
      imgs[imgIndex] = value;
      return { ...v, images: imgs };
    }));
  };

  const addVariantImageField = (vIndex) => {
    setVariants(vs => vs.map((v, i) => i === vIndex ? { ...v, images: [...v.images, ''] } : v));
  };

  const removeVariantImageField = (vIndex, imgIndex) => {
    setVariants(vs => vs.map((v, i) => {
      if (i !== vIndex) return v;
      if (v.images.length <= 1) return v;
      return { ...v, images: v.images.filter((_, ii) => ii !== imgIndex) };
    }));
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

    try {
      // Basic validation for at least one variant
      if (!variants.length || !variants[0].variant_name) {
        await Swal.fire({
          title: 'Missing variant',
          text: 'Please add at least one variant with a name.',
          icon: 'warning',
          confirmButtonColor: '#ec4899'
        });
        return;
      }

      // Create product
      const productResult = await dispatch(createProduct(formData)).unwrap();
      const productId = productResult.data.product_id;

      // Create variants and their images
      for (let vIndex = 0; vIndex < variants.length; vIndex++) {
        const v = variants[vIndex];
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

        // Attach images to this variant
        const imgs = Array.isArray(v.images) ? v.images : [];
        for (let i = 0; i < imgs.length; i++) {
          const url = imgs[i];
          if (!url) continue;
          await fetch(`${API_URL}/products/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: productId,
              variant_id: variantId,
              image_url: url,
              is_main: vIndex === 0 && i === 0 // first image of first variant as main
            })
          });
        }
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Product and variants created successfully.',
        icon: 'success',
        confirmButtonColor: '#ec4899'
      });

      router.push(`/${role}/console/product-management/product-details/${productId}`);
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error?.message || 'Failed to create product',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
            <p className="text-gray-500 mt-1">Create a new product and add variants with images</p>
          </div>
          <Link href={`/${role}/console/product-management/all-products`}>
            <button className="btn-secondary">Cancel</button>
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
              ></textarea>
            </div>

            <div className="mt-4 flex items-center">
              <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Active Product
              </label>
            </div>
          </div>

          {/* Variants */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Variants</h2>
              <button type="button" onClick={addVariant} className="btn-secondary flex items-center gap-2 text-sm">
                <PlusIcon className="w-4 h-4" /> Add Variant
              </button>
            </div>

            <div className="space-y-6">
              {variants.map((v, vIndex) => (
                  <div key={vIndex} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">Variant {vIndex + 1}</h3>
                      {variants.length > 1 && (
                          <button type="button" onClick={() => removeVariant(vIndex)} className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Variant Name *</label>
                        <input type="text" value={v.variant_name} onChange={(e) => handleVariantChange(vIndex, 'variant_name', e.target.value)} className="input-field" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                        <input type="text" value={v.sku} onChange={(e) => handleVariantChange(vIndex, 'sku', e.target.value)} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                        <input type="number" min="0" value={v.stock} onChange={(e) => handleVariantChange(vIndex, 'stock', e.target.value)} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">MRP Price</label>
                        <input type="number" min="0" step="0.01" value={v.mrp_price} onChange={(e) => handleVariantChange(vIndex, 'mrp_price', e.target.value)} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
                        <input type="number" min="0" step="0.01" value={v.price} onChange={(e) => handleVariantChange(vIndex, 'price', e.target.value)} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GST %</label>
                        <input type="number" min="0" step="0.01" value={v.gst_percentage} onChange={(e) => handleVariantChange(vIndex, 'gst_percentage', e.target.value)} className="input-field" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input id={`gstinc-${vIndex}`} type="checkbox" checked={v.gst_included} onChange={(e) => handleVariantChange(vIndex, 'gst_included', e.target.checked)} className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                        <label htmlFor={`gstinc-${vIndex}`} className="text-sm font-medium text-gray-700">Price includes GST</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                        <input type="text" value={v.weight} onChange={(e) => handleVariantChange(vIndex, 'weight', e.target.value)} className="input-field" placeholder="e.g., 1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                        <select value={v.unit} onChange={(e) => handleVariantChange(vIndex, 'unit', e.target.value)} className="input-field">
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="l">l</option>
                          <option value="ml">ml</option>
                          <option value="pc">pc</option>
                        </select>
                      </div>
                    </div>

                    {/* Variant Images */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">Variant Images</p>
                          <p className="text-xs text-gray-500">First image of first variant becomes product main image</p>
                        </div>
                        <button type="button" onClick={() => addVariantImageField(vIndex)} className="btn-secondary flex items-center gap-2 text-xs">
                          <PlusIcon className="w-4 h-4" /> Add Image
                        </button>
                      </div>

                      <div className="space-y-3">
                        {v.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="flex items-center gap-3">
                              {img && (
                                  <img src={img} alt={`Variant ${vIndex + 1} - ${imgIndex + 1}`} className="w-16 h-16 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              )}
                              <input type="text" value={img} onChange={(e) => handleVariantImageChange(vIndex, imgIndex, e.target.value)} placeholder="Enter image URL" className="input-field flex-1" />
                              {vIndex === 0 && imgIndex === 0 && (
                                  <span className="text-xs text-pink-600 font-medium whitespace-nowrap px-3 py-1 bg-pink-50 rounded-full">Main</span>
                              )}
                              {v.images.length > 1 && (
                                  <button type="button" onClick={() => removeVariantImageField(vIndex, imgIndex)} className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg">
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                              )}
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href={`/${role}/console/product-management/all-products`}>
              <button type="button" className="btn-secondary">
                Cancel
              </button>
            </Link>
            <button type="submit" className="btn-primary">
              Create Product
            </button>
          </div>
        </form>
      </div>
  );
}