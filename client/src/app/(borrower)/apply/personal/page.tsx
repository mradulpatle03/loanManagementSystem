"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  pan: z
    .string()
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN format (e.g. ABCDE1234F)",
    ),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  monthlySalary: z
    .number({ invalid_type_error: "Enter a valid salary" })
    .min(1, "Required"),
  employmentMode: z.enum(["salaried", "self-employed", "unemployed"], {
    errorMap: () => ({ message: "Select employment mode" }),
  }),
});

type FormData = z.infer<typeof schema>;

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [breError, setBreError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setBreError(null);
    try {
      await api.post("/borrower/personal-details", data);
      toast.success("Eligibility check passed!");
      router.push("/apply/documents");
    } catch (err: any) {
      const msg =
        err.response?.data?.reason ||
        err.response?.data?.message ||
        "Eligibility check failed";
      if (err.response?.status === 422) {
        setBreError(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["borrower"]}>
      <div className="bg-[#f6f8fc] py-10 px-4">
        <div className="max-w-lg mx-auto">
          {/* Step Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-gray-400">Step 1 of 3</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Details
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your details to check loan eligibility instantly
                </p>
              </div>
            </div>

            {/* Error */}
            {breError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">Not eligible</p>
                <p className="text-red-600 text-sm mt-1">{breError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  {...register("fullName")}
                  placeholder="As per PAN card"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 
            text-sm transition"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* PAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN number
                </label>
                <input
                  {...register("pan")}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 
            text-sm uppercase tracking-wider"
                  style={{ textTransform: "uppercase" }}
                />
                {errors.pan && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pan.message}
                  </p>
                )}
              </div>

              {/* DOB + Salary (Grouped for better layout) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of birth
                  </label>
                  <input
                    {...register("dateOfBirth")}
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly salary
                  </label>
                  <input
                    {...register("monthlySalary", { valueAsNumber: true })}
                    type="number"
                    placeholder="₹ 35,000"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                  {errors.monthlySalary && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.monthlySalary.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Employment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment type
                </label>
                <select
                  {...register("employmentMode")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white"
                >
                  <option value="">Select employment type</option>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="unemployed">Unemployed</option>
                </select>
                {errors.employmentMode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.employmentMode.message}
                  </p>
                )}
              </div>

              {/* Info Note */}
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                Your PAN and income details are used only for eligibility
                checks.
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 
          text-white font-medium py-2.5 rounded-lg text-sm 
          transition-all disabled:bg-blue-400"
              >
                {loading ? "Checking eligibility..." : "Check Eligibility →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
