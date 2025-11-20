// frontend/app/(admin)/product-management/edit-product/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchProductById, updateProduct, clearSelectedProduct, getAllTags } from '@/store/productsSlice';
import { fetchCategories } from '@/store/categoriesSlice';
import Swal from 'sweetalert2';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EditProductPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const { selectedProduct } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);
  const tags = useSelector(state => state.products.tags || []);

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    tag_id: '',
    description: '',
    is_active: true
  });

  const [images, setImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProductById(productId));
    dispatch(getAllTags());

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, productId]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        product_name: selectedProduct.product_name,
        category_id: selectedProduct.category_id,
        tag_id: selectedProduct.tag_id || '',
        description: selectedProduct.description || '',
        is_active: selectedProduct.is_active
      });

      setImages(selectedProduct.main_image.map(img => ({
        ...img,
        isNew: false
      })));

      setLoading(false);
    }
  }, [selectedProduct]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...images];
    updatedImages[index].image_url = value;
    setImages(updatedImages);
  };

  const addImageField = () => {
    setImages([...images, {
      image_url: '',
      is_main: images.length === 0,
      isNew: true
    }]);
  };

  const removeImageField = async (index) => {
    const image = images[index];

    if (!image.isNew) {
      const result = await Swal.fire({
        title: 'Delete Image?',
        text: 'This will permanently delete this image.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ec4899',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
      });

      if (!result.isConfirmed) return;

      setDeletedImages([...deletedImages, image.image_id]);
    }

    const updatedImages = images.filter((_, i) => i !== index);

    // If removed image was main and there are other images, make first one main
    if (image.is_main && updatedImages.length > 0) {
      updatedImages[0].is_main = true;
    }

    setImages(updatedImages);
  };

  const setMainImage = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      is_main: i === index
    }));
    setImages(updatedImages);
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
      // Update product basic info including tag
      await dispatch(updateProduct({
        id: productId,
        productData: formData
      })).unwrap();

      // Delete removed images
      for (const imageId of deletedImages) {
        await fetch(`${API_URL}/products/images/${imageId}`, {
          method: 'DELETE'
        });
      }

      // Update existing images and add new ones
      for (const image of images) {
        if (image.isNew && image.image_url) {
          await fetch(`${API_URL}/products/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: productId,
              image_url: image.image_url,
              is_main: image.is_main
            })
          });
        } else if (!image.isNew) {
          // Update is_main status for existing images
          await fetch(`${API_URL}/products/images/${image.image_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: image.image_url,
              is_main: image.is_main
            })
          });
        }
      }

      Swal.fire({
        title: 'Success!',
        text: 'Product updated successfully',
        icon: 'success',
        confirmButtonColor: '#ec4899'
      }).then(() => {
        router.push(`/admin/console/product-management/product-details/${productId}`);
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update product',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/console/product-management/product-details/${productId}`}>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
              <p className="text-gray-500 mt-1">Update product information and images</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="">No Tag</option>
                  {tags.map(tag => (
                      <option key={tag.tag_id} value={tag.tag_id}>
                        {tag.tag_name}
                      </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Assign a tag to this product
                </p>
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

          {/* Images */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Product Images</h2>
              <button
                  type="button"
                  onClick={addImageField}
                  className="btn-secondary flex items-center gap-2 text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Image
              </button>
            </div>

            <div className="space-y-3">
              {images.map((image, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {image.image_url && (
                        <img
                            src={image.image_url}
                            alt={`Product ${index + 1}`}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                        />
                    )}
                    <input
                        type="text"
                        value={image.image_url}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="Enter image URL"
                        className="input-field flex-1"
                    />
                    <button
                        type="button"
                        onClick={() => setMainImage(index)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                            image.is_main
                                ? 'bg-pink-500 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {image.is_main ? 'Main' : 'Set Main'}
                    </button>
                    {image.isNew && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">
                    New
                  </span>
                    )}
                    <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
              ))}

              {images.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No images added. Click "Add Image" to upload one.
                  </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href={`/admin/console/product-management/product-details/${productId}`}>
              <button type="button" className="btn-secondary">
                Cancel
              </button>
            </Link>
            <button type="submit" className="btn-primary">
              Update Product
            </button>
          </div>
        </form>
      </div>
  );
}