"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/pin";

async function requireAdmin() {
  const role = await getRole();
  if (role !== "admin") {
    throw new Error("Admin PIN required.");
  }
  return createClient();
}

export type AdminFormState = { error: string | null; success?: boolean };

export async function addFloor(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Floor name is required." };

  try {
    const supabase = await requireAdmin();
    const { count } = await supabase
      .from("floors")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase
      .from("floors")
      .insert({ name, position: (count ?? 0) + 1 });

    if (error) return { error: error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function renameFloor(floorId: string, name: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("floors")
    .update({ name })
    .eq("id", floorId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteFloor(floorId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("floors").delete().eq("id", floorId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function addRoom(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const floorId = String(formData.get("floorId") ?? "");
  if (!name || !floorId) return { error: "Room name and floor are required." };

  try {
    const supabase = await requireAdmin();
    const { count } = await supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .eq("floor_id", floorId);

    const { error } = await supabase
      .from("rooms")
      .insert({ name, floor_id: floorId, position: (count ?? 0) + 1 });

    if (error) return { error: error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function renameRoom(roomId: string, name: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("rooms").update({ name }).eq("id", roomId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function moveRoom(roomId: string, floorId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("rooms")
    .update({ floor_id: floorId })
    .eq("id", roomId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteRoom(roomId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}
