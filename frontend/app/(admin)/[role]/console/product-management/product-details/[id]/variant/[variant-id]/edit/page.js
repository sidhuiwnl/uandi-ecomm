"use client";
import {useParams, useRouter} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {fetchProductById, selectSelectedProduct, updateVariant} from "@/store/productsSlice";
import { ArrowLeft } from "lucide-react";

export default function Page() {
    const {id, "variant-id": variantId, role} = useParams(); // Fixed parameter name
    const dispatch = useDispatch();
    const product = useSelector(selectSelectedProduct);
    const [variant, setVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    console.log("Product:", product);
    console.log("Variant ID:", variantId);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (product?.variants?.length) {
            const foundVariant = product.variants.find(v =>
                v.variant_id === parseInt(variantId) || v.id === parseInt(variantId) // Check both possible ID fields
            );
            console.log("Found variant:", foundVariant);
            setVariant(foundVariant || null);
            setLoading(false);
        }
    }, [product, variantId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!variant) return;

        dispatch(updateVariant({
            productId: id,
            variantId: variantId,
            variantData: variant
        })).then(() => {
            router.push(`/${role}/console/product-management/product-details/${id}/variant/${variantId}`);
        });
    };

    const handleChange = (e) => {
        const {name, value, type} = e.target;
        setVariant(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading variant details...</p>
                </div>
            </div>
        );
    }

    if (!variant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-lg mb-4">Variant not found</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 hover:bg-white rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Variant</h1>
                        <p className="text-gray-500 mt-1">Update variant information</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="variant_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Variant Name *
                                </label>
                                <input
                                    type="text"
                                    id="variant_name"
                                    name="variant_name"
                                    value={variant.variant_name || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                    placeholder="Enter variant name"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    id="sku"
                                    name="sku"
                                    value={variant.sku || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                    placeholder="Enter SKU"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={variant.description || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                placeholder="Enter variant description"
                            />
                        </div>

                        {/* Pricing & Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    Price *
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={variant.price || ''}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="mrp_price" className="block text-sm font-medium text-gray-700 mb-2">
                                    MRP Price
                                </label>
                                <input
                                    type="number"
                                    id="mrp_price"
                                    name="mrp_price"
                                    value={variant.mrp_price || ''}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    value={variant.stock || ''}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Additional Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight
                                </label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={variant.weight || ''}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit
                                </label>
                                <select
                                    id="unit"
                                    name="unit"
                                    value={variant.unit || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select unit</option>
                                    <option value="g">g</option>
                                    <option value="kg">kg</option>
                                    <option value="ml">ml</option>
                                    <option value="L">L</option>
                                    <option value="pcs">pcs</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}