// frontend/app/(admin)/product-management/all-products/page.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, updateStock } from '@/store/productsSlice';
import { fetchCategories } from '@/store/categoriesSlice';
import Link from 'next/link';
import Swal from 'sweetalert2';
import {
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';

import ProductPreviewModal from '@/components/ProductPreviewModal';
import StockUpdateModal from '@/components/StockUpdateModal';
import { useParams, useRouter } from "next/navigation";




export default function AllProductsPage() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories || { categories: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewProduct, setPreviewProduct] = useState(null);
  const [stockUpdateProduct, setStockUpdateProduct] = useState(null);
  const router = useRouter();
  const { role } = useParams();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

 

  const handleDelete = async (productId, productName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${productName}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        Swal.fire({
          title: 'Deleted!',
          text: 'Product has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#ec4899'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete product.',
          icon: 'error',
          confirmButtonColor: '#ec4899'
        });
      }
    }
  };

  const handleStockUpdate = async (variantId, newStock) => {
    try {
      await dispatch(updateStock({ variantId, stock: newStock })).unwrap();
      dispatch(fetchProducts());
      Swal.fire({
        title: 'Success!',
        text: 'Stock updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update stock.',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category.category_id == categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && product.is_active) ||
        (statusFilter === 'inactive' && !product.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = useMemo(() => {
    const total = products?.length || 0;
    const active = products?.filter(p => p.is_active)?.length || 0;
    const outOfStock = products?.filter(p => (p.variants || []).reduce((s, v) => s + (v.stock || 0), 0) <= 0)?.length || 0;
    return { total, active, outOfStock };
  }, [products]);

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 mt-1">Manage your catalog, stock and visibility</p>
          </div>
          <Link href={`/${role}/console/product-management/add-product`} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              title: "Total Products",
              value: stats.total,
              icon: <Filter className="w-6 h-6 text-pink-600" />,
              bg: "bg-pink-50",
            },
            {
              title: "Active",
              value: stats.active,
              icon: <span className="inline-block h-3 w-3 rounded-full bg-green-500" />,
              bg: "bg-green-50",
            },
            {
              title: "Out of Stock",
              value: stats.outOfStock,
              icon: <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />,
              bg: "bg-amber-50",
            },
          ].map((item, i) => (
              <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{item.title}</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                  <div
                      className={`rounded-xl ${item.bg} p-3 transition-transform duration-300 group-hover:scale-110`}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>
          ))}
        </div>


        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ease-in-out bg-gray-50 hover:bg-white"
                  aria-label="Search products"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category Filter */}
              {/* Category Filter */}
              <div className="relative">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-48 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ease-in-out bg-gray-50 hover:bg-white appearance-none pr-10 cursor-pointer"
                    aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {categories?.length > 0 ? (
                      categories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.category_name}
                          </option>
                      ))
                  ) : (
                      <option disabled>Loading...</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>


              {/* Status Filter */}
              <div className="relative">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-40 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ease-in-out bg-gray-50 hover:bg-white appearance-none pr-10 cursor-pointer"
                    aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters Indicator */}
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchTerm && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                Search: &#34;{searchTerm}
                      <button
                          onClick={() => setSearchTerm('')}
                          className="ml-1.5 hover:text-pink-900"
                      >
                  ×
                </button>
              </span>
                )}
                {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Category
                <button
                    onClick={() => setCategoryFilter('all')}
                    className="ml-1.5 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
                )}
                {statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {statusFilter}
                      <button
                          onClick={() => setStatusFilter('all')}
                          className="ml-1.5 hover:text-green-900"
                      >
                  ×
                </button>
              </span>
                )}
              </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50/60 backdrop-blur-sm">
            <tr>
              <th className="text-left py-4 px-5 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
              <th className="text-left py-4 px-5 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-left py-4 px-5 text-xs font-medium text-gray-500 uppercase tracking-wide">Variants</th>
              <th className="text-left py-4 px-5 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock</th>
              <th className="text-left py-4 px-5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-right py-4 px-5 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => (
                <tr
                    key={product.product_id}
                    className="transition-all duration-200 hover:bg-gray-50/60 hover:shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {product.main_image ? (
                          <img
                              src={product.main_image}
                              alt={product.product_name}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                          />
                      ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                            N/A
                          </div>
                      )}
                      <div>
                        <Link
                            href={`/${role}/console/product-management/product-details/${product.product_id}`}
                            className="font-medium text-gray-900 hover:text-pink-600 transition-colors"
                        >
                          {product.product_name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {product.product_id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5 text-sm text-gray-700">
                    {product.category.category_name}
                  </td>

                  <td className="py-4 px-5 text-sm text-gray-700">
                    {product.variants.length} variant(s)
                  </td>

                  <td className="py-4 px-5 text-sm">
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStockUpdateProduct(product);
                        }}
                        className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
                    >
                      {product.variants.reduce((sum, v) => sum + v.stock, 0)} in stock
                    </button>
                  </td>

                  <td className="py-4 px-5">
            <span
                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                    product.is_active
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'
                }`}
            >
              {product.is_active ? 'Active' : 'Inactive'}
            </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                          onClick={() =>
                              router.push(`/${role}/console/product-management/product-details/${product.product_id}`)
                          }
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                          title="View"
                      >
                        <Eye className="w-5 h-5" strokeWidth={1.8} />
                      </button>
                      <Link
                          href={`/${role}/console/product-management/edit-product/${product.product_id}`}
                          className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                          title="Edit"
                      >
                        <Edit3 className="w-5 h-5" strokeWidth={1.8} />
                      </Link>
                      <button
                          onClick={() => handleDelete(product.product_id, product.product_name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                          title="Delete"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
            ))}

            {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500 text-sm">
                    No products found
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        {previewProduct && (
            <ProductPreviewModal
                product={previewProduct}
                onClose={() => setPreviewProduct(null)}
            />
        )}

        {stockUpdateProduct && (
            <StockUpdateModal
                product={stockUpdateProduct}
                onClose={() => setStockUpdateProduct(null)}
                onUpdate={handleStockUpdate}
            />
        )}
      </div>
  );
}