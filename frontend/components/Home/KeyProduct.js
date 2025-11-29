import React from 'react';

const KeyProduct = () => {
  return (
    <>
    <div>
      <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 tracking-tight">
            “Our Little Swirl of Softness”
          </h2>
          </div>
    </div>
    <div className="relative bg-[#FFD3D5]   rounded-xl mt-32 md:mt-32 md:p-8 shadow-lg w-full max-w-6xl mx-auto min-h-[300px] flex flex-col md:flex-row">
      
      {/* Container for image with breakout effect */}
      <div className="w-full md:w-1/2 flex items-center justify-center relative mb-8 md:mb-0">
        <img
          src="/images/hero-body-butter.png"
          alt="Shearoots Body Butter"
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-56 sm:w-72 md:w-[450px] lg:w-[500px] object-cover rounded-xl drop-shadow-xl"
          style={{ zIndex: 2 }}
        />
        {/* Spacer to maintain flex height can be restored if needed */}
        <div className="w-full h-16 md:h-0" />
      </div>
      
      {/* Text Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-0 text-center md:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#D8234B] mb-4">Butter up your skin</h2>
        <p className="text-md sm:text-lg text-[#D8234B]">
           Our Shearoots body butter is crafted to keep your skin soft, deeply moisturized, and naturally glowing.Made with rich butters and nourishing oils, it melts into the skin to deliver long-lasting hydration without feeling greasy. Perfect for dry, dull, or tired skin that needs gentle daily care.
        </p>
      </div>
    </div>
    </>
    
  );
};

export default KeyProduct;
