export default function BlacklistedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">⊘</div>
        <h1 className="text-2xl font-bold text-wfd-charcoal mb-2">Account Removed</h1>
        <p className="text-gray-600">
          This account has been removed from the WFD EMS Student Portal.
        </p>
        <p className="text-sm text-gray-400 mt-3">
          If you believe this is an error, contact the EMS Training Division.
        </p>
      </div>
    </div>
  );
}
