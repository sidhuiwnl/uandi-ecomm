'use client';

import { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ImageGalleryModal({ images, productName, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-60">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
            >
                <XMarkIcon className="w-8 h-8" />
            </button>

            <div className="w-full max-w-5xl px-4">
                <div className="relative">
                    {/* Main Image */}
                    <div className="bg-white rounded-lg overflow-hidden">
                        <img
                            src={images[currentIndex].image_url}
                            alt={`${productName} ${currentIndex + 1}`}
                            className="w-full h-[70vh] object-contain"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="100%25" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                            }}
                        />
                    </div>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                            >
                                <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                            >
                                <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                    <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <button
                                key={image.image_id}
                                onClick={() => setCurrentIndex(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentIndex
                                        ? 'border-pink-500 scale-110'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={image.image_url}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}