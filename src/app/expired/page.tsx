import Link from 'next/link';

export default function ExpiredPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl">⏳</div>
        <h1 className="text-2xl font-bold text-wfd-charcoal mb-2">Access Expired</h1>
        <p className="text-gray-600 mb-6">
          Your access to the WFD EMS Student Portal has expired. Your previous registration information will be available when you re-register.
        </p>
        <Link
          href="/onboarding?token=WFD_TRAINING_2026"
          className="inline-block rounded-lg bg-wfd-crimson text-white px-6 py-3 font-semibold hover:bg-red-700 transition-colors"
        >
          Re-register for Student Portal
        </Link>
      </div>
    </div>
  );
}
