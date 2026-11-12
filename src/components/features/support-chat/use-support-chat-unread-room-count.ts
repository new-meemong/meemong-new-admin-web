"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { supportAuth, supportDb } from "@/lib/firebase/support-chat";

/**
 * 사이드바 관리자채팅 배지: 안 읽은 메시지 수가 아니라 안 읽은 방 수(Notion 어드민 알림).
 * 다른 메뉴에서 토큰 발급 함수를 매번 호출하지 않도록, 관리자채팅에 들어와 이미 열린
 * 운영자 세션이 있을 때만 구독한다.
 */
export function useSupportChatUnreadRoomCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let unsubscribeInbox: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(supportAuth, async (user) => {
      unsubscribeInbox?.();
      unsubscribeInbox = null;
      setCount(0);
      if (!user) return;
      const { claims } = await user.getIdTokenResult();
      if (claims.supportAdmin !== true) return;
      unsubscribeInbox = onSnapshot(
        query(collection(supportDb, "supportInbox"), where("inboxUnreadCount", ">", 0)),
        (snapshot) => setCount(snapshot.size),
        () => setCount(0),
      );
    });
    return () => {
      unsubscribeInbox?.();
      unsubscribeAuth();
    };
  }, []);
  return count;
}
