export default function EmptyState({ message, icon = '📭' }: { message: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}