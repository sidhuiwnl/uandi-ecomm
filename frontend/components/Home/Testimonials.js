'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      text:
        'U&I Naturals has turned my nightly routine into a little handmade ritual. The body butter melts in like whipped cream, and my skin actually stays soft until morning.',
      author: 'Radha J.',
      role: 'Verified customer'
    },
    {
      id: 2,
      text:
        'You can feel the difference in the textures and the gentle scents. Knowing everything is crafted in small batches makes each jar feel special, not generic.',
      author: 'Kumar C.',
      role: 'Verified customer'
    },
    {
      id: 3,
      text:
        'My skin is reactive to almost everything, but your unscented butter has been a quiet miracle. No sting, no redness—just calm, nourished skin that finally feels comfortable.',
      author: 'Lavanya R.',
      role: 'Verified customer'
    }
  ];

  // Auto Slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () =>
    setCurrentSlide(prev => (prev + 1) % testimonials.length);

  const prevSlide = () =>
    setCurrentSlide(prev => (prev - 1 + testimonials.length) % testimonials.length);

  const goToSlide = (i) => setCurrentSlide(i);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 tracking-tight">
            Loved by real skin
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Handwritten words from people who’ve welcomed U&amp;I Naturals into their everyday rituals.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center relative">
            {/* Prev Button: hidden on mobile */}
            <button
              onClick={prevSlide}
              className="hidden md:flex absolute left-0 md:-left-16 z-10 p-3 rounded-full text-[#D8234B] hover:text-[#a4193e] hover:bg-[#FFD3D5]/60 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-9 h-9" strokeWidth={3} />
            </button>

            {/* Card */}
            <div className="w-full px-4 md:px-10">
              <div
                key={currentSlide}
                style={{ minHeight: '240px' }} // fixed height for all cards
                className="bg-gradient-to-br from-[#D8234B] to-[#FFD3D5] rounded-3xl p-8 md:p-12 text-white shadow-lg relative transition-all duration-500 ease-out animate-fade-slide flex flex-col justify-center"
              >
                <div className="absolute top-4 left-4 text-white/30 text-7xl leading-none font-serif select-none pointer-events-none">
                  "
                </div>

                <p className="text-lg md:text-xl lg:text-2xl text-center leading-relaxed relative z-10">
                  {testimonials[currentSlide].text}
                </p>

                {/* Speech Pointer */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[30px] border-t-[#D8234B]" />
                </div>
              </div>

              {/* Author */}
              <div className="flex flex-col items-center justify-center mt-10">
                <h4 className="text-xl md:text-2xl font-semibold text-[#D8234B]">
                  {testimonials[currentSlide].author}
                </h4>
                <p className="text-sm md:text-base text-[#D8234B]/70 mt-1 tracking-wide uppercase">
                  {testimonials[currentSlide].role}
                </p>
              </div>
            </div>

            {/* Next Button: hidden on mobile */}
            <button
              onClick={nextSlide}
              className="hidden md:flex absolute right-0 md:-right-16 z-10 p-3 rounded-full text-[#D8234B] hover:text-[#a4193e] hover:bg-[#FFD3D5]/60 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-9 h-9" strokeWidth={3} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-[#D8234B] w-8 h-3'
                    : 'bg-[#FFD3D5]/70 hover:bg-[#FFD3D5]/90 w-3 h-3'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
