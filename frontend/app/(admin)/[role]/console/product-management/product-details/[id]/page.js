'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { fetchProductById, clearSelectedProduct } from '@/store/productsSlice';
import Link from 'next/link';
import Swal from 'sweetalert2';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon,
  PhotoIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import AddVariantModal from '@/components/AddVariantModal';
import EditVariantModal from '@/components/EditVariantModal';
import ImageGalleryModal from '@/components/ImageGalleryModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProductDetailsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const role = params.role;

  const { selectedProduct } = useSelector(state => state.products);

  console.log(selectedProduct);

  const [loading, setLoading] = useState(true);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const loadProduct = () => {
    setLoading(true);
    dispatch(fetchProductById(productId)).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProduct();
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, productId]);

  const handleDeleteVariant = async (variantId, variantName) => {
    const result = await Swal.fire({
      title: 'Delete Variant?',
      text: `Are you sure you want to delete "${variantName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/products/variants/${variantId}`, {
          method: 'DELETE'
        });

        Swal.fire({
          title: 'Deleted!',
          text: 'Variant deleted successfully',
          icon: 'success',
          confirmButtonColor: '#ec4899',
          timer: 2000
        });

        loadProduct();
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete variant',
          icon: 'error',
          confirmButtonColor: '#ec4899'
        });
      }
    }
  };

  const handleEditVariant = (variant) => {
    setSelectedVariant(variant);
    setShowEditVariantModal(true);
  };

  const openImageGallery = () => {
    setShowImageGallery(true);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading product details...</p>
          </div>
        </div>
    );
  }

  if (!selectedProduct) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Product not found</p>
            <Link href={`/${role}/console/product-management/all-products`}>
              <button className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors">
                Back to Products
              </button>
            </Link>
          </div>
        </div>
    );
  }

  const totalStock = selectedProduct.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const totalVariants = selectedProduct.variants?.length || 0;

  return (
      <div className="min-h-screen  py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href={`/${role}/console/product-management/all-products`}>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 p-3 hover:bg-white rounded-2xl shadow-sm">
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span className="font-medium">Back to Products</span>
                </button>
              </Link>
              <div className="  p-4">
                <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.product_name}</h1>
                <p className="text-gray-500 mt-1">Manage product details and variants</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/${role}/console/product-management/edit-product/${productId}`}>
                <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-md">
                  <PencilIcon className="w-5 h-5" />
                  Edit Product
                </button>
              </Link>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Image & Quick Stats */}
            <div className="xl:col-span-1 space-y-6">
              {/* Product Image Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                    Product Image
                    {selectedProduct.tag_name && (
                        <span className="bg-pink-500 text-white text-sm font-medium px-3 py-1 rounded-full shadow-md">
                        {selectedProduct.tag_name}
                      </span>
                    )}
                  </h2>
                  {selectedProduct.main_image && selectedProduct.main_image.length > 0 ? (
                      <div className="space-y-4">
                        <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square cursor-pointer" onClick={openImageGallery}>
                          <img
                              src={selectedProduct.main_image.find(img => img.is_main)?.image_url || selectedProduct.main_image[0].image_url}
                              alt={selectedProduct.product_name}
                              className="w-full h-full object-cover"
                              onClick={openImageGallery}
                              onError={(e) => {
                                e.target.src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="256" viewBox="0 0 400 256"%3E%3Crect width="400" height="256" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                          />

                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openImageGallery();
                              }}
                              className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                          >
                            <PhotoIcon className="w-5 h-5 text-gray-700" />
                          </button>
                        </div>

                        {selectedProduct.main_image.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                              {selectedProduct.main_image.slice(0, 4).map((image, index) => (
                                  <img
                                      key={image.image_id}
                                      src={image.image_url}
                                      alt={`${selectedProduct.product_name} ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity border-2 border-transparent hover:border-pink-500"
                                      onClick={openImageGallery}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                  />
                              ))}
                            </div>
                        )}
                      </div>
                  ) : (
                      <div className="bg-gray-100 h-64 rounded-xl flex flex-col items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-400">No images available</p>
                      </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Variants</span>
                    <span className="text-2xl font-bold text-gray-900">{totalVariants}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Stock</span>
                    <span className="text-2xl font-bold text-gray-900">{totalStock}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Status</span>
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}>
                    {selectedProduct.is_active ? (
                        <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                        <XCircleIcon className="w-4 h-4" />
                    )}
                      {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info & Variants */}
            <div className="xl:col-span-2 space-y-6">
              {/* Product Information Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">

                    Product Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Product Name</label>
                      <p className="text-gray-900 font-semibold text-lg">{selectedProduct.product_name}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-gray-900 font-semibold">{selectedProduct.category_name}</p>
                    </div>

                    {selectedProduct.description && (
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-sm font-medium text-gray-500">Description</label>
                          <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">

                        Product Variants
                      </h2>
                      <p className="text-gray-500 mt-1">Manage different variants of this product</p>
                    </div>
                    <button
                        onClick={() => setShowAddVariantModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-rose-300 to-rose-400 hover:from-pink-300 hover:to-pink-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Add Variant
                    </button>
                  </div>

                  {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProduct.variants.map(variant => (
                            <div
                                key={variant.variant_id}
                                onClick={() => {
                                  router.push(`/${role}/console/product-management/product-details/${productId}/variant/${variant?.variant_id}`)
                                }}
                                className="group border border-gray-200 hover:border-pink-300 rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer bg-white"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                                      {variant.variant_name || 'Default Variant'}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        variant.stock > 10
                                            ? 'bg-green-100 text-green-700'
                                            : variant.stock > 0
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                    }`}>
                                {variant.stock} units
                              </span>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">SKU:</span>
                                      <span className="ml-2 font-medium">{variant.sku || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Price:</span>
                                      <span className="ml-2 font-medium">₹{parseFloat(variant.price).toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Final Price:</span>
                                      <span className="ml-2 font-medium text-pink-600">₹{parseFloat(variant.final_price).toFixed(2)}</span>
                                    </div>
                                    {variant.weight && (
                                        <div>
                                          <span className="text-gray-500">Weight:</span>
                                          <span className="ml-2 font-medium">{variant.weight}{variant.unit}</span>
                                        </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditVariant(variant);
                                      }}
                                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Edit"
                                  >
                                    <PencilIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteVariant(variant.variant_id, variant.variant_name);
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete"
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No variants added yet</p>
                        <button
                            onClick={() => setShowAddVariantModal(true)}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                          Add First Variant
                        </button>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAddVariantModal && (
            <AddVariantModal
                productId={productId}
                onClose={() => setShowAddVariantModal(false)}
                onSuccess={() => {
                  setShowAddVariantModal(false);
                  loadProduct();
                }}
            />
        )}

        {showEditVariantModal && selectedVariant && (
            <EditVariantModal
                variant={selectedVariant}
                productId={selectedProduct.product_id}
                images={selectedProduct.main_image || []}
                onClose={() => {
                  setShowEditVariantModal(false);
                  setSelectedVariant(null);
                }}
                onSuccess={() => {
                  setShowEditVariantModal(false);
                  setSelectedVariant(null);
                  loadProduct();
                }}
            />
        )}

        {showImageGallery && selectedProduct.main_image && (
            <ImageGalleryModal
                images={selectedProduct.main_image}
                productName={selectedProduct.product_name}
                onClose={() => setShowImageGallery(false)}
            />
        )}
      </div>
  );
}