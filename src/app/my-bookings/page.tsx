import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/pin";
import { formatDateTime } from "@/lib/time";
import { CancelButton } from "@/components/CancelButton";
import { SearchForm } from "./SearchForm";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const role = await getRole();
  if (!role) redirect("/login");

  const { name } = await searchParams;
  const query = (name ?? "").trim();
  const supabase = createClient();

  const { data: bookings } = query
    ? await supabase
        .from("bookings")
        .select("id, start_time, end_time, title, booked_by, room_id, rooms(name, floors(name))")
        .ilike("booked_by", `%${query}%`)
        .gt("end_time", new Date().toISOString())
        .order("start_time")
    : { data: null };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">My bookings</h1>
        <p className="text-sm text-neutral-500">
          Since there are no individual accounts, search by the name you used
          when booking.
        </p>
      </div>

      <SearchForm defaultValue={query} />

      {query && (!bookings || bookings.length === 0) && (
        <p className="text-sm text-neutral-500">
          No upcoming bookings found for &quot;{query}&quot;.{" "}
          <Link href="/" className="underline">
            Book a room
          </Link>
          .
        </p>
      )}

      {bookings && bookings.length > 0 && (
        <ul className="space-y-2">
          {bookings.map((b) => {
            const room = b.rooms as unknown as {
              name: string;
              floors: { name: string } | null;
            } | null;
            return (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 bg-white border border-neutral-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {room?.name}{" "}
                    <span className="text-neutral-400 font-normal">
                      · {room?.floors?.name}
                    </span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    {b.title ? `${b.title} · ` : ""}
                    {formatDateTime(b.start_time)} – {formatDateTime(b.end_time)}
                  </p>
                  <p className="text-xs text-neutral-400">Booked by {b.booked_by}</p>
                </div>
                <CancelButton bookingId={b.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
