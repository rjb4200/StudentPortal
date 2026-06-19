import Link from 'next/link';

export default function PublicHomePage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal font-serif mb-1">Welcome</h2>
      <p className="text-gray-500 text-sm mb-6">
        Access your EMS student portal account and training materials.
      </p>

      <Link
        href="/onboarding"
        className="block w-full bg-wfd-crimson text-white p-4 rounded-xl font-semibold mb-3 hover:brightness-90 transition-all text-center"
      >
        Begin Student Onboarding
        <span className="block text-xs font-normal text-white/70 mt-0.5">
          Register for portal access
        </span>
      </Link>

      <Link
        href="/login"
        className="block w-full bg-wfd-charcoal text-white p-4 rounded-xl font-semibold mb-6 hover:brightness-125 transition-all text-center"
      >
        Sign In
        <span className="block text-xs font-normal text-white/70 mt-0.5">
          Already registered? Log in here
        </span>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/onboarding"
          className="rounded-lg border border-gray-200 p-3 text-center text-sm hover:border-wfd-crimson/30 transition-colors"
        >
          <span className="block font-semibold text-wfd-charcoal">New student?</span>
          <span className="block text-xs text-gray-500">Request portal access</span>
        </Link>
        <a
          href="mailto:jbrown@winchesterky.com"
          className="rounded-lg border border-gray-200 p-3 text-center text-sm hover:border-wfd-crimson/30 transition-colors"
        >
          <span className="block font-semibold text-wfd-charcoal">Need help?</span>
          <span className="block text-xs text-gray-500">Contact EMS staff</span>
        </a>
      </div>
    </div>
  );
}
