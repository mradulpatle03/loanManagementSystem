"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types";

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export default function AuthGuard({ children, allowedRoles }: Props) {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace("/login");
    }
  }, [token, user, allowedRoles, router]);

  if (!token || !user || !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
