// lib/fetcher.ts
export interface FetcherOptions extends RequestInit {
  baseUrl?: string;
  query?: Record<string, string | number>;
}

export async function fetcher<T>(
  endpoint: string,
  { baseUrl = process.env.NEXT_PUBLIC_API_URL, query, headers, ...options }: FetcherOptions = {},
): Promise<T> {
  const url = new URL(baseUrl + endpoint, window.location.origin);

  // 쿼리 파라미터 붙이기
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...options,
  } as FetcherOptions);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.message || `API 요청 실패: ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
}
