"use client";

import { useTransition } from "react";
import { cancelBooking } from "@/lib/actions/bookings";

export function CancelButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Cancel this booking?")) return;
        startTransition(async () => {
          await cancelBooking(bookingId);
        });
      }}
      className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isPending ? "Cancelling…" : "Cancel"}
    </button>
  );
}
