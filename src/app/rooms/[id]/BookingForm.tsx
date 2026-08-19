"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBooking, type BookingFormState } from "@/lib/actions/bookings";
import { nowForInput } from "@/lib/time";

const initialState: BookingFormState = { error: null };
const NAME_STORAGE_KEY = "mrb_name";

export function BookingForm({ roomId }: { roomId: string }) {
  const boundAction = createBooking.bind(null);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Prefill the name field from a previous visit. Done as a direct DOM
  // write (not React state) so there's no server/client render mismatch
  // and no extra re-render -- this is a one-off browser-only convenience,
  // not state React needs to track.
  useEffect(() => {
    const saved = window.localStorage.getItem(NAME_STORAGE_KEY);
    if (saved && nameRef.current && !nameRef.current.value) {
      nameRef.current.value = saved;
    }
  }, []);

  useEffect(() => {
    if (state.success && formRef.current) {
      const name = nameRef.current?.value;
      formRef.current.reset();
      // Keep the name field filled in after a reset (nicer for repeat bookings).
      if (nameRef.current && name) {
        nameRef.current.value = name;
      }
    }
  }, [state.success]);

  const defaultStart = nowForInput(5);
  const defaultEnd = nowForInput(65);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        const name = new FormData(e.currentTarget).get("bookedBy");
        if (typeof name === "string" && name.trim()) {
          window.localStorage.setItem(NAME_STORAGE_KEY, name.trim());
        }
      }}
      className="space-y-4 bg-white border border-neutral-200 rounded-xl p-4"
    >
      <input type="hidden" name="roomId" value={roomId} />

      <label className="block text-sm">
        <span className="block mb-1 font-medium text-neutral-700">Your name</span>
        <input
          ref={nameRef}
          name="bookedBy"
          type="text"
          required
          placeholder="e.g. Aziz"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
        />
      </label>

      <label className="block text-sm">
        <span className="block mb-1 font-medium text-neutral-700">
          Title (optional)
        </span>
        <input
          name="title"
          type="text"
          placeholder="e.g. Team sync"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="block mb-1 font-medium text-neutral-700">Start</span>
          <input
            name="start"
            type="datetime-local"
            required
            defaultValue={defaultStart}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
          />
        </label>
        <label className="block text-sm">
          <span className="block mb-1 font-medium text-neutral-700">End</span>
          <input
            name="end"
            type="datetime-local"
            required
            defaultValue={defaultEnd}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
          />
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          Room booked!
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 text-white text-sm font-medium py-2 hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {pending ? "Booking…" : "Book room"}
      </button>
    </form>
  );
}
