"use client";

import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { verifyUser, logout, refreshToken } from "@/store/authSlice";


export default function AdminNavbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [roleText, setRoleText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Ref for the **entire** profile area (button + dropdown)
  const dropdownRef = useRef(null);

  /* ────────────────────── Role text ────────────────────── */
  useEffect(() => {
    if (!user?.role) return;
    if (user.role === "superadmin") setRoleText("Test Admin");
    else if (user.role === "admin") setRoleText("Admin");
    else setRoleText("Moderator");
  }, [user]);

  /* ────────────────────── Auth verification ────────────────────── */
  useEffect(() => {
  // Don't verify if we're logging out
  if (!isAuthenticated && !loading && !isLoggingOut) {
    dispatch(verifyUser())
      .unwrap()
      .catch((error) => {
        console.error("Verify user error on dashboard:", error);
        if (error === "Invalid access token") {
          dispatch(refreshToken())
            .unwrap()
            .then(() => dispatch(verifyUser()))
            .catch(() => router.push("/login"));
        } else {
          router.push("/login");
        }
      });
  }
}, [dispatch, isAuthenticated, loading, router, isLoggingOut]);

  /* ────────────────────── Close dropdown on outside click ────────────────────── */
  // useEffect(() => {
  //   const handleOutside = (e) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
  //       setDropdownOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleOutside);
  //   return () => document.removeEventListener("mousedown", handleOutside);
  // }, []);

  /* ────────────────────── Handlers ────────────────────── */
  const toggleDropdown = (e) => {
    e.stopPropagation();               // prevent the outside-click handler
    setDropdownOpen((prev) => !prev);
  };

  const handleViewProfile = (e) => {
    e.stopPropagation();
    router.push("/profile");
    setDropdownOpen(false);
  };

  // FIXED: Wait for logout to complete
 const handleLogout = (e) => {
  e.stopPropagation();
  setDropdownOpen(false);
  setIsLoggingOut(true); // Set flag before logout

  dispatch(logout())
    .unwrap()
    .then(() => {
      router.push("/");
    })
    .catch(() => {
      router.push("/");
    });
};

  const avatarUrl = user?.profile_picture_url || "/emma3.jpg";


  return (
    <>
      {/* ───── Desktop & Tablet ───── */}
      <nav className="hidden md:flex w-full border-b  border-pink-100 items-center min-h-[75px] justify-between px-6 bg-white-200/20 backdrop-blur-3xl">
        {/* Left */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
          </div>

          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#d8234b]/30 text-gray-800 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>

          {/* Profile wrapper – ref covers button + menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1.5 hover:bg-gray-50/50 rounded-lg p-1 transition"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden">
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40px, 40px"
              />
            </div>

              <div className="flex flex-col">
                <p className="font-medium capitalize text-left text-neutral-800 -my-1">
                  {user?.first_name || "User"}
                </p>
                <p className="font-normal text-xs text-left text-neutral-600">{roleText}</p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-neutral-600 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                onClick={(e) => e.stopPropagation()}   // keep menu open when clicking inside
              >
                <button
                  onClick={handleViewProfile}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                <hr className="mx-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ───── Mobile ───── */}
      <nav className="md:hidden w-full flex border-b border-rose-400/50 items-center min-h-[75px] justify-between px-4 bg-white-200/20 backdrop-blur-3xl sticky top-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button className="p-2">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>

          {/* Search – icon to expand */}
          <div className="relative">
            {searchExpanded ? (
              <div className="absolute right-0 top-0 w-[calc(100vw-6rem)] flex items-center">
                <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  autoFocus
                  className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#d8234b]/30 text-gray-800 placeholder:text-gray-500"
                />
                <button
                  onClick={() => setSearchExpanded(false)}
                  className="absolute right-2 top-2"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchExpanded(true)} className="p-2">
                <Search className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>

          {/* Mobile profile – same ref logic */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="flex items-center gap-1.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 40px, 40px"
                />
              </div>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="font-medium text-lg text-neutral-800 -my-1">
                    {user?.first_name || "User"}
                  </p>
                  <p className="font-normal text-sm text-neutral-600 -my-0.5">{roleText}</p>
                </div>
                <button
                  onClick={handleViewProfile}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                <hr className="mx-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Hamburger placeholder */}
          <button className="p-2">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>
    </>
  );
}