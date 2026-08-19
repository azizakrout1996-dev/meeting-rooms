import Link from "next/link";
import { getRole } from "@/lib/pin";
import { lock } from "@/lib/actions/access";

export async function NavBar() {
  const role = await getRole();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-neutral-900 shrink-0">
          🏢 Meeting Rooms
        </Link>

        {role && (
          <nav className="flex items-center gap-4 text-sm text-neutral-600 overflow-x-auto">
            <Link href="/" className="hover:text-neutral-900 whitespace-nowrap">
              Rooms
            </Link>
            <Link
              href="/my-bookings"
              className="hover:text-neutral-900 whitespace-nowrap"
            >
              My bookings
            </Link>
            {role === "admin" && (
              <Link
                href="/admin"
                className="hover:text-neutral-900 whitespace-nowrap"
              >
                Admin
              </Link>
            )}
            <form action={lock}>
              <button
                type="submit"
                className="text-neutral-500 hover:text-neutral-900 whitespace-nowrap"
              >
                Lock
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
