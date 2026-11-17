import { useEffect, useRef } from "react";

/** Reuses the keyword field for author IDs without changing API search types. */
export default function useContentSearchInput(
  searchType: string | undefined,
  value = "",
) {
  const ref = useRef<HTMLInputElement>(null);
  const isUserId = searchType === "USER_ID";
  useEffect(() => {
    ref.current?.setCustomValidity(
      isUserId &&
        value &&
        (!/^\d+$/.test(value) ||
          !Number.isSafeInteger(Number(value)) ||
          Number(value) < 1)
        ? "userId는 양의 정수로 입력해주세요."
        : "",
    );
  }, [isUserId, value]);
  return {
    ref,
    inputMode: isUserId ? ("numeric" as const) : undefined,
    pattern: isUserId ? "[0-9]+" : undefined,
  };
}

export function getContentSearchQuery<T extends string>(
  searchType: T | "USER_ID" | undefined,
  searchKeyword = "",
) {
  if (searchType === "USER_ID") {
    return { userId: searchKeyword ? Number(searchKeyword) : undefined };
  }
  return {
    searchType: searchType as Exclude<T, "USER_ID"> | undefined,
    searchKeyword,
  };
}
