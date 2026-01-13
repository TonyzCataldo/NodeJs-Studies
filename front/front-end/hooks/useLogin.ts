"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useLogin() {
  const [state, action, isPending] = useActionState(loginAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
    }
  }, [state.success, router]);

  return {
    state,
    action,
    isPending,
  };
}
