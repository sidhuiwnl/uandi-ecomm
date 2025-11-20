"use client";

import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import {
    deleteVariant,
    fetchProductById,
    selectSelectedProduct,
} from "@/store/productsSlice";
import { Plus, ArrowLeft, Play, XCircle } from "lucide-react";

export default function VariantDetailsPage() {
    const { id, "variant-id": variantId, role } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();
    const product = useSelector(selectSelectedProduct);
    const [variant, setVariant] = useState(null);
    const [openSection, setOpenSection] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'

    // Fetch product details
    useEffect(() => {
        if (id) dispatch(fetchProductById(id));
    }, [dispatch, id]);

    // Find specific variant once product is loaded
    useEffect(() => {
        if (product?.variants?.length) {
            const foundVariant = product.variants.find(
                (v) => v.variant_id === parseInt(variantId)
            );
            setVariant(foundVariant || null);

            // Separate images and videos
            if (foundVariant?.images?.length) {
                const images = foundVariant.images.filter(img => !img.is_video);
                const videos = foundVariant.images.filter(img => img.is_video);

                // Set default main image
                if (images.length > 0) {
                    const main = images.find((img) => img.is_main) || images[0];
                    setSelectedImage(main);
                    setMediaType('image');
                } else if (videos.length > 0) {
                    // If no images, show first video
                    setSelectedVideo(videos[0]);
                    setMediaType('video');
                }
            }
        }
    }, [product, variantId]);

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete this variant.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            await dispatch(deleteVariant({ productId: id, variantId }));

            await Swal.fire({
                title: "Deleted!",
                text: "The variant has been successfully deleted.",
                icon: "success",
                confirmButtonColor: "#ec4899",
                timer: 1500,
                showConfirmButton: false,
            });

            router.push(`/${role}/console/product-management/product-details/${id}`);
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "Failed to delete the variant. Please try again.",
                icon: "error",
                confirmButtonColor: "#ec4899",
            });
        }
    };

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const openVideoPlayer = (video) => {
        setSelectedVideo(video);
        setShowVideoModal(true);
    };

    if (!variant) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading variant details...</p>
            </div>
        );
    }

    // Separate images and videos
    const allMedia = variant.images || [];
    const images = allMedia.filter(img => !img.is_video);
    const videos = allMedia.filter(img => img.is_video);

    return (
        <div className="min-h-screen">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Back Button */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${role}/console/product-management/product-details/${id}`}>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Product</span>
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Media Section */}
                    <div className="space-y-4">
                        {/* Main Display Area */}
                        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square relative">
                            {mediaType === 'image' && selectedImage ? (
                                <Image
                                    key={selectedImage?.image_url || "/placeholder.svg"}
                                    src={selectedImage?.image_url || "/placeholder.svg"}
                                    alt={variant.variant_name || "Variant Image"}
                                    width={600}
                                    height={600}
                                    className="w-full h-full object-cover transition-all duration-300 ease-in-out"
                                />
                            ) : mediaType === 'video' && selectedVideo ? (
                                <div className="relative w-full h-full">
                                    <video
                                        src={selectedVideo.image_url}
                                        className="w-full h-full object-cover"
                                        preload="metadata"
                                    />
                                    <div 
                                        className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors"
                                        onClick={() => openVideoPlayer(selectedVideo)}
                                    >
                                        <div className="bg-white/90 p-6 rounded-full hover:scale-110 transition-transform">
                                            <Play className="w-12 h-12 text-pink-600" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-400">No media available</p>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails - Images and Videos Combined */}
                        {(images.length > 0 || videos.length > 0) && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {/* Image Thumbnails */}
                                {images.map((img, index) => (
                                    <div
                                        key={`img-${img.image_id || index}`}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                                            mediaType === 'image' && selectedImage?.image_url === img.image_url
                                                ? "border-pink-500 scale-105"
                                                : "border-transparent hover:border-gray-300"
                                        }`}
                                        onClick={() => {
                                            setSelectedImage(img);
                                            setMediaType('image');
                                        }}
                                    >
                                        <Image
                                            src={img.image_url || "/placeholder.svg"}
                                            alt={`Image ${index + 1}`}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}

                                {/* Video Thumbnails */}
                                {videos.map((video, index) => (
                                    <div
                                        key={`vid-${video.image_id || index}`}
                                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                                            mediaType === 'video' && selectedVideo?.image_url === video.image_url
                                                ? "border-pink-500 scale-105"
                                                : "border-transparent hover:border-gray-300"
                                        }`}
                                        onClick={() => {
                                            setSelectedVideo(video);
                                            setMediaType('video');
                                        }}
                                    >
                                        <video
                                            src={video.image_url}
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white" fill="currentColor" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Media Count Badge */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            {images.length > 0 && (
                                <span className="px-3 py-1 bg-gray-100 rounded-full">
                                    {images.length} {images.length === 1 ? 'Image' : 'Images'}
                                </span>
                            )}
                            {videos.length > 0 && (
                                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full">
                                    {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="py-4">
                        <div className="mb-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                {variant.variant_name}
                            </h1>

                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-lg font-medium text-gray-700">
                                    {variant.weight ? `${variant.weight}${variant.unit}` : "—"}
                                </span>
                                <span className="text-2xl font-bold text-gray-900">
                                    ₹{variant.price}
                                </span>
                            </div>

                            <p className="text-gray-600 text-lg leading-relaxed">
                                {variant.description ||
                                    "This variant currently has no description."}
                            </p>
                        </div>

                        <div className="border-t border-gray-200 my-8"></div>

                        {/* Expandable Sections */}
                        <div className="space-y-4">
                            {[
                                {
                                    key: "details",
                                    title: "Details",
                                    content: (
                                        <div className="space-y-2">
                                            <p><strong>MRP:</strong> ₹{variant.mrp_price ? parseFloat(variant.mrp_price).toFixed(2) : parseFloat(variant.price).toFixed(2)}</p>
                                            <p><strong>Final Price:</strong> ₹{parseFloat(variant.final_price).toFixed(2)}</p>
                                            <p><strong>GST:</strong> {variant.gst_percentage}% {variant.gst_included ? '(Included)' : '(Extra)'}</p>
                                            <p><strong>GST Amount:</strong> ₹{variant.gst_amount ? parseFloat(variant.gst_amount).toFixed(2) : '0.00'}</p>
                                        </div>
                                    ),
                                },
                                {
                                    key: "payments",
                                    title: "Payment Options",
                                    content: "Cash on Delivery, UPI, Credit/Debit Cards, Net Banking available.",
                                },
                                {
                                    key: "shipping",
                                    title: "Shipping",
                                    content: `Free shipping on orders above ₹499. Standard delivery in 3-5 business days.`,
                                },
                            ].map(({ key, title, content }) => (
                                <div key={key} className="border-b border-gray-200 pb-4">
                                    <button
                                        onClick={() => toggleSection(key)}
                                        className="flex items-center justify-between w-full text-left"
                                    >
                                        <span className="text-lg font-semibold text-gray-900">
                                            {title}
                                        </span>
                                        <Plus
                                            className={`w-5 h-5 text-gray-600 transition-transform ${
                                                openSection === key ? "rotate-45" : ""
                                            }`}
                                        />
                                    </button>
                                    {openSection === key && (
                                        <div className="mt-4 text-gray-600">
                                            {typeof content === 'string' ? <p>{content}</p> : content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Buttons */}
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

                        {/* Extra Info */}
                        <div className="mt-8 grid grid-cols-2 gap-6 text-sm text-gray-500">
                            <div>
                                <p className="font-medium mb-1">SKU</p>
                                <p>{variant.sku || "N/A"}</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Stock</p>
                                <p
                                    className={
                                        variant.stock === 0
                                            ? "text-red-600"
                                            : variant.stock < 10
                                                ? "text-orange-600"
                                                : "text-green-600"
                                    }
                                >
                                    {variant.stock} units
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {showVideoModal && selectedVideo && (
                <div 
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
                    onClick={() => setShowVideoModal(false)}
                >
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowVideoModal(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <XCircle className="w-8 h-8" />
                        </button>
                        <video
                            src={selectedVideo.image_url}
                            controls
                            autoPlay
                            className="w-full rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
