// app/(auth)/login/resetPassword/page.tsx
import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}