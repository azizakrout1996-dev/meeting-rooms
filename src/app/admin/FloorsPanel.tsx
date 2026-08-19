"use client";

import { useActionState, useState, useTransition } from "react";
import type { Floor } from "@/lib/database.types";
import { addFloor, renameFloor, deleteFloor } from "@/lib/actions/admin";
import type { AdminFormState } from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function FloorsPanel({ floors }: { floors: Floor[] }) {
  const [state, formAction, pending] = useActionState(addFloor, initialState);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
        Floors
      </h2>

      <ul className="space-y-2">
        {floors.map((floor) => (
          <FloorRow key={floor.id} floor={floor} />
        ))}
        {floors.length === 0 && (
          <p className="text-sm text-neutral-400">No floors yet.</p>
        )}
      </ul>

      <form action={formAction} className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder="New floor name (e.g. Floor 4)"
          required
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800 transition disabled:opacity-50"
        >
          Add floor
        </button>
      </form>
      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
    </section>
  );
}

function FloorRow({ floor }: { floor: Floor }) {
  const [name, setName] = useState(floor.name);
  const [isPending, startTransition] = useTransition();
  const dirty = name.trim() !== floor.name && name.trim().length > 0;

  return (
    <li className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
      />
      {dirty && (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await renameFloor(floor.id, name.trim());
            })
          }
          className="text-xs font-medium text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
        >
          Save
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (
            !confirm(
              `Delete "${floor.name}"? Rooms on this floor will also be deleted.`
            )
          )
            return;
          startTransition(async () => {
            await deleteFloor(floor.id);
          });
        }}
        className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}
