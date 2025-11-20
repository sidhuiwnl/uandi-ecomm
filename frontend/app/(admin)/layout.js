import { Inter } from "next/font/google";
import Sidebar, { SidebarProvider } from "@/components/Sidebar";
import AdminNavbar from "@/components/AdminNavbar";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <div
        className="min-h-screen flex w-full bg-white/40 backdrop-blur-3xl"
        style={{
          background: `
            radial-gradient(ellipse 500px 350px at 0% 0%, rgba(255, 40, 80, 0.35) 0%, rgba(255, 40, 80, 0.12) 10%, transparent 100%),
            radial-gradient(ellipse 500px 350px at 100% 0%, rgba(255, 60, 100, 0.35) 0%, rgba(255, 60, 100, 0.12) 10%, transparent 100%)
          `,
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Sidebar />

        {/* Right Content Section */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Navbar */}
          <div className="sticky top-0 z-30">
            <AdminNavbar />
          </div>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 py-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

