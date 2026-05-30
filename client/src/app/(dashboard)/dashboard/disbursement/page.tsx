"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loan, User } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import AuthGuard from "@/components/AuthGuard";

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/disbursement/loans");
      setLoans(res.data.loans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDisburse = async (id: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/disbursement/loans/${id}/disburse`);
      toast.success("Loan disbursed!");
      setConfirmId(null);
      fetchLoans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to disburse");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["disbursement", "admin"]}>
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Disbursement Module
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sanctioned loans ready for disbursement
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : loans.length === 0 ? (
            <EmptyState
              message="No sanctioned loans pending disbursement"
              icon="💸"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* Head */}
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    {[
                      "Borrower",
                      "Loan Amount",
                      "Total Repayment",
                      "Sanctioned By",
                      "Sanctioned Date",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-gray-100">
                  {loans.map((loan) => {
                    const borrower = loan.borrowerId as User;
                    const sanctioner = loan.sanctionedBy as User;

                    return (
                      <tr
                        key={loan._id}
                        className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300"
                      >
                        {/* Borrower */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                            {borrower?.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {borrower?.email}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 font-medium text-gray-800">
                          {formatCurrency(loan.amount)}
                        </td>

                        {/* Repayment */}
                        <td className="px-5 py-4 font-medium text-green-600">
                          {formatCurrency(loan.totalRepayment)}
                        </td>

                        {/* Sanctioned By */}
                        <td className="px-5 py-4 text-gray-600">
                          {sanctioner?.name ?? "—"}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-gray-500">
                          {loan.sanctionedAt
                            ? formatDate(loan.sanctionedAt)
                            : "—"}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setConfirmId(loan._id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs rounded-lg shadow-sm hover:shadow-md transition-all"
                          >
                            Disburse
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirm Modal */}
        {confirmId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-scaleIn">
              <div className="text-5xl mb-4">💸</div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Confirm Disbursement
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                This action cannot be undone. Funds will be marked as disbursed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDisburse(confirmId)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm hover:shadow-md transition disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
