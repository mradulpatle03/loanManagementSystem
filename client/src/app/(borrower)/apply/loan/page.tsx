"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { formatCurrency } from "@/lib/utils";

const RATE = 12;

function calcSI(principal: number, days: number) {
  const si = (principal * RATE * days) / (365 * 100);
  return parseFloat(si.toFixed(2));
}

export default function LoanPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(180);
  const [loading, setLoading] = useState(false);

  const si = calcSI(amount, tenure);
  const total = parseFloat((amount + si).toFixed(2));

  const handleApply = async () => {
    setLoading(true);
    try {
      await api.post("/borrower/apply", { amount, tenureDays: tenure });
      toast.success("Loan application submitted!");
      router.push("/borrower/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["borrower"]}>
      <div className="bg-[#f6f8fc] py-10 px-4">
        <div className="max-w-lg mx-auto">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Back
            </button>
            <span className="text-xs text-gray-400">Step 3 of 3</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Configure Your Loan
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Adjust values to see real-time repayment details
              </p>
            </div>

            {/* Loan Amount */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Loan Amount
                </label>
                <span className="text-blue-700 font-semibold text-sm">
                  {formatCurrency(amount)}
                </span>
              </div>

              <input
                type="range"
                min={50000}
                max={500000}
                step={10000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-blue-700"
              />

              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹50K</span>
                <span>₹5L</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Tenure
                </label>
                <span className="text-blue-700 font-semibold text-sm">
                  {tenure} days
                </span>
              </div>

              <input
                type="range"
                min={30}
                max={365}
                step={1}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-blue-700"
              />

              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>30d</span>
                <span>365d</span>
              </div>
            </div>

            {/* Highlight Result */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
              <p className="text-xs text-blue-700 mb-1">Total Repayment</p>
              <p className="text-xl font-bold text-blue-800">
                {formatCurrency(total)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 border border-gray-200">
              {[
                { label: "Principal", value: formatCurrency(amount) },
                { label: "Interest Rate", value: `${RATE}% p.a.` },
                { label: "Tenure", value: `${tenure} days` },
                { label: "Interest", value: formatCurrency(si) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleApply}
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 
        text-white font-semibold py-3 rounded-lg 
        transition-all disabled:bg-blue-400"
            >
              {loading ? "Submitting..." : "Apply for Loan →"}
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
