"use client";

import { useActionState } from "react";
import { unlockWithPin, type PinFormState } from "@/lib/actions/access";

const initialState: PinFormState = { error: null };

export function PinForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(unlockWithPin, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 bg-white border border-neutral-200 rounded-xl p-6 shadow-sm"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <label className="block text-sm">
        <span className="block mb-2 font-medium text-neutral-700 text-center">
          PIN
        </span>
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          autoFocus
          required
          maxLength={12}
          className="w-full rounded-md border border-neutral-300 px-3 py-3 text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
        />
      </label>

      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-center">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 text-white text-sm font-medium py-2 hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {pending ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
