'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types';
import Spinner from './ui/Spinner';

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

type AuthStatus = 'loading' | 'authorized' | 'unauthorized';

export default function AuthGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    // Directly read from persisted storage first
    const raw = localStorage.getItem('auth-storage');
    let user = null;
    let token = null;

    try {
      if (raw) {
        const parsed = JSON.parse(raw);
        user = parsed?.state?.user ?? null;
        token = parsed?.state?.token ?? null;
      }
    } catch {
      // malformed storage
    }

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace('/login');
      return;
    }

    // Also sync into the Zustand store in case it hasn't hydrated yet
    useAuthStore.setState({ user, token, _hasHydrated: true });
    setStatus('authorized');
  }, []);

  if (status !== 'authorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}