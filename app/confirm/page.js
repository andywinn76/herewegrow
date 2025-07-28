"use client";

export default function ConfirmPage() {
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-xl font-bold mb-4">Almost Done!</h1>
      <p className="text-gray-700">
        Make sure to click the confirmation link sent to <strong>both email addresses</strong> to finalize the update.
      </p>
      <p>You will be directed to login again.</p>
    </div>
  );
}