import { redirect } from "next/navigation";
import { getRole } from "@/lib/pin";
import { createClient } from "@/lib/supabase/server";
import { FloorsPanel } from "./FloorsPanel";
import { RoomsPanel } from "./RoomsPanel";
import { PinForm } from "@/app/login/PinForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const role = await getRole();

  if (!role) redirect("/login");

  if (role !== "admin") {
    return (
      <div className="max-w-sm mx-auto mt-10">
        <h1 className="text-lg font-semibold text-neutral-900 text-center mb-1">
          Admin access
        </h1>
        <p className="text-sm text-neutral-500 text-center mb-8">
          Enter the admin PIN to manage floors and rooms.
        </p>
        <PinForm redirectTo="/admin" />
      </div>
    );
  }

  const supabase = createClient();
  const [{ data: floors }, { data: rooms }] = await Promise.all([
    supabase.from("floors").select("*").order("position"),
    supabase.from("rooms").select("*").order("position"),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Admin</h1>
        <p className="text-sm text-neutral-500">
          Manage floors and meeting rooms.
        </p>
      </div>

      <FloorsPanel floors={floors ?? []} />
      <RoomsPanel floors={floors ?? []} rooms={rooms ?? []} />
    </div>
  );
}
