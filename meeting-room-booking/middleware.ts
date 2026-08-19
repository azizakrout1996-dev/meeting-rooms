import { NextResponse, type NextRequest } from "next/server";
import { verifySessionValue, SESSION_COOKIE } from "@/lib/pin";

const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  const role = await verifySessionValue(
    request.cookies.get(SESSION_COOKIE.name)?.value
  );

  const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  const isStatic =
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon");

  if (!role && !isPublic && !isStatic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (role && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
