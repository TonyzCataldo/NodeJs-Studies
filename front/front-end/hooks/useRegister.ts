"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRegister() {
  const [state, action, isPending] = useActionState(registerAction, {});
  const router = useRouter();

  // We removed the auto-redirect to allow the component to show a success message
  /*
  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=true");
    }
  }, [state.success, router]);
  */

  return {
    state,
    action,
    isPending,
    // Helper to check for specific field errors if we map them
    errors: state.errors,
  };
}
