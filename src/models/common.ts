export type SearchType = "UID" | "NAME" | "NAME_EQUALS" | "PHONE" | "CONTENT" | "PROFILE_DESCRIPTION"; // 검색 키워드 타입

export type PaginationType = {
  page: number;
  size: number;
};
