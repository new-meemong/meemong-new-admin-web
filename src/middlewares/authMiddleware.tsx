// middlewares/authMiddleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const isLoginPage = request.nextUrl.pathname === "/login";
  const isRoot = pathname === "/";

  if (!token) {
    if (isLoginPage) return null;
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/admins/me`, {
      method: "GET",
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!res.ok) {
      if (isLoginPage || isRoot) return null;
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 로그인된 사용자가 /login 또는 / 경로 접근 시 → /user로 이동
    if (isLoginPage || isRoot) {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    return null; // 정상 통과
  } catch (err) {
    console.error("Auth validation failed:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return null; // 아무것도 안 하면 통과
}
