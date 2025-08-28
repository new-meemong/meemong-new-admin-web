export interface FetcherOptions extends RequestInit {
  baseUrl?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** 편의: json 객체를 넣으면 자동 직렬화 + 헤더 설정 */
  json?: unknown;
}

function buildUrl(
  base: string,
  endpoint: string,
  query?: FetcherOptions["query"],
) {
  const baseFixed = base.endsWith("/") ? base : base + "/";
  const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = new URL(baseFixed + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
    });
  }
  return url.toString();
}

function getAccessTokenFromCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("accessToken="))
    ?.split("=")[1];
}

export async function fetcher<T>(
  endpoint: string,
  {
    baseUrl = process.env.NEXT_PUBLIC_API_URL!,
    query,
    headers,
    json,
    ...options
  }: FetcherOptions = {},
): Promise<T> {
  if (!baseUrl) {
    throw new Error(
      "API URL이 설정되지 않았습니다. NEXT_PUBLIC_API_URL 환경변수를 확인해주세요.",
    );
  }

  const url = buildUrl(baseUrl, endpoint, query);
  const hdrs = new Headers(headers);

  // Authorization 자동 주입(없을 때만)
  if (!hdrs.has("Authorization")) {
    const token = getAccessTokenFromCookie();
    if (token) hdrs.set("Authorization", token);
  }

  // ---- Body 구성 (정확한 타입 보장) ----
  let body: BodyInit | undefined = undefined;

  if (json !== undefined) {
    // json 옵션이 들어오면 우선 적용
    body = JSON.stringify(json);
    if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", "application/json");
  } else if (options.body != null) {
    // 사용자가 RequestInit.body를 직접 준 경우 처리
    const raw: unknown = options.body;

    // FormData/Blob/URLSearchParams/ArrayBuffer류/문자열/기타 객체
    if (typeof FormData !== "undefined" && raw instanceof FormData) {
      body = raw; // boundary 자동
      if (hdrs.has("Content-Type")) hdrs.delete("Content-Type");
    } else if (typeof Blob !== "undefined" && raw instanceof Blob) {
      body = raw;
      if (hdrs.has("Content-Type")) hdrs.delete("Content-Type");
    } else if (
      typeof URLSearchParams !== "undefined" &&
      raw instanceof URLSearchParams
    ) {
      body = raw;
      if (!hdrs.has("Content-Type")) {
        hdrs.set(
          "Content-Type",
          "application/x-www-form-urlencoded;charset=UTF-8",
        );
      }
    } else if (
      raw instanceof ArrayBuffer ||
      (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(raw as unknown))
    ) {
      // ArrayBuffer/TypedArray 등 바이너리류
      body = raw as BodyInit;
      // Content-Type은 호출자가 필요 시 지정
    } else if (typeof raw === "string") {
      body = raw; // 문자열은 그대로 사용
      if (!hdrs.has("Content-Type")) {
        // 기본은 JSON로 가정 (요청: "헤더 따로 설정 안했으면 application/json")
        hdrs.set("Content-Type", "application/json");
      }
    } else {
      // 그 외 일반 객체로 간주 → JSON 직렬화
      body = JSON.stringify(raw as Record<string, unknown>);
      if (!hdrs.has("Content-Type"))
        hdrs.set("Content-Type", "application/json");
    }
  } else {
    // body가 없는 경우에도 기본 Content-Type은 json로(요청사항 반영)
    if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers: hdrs, body });

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      let errJson = {} as unknown as Record<string, string>;
      try {
        errJson = await res.json();
      } catch {}
      throw new Error(
        errJson?.message || `API 요청 실패: ${res.status} ${res.statusText}`,
      );
    }
    const text = await res.text().catch(() => "");
    throw new Error(
      text ||
        `서버 에러: ${res.status} ${res.statusText}. API URL을 확인해주세요.`,
    );
  }

  if (res.status === 204) return null as unknown as T;

  const respCt = res.headers.get("content-type") || "";
  if (respCt.includes("application/json")) {
    return (await res.json()) as T;
  }
  const text = await res.text();
  return text as unknown as T;
}
