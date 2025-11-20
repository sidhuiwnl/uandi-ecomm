"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  MapPin,
  ShoppingBag,
  ListChecks,
  Eye,
  Key,
  LogOut,
} from "lucide-react";

export default function UserSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: <User size={18} />, label: "My Profile", path: "/profile" },
    { icon: <MapPin size={18} />, label: "Delivery Address", path: "/profile/address" },
    { icon: <ShoppingBag size={18} />, label: "Order History", path: "/profile/orders" },
    { icon: <ListChecks size={18} />, label: "My Top Products", path: "/profile/products" },
    { icon: <Eye size={18} />, label: "Recently Viewed", path: "/profile/viewed" },
    { icon: <Key size={18} />, label: "Change Password", path: "/profile/password" },
  ];

  return (
    <aside className="w-72 bg-[#f9fafb] border-r border-gray-200 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-300" />
        <div className="ml-3">
          <p className="text-gray-800 font-medium text-sm">Good Evening 👋</p>
          <p className="text-gray-500 text-xs">08:00:21 PM</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col space-y-3 text-gray-700 font-medium">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              pathname === item.path
                ? "bg-green-100 text-green-700 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <button className="flex items-center gap-3 px-3 py-2 mt-auto text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg text-sm">
        <LogOut size={18} /> Log Out
      </button>
    </aside>
  );
}
