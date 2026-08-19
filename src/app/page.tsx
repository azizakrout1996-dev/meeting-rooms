import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTime, currentTimeMs } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: floors }, { data: rooms }, { data: bookings }] =
    await Promise.all([
      supabase.from("floors").select("*").order("position"),
      supabase.from("rooms").select("*").order("position"),
      // Bookings happening right now or later today/upcoming — enough to
      // compute "available now" / "busy until" for each room.
      supabase
        .from("bookings")
        .select("id, room_id, start_time, end_time, title")
        .gt("end_time", new Date().toISOString())
        .order("start_time"),
    ]);

  const now = currentTimeMs();
  const roomsByFloor = new Map<string, typeof rooms>();
  (rooms ?? []).forEach((room) => {
    const list = roomsByFloor.get(room.floor_id) ?? [];
    list.push(room);
    roomsByFloor.set(room.floor_id, list);
  });

  const bookingsByRoom = new Map<string, NonNullable<typeof bookings>>();
  (bookings ?? []).forEach((b) => {
    const list = bookingsByRoom.get(b.room_id) ?? [];
    list.push(b);
    bookingsByRoom.set(b.room_id, list);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">
          Meeting rooms
        </h1>
        <p className="text-sm text-neutral-500">
          Live availability across every floor.
        </p>
      </div>

      {(!floors || floors.length === 0) && (
        <p className="text-sm text-neutral-500">
          No floors yet. Ask an admin to add one.
        </p>
      )}

      {floors?.map((floor) => {
        const floorRooms = roomsByFloor.get(floor.id) ?? [];
        return (
          <section key={floor.id}>
            <h2 className="text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">
              {floor.name}
            </h2>
            {floorRooms.length === 0 ? (
              <p className="text-sm text-neutral-400">No rooms on this floor.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {floorRooms.map((room) => {
                  const roomBookings = (bookingsByRoom.get(room.id) ?? [])
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.start_time).getTime() -
                        new Date(b.start_time).getTime()
                    );
                  const current = roomBookings.find(
                    (b) =>
                      new Date(b.start_time).getTime() <= now &&
                      new Date(b.end_time).getTime() > now
                  );
                  const next = !current
                    ? roomBookings.find(
                        (b) => new Date(b.start_time).getTime() > now
                      )
                    : undefined;

                  return (
                    <Link
                      key={room.id}
                      href={`/rooms/${room.id}`}
                      className="block rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-neutral-900">
                          {room.name}
                        </span>
                        <StatusBadge busy={Boolean(current)} />
                      </div>
                      <p className="mt-2 text-sm text-neutral-500">
                        {current
                          ? `Busy until ${formatTime(current.end_time)}`
                          : next
                          ? `Free now · next booking ${formatTime(next.start_time)}`
                          : "Free all day"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StatusBadge({ busy }: { busy: boolean }) {
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        busy
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          busy ? "bg-red-500" : "bg-emerald-500"
        }`}
      />
      {busy ? "Busy" : "Available"}
    </span>
  );
}
