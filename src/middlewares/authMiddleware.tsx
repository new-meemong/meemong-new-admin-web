// middlewares/authMiddleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

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
      // 토큰은 있지만 유효하지 않음 → 로그인 페이지 허용, 그 외는 리다이렉트
      if (isLoginPage) return null;
      return NextResponse.redirect(new URL("/login", request.url));
    }

    //토큰이 유효한데 로그인 페이지 접근 시 → /user로 리다이렉트
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/user", request.url));
    }

    return null; // 정상 통과
  } catch (err) {
    console.error("Auth validation failed:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return null; // 아무것도 안 하면 통과
}
