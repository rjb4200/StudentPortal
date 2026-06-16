'use client';

interface OnboardingIntroProps {
  onBegin: () => void;
  helpEmail?: string;
}

export function OnboardingIntro({ onBegin, helpEmail }: OnboardingIntroProps) {
  return (
    <div className="bg-wfd-crimson rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-10 md:px-10 md:py-14 text-center">
        <p className="text-wfd-gold text-sm font-semibold tracking-widest uppercase mb-3"
           style={{ fontFamily: "'EB Garamond', serif" }}>
          Winchester Fire Department
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "'EB Garamond', serif" }}>
          EMS Student Portal
        </h1>
        <p className="text-gray-200 max-w-lg mx-auto mb-2 leading-relaxed">
          Welcome to the Winchester Fire Department clinical rotation onboarding.
          Complete these steps to register as a student and schedule ride time with
          our preceptors.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Estimated time: ~10 minutes
        </p>
        <button
          onClick={onBegin}
          className="inline-block bg-white text-wfd-crimson font-semibold rounded-lg px-10 py-3 text-base hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-wfd-crimson transition-colors"
        >
          Begin Registration
        </button>
      </div>
      <div className="bg-wfd-charcoal px-6 py-4 text-center">
        <p className="text-gray-400 text-xs">
          Need help? Contact your instructor or email{' '}
          <a href={`mailto:${helpEmail ?? 'jbrown@winchesterky.com'}`} className="text-wfd-gold hover:underline">
            {helpEmail ?? 'jbrown@winchesterky.com'}
          </a>
        </p>
      </div>
    </div>
  );
}
