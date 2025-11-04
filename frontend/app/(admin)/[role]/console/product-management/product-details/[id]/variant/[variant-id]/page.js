"use client";

import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Image from "next/image";
import { deleteVariant, fetchProductById, selectSelectedProduct } from "@/store/productsSlice";
import { ChevronDown, Plus } from "lucide-react";

export default function VariantDetailsPage() {
    const { id, "variant-id": variantId, role } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();
    const product = useSelector(selectSelectedProduct);
    const [variant, setVariant] = useState(null);
    const [openSection, setOpenSection] = useState(null);

    // Fetch product details when page loads
    useEffect(() => {
        if (id) dispatch(fetchProductById(id));
    }, [dispatch, id]);

    // Find the specific variant once product is fetched
    useEffect(() => {
        if (product?.variants?.length) {
            const foundVariant = product.variants.find(
                (v) => v.variant_id === parseInt(variantId)
            );
            setVariant(foundVariant || null);
        }
    }, [product, variantId]);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this variant?")) {
            await dispatch(deleteVariant({ productId: id, variantId }));
            router.push(`/${role}/console/product-management/product-details/${id}`);
        }
    };

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    if (!variant) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading variant details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square">
                            <Image
                                src={variant.variant_image || "/placeholder.svg"}
                                alt={variant.variant_name || "Variant Image"}
                                width={600}
                                height={600}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="py-4">
                        {/* Product Title and Info */}
                        <div className="mb-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                {variant.variant_name || "Summit Seeker Pack"}
                            </h1>

                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-lg font-medium text-gray-700">
                                    {variant.attributes?.size || "ONE SIZE"}
                                </span>
                                <span className="text-2xl font-bold text-gray-900">
                                    ${variant.price || "120"}
                                </span>
                            </div>

                            <p className="text-gray-600 text-lg leading-relaxed">
                                {variant.description || "This compact and durable backpack embodies a true spirit of adventure and passion for exploration."}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-8"></div>

                        {/* Expandable Sections */}
                        <div className="space-y-4">
                            {/* Details Section */}
                            <div className="border-b border-gray-200 pb-4">
                                <button
                                    onClick={() => toggleSection('details')}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <span className="text-lg font-semibold text-gray-900">Details</span>
                                    <Plus className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'details' ? 'rotate-45' : ''}`} />
                                </button>
                                {openSection === 'details' && (
                                    <div className="mt-4 text-gray-600">
                                        <p>Product details and specifications will appear here...</p>
                                    </div>
                                )}
                            </div>

                            {/* Payments Options Section */}
                            <div className="border-b border-gray-200 pb-4">
                                <button
                                    onClick={() => toggleSection('payments')}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <span className="text-lg font-semibold text-gray-900">Payments Options</span>
                                    <Plus className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'payments' ? 'rotate-45' : ''}`} />
                                </button>
                                {openSection === 'payments' && (
                                    <div className="mt-4 text-gray-600">
                                        <p>Available payment methods will appear here...</p>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Section */}
                            <div className="border-b border-gray-200 pb-4">
                                <button
                                    onClick={() => toggleSection('shipping')}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <span className="text-lg font-semibold text-gray-900">Shipping</span>
                                    <Plus className={`w-5 h-5 text-gray-600 transition-transform ${openSection === 'shipping' ? 'rotate-45' : ''}`} />
                                </button>
                                {openSection === 'shipping' && (
                                    <div className="mt-4 text-gray-600">
                                        <p>Shipping information and options will appear here...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() =>
                                    router.push(
                                        `/${role}/console/product-management/product-details/${id}/variant/${variantId}/edit`
                                    )
                                }
                                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
                            >
                                Edit Variant
                            </button>

                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
                            >
                                Delete Variant
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 grid grid-cols-2 gap-6 text-sm text-gray-500">
                            <div>
                                <p className="font-medium mb-1">SKU</p>
                                <p>{variant.sku || "N/A"}</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Stock</p>
                                <p className={variant.stock === 0 ? 'text-red-600' : variant.stock < 10 ? 'text-orange-600' : 'text-green-600'}>
                                    {variant.stock} units
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}