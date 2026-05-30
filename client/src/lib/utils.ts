export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export const formatDate = (date: string): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    applied: "bg-blue-100 text-blue-700",
    sanctioned: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    disbursed: "bg-purple-100 text-purple-700",
    closed: "bg-gray-100 text-gray-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
};

export const getRoleDashboardPath = (role: string): string => {
  const map: Record<string, string> = {
    borrower: "/apply/personal",
    sales: "/dashboard/sales",
    sanction: "/dashboard/sanction",
    disbursement: "/dashboard/disbursement",
    collection: "/dashboard/collection",
    admin: "/dashboard/sales",
  };
  return map[role] ?? "/login";
};
