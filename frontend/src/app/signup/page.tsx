"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-extrabold tracking-tight">Verification mode only</h2>
        <p className="text-slate-500 mt-2">This backend does not support registration, so the app redirects to the verifier dashboard.</p>
      </div>
    </div>
  );
}
