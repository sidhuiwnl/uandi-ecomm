"use client";
import UserSidebar from "@/components/UserProfile/UserSidebar";

export default function ProfileLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center  md:p-8">
      <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-6xl">
        <UserSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
