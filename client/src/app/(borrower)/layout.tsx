"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const STEPS = [
  { label: "Eligibility", path: "/apply/personal", icon: "", step: 1 },
  { label: "Documents", path: "/apply/documents", icon: "", step: 2 },
  { label: "Loan Config", path: "/apply/loan", icon: "", step: 3 },
  { label: "My Dashboard", path: "/borrower/dashboard", icon: "", step: 4 },
];

export default function BorrowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loanStatus, setLoanStatus] = useState<string | null>(null);
  const [breStatus, setBreStatus] = useState<boolean>(false);
  const [hasSalarySlip, setHasSalarySlip] = useState<boolean>(false);

  useEffect(() => {
    // fetch user profile to get BRE + salary slip status
    api
      .get("/auth/me")
      .then((r) => {
        setBreStatus(r.data.user.isBrePassed ?? false);
        setHasSalarySlip(!!r.data.user.salarySlipUrl);
      })
      .catch(() => {});

    // fetch loan status
    api
      .get("/borrower/loan")
      .then((r) => {
        setLoanStatus(r.data.loan?.status ?? null);
      })
      .catch(() => setLoanStatus(null));
  }, [pathname]); // re-check on every page change

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Determine which steps are accessible
  const isAccessible = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return breStatus;
    if (step === 3) return breStatus && hasSalarySlip;
    if (step === 4) return !!loanStatus;
    return false;
  };

  const getStepStatus = (step: number) => {
    if (step === 1 && breStatus) return "done";
    if (step === 2 && hasSalarySlip) return "done";
    if (step === 3 && loanStatus) return "done";
    if (step === 4 && loanStatus === "closed") return "done";
    if (pathname === STEPS[step - 1].path) return "active";
    return isAccessible(step) ? "available" : "locked";
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col">

  {/* HEADER */}
  <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between sticky top-0 z-20">

    {/* LEFT */}
    <div className="flex items-center gap-4">
      <button
        className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-500 transition"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#635bff] rounded-md flex items-center justify-center">
          <span className="text-white text-sm font-semibold">L</span>
        </div>
        <span className="text-[15px] font-semibold text-gray-900">
          LMS
        </span>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-4">

      <span className="hidden sm:block text-sm text-gray-600">
        {user?.name}
      </span>

      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
        Borrower
      </span>

      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-red-600 transition"
      >
        Logout
      </button>
    </div>
  </header>

  <div className="flex flex-1">

    {/* MOBILE OVERLAY */}
    {menuOpen && (
      <div
        className="fixed inset-0 bg-black/20 z-10 md:hidden"
        onClick={() => setMenuOpen(false)}
      />
    )}

    {/* SIDEBAR */}
    <aside
      className={`
      bg-white border-r border-gray-200 w-64 shrink-0 py-6 px-3 flex flex-col
      md:flex
      ${menuOpen ? "flex fixed left-0 top-14 bottom-0 z-20" : "hidden"}
    `}
    >
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-4">
        Application
      </p>

      <nav className="space-y-1 flex-1">
        {STEPS.map((item) => {
          const status = getStepStatus(item.step);
          const accessible = isAccessible(item.step);

          return (
            <button
              key={item.path}
              onClick={() => {
                if (!accessible) return;
                router.push(item.path);
                setMenuOpen(false);
              }}
              disabled={!accessible}
              className={`
              group w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition
              
              ${status === "active" ? "bg-[#f1f3ff] text-[#635bff]" : ""}
              ${status === "done" ? "text-gray-700 hover:bg-gray-50" : ""}
              ${status === "available" ? "text-gray-500 hover:bg-gray-50" : ""}
              ${status === "locked" ? "text-gray-300 cursor-not-allowed" : ""}
            `}
            >
              {/* ICON */}
              <span className="w-5 text-center text-sm">
                {item.icon}
              </span>

              {/* LABEL */}
              <span className="flex-1">{item.label}</span>

              {/* STATUS */}
              {status === "done" && (
                <span className="text-green-500 text-xs">✓</span>
              )}

              {status === "active" && (
                <span className="w-1 h-1 rounded-full bg-[#635bff]" />
              )}

              {status === "locked" && (
                <span className="text-xs">🔒</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* LOAN STATUS */}
      {loanStatus && (
        <div className="mt-4 mx-3 p-3 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Loan status</p>
          <div
            className={`
            text-xs font-medium px-2 py-1 rounded-full w-fit
            ${loanStatus === "applied" ? "bg-blue-100 text-blue-700" : ""}
            ${loanStatus === "sanctioned" ? "bg-green-100 text-green-700" : ""}
            ${loanStatus === "disbursed" ? "bg-purple-100 text-purple-700" : ""}
            ${loanStatus === "closed" ? "bg-gray-200 text-gray-600" : ""}
            ${loanStatus === "rejected" ? "bg-red-100 text-red-700" : ""}
          `}
          >
            {loanStatus}
          </div>
        </div>
      )}

      {/* USER EMAIL */}
      <div className="mt-4 pt-3 border-t border-gray-100 px-3">
        <p className="text-xs text-gray-400 truncate">
          {user?.email}
        </p>
      </div>
    </aside>

    {/* MAIN */}
    <main className="flex-1 overflow-auto min-w-0">
      
      {/* CONTENT WRAPPER */}
      <div className="max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </div>

    </main>
  </div>
</div>
  );
}
