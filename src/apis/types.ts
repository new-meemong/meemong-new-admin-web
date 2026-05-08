// 공통 페이지 응답
export interface PaginatedResponse<T> {
  content: T[];
  totalCount: number;
  page: number;
  size: number;
}

export type ServerPaginatedPayload<T> = Partial<
  Omit<PaginatedResponse<T>, "content">
> & {
  content?: T[];
  dataList?: T[];
  dataCount?: number;
};

export type ServerPaginatedResponse<T> =
  | ServerPaginatedPayload<T>
  | { data: ServerPaginatedPayload<T> };

function getPaginatedPayload<T>(
  response: ServerPaginatedResponse<T>,
): ServerPaginatedPayload<T> {
  if (
    "data" in response &&
    typeof response.data === "object" &&
    response.data !== null
  ) {
    return response.data;
  }

  return response as ServerPaginatedPayload<T>;
}

export function normalizePaginatedResponse<T>(
  response: ServerPaginatedResponse<T>,
): PaginatedResponse<T> {
  const payload = getPaginatedPayload(response);
  const content = payload.content ?? payload.dataList ?? [];

  return {
    ...payload,
    content,
    totalCount: payload.totalCount ?? payload.dataCount ?? 0,
    page: payload.page ?? 1,
    size: payload.size ?? content.length,
  };
}
