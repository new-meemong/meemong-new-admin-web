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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
