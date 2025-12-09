"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const banners = [
  { id: 1, image: "https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/banner-1-new.webp", link: "/products" },
  { id: 2, image: "https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/banner-2.webp", link: "/products/16" },
  { id: 3, image: "https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/banner-3.webp", link: "/products/17" },
  { id: 4, image: "https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/banner-4.webp", link: "/products/22" },
];

export default function PromotionalBanners() {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef(null);

  const minSwipeDistance = 50;

  const resetAutoSlide = useCallback(() => {
    if (timeoutRef.current) clearInterval(timeoutRef.current);
    timeoutRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
    resetAutoSlide();
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    resetAutoSlide();
  };

  useEffect(() => {
    timeoutRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timeoutRef.current);
  }, []);

  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    setTouchStart(e.clientX);
    setTouchEnd(0);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  const onMouseLeave = () => {
    if (isDragging) setIsDragging(false);
  };

  return (
    <div className="relative w-full overflow-hidden bg-neutral-900/5">
      {/* Maintain a consistent hero aspect ratio like Vilvah */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
        <a
          href={banners[current].link}
          className="block cursor-grab active:cursor-grabbing w-full h-full"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <img
            src={banners[current].image}
            alt={`Banner ${current + 1}`}
            className="absolute inset-0 w-full h-full object-cover object-center select-none"
            draggable="false"
          />
        </a>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 backdrop-blur-sm bg-black/20 px-5 py-3 rounded-full">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                resetAutoSlide();
              }}
              aria-label={`Go to slide ${i + 1}`}
              className="relative group"
            >
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === current
                    ? "w-10 bg-gradient-to-r from-pink-400 to-pink-600"
                    : "w-8 bg-white/50 group-hover:bg-white/70"
                }`}
              >
                {i === current && (
                  <div
                    className="h-full bg-white/40 rounded-full animate-progress"
                    style={{ animation: "progress 4s linear infinite" }}
                  />
                )}
              </div>
              {i === current && (
                <div className="absolute inset-0 rounded-full bg-pink-400 blur-md opacity-40 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 flex items-center justify-center group shadow-lg opacity-70 hover:opacity-100 focus:opacity-100"
        >
          <svg
            className="w-6 h-6 text-gray-800 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 flex items-center justify-center group shadow-lg opacity-70 hover:opacity-100 focus:opacity-100"
        >
          <svg
            className="w-6 h-6 text-gray-800 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
