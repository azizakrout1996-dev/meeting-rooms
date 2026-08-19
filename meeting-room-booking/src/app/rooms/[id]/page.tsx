import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/pin";
import { formatDateTime } from "@/lib/time";
import { BookingForm } from "./BookingForm";
import { CancelButton } from "@/components/CancelButton";

export const dynamic = "force-dynamic";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getRole();
  if (!role) redirect("/login");

  const { id } = await params;
  const supabase = createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("*, floors(name)")
    .eq("id", id)
    .single();

  if (!room) {
    notFound();
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, title, booked_by")
    .eq("room_id", id)
    .gt("end_time", new Date().toISOString())
    .order("start_time");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← All rooms
        </Link>
        <h1 className="text-lg font-semibold text-neutral-900 mt-1">
          {room.name}
        </h1>
        <p className="text-sm text-neutral-500">
          {(room as { floors?: { name: string } }).floors?.name}
        </p>
      </div>

      <BookingForm roomId={room.id} />

      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">
          Upcoming bookings
        </h2>
        {!bookings || bookings.length === 0 ? (
          <p className="text-sm text-neutral-400">No upcoming bookings.</p>
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {b.title || "Meeting"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDateTime(b.start_time)} – {formatDateTime(b.end_time)}
                  </p>
                  <p className="text-xs text-neutral-400">Booked by {b.booked_by}</p>
                </div>
                <CancelButton bookingId={b.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
