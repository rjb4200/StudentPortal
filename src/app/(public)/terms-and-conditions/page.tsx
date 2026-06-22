export default function TermsAndConditionsPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal font-serif mb-1">Terms and Conditions</h2>
      <p className="text-gray-500 text-xs mb-4">Last updated: June 22, 2026</p>

      <div className="text-gray-700 text-sm space-y-3 leading-relaxed">
        <p>
          By accessing or using the WFD EMS Student Portal (the &ldquo;Portal&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the Portal.
        </p>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">Use of the Portal</h3>
        <p>
          The Portal is provided to EMS students, instructors, and training staff of the Winchester Fire Department Division of EMS for scheduling, onboarding, training, and communication purposes. You are responsible for maintaining the confidentiality of your account credentials.
        </p>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">SMS Notifications</h3>

        <h4 className="font-semibold text-wfd-charcoal text-sm">Program Name</h4>
        <p>WFD EMS Student Portal SMS Notifications</p>

        <h4 className="font-semibold text-wfd-charcoal text-sm">Program Description</h4>
        <p>
          By opting in to SMS notifications, you agree to receive text messages from the Winchester Fire Department EMS Student Portal related to student onboarding, shift approvals, day-before shift reminders, schedule updates, and training staff alerts.
        </p>

        <h4 className="font-semibold text-wfd-charcoal text-sm">Message Frequency</h4>
        <p>Message frequency varies based on portal activity and scheduled shifts.</p>

        <h4 className="font-semibold text-wfd-charcoal text-sm">Message and Data Rates</h4>
        <p>Message and data rates may apply. Please check with your mobile carrier for details.</p>

        <h4 className="font-semibold text-wfd-charcoal text-sm">Help and Support</h4>
        <p>
          Reply <strong>HELP</strong> for help. You may also contact us at{' '}
          <a href="mailto:jbrown@winchesterky.com" className="text-wfd-crimson underline">jbrown@winchesterky.com</a>.
        </p>

        <h4 className="font-semibold text-wfd-charcoal text-sm">Opt-Out Instructions</h4>
        <p>
          Reply <strong>STOP</strong> at any time to opt out of SMS notifications. After opting out, you will no longer receive SMS messages from the Portal.
        </p>

        <h4 className="font-semibold text-wfd-charcoal text-sm">SMS Consent and Data Sharing</h4>
        <p>
          SMS consent is not shared with third parties for marketing purposes. Phone numbers collected for SMS are used exclusively for the program described above.
        </p>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">Changes to These Terms</h3>
        <p>
          We reserve the right to update these Terms and Conditions at any time. Continued use of the Portal after changes constitutes acceptance of the updated terms.
        </p>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">Contact</h3>
        <p>
          For questions about these Terms and Conditions, please contact us at{' '}
          <a href="mailto:jbrown@winchesterky.com" className="text-wfd-crimson underline">jbrown@winchesterky.com</a>.
        </p>
      </div>
    </div>
  );
}
