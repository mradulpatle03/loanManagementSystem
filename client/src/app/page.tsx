"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Runs client-side only — localStorage is available here
    const raw = localStorage.getItem("auth-storage");
    try {
      if (raw) {
        const parsed = JSON.parse(raw);
        const user = parsed?.state?.user;
        const token = parsed?.state?.token;
        if (token && user) {
          const roleMap: Record<string, string> = {
            borrower: "/borrower/dashboard",
            sales: "/dashboard/sales",
            sanction: "/dashboard/sanction",
            disbursement: "/dashboard/disbursement",
            collection: "/dashboard/collection",
            admin: "/dashboard/sales",
          };
          router.replace(roleMap[user.role] ?? "/login");
          return;
        }
      }
    } catch {
      // malformed
    }
    router.replace("/login");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );
}
