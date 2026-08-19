"use client";

import { useActionState, useState, useTransition } from "react";
import type { Floor, Room } from "@/lib/database.types";
import {
  addRoom,
  renameRoom,
  moveRoom,
  deleteRoom,
  type AdminFormState,
} from "@/lib/actions/admin";

const initialState: AdminFormState = { error: null };

export function RoomsPanel({
  floors,
  rooms,
}: {
  floors: Floor[];
  rooms: Room[];
}) {
  const [state, formAction, pending] = useActionState(addRoom, initialState);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
        Meeting rooms
      </h2>

      <ul className="space-y-2">
        {rooms.map((room) => (
          <RoomRow key={room.id} room={room} floors={floors} />
        ))}
        {rooms.length === 0 && (
          <p className="text-sm text-neutral-400">No rooms yet.</p>
        )}
      </ul>

      <form action={formAction} className="flex flex-wrap gap-2">
        <input
          name="name"
          type="text"
          placeholder="New room name"
          required
          className="flex-1 min-w-[10rem] rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
        />
        <select
          name="floorId"
          required
          defaultValue=""
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
        >
          <option value="" disabled>
            Choose floor
          </option>
          {floors.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending || floors.length === 0}
          className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800 transition disabled:opacity-50"
        >
          Add room
        </button>
      </form>
      {floors.length === 0 && (
        <p className="text-xs text-neutral-400">Add a floor first.</p>
      )}
      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
    </section>
  );
}

function RoomRow({ room, floors }: { room: Room; floors: Floor[] }) {
  const [name, setName] = useState(room.name);
  const [isPending, startTransition] = useTransition();
  const dirty = name.trim() !== room.name && name.trim().length > 0;

  return (
    <li className="flex flex-wrap items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 min-w-[8rem] text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
      />
      {dirty && (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await renameRoom(room.id, name.trim());
            })
          }
          className="text-xs font-medium text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
        >
          Save
        </button>
      )}
      <select
        value={room.floor_id}
        disabled={isPending}
        onChange={(e) =>
          startTransition(async () => {
            await moveRoom(room.id, e.target.value);
          })
        }
        className="rounded-md border border-neutral-300 px-2 py-1 text-xs bg-white"
      >
        {floors.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm(`Delete "${room.name}"? Its bookings will be removed too.`))
            return;
          startTransition(async () => {
            await deleteRoom(room.id);
          });
        }}
        className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}
