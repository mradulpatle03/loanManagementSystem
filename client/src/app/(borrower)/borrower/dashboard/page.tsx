"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import { Loan } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

const STATUS_STEPS = ["applied", "sanctioned", "disbursed", "closed"];

export default function BorrowerDashboard() {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get("/borrower/loan")
      .then((r) => setLoan(r.data.loan))
      .catch(() => setLoan(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard allowedRoles={["borrower"]}>
      <div className="max-w-2xl mx-auto py-10 px-4">

  {loading ? (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  ) : !loan ? (
    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center hover:shadow-md transition">
      <div className="text-5xl mb-4">📋</div>
      <h2 className="font-semibold text-gray-800 mb-2">
        No loan application yet
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Start your application in just a few steps
      </p>
      <button
        onClick={() => router.push("/apply/personal")}
        className="bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium 
        hover:bg-blue-800 hover:scale-[1.02] active:scale-[0.98] transition"
      >
        Start Application →
      </button>
    </div>
  ) : (
    <div className="space-y-5">

      {/* HERO CARD */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-600 text-white rounded-2xl p-6 shadow-md">
        <p className="text-sm opacity-80 mb-1">Total Repayment</p>
        <h1 className="text-2xl font-bold">
          {formatCurrency(loan.totalRepayment)}
        </h1>

        <div className="flex justify-between mt-4 text-sm opacity-90">
          <span>{formatCurrency(loan.amount)}</span>
          <span>{loan.tenureDays} days</span>
        </div>
      </div>

      {/* STATUS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">
            Application Status
          </h2>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(loan.status)}`}
          >
            {loan.status}
          </span>
        </div>

        {/* Progress */}
        <div className="relative">
          <div className="flex justify-between">
            {STATUS_STEPS.map((s, idx) => {
              const currentIdx = STATUS_STEPS.indexOf(loan.status);
              const done = currentIdx >= idx;

              return (
                <div key={s} className="flex flex-col items-center gap-1 group">
                  
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                    ${done 
                      ? "bg-blue-600 border-blue-600 text-white scale-105 shadow-md" 
                      : "bg-white border-gray-200 text-gray-400 group-hover:border-blue-400"}`}
                  >
                    {done ? "✓" : idx + 1}
                  </div>

                  <span
                    className={`text-xs capitalize font-medium transition
                    ${done ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Animated line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${(STATUS_STEPS.indexOf(loan.status) / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Principal", value: formatCurrency(loan.amount) },
          { label: "Tenure", value: `${loan.tenureDays} days` },
          { label: "Interest", value: formatCurrency(loan.simpleInterest) },
          { label: "Rate", value: `${loan.interestRate}% p.a.` },
          { label: "Applied On", value: formatDate(loan.createdAt) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:-translate-y-[2px] transition cursor-default"
          >
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="font-semibold text-gray-800 text-sm">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ACTION CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">

        <h2 className="font-semibold text-gray-900 mb-4">
          What’s next?
        </h2>

        <div className="rounded-xl p-4 transition-all duration-300 hover:shadow-sm">

          {loan.status === "applied" && (
            <div className="flex items-start gap-3">
              <span className="text-2xl animate-pulse">⏳</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Under review
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Our team is evaluating your application.
                </p>
              </div>
            </div>
          )}

          {loan.status === "sanctioned" && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-medium text-green-700 text-sm">
                  Loan approved
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Disbursement is being processed.
                </p>
              </div>
            </div>
          )}

          {loan.status === "disbursed" && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-medium text-purple-700 text-sm">
                  Amount disbursed
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Repayment due:{" "}
                  <strong>{formatCurrency(loan.totalRepayment)}</strong>
                </p>
              </div>
            </div>
          )}

          {loan.status === "closed" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    Loan closed
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    You’ve successfully repaid your loan.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/apply/personal")}
                className="self-start bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
              >
                Apply again →
              </button>
            </div>
          )}

          {loan.status === "rejected" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-medium text-red-700 text-sm">
                    Application rejected
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {loan.rejectionReason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/apply/personal")}
                className="self-start bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
              >
                Try again →
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  )}
</div>
    </AuthGuard>
  );
}
