import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-blue-700 text-white rounded-lg font-medium text-sm hover:bg-blue-800 transition-colors">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
