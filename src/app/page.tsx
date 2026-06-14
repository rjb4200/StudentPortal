import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-wfd-crimson rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-wfd-charcoal mb-2">
            EMS Student Portal
          </h1>
          <p className="text-gray-500">
            Winchester Fire Department — Division of EMS<br />
            Student Training & Rotation Portal
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/onboarding"
            className="block w-full bg-wfd-crimson text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Begin Student Onboarding
          </Link>
          <Link
            href="/login"
            className="block w-full bg-wfd-charcoal text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          New students: click &quot;Begin Student Onboarding&quot; to register, review legal documents, and complete the Policy and Protocol Review.
        </p>
      </div>
    </div>
  );
}
