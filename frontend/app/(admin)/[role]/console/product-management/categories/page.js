// frontend/app/(admin)/product-management/categories/page.js
'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/store/categoriesSlice';
import Swal from 'sweetalert2';
import {
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector(state => state.categories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '',
    category_description: ''
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        category_name: category.category_name,
        category_description: category.category_description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        category_name: '',
        category_description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ category_name: '', category_description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await dispatch(updateCategory({
          id: editingCategory.category_id,
          categoryData: formData
        })).unwrap();
        Swal.fire({
          title: 'Success!',
          text: 'Category updated successfully',
          icon: 'success',
          confirmButtonColor: '#ec4899'
        });
      } else {
        await dispatch(createCategory(formData)).unwrap();
        Swal.fire({
          title: 'Success!',
          text: 'Category created successfully',
          icon: 'success',
          confirmButtonColor: '#ec4899'
        });
      }
      handleCloseModal();
      dispatch(fetchCategories());
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to save category',
        icon: 'error',
        confirmButtonColor: '#ec4899'
      });
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${categoryName}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        Swal.fire({
          title: 'Deleted!',
          text: 'Category has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#ec4899'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Cannot delete category with existing products',
          icon: 'error',
          confirmButtonColor: '#ec4899'
        });
      }
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 mt-1">Organize and manage your product categories</p>
          </div>
          <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(category => (
              <div
                  key={category.category_id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-pink-600 transition-colors">
                      {category.category_name}
                    </h3>
                    {category.category_description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                          {category.category_description}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {new Date(category.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <button
                        onClick={() => handleOpenModal(category)}
                        className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Edit"
                    >
                      <Pencil className="w-5 h-5" strokeWidth={1.8} />
                    </button>
                    <button
                        onClick={() => handleDelete(category.category_id, category.category_name)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Delete"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* Empty state */}
        {categories.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-500">No categories yet. Click <span className="text-pink-600 font-medium">Add Category</span> to create one.</p>
            </div>
        )}

        {/* Modal */}
        {showModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center
             bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.15),transparent_70%),rgba(17,17,17,0.35)]
             backdrop-blur-[8px] transition-all duration-300"
            >


            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg relative">
                <button
                    onClick={handleCloseModal}
                    className="absolute right-3 top-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                        type="text"
                        value={formData.category_name}
                        onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                        placeholder="e.g. Electronics"
                        required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                        value={formData.category_description}
                        onChange={(e) => setFormData({ ...formData, category_description: e.target.value })}
                        rows="3"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                        placeholder="Short description of this category..."
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium shadow-sm transition-all duration-200"
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}