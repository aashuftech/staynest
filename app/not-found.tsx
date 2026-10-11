import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-bold text-blue-100 mb-4">404</div>
        <div className="text-6xl mb-6">🏠</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md">
          Looks like this page moved out! Let us find you a better place.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/apartments"
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-8 py-3 rounded-xl border border-gray-200 transition-all"
          >
            Browse Apartments
          </Link>
        </div>
      </div>
    </div>
  );
}
