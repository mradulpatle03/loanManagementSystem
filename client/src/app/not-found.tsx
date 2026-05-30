import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
          Back to Login
        </Link>
      </div>
    </div>
  );
}