"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Loan, Payment, User } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import AuthGuard from "@/components/AuthGuard";

interface LoanWithOutstanding extends Loan {
  outstanding: number;
}

interface PaymentForm {
  utrNumber: string;
  amount: string;
  paymentDate: string;
}

export default function CollectionPage() {
  const [loans, setLoans] = useState<LoanWithOutstanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    loan: LoanWithOutstanding | null;
  }>({ open: false, loan: null });
  const [form, setForm] = useState<PaymentForm>({
    utrNumber: "",
    amount: "",
    paymentDate: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);
  const [payments, setPayments] = useState<Record<string, Payment[]>>({});

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/collection/loans");
      setLoans(res.data.loans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchPayments = async (loanId: string) => {
    if (payments[loanId]) return;
    try {
      const res = await api.get(`/collection/loans/${loanId}/payments`);
      setPayments((prev) => ({ ...prev, [loanId]: res.data.payments }));
    } catch {
      toast.error("Failed to load payments");
    }
  };

  const toggleExpand = (loanId: string) => {
    if (expandedLoan === loanId) {
      setExpandedLoan(null);
    } else {
      setExpandedLoan(loanId);
      fetchPayments(loanId);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentModal.loan) return;
    if (!form.utrNumber.trim() || !form.amount || !form.paymentDate) {
      toast.error("All fields are required");
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/collection/loans/${paymentModal.loan._id}/payment`, {
        utrNumber: form.utrNumber.trim(),
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
      });
      toast.success("Payment recorded!");
      setPaymentModal({ open: false, loan: null });
      setForm({ utrNumber: "", amount: "", paymentDate: "" });
      // Reset payment cache for this loan so it reloads
      setPayments((prev) => {
        const n = { ...prev };
        delete n[paymentModal.loan!._id];
        return n;
      });
      fetchLoans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["collection", "admin"]}>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Collection Module
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track repayments for disbursed loans
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : loans.length === 0 ? (
            <EmptyState message="No disbursed loans yet" icon="💰" />
          ) : (
            <div className="divide-y divide-gray-100">
              {loans.map((loan) => {
                const borrower = loan.borrowerId as User;
                const paidPct = Math.min(
                  100,
                  (loan.totalPaid / loan.totalRepayment) * 100,
                );
                const isExpanded = expandedLoan === loan._id;

                return (
                  <div key={loan._id} className="group transition-all">
                    {/* Row */}
                    <div className="p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300">
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Borrower */}
                        <div className="flex-1 min-w-40">
                          <p className="font-semibold text-gray-900 group-hover:text-teal-600 transition">
                            {borrower?.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {borrower?.email}
                          </p>
                        </div>

                        {/* Amounts */}
                        <div className="text-sm min-w-28">
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="font-semibold text-gray-800">
                            {formatCurrency(loan.totalRepayment)}
                          </p>
                        </div>

                        <div className="text-sm min-w-28">
                          <p className="text-xs text-gray-400">Paid</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(loan.totalPaid)}
                          </p>
                        </div>

                        <div className="text-sm min-w-28">
                          <p className="text-xs text-gray-400">Outstanding</p>
                          <p className="font-semibold text-orange-500">
                            {formatCurrency(loan.outstanding)}
                          </p>
                        </div>

                        {/* Status */}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${getStatusColor(
                            loan.status,
                          )}`}
                        >
                          {loan.status}
                        </span>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {loan.status === "disbursed" && (
                            <button
                              onClick={() =>
                                setPaymentModal({ open: true, loan })
                              }
                              className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs rounded-lg shadow-sm hover:shadow-md transition-all"
                            >
                              + Payment
                            </button>
                          )}

                          <button
                            onClick={() => toggleExpand(loan._id)}
                            className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all"
                          >
                            {isExpanded ? "Hide" : "History"}
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Repayment Progress</span>
                          <span className="font-medium text-gray-600">
                            {paidPct.toFixed(1)}%
                          </span>
                        </div>

                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              loan.status === "closed"
                                ? "bg-gray-500"
                                : "bg-gradient-to-r from-teal-400 to-teal-600"
                            }`}
                            style={{ width: `${paidPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Accordion */}
                    {isExpanded && (
                      <div className="bg-gray-50/80 backdrop-blur px-5 py-4 border-t border-gray-100 animate-fadeIn">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">
                          Payment History
                        </p>

                        {!payments[loan._id] ? (
                          <p className="text-xs text-gray-400">Loading...</p>
                        ) : payments[loan._id].length === 0 ? (
                          <p className="text-xs text-gray-400">
                            No payments recorded yet
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {payments[loan._id].map((p) => (
                              <div
                                key={p._id}
                                className="flex justify-between items-center text-xs bg-white rounded-xl px-4 py-2 border border-gray-100 shadow-sm hover:shadow-md transition"
                              >
                                <div>
                                  <span className="font-semibold text-gray-800">
                                    {p.utrNumber}
                                  </span>
                                  <span className="text-gray-400 ml-2">
                                    {formatDate(p.paymentDate)}
                                  </span>
                                </div>
                                <span className="font-bold text-green-600">
                                  {formatCurrency(p.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {paymentModal.open && paymentModal.loan && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Record Payment
              </h3>

              <p className="text-gray-500 text-sm mb-1">
                {(paymentModal.loan.borrowerId as User)?.name}
              </p>

              <p className="text-xs text-orange-500 mb-5">
                Outstanding: {formatCurrency(paymentModal.loan.outstanding)}
              </p>

              <div className="space-y-4">
                <input
                  value={form.utrNumber}
                  onChange={(e) =>
                    setForm({ ...form, utrNumber: e.target.value })
                  }
                  placeholder="UTR Number"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                />

                <input
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  type="number"
                  placeholder="Amount"
                  max={paymentModal.loan.outstanding}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                />

                <input
                  value={form.paymentDate}
                  onChange={(e) =>
                    setForm({ ...form, paymentDate: e.target.value })
                  }
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setPaymentModal({ open: false, loan: null });
                    setForm({ utrNumber: "", amount: "", paymentDate: "" });
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRecordPayment}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg text-sm hover:shadow-md transition disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
