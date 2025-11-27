import React from 'react';
// 💡 Lucide Icons for social media
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

// Data for easy maintenance
const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'All Products', href: '/products' },
  { name: 'Currate Your Routine', href: '/currate-your-routine' },
  { name: 'About', href: '/about' },
  { name: 'AI Skincare', href: '/ai-skincare' },
  { name: 'Blogs', href: '/blogs' },
];

const aboutUsLinks = [
  { name: 'Terms & Conditions', href: '/terms-and-conditions' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Refund Policy', href: '/refund-policy' },
  {name: 'Shipping Policy', href: '/shipping-policy' },
  { name: 'Contact Us', href: '/contact-us' },
];

const customerServicesLinks = [
  { name: 'New Launches', href: '/collections/1' },
  { name: 'Kids', href: '/collections/2' },
  { name: 'Teens', href: '/collections/3' },
  { name: 'Adults', href: '/collections/4' },
  { name: 'Treatments', href: '/collections/5' },
];

// Helper component for column links
const FooterLinkColumn = ({ title, links }) => (
  <div className="flex flex-col space-y-2">
    {/* Text-xl for the title, matching the original image's look */}
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    {links.map((link) => (
      <a 
        key={link.name} 
        href={link.href} 
        className="text-white hover:text-gray-300 transition duration-150 text-sm" // Added text-sm for better match
      >
        {link.name}
      </a>
    ))}
  </div>
);

const Footer = () => {
  // Common styling for the social icon wrappers
  const socialIconStyle = "p-2 border border-white rounded-full hover:bg-white hover:text-pink-600 transition duration-150";

  return (
    <footer className="w-full">
      {/* --- Top Red Section --- */}
      {/* Using pink-600 (or adjust to a custom color like #f72c69) for the background */}
      <div className="bg-[#d8234b]/90 text-white py-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          {/*
            Key: grid-cols-4 for equal width on md and larger screens.
            We use flex-grow or basic grid setup to ensure even distribution.
          */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Section 1: Logo & Description */}
            <div className="flex flex-col space-y-4">
              {/* Custom style for the logo text - ensure your logo image/SVG replaces this in production */}
              <Image
                src="/images/logo-white.png"
                alt="U&I Naturals Logo"
                width={150}
                height={50}
                className="object-contain"
              />
              
              <p className="text-sm leading-relaxed max-w-xs">
                U&I Naturals is dedicated to providing natural and effective skincare solutions that nurture your skin and soul.
              </p>

              {/* Social Icons */}
              <div className="flex space-x-4 pt-2">
                <a href="#" className={socialIconStyle} aria-label="Facebook">
                  <FaFacebookF size={18} /> 
                </a>
                <a href="#" className={socialIconStyle} aria-label="Instagram">
                  <FaInstagram size={18} />
                </a>
                <a href="#" className={socialIconStyle} aria-label="Twitter">
                  <FaTwitter size={18} />
                </a>
                <a href="#" className={socialIconStyle} aria-label="LinkedIn">
                  <FaLinkedinIn size={18} />
                </a>
              </div>
            </div>
            
            {/* Section 2: Quick Links */}
            <FooterLinkColumn title="Quick Link" links={quickLinks} />

            {/* Section 3: About Us */}
            <FooterLinkColumn title="Information" links={aboutUsLinks} />

            {/* Section 4: Customer Services */}
            <FooterLinkColumn title="Collections" links={customerServicesLinks} />
          </div>
        </div>
      </div>

      {/* --- Bottom Black Section --- */}
      <div className="bg-black text-gray-400 py-4 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          
          {/* Copyright */}
          <p className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} U&I Naturals. All rights reserved.
          </p>
        
          
          {/* Scroll to Top */}
          <p>
            Powered by <Link href="https://www.pixelatedworks.com" target="_blank" className="hover:text-white font-semibold transition duration-150">Pixelated</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;