import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "@/middlewares/authMiddleware";

const middlewares = [authMiddleware];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  for (const mw of middlewares) {
    const response = await mw(request);
    if (response) return response;
  }

  return NextResponse.next();
}

export const config = {
  // Public preview assets contain no consultation data; React portals supply it.
  matcher: ["/((?!_next/static|_next/image|v3-hair-preview(?:/|$)|favicon.ico|robots.txt).*)"],
};
