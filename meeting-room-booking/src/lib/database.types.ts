// Hand-written types matching supabase/migrations/0001_init.sql.
// This app has no individual user accounts -- see src/lib/pin.ts for the
// shared-PIN access model. Bookings just record a free-text name.

export interface Floor {
  id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface Room {
  id: string;
  floor_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  booked_by: string;
  title: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
}
