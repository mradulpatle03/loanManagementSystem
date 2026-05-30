"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";

import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import AuthGuard from "@/components/AuthGuard";

export default function SalesPage() {
  const [leads, setLeads] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const fetchLeads = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/sales/leads?page=${p}&limit=10&sort=${sortOrder}`,
      );
      setLeads(res.data.leads);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(page);
  }, [page, sortOrder]);

  return (
    <AuthGuard allowedRoles={["sales", "admin"]}>
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
  
  {/* Header */}
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
        Sales Leads
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        {total} registered borrowers without active loans
      </p>
    </div>

    <button
      onClick={() => {
        setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
        setPage(1);
      }}
      className="px-4 py-2 text-xs font-medium border border-gray-300 rounded-xl bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all flex items-center gap-2"
    >
      <span>Date</span>
      <span className="text-indigo-600 font-bold">
        {sortOrder === "desc" ? "↓" : "↑"}
      </span>
    </button>
  </div>

  {/* Card */}
  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
    {loading ? (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    ) : leads.length === 0 ? (
      <EmptyState
        message="No leads yet. Borrowers who register without applying will appear here."
        icon="👥"
      />
    ) : (
      <>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            
            {/* Head */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Employment",
                  "Monthly Salary",
                  "BRE Status",
                  "Registered",
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
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300"
                >
                  {/* Name */}
                  <td className="px-5 py-4 font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                    {lead.name}
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-gray-600">
                    {lead.email}
                  </td>

                  {/* Employment */}
                  <td className="px-5 py-4 capitalize text-gray-600">
                    {lead.employmentMode ?? "—"}
                  </td>

                  {/* Salary */}
                  <td className="px-5 py-4 text-gray-700 font-medium">
                    {lead.monthlySalary
                      ? `₹${lead.monthlySalary.toLocaleString("en-IN")}`
                      : "—"}
                  </td>

                  {/* BRE Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        lead.isBrePassed
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <StatusBadge
                        status={lead.isBrePassed ? "passed" : "pending"}
                      />
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-gray-500">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Page <span className="font-medium text-gray-700">{page}</span> of{" "}
              <span className="font-medium text-gray-700">{pages}</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-white hover:shadow-sm transition"
              >
                Previous
              </button>

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg disabled:opacity-40 hover:shadow-md transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </div>
</div>
    </AuthGuard>
  );
}
