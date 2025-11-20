"use client";

import { useState, createContext, useContext, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Box,
  ShoppingBag,
  Users,
  CreditCard,
  Tag,
  FileText,
  Shield,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  Package,
  List,
  Grid,
  Layers,
  Folder
} from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchCollections } from "@/store/collectionsSlice";

// Sidebar Context
const SidebarContext = createContext({
  isOpen: false,
  isCollapsed: false,
  toggleSidebar: () => {},
  toggleCollapse: () => {},
  closeSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
      return newState;
    });
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        toggleSidebar,
        toggleCollapse,
        closeSidebar,
        isMounted,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// Menu Item Component
function MenuItem({ item, isCollapsed, closeSidebar }) {
  const pathname = usePathname();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = pathname.startsWith(item.href);
  const isAnySubItemActive =
    hasSubItems && item.subItems.some((sub) => pathname.startsWith(sub.href));

  useEffect(() => {
    if (isAnySubItemActive) {
      setIsSubmenuOpen(true);
    }
  }, [isAnySubItemActive]);

  const toggleSubmenu = (e) => {
    e.preventDefault();
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  // Parent Menu with Sub-items
  if (hasSubItems) {
    return (
      <div>
        <div
          className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
            isActive || isAnySubItemActive
              ? "bg-rose-400/20 backdrop-blur-3xl text-rose-600 shadow-gray-900/50"
              : "text-gray-700 hover:bg-rose-400/20 hover:text-rose-600"
          }`}
          onClick={toggleSubmenu}
          title={isCollapsed ? item.name : ""}
        >
          <div className="flex items-center gap-3 flex-1">
            <item.icon
              size={19}
              className={`flex-shrink-0 transition-transform duration-200 ${
                isActive || isAnySubItemActive
                  ? "scale-110 text-rose-600"
                  : "group-hover:scale-105"
              }`}
            />
            <span
              className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
              }`}
            >
              {item.name}
            </span>
          </div>

          {hasSubItems && (
            <ChevronDown
              size={16}
              className={`flex-shrink-0 transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
              } ${isSubmenuOpen ? "rotate-180" : ""}`}
            />
          )}

          {(isActive || isAnySubItemActive) && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full" />
          )}
        </div>

        {/* Submenu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isSubmenuOpen && !isCollapsed
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-4">
            {item.subItems.map((subItem) => {
              const isSubActive = pathname.startsWith(subItem.href);
              return (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  onClick={closeSidebar}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                    isSubActive
                      ? "bg-rose-400/20 text-rose-600"
                      : "text-gray-700 hover:bg-rose-400/20 hover:text-rose-600"
                  }`}
                >
                  <subItem.icon
                    size={16}
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isSubActive
                        ? "scale-110 text-rose-600"
                        : "group-hover:scale-105"
                    }`}
                  />
                  <span className="font-medium text-sm">{subItem.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Collapsed State - Show submenu on hover */}
        {isCollapsed && (
          <div className="hidden lg:block absolute left-full top-0 ml-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
            <div className="bg-white rounded-lg shadow-2xl border border-rose-200 py-2 min-w-[180px]">
              <div className="px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">
                {item.name}
              </div>
              {item.subItems.map((subItem) => {
                const isSubActive = pathname.startsWith(subItem.href);
                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                      isSubActive
                        ? "bg-rose-100 text-rose-600"
                        : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <subItem.icon size={16} className="flex-shrink-0" />
                    <span className="text-sm">{subItem.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular Menu Item
  return (
    <Link
      href={item.href}
      onClick={closeSidebar}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
        isActive
          ? "bg-rose-400/20 backdrop-blur-3xl text-rose-600 shadow-gray-900/50"
          : "text-gray-700 hover:bg-rose-400/20 hover:text-rose-600"
      }`}
      title={isCollapsed ? item.name : ""}
    >
      <item.icon
        size={20}
        className={`flex-shrink-0 transition-transform duration-200 ${
          isActive ? "scale-110 text-rose-600" : "group-hover:scale-105"
        }`}
      />
      <span
        className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
        }`}
      >
        {item.name}
      </span>

      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full" />
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="hidden lg:block absolute left-full ml-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 z-50 shadow-lg">
          {item.name}
        </div>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapse, closeSidebar, isMounted } =
    useSidebar();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items: collections } = useSelector((state) => state.collections);

  console.log("collections", collections);

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  const base = user?.role ? `/${user.role}` : "";

  const navItems = [
    { name: "Dashboard", icon: Home, href: `${base}/dashboard` },

    {
      name: "Products",
      icon: Box,
      href: `${base}/console/product-management`,
      subItems: [
        { name: "All Products", icon: List, href: `${base}/console/product-management/all-products` },
        { name: "Add Product", icon: Package, href: `${base}/console/product-management/add-product` },
        { name: "Categories", icon: Grid, href: `${base}/console/product-management/categories` },
      ],
    },

    {
      name: "Orders",
      icon: ShoppingBag,
      href: `${base}/console/order-management`,
      subItems: [
        { name: "All Orders", icon: List, href: `${base}/console/order-management/all` },
        { name: "Pending Orders", icon: Package, href: `${base}/console/order-management/pending` },
      ],
    },

    // ⭐ DYNAMIC COLLECTIONS MENU (kept from new sidebar)
    {
      name: "Collections",
      icon: Layers,
      href: `${base}/console/collection-management/collections`,
      subItems: [
        ...(collections?.length > 0
          ? collections.map((col) => ({
              name: col.collection_name,
              icon: Folder,
              href: `${base}/console/collection-management/collections/${col.collection_id}`,
            }))
          : []),
      ],
    },

    // ✅ Routes from OLD sidebar
    { name: "Customers", icon: Users, href: `${base}/console/customer-management` },
    { name: "Payments", icon: CreditCard, href: `${base}/payments` },
    { name: "Promotions", icon: Tag, href: `${base}/promotions` ,
    subItems: [
        { name: "Coupons", icon: List, href: `${base}/offers/coupons` },
        { name: "Discounts", icon: Package, href: `${base}/offers/discounts` },
      ]
  
  },

    {
      name: "Content",
      icon: FileText,
      href: `${base}/content`,
      subItems: [
        { name: "Blogs", icon: List, href: `${base}/console/content-management/blogs` },
        { name: "Testimonials", icon: Package, href: `${base}/console/content-management/testimonials` },
        { name: "Reels", icon: Package, href: `${base}/console/content-management/reels` },
        { name: "FAQ", icon: Package, href: `${base}/console/content-management/faq` },
        // Privacy Policy was commented out in old sidebar, keeping it commented
        // { name: "Privacy Policy", icon: Package, href: `${base}/console/content-management/privacy-policy` },
      ],
    },

    { name: "Security Roles", icon: Shield, href: `${base}/system/security-roles` },
  ];

  return (
    <>
      {/* Mobile Hamburger Button - from OLD sidebar structure */}
      <button
        onClick={toggleSidebar}
        className={`lg:hidden fixed top-4 right-4 z-60 p-2.5 bg-gray-950 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 active:scale-95 ${
          isOpen ? "translate-x-0" : "translate-x-0"
        }`}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
      </button>

      {/* Sidebar - using OLD header structure with NEW styling */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-70 h-screen 
        bg-white/20 backdrop-blur-2xl text-black border-r border-pink-200
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        ${isMounted && isCollapsed ? "lg:w-16" : "lg:w-64"} 
        w-64 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none`}
      >
        <div className="flex flex-col h-full">
          {/* Header - EXACTLY from OLD sidebar */}
          <div className="flex items-center justify-between p-3 min-h-[75px]">
            <div
              className={`flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Brand Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-bold text-neutral-800 -my-1">U&I Naturals</p>
                <p className="text-sm text-neutral-600 -my-0.5">Admin Panel</p>
              </div>
            </div>

            <button
              onClick={toggleCollapse}
              className="hidden lg:block p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 active:scale-95"
              aria-label="Toggle sidebar"
              title="Toggle sidebar (Ctrl+B)"
            >
              {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
            {navItems.map((item) => (
              <MenuItem
                key={item.name}
                item={item}
                isCollapsed={isCollapsed}
                closeSidebar={closeSidebar}
              />
            ))}
          </nav>

          {/* Footer - from OLD sidebar */}
          <div className=" p-4">
            <div
              className={`flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
              }`}
            >
              <p className="text-xs text-gray-500">Powered by <Link href="https://thepixelatedcafe.com" target="_blank" rel="noopener noreferrer"><span className="font-semibold">Pixelated</span></Link></p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
