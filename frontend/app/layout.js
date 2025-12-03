import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import Navbar from "@/components/Navbar";
import CartModal from "@/components/CartModal";
import WishlistModal from "@/components/WishlistModal";

// Load fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata = {
  title: 'U&I Naturals',
  icons: {
    icon: '/favicon.svg', // your SVG favicon path
    // shortcut: '/favicon.ico',
    // apple: '/apple-touch-icon.png',
  },
};


// Root Layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white text-gray-900`}
      >
        <ReduxProvider>
          {/* <Navbar /> */}
          <main>{children}</main>
          <CartModal />
          <WishlistModal />
        </ReduxProvider>
      </body>
    </html>
  );
}
