import { PinForm } from "./PinForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-semibold text-center mb-1">🏢 Meeting Rooms</h1>
      <p className="text-sm text-neutral-500 text-center mb-8">
        Enter the office PIN to view and book meeting rooms.
      </p>
      <PinForm redirectTo={redirectTo ?? "/"} />
    </div>
  );
}
