export type SearchType =
  | "USERS_ID"
  | "NAME"
  | "NAME_EQUALS"
  | "PHONE"
  | "CONTENT"
  | "PROFILE_DESCRIPTION"
  | "BRAND"; // 검색 키워드 타입

export type PaginationType = {
  page: number;
  size: number;
};
