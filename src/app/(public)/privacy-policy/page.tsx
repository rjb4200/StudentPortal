export default function PrivacyPolicyPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal font-serif mb-1">Privacy Policy</h2>
      <p className="text-gray-500 text-xs mb-4">Last updated: June 22, 2026</p>

      <div className="text-gray-700 text-sm space-y-3 leading-relaxed">
        <p>
          The Winchester Fire Department Division of EMS (&ldquo;WFD EMS,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the WFD EMS Student Portal (the &ldquo;Portal&rdquo;). This Privacy Policy explains how we collect, use, and protect your personal data when you use the Portal.
        </p>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">Information We Collect</h3>
        <p>We may collect the following personal data:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Name, email address, and phone number</li>
          <li>School, program, and instructor information</li>
          <li>Schedule data, shift preferences, and attendance records</li>
          <li>Onboarding records, legal document signatures, and quiz results</li>
          <li>Messages and notifications sent through the Portal</li>
          <li>Evaluation and training progress records</li>
        </ul>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">How We Use Your Information</h3>
        <p>Your personal data is used solely to operate and maintain the EMS Student Portal, including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Managing student accounts and onboarding</li>
          <li>Scheduling shifts and sending reminders</li>
          <li>Facilitating communication between students, instructors, and training staff</li>
          <li>Tracking training progress and maintaining compliance records</li>
        </ul>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">SMS Notifications</h3>
        <p>
          Phone numbers collected for the WFD EMS Student Portal are used only to send operational portal notifications, including shift approvals, shift reminders, schedule updates, onboarding alerts, and related training notifications.
        </p>
        <p>
          SMS opt-in data and phone numbers are not sold or shared with third parties for marketing purposes.
        </p>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">Data Sharing</h3>
        <p>
          We do not sell your personal data. We may share data with third-party service providers (e.g., hosting, SMS delivery, email delivery) strictly for the purpose of operating the Portal. These providers are contractually bound to protect your data.
        </p>

        <h3 className="font-bold text-wfd-charcoal font-serif text-base">Contact</h3>
        <p>
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:jbrown@winchesterky.com" className="text-wfd-crimson underline">jbrown@winchesterky.com</a>.
        </p>
      </div>
    </div>
  );
}
