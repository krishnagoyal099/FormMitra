// src/hooks/use-action-state.ts
"use client";
import { useState, useCallback } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";

interface ActionState<T> {
  data: T | null;
  error: string | null;
  busy: boolean;
}

export function useActionState<T, P extends unknown[]>(
  action: (...args: P) => Promise<{ ok: boolean; data?: T; message?: string }>
) {
  const [state, setState] = useState<ActionState<T>>({
    data: null,
    error: null,
    busy: false,
  });

  const execute = useCallback(async (...args: P) => {
    setState({ data: null, error: null, busy: true });
    try {
      const res = await action(...args);
      if (res.ok && res.data) {
        setState({ data: res.data, error: null, busy: false });
        return res;
      } else {
        setState({ data: null, error: res.message ?? "Action failed", busy: false });
        return res;
      }
    } catch (err) {
      // Next.js redirect() throws a special error internally — re-throw it so
      // the navigation can proceed instead of being caught as an app error.
      if (isRedirectError(err)) throw err;

      const message = (err as Error).message;
      setState({ data: null, error: message, busy: false });
      return { ok: false, message };
    }
  }, [action]);

  return { ...state, execute };
}
