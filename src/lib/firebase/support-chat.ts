"use client";

import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAccessTokenFromCookie } from "@/apis/core";
import { app } from "@/lib/firebase/client";
import { resolveFirestoreDatabaseId } from "@/lib/firebase/database";

/**
 * 운영팀 채팅 전용 운영 DB. 개발 DB를 두지 않기로 했으므로(2026-11-11) 운영 API로
 * 로그인한 어드민에서만 쓴다. 토큰 발급 함수도 운영 Node API로만 관리자를 확인한다.
 */
export const SUPPORT_CHAT_DATABASE_ID = "meemong-support-chat";
const ADMIN_TOKEN_ENDPOINT =
  "https://asia-northeast3-new-meemong.cloudfunctions.net/issueSupportChatAdminToken";

export const supportDb = getFirestore(app, SUPPORT_CHAT_DATABASE_ID);
export const supportAuth = getAuth(app);

export interface SupportAdminIdentity {
  adminId: string;
  adminName: string;
}

export class SupportChatUnavailableError extends Error {}

let inFlight: Promise<SupportAdminIdentity> | null = null;
// Firebase 세션은 브라우저에 유지된다. 다른 관리자로 다시 로그인했는데 이전 운영자
// 세션을 재사용하지 않도록, 세션을 연 어드민 토큰의 해시를 함께 기억한다.
const SESSION_FINGERPRINT_KEY = "supportChatAdminSession";

async function fingerprint(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function identityFromCurrentUser(): Promise<SupportAdminIdentity | null> {
  const user = supportAuth.currentUser;
  if (!user) return null;
  const { claims } = await user.getIdTokenResult();
  if (claims.supportAdmin !== true || typeof claims.adminId !== "string") {
    return null;
  }
  return {
    adminId: claims.adminId,
    adminName: typeof claims.adminName === "string" ? claims.adminName : "",
  };
}

/** 어드민 로그인 쿠키로 Firebase 운영자 세션을 연다. */
export function ensureSupportAdminSession(): Promise<SupportAdminIdentity> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    if (resolveFirestoreDatabaseId() !== "meemong-chat") {
      throw new SupportChatUnavailableError(
        "운영팀 채팅은 운영 API(api.meemong.com)로 로그인한 어드민에서만 사용할 수 있습니다.",
      );
    }
    await supportAuth.authStateReady();
    const accessToken = getAccessTokenFromCookie();
    if (!accessToken) {
      await signOutSupportAdmin();
      throw new SupportChatUnavailableError("어드민 로그인이 필요합니다.");
    }
    const currentFingerprint = await fingerprint(accessToken);
    const existing = await identityFromCurrentUser();
    if (existing && sessionStorage.getItem(SESSION_FINGERPRINT_KEY) === currentFingerprint) {
      return existing;
    }
    await signOutSupportAdmin();
    const response = await fetch(ADMIN_TOKEN_ENDPOINT, {
      method: "POST",
      // fetcher와 같은 값을 그대로 보내 Node가 같은 판정을 하게 한다.
      headers: { Authorization: accessToken },
    });
    if (!response.ok) {
      throw new SupportChatUnavailableError(
        `운영자 확인에 실패했습니다. (${response.status})`,
      );
    }
    const { token } = (await response.json()) as { token?: string };
    if (!token) throw new SupportChatUnavailableError("운영자 토큰이 없습니다.");
    await signInWithCustomToken(supportAuth, token);
    sessionStorage.setItem(SESSION_FINGERPRINT_KEY, currentFingerprint);
    const identity = await identityFromCurrentUser();
    if (!identity) throw new SupportChatUnavailableError("운영자 권한이 없습니다.");
    return identity;
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export async function signOutSupportAdmin(): Promise<void> {
  sessionStorage.removeItem(SESSION_FINGERPRINT_KEY);
  if (supportAuth.currentUser) await supportAuth.signOut();
}
