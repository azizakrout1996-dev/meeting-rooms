"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { overlaps, formatTime } from "@/lib/time";
import { getRole } from "@/lib/pin";

export type BookingFormState = { error: string | null; success?: boolean };

export async function createBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const role = await getRole();
  if (!role) {
    return { error: "Your session expired. Please enter the PIN again." };
  }

  const roomId = String(formData.get("roomId") ?? "");
  const bookedBy = String(formData.get("bookedBy") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const startLocal = String(formData.get("start") ?? "");
  const endLocal = String(formData.get("end") ?? "");

  if (!roomId || !startLocal || !endLocal) {
    return { error: "Please fill in the start and end time." };
  }
  if (!bookedBy) {
    return { error: "Please enter your name." };
  }

  const start = new Date(startLocal);
  const end = new Date(endLocal);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Invalid date/time." };
  }
  if (end <= start) {
    return { error: "End time must be after the start time." };
  }
  if (start < new Date(Date.now() - 60 * 1000)) {
    return { error: "You can't book a slot in the past." };
  }

  const supabase = createClient();

  // Re-check for conflicts server-side right before inserting (the DB has
  // no exclusion constraint here, so we do a best-effort check + rely on
  // the UI refreshing to catch the rare race).
  const { data: existing, error: fetchError } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("room_id", roomId);

  if (fetchError) {
    return { error: fetchError.message };
  }

  const conflict = (existing ?? []).find((b) =>
    overlaps(start, end, b.start_time, b.end_time)
  );

  if (conflict) {
    return {
      error: `Room unavailable from ${formatTime(conflict.start_time)} to ${formatTime(
        conflict.end_time
      )}.`,
    };
  }

  const { error: insertError } = await supabase.from("bookings").insert({
    room_id: roomId,
    booked_by: bookedBy,
    title: title || null,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/");
  revalidatePath(`/rooms/${roomId}`);
  revalidatePath("/my-bookings");

  return { error: null, success: true };
}

export async function cancelBooking(bookingId: string) {
  const role = await getRole();
  if (!role) {
    throw new Error("Your session expired. Please enter the PIN again.");
  }

  const supabase = createClient();
  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/my-bookings");
  revalidatePath("/rooms", "layout");
}
