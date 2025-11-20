"use client";

import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProductById, selectSelectedProduct } from "@/store/productsSlice";
import Swal from "sweetalert2";
import { ArrowLeft, X, Upload, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { XMarkIcon, PhotoIcon, VideoCameraIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function EditVariantPage() {
    const { id: productId, "variant-id": variantId, role } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();
    const product = useSelector(selectSelectedProduct);

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Image/Video state (from modal)
    const [existingImages, setExistingImages] = useState([]);
    const [existingVideo, setExistingVideo] = useState(null);
    const [imageReplacements, setImageReplacements] = useState({});
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [newVideoFile, setNewVideoFile] = useState(null);
    const [newVideoPreview, setNewVideoPreview] = useState(null);

    // Fetch the product and variant details
    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(productId));
        }
    }, [dispatch, productId]);

    useEffect(() => {
        if (product?.variants?.length) {
            const foundVariant = product.variants.find(
                (v) => v.variant_id === parseInt(variantId)
            );

            if (foundVariant) {
                setFormData({
                    variant_name: foundVariant.variant_name || "",
                    sku: foundVariant.sku || "",
                    mrp_price: foundVariant.mrp_price || "",
                    price: foundVariant.price || "",
                    gst_percentage: foundVariant.gst_percentage || 18,
                    gst_included:
                        foundVariant.gst_included !== undefined
                            ? foundVariant.gst_included
                            : true,
                    stock: foundVariant.stock || 0,
                    weight: foundVariant.weight || "",
                    unit: foundVariant.unit || "ml",
                });

                // Separate images and videos
                const variantImages = foundVariant.images?.filter(img => !img.is_video) || [];
                const variantVideo = foundVariant.images?.find(img => img.is_video) || null;
                
                setExistingImages(variantImages);
                setExistingVideo(variantVideo);
            }
            setLoading(false);
        }
    }, [product, variantId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(imageReplacements).forEach(r => URL.revokeObjectURL(r.preview));
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
            if (newVideoPreview) URL.revokeObjectURL(newVideoPreview);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const calculateFinalPrice = () => {
        if (!formData?.price) return 0;
        const price = parseFloat(formData.price);
        const gst = parseFloat(formData.gst_percentage);
        return formData.gst_included ? price : price + (price * gst) / 100;
    };

    // Replace individual existing image
    const handleReplaceImage = (e, imageIndex, imageId) => {
        const file = e.target.files[0];
        if (!file) return;

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

    const cancelReplacement = (imageIndex) => {
        if (imageReplacements[imageIndex]) {
            URL.revokeObjectURL(imageReplacements[imageIndex].preview);
            const newReplacements = { ...imageReplacements };
            delete newReplacements[imageIndex];
            setImageReplacements(newReplacements);
        }
    };

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

        const validFiles = filesToAdd.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== filesToAdd.length) {
            Swal.fire({
                title: 'Invalid file type',
                text: 'Please select only image files',
                icon: 'error',
                confirmButtonColor: '#ec4899'
            });
        }

        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        
        setNewImageFiles(prev => [...prev, ...validFiles]);
        setNewImagePreviews(prev => [...prev, ...newPreviews]);

        e.target.value = '';
    };

    const removeNewImage = (index) => {
        URL.revokeObjectURL(newImagePreviews[index]);
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

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
            
            setExistingImages(imgs => imgs.filter(img => img.image_id !== imageId));
            
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

    const uploadReplacementImages = async () => {
        const replacements = Object.values(imageReplacements);
        if (replacements.length === 0) return [];

        const results = [];

        for (const replacement of replacements) {
            const formDataUpload = new FormData();
            formDataUpload.append('image', replacement.file);
            formDataUpload.append('image_id', replacement.imageId);
            formDataUpload.append('old_url', replacement.oldUrl);
            formDataUpload.append('variant_id', variantId);
            formDataUpload.append('product_id', productId);

            try {
                const response = await fetch(`${API_URL}/products/replace-single-image`, {
                    method: 'POST',
                    body: formDataUpload
                });

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    throw new Error('Server returned invalid response.');
                }

                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Failed to replace image');
                }

                results.push(result);
            } catch (error) {
                throw new Error(`Image replacement failed: ${error.message}`);
            }
        }

        return results;
    };

    const uploadNewImages = async () => {
        if (newImageFiles.length === 0) return [];

        const formDataUpload = new FormData();
        
        newImageFiles.forEach((file, index) => {
            formDataUpload.append(`images[${index}]`, file);
        });

        try {
            const response = await fetch(`${API_URL}/products/upload-media`, {
                method: 'POST',
                body: formDataUpload
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

    const replaceExistingVideo = async () => {
        if (!newVideoFile || !existingVideo) return null;

        const formDataUpload = new FormData();
        formDataUpload.append('video', newVideoFile);
        formDataUpload.append('video_id', existingVideo.image_id);
        formDataUpload.append('old_url', existingVideo.image_url);
        formDataUpload.append('variant_id', variantId);
        formDataUpload.append('product_id', productId);

        try {
            const response = await fetch(`${API_URL}/products/replace-single-video`, {
                method: 'POST',
                body: formDataUpload
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned invalid response.');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to replace video');
            }

            return result.data.new_url;
        } catch (error) {
            throw new Error(`Video replacement failed: ${error.message}`);
        }
    };

    const uploadNewVideo = async () => {
        if (!newVideoFile) return null;

        const formDataUpload = new FormData();
        formDataUpload.append('video', newVideoFile);

        try {
            const response = await fetch(`${API_URL}/products/upload-media`, {
                method: 'POST',
                body: formDataUpload
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

        if (!formData?.price) {
            Swal.fire({
                title: "Error!",
                text: "Please enter a valid price.",
                icon: "error",
                confirmButtonColor: "#ec4899",
            });
            return;
        }

        setUploading(true);

        try {
            // 1. Update variant details
            const response = await fetch(
                `${API_URL}/products/variants/${variantId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!data.success) throw new Error(data.message);

            // 2. Replace individual images
            await uploadReplacementImages();

            // 3. Upload and insert new images
            const newImageUrls = await uploadNewImages();
            for (const url of newImageUrls) {
                await fetch(`${API_URL}/products/images`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product_id: productId,
                        variant_id: variantId,
                        image_url: url,
                        is_main: false,
                        is_video: 0
                    })
                });
            }

            // 4. Handle video replacement or new upload
            if (newVideoFile) {
                if (existingVideo) {
                    await replaceExistingVideo();
                } else {
                    const videoUrl = await uploadNewVideo();
                    if (videoUrl) {
                        await fetch(`${API_URL}/products/images`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                product_id: productId,
                                variant_id: variantId,
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
                title: "Success!",
                text: "Variant updated successfully",
                icon: "success",
                confirmButtonColor: "#ec4899",
                timer: 2000,
                showConfirmButton: false,
            });

            router.push(`/${role}/console/product-management/product-details/${productId}`);
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error.message || "Failed to update variant",
                icon: "error",
                confirmButtonColor: "#ec4899",
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading || !formData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-b-2 border-pink-500 mx-auto mb-3"></div>
                    <p className="text-gray-500">Loading variant details...</p>
                </div>
            </div>
        );
    }

    const totalImageCount = existingImages.length + newImageFiles.length;

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-50 rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Variant
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Update variant information and media
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: "Variant Name", name: "variant_name" },
                                { label: "SKU", name: "sku" },
                                { label: "MRP Price (₹)", name: "mrp_price" },
                                { label: "Selling Price (₹)", name: "price", required: true },
                                { label: "GST (%)", name: "gst_percentage" },
                                { label: "Stock", name: "stock", required: true },
                                { label: "Weight", name: "weight" },
                            ].map((f) => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {f.label}
                                    </label>
                                    <input
                                        type="text"
                                        name={f.name}
                                        value={formData[f.name]}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
                                        required={f.required}
                                        disabled={uploading}
                                    />
                                </div>
                            ))}

                            {/* Unit Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit
                                </label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
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

                        {/* GST Included */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="gst_included"
                                checked={formData.gst_included}
                                onChange={handleChange}
                                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                disabled={uploading}
                            />
                            <label className="text-sm font-medium text-gray-700">
                                GST Included in Price
                            </label>
                        </div>

                        {/* Final Price */}
                        {formData.price && (
                            <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                                <div className="flex justify-between text-gray-700">
                                    <span>Final Price:</span>
                                    <span className="font-bold text-pink-600">
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
                                    <label className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
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
                                                <img
                                                    src={imageReplacements[index] ? imageReplacements[index].preview : img.image_url}
                                                    alt="Variant"
                                                    className={`w-full h-24 object-cover rounded-lg border-2 ${
                                                        imageReplacements[index] ? 'border-orange-400' : 'border-gray-200'
                                                    }`}
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                                
                                                {imageReplacements[index] && (
                                                    <span className="absolute top-1 left-1 text-xs text-white font-medium px-2 py-1 bg-orange-600 rounded-full">
                                                        New
                                                    </span>
                                                )}

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
                                    <label className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
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

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 flex items-center gap-2 min-w-[140px] justify-center"
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
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
