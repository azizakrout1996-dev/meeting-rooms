"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const NAME_STORAGE_KEY = "mrb_name";

export function SearchForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Prefill from a previous visit as a direct DOM write (not React state),
  // so there's no server/client render mismatch and no extra re-render.
  useEffect(() => {
    if (!defaultValue) {
      const saved = window.localStorage.getItem(NAME_STORAGE_KEY);
      if (saved && inputRef.current && !inputRef.current.value) {
        inputRef.current.value = saved;
      }
    }
  }, [defaultValue]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = inputRef.current?.value.trim() ?? "";
        if (trimmed) window.localStorage.setItem(NAME_STORAGE_KEY, trimmed);
        router.push(`/my-bookings?name=${encodeURIComponent(trimmed)}`);
      }}
      className="flex gap-2"
    >
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        type="text"
        placeholder="Your name"
        className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
      />
      <button
        type="submit"
        className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800 transition"
      >
        Search
      </button>
    </form>
  );
}
