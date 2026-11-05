"use client";

import { useEffect, useState } from "react";

// 서버 응답을 확인하기 전까지 같은 탭의 새로고침/화면 이동에도 요청을 유지한다.
export function usePendingBusinessMongRequest<T>(key: string) {
  const [request, setRequest] = useState<T | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(key);
      setRequest(stored ? (JSON.parse(stored) as T) : null);
      setReady(true);
    } catch {
      setStorageError(
        "요청 복구 저장소에 접근할 수 없습니다. 브라우저 저장소 설정을 확인해주세요.",
      );
    }
  }, [key]);
  const save = (value: T) => {
    // 저장 실패 시 실제 지급 요청도 시작하지 않는다.
    sessionStorage.setItem(key, JSON.stringify(value));
    setRequest(value);
  };
  const clear = () => {
    sessionStorage.removeItem(key);
    setRequest(null);
  };
  return { request, ready, storageError, save, clear };
}
