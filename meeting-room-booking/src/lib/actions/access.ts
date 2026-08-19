"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pinToRole, createSessionValue, SESSION_COOKIE } from "@/lib/pin";

export type PinFormState = { error: string | null };

export async function unlockWithPin(
  _prevState: PinFormState,
  formData: FormData
): Promise<PinFormState> {
  const pin = String(formData.get("pin") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  const role = pinToRole(pin);
  if (!role) {
    return { error: "Incorrect PIN." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE.name, await createSessionValue(role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_COOKIE.maxAgeSeconds,
    path: "/",
  });

  redirect(redirectTo || "/");
}

export async function lock() {
  const store = await cookies();
  store.delete(SESSION_COOKIE.name);
  redirect("/login");
}
