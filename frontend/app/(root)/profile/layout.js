"use client";
import Sidebar from "@/components/UserProfile/UserSidebar";

export default function ProfileLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-8">
      <div className="flex bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-6xl">
        <Sidebar />
        <main className="flex-1 p-3 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
