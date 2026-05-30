"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loan, User } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import AuthGuard from "@/components/AuthGuard";

type Tab = "applied" | "sanctioned" | "rejected";

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [tab, setTab] = useState<Tab>("applied");
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    loanId: string;
  }>({ open: false, loanId: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoans = async (status: Tab) => {
    setLoading(true);
    try {
      const res = await api.get(`/sanction/loans?status=${status}`);
      setLoans(res.data.loans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(tab);
  }, [tab]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/sanction/loans/${id}/approve`);
      toast.success("Loan approved!");
      fetchLoans(tab);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/sanction/loans/${rejectModal.loanId}/reject`, {
        reason: rejectReason,
      });
      toast.success("Loan rejected");
      setRejectModal({ open: false, loanId: "" });
      setRejectReason("");
      fetchLoans(tab);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const TABS: Tab[] = ["applied", "sanctioned", "rejected"];

  return (
    <AuthGuard allowedRoles={["sanction", "admin"]}>
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Sanction Module
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and action loan applications
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100/80 backdrop-blur p-1 rounded-xl w-fit mb-6 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all
        ${
          tab === t
            ? "bg-white shadow text-indigo-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : loans.length === 0 ? (
            <EmptyState message={`No ${tab} loans found`} icon="🏦" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* Head */}
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    {[
                      "Borrower",
                      "Amount",
                      "Tenure",
                      "Total Repayment",
                      "Applied",
                      "Salary Slip",
                      "Status",
                      ...(tab === "applied" ? ["Actions"] : []),
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

                        {/* Tenure */}
                        <td className="px-5 py-4 text-gray-600">
                          {loan.tenureDays}d
                        </td>

                        {/* Repayment */}
                        <td className="px-5 py-4 text-green-600 font-medium">
                          {formatCurrency(loan.totalRepayment)}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-gray-500">
                          {formatDate(loan.createdAt)}
                        </td>

                        {/* Salary Slip */}
                        <td className="px-5 py-4">
                          <a
                            href={loan.salarySlipUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline text-xs font-medium"
                          >
                            View →
                          </a>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                              loan.status,
                            )}`}
                          >
                            {loan.status}
                          </span>

                          {loan.rejectionReason && (
                            <p className="text-red-500 text-xs mt-1 max-w-xs truncate">
                              {loan.rejectionReason}
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        {tab === "applied" && (
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(loan._id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                              >
                                ✓ Approve
                              </button>

                              <button
                                onClick={() =>
                                  setRejectModal({
                                    open: true,
                                    loanId: loan._id,
                                  })
                                }
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Reject Loan
              </h3>

              <p className="text-gray-500 text-sm mb-4">
                Please provide a reason for rejection
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Inconsistent income documents..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setRejectModal({ open: false, loanId: "" });
                    setRejectReason("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm hover:shadow-md transition disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
