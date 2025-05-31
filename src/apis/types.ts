// 공통 페이지 응답
export interface PaginatedResponse<T> {
  content: T[];
  totalCount: number;
  page: number;
  size: number;
}
