import { getStatusColor } from '@/lib/utils';

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}