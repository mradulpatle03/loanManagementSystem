'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AuthResponse } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/signup', data);
      login(res.data.user, res.data.token);
      toast.success('Account created! Let\'s check your eligibility.');
      router.push('/apply/personal');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb] p-4">

  <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">

    {/* LEFT SIDE (Onboarding Context) */}
    <div className="hidden md:flex flex-col justify-between bg-linear-to-br from-blue-900 to-blue-700 text-white p-10">
      
      <div>
        <h1 className="text-xl font-semibold tracking-wide">
          Loan Management System
        </h1>
      </div>

      <div>
        <h2 className="text-3xl font-semibold leading-snug">
          Start your loan
          <br /> journey today
        </h2>
        <p className="mt-4 text-blue-100 text-sm max-w-sm">
          Create your account to apply for loans, track approvals, and manage repayments seamlessly.
        </p>
      </div>

      <div className="text-xs text-blue-200">
        Fast Approval • Secure Data • Easy Tracking
      </div>
    </div>

    {/* RIGHT SIDE (Form) */}
    <div className="flex items-center justify-center px-6 py-10 md:p-12">
      
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Create account
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Apply for a loan in minutes
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Ravi Kumar"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 
              text-sm transition"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 
              text-sm transition"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="Create a strong password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 
              text-sm transition"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 
            text-white py-2.5 rounded-lg text-sm font-medium 
            transition shadow-sm hover:shadow-md disabled:bg-blue-400"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  </div>
</div>
  );
}