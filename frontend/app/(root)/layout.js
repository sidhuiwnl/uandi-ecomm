'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "@/store/slices/cartSlice";
import { Car } from "lucide-react";
import CartModal from "@/components/CartModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function CartInitializer() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  return null;
}

export default function Layout({ children }) {
  return (
    <>
      <CartInitializer />
      <div
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-[#FCFBF5] text-gray-900`}
      >
        <Navbar />
        <main>{children}</main>
        <CartModal />
      </div>
    </>
    
  );
}
