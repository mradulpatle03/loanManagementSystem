"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AuthGuard from "@/components/AuthGuard";
import { Role } from "@/types";

const NAV_ITEMS = [
  {
    label: "Sales",
    path: "/dashboard/sales",
    roles: ["sales", "admin"],
    icon: "",
  },
  {
    label: "Sanction",
    path: "/dashboard/sanction",
    roles: ["sanction", "admin"],
    icon: "",
  },
  {
    label: "Disbursement",
    path: "/dashboard/disbursement",
    roles: ["disbursement", "admin"],
    icon: "",
  },
  {
    label: "Collection",
    path: "/dashboard/collection",
    roles: ["collection", "admin"],
    icon: "",
  },
];

const DASHBOARD_ROLES: Role[] = [
  "admin",
  "sales",
  "sanction",
  "disbursement",
  "collection",
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  sales: "bg-blue-100 text-blue-700",
  sanction: "bg-green-100 text-green-700",
  disbursement: "bg-orange-100 text-orange-700",
  collection: "bg-teal-100 text-teal-700",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const visibleNav = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <AuthGuard allowedRoles={DASHBOARD_ROLES}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-5 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">L</span>
              </div>

              <span className="font-semibold text-gray-900 hidden sm:block tracking-tight">
                LMS Dashboard
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* User */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-800">
                {user?.name}
              </span>
              <span className="text-xs text-gray-400">{user?.email}</span>
            </div>

            {/* Role */}
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full capitalize shadow-sm ${
                ROLE_COLORS[user?.role ?? ""] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {user?.role}
            </span>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-semibold shadow">
              {user?.name?.charAt(0)}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-1 relative">
          {/* Overlay */}
          {menuOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
        bg-white/80 backdrop-blur-xl border-r border-gray-200 w-64 shrink-0 py-5 px-3
        md:flex md:flex-col
        ${
          menuOpen
            ? "flex flex-col fixed left-0 top-[64px] bottom-0 z-30 shadow-2xl"
            : "hidden"
        }
      `}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-4">
              Modules
            </p>

            <nav className="space-y-1">
              {visibleNav.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setMenuOpen(false);
                    }}
                    className={`group w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 relative
                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                  >
                    {/* Icon */}
                    <span
                      className={`text-base transition ${
                        isActive
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {item.label}

                    {/* Active Indicator */}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-6 rounded-full bg-indigo-600" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="mt-auto pt-4 border-t border-gray-100 px-3">
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 overflow-auto min-w-0">
            <div className="max-w-[1400px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
