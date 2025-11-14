export interface FetcherOptions extends RequestInit {
  baseUrl?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** 편의: json 객체를 넣으면 자동 직렬화 + 헤더 설정 */
  json?: unknown;
}

function buildUrl(
  base: string,
  endpoint: string,
  query?: FetcherOptions["query"]
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

/**
 * 개발 환경에서 API 로그를 출력합니다.
 */
function logApiRequest(
  method: string,
  url: string,
  headers: Headers,
  body: BodyInit | undefined
) {
  if (process.env.NODE_ENV !== "development") return;

  const maskedHeaders = new Headers(headers);
  // Authorization 토큰 마스킹
  if (maskedHeaders.has("Authorization")) {
    const auth = maskedHeaders.get("Authorization") || "";
    maskedHeaders.set(
      "Authorization",
      auth.length > 20 ? `${auth.substring(0, 10)}...${auth.slice(-5)}` : "***"
    );
  }

  console.group(
    `%c[API Request] %c${method} %c${url}`,
    "color: #3498db; font-weight: bold;",
    "color: #9b59b6; font-weight: bold;",
    "color: #34495e;"
  );
  console.log("📤 Headers:", Object.fromEntries(maskedHeaders.entries()));
  if (body) {
    try {
      const bodyText =
        typeof body === "string"
          ? body
          : body instanceof FormData
            ? "[FormData]"
            : "[Binary]";
      const parsedBody =
        bodyText.startsWith("{") || bodyText.startsWith("[")
          ? JSON.parse(bodyText)
          : bodyText;
      console.log("📦 Body:", parsedBody);
    } catch {
      console.log("📦 Body:", body);
    }
  }
  console.groupEnd();
}

/**
 * 개발 환경에서 API 응답 로그를 출력합니다.
 */
function logApiResponse(
  method: string,
  url: string,
  status: number,
  duration: number,
  data: unknown
) {
  if (process.env.NODE_ENV !== "development") return;

  const isSuccess = status >= 200 && status < 300;
  const statusColor = isSuccess ? "#2ecc71" : "#e74c3c";

  console.group(
    `%c[API Response] %c${method} %c${url} %c${status} %c(${duration}ms)`,
    "color: #2ecc71; font-weight: bold;",
    "color: #9b59b6; font-weight: bold;",
    "color: #34495e;",
    `color: ${statusColor}; font-weight: bold;`,
    "color: #95a5a6;"
  );
  console.log("📥 Response:", data);
  console.groupEnd();
}

/**
 * 개발 환경에서 API 에러 로그를 출력합니다.
 */
function logApiError(
  method: string,
  url: string,
  status: number,
  duration: number,
  error: unknown
) {
  if (process.env.NODE_ENV !== "development") return;

  console.group(
    `%c[API Error] %c${method} %c${url} %c${status} %c(${duration}ms)`,
    "color: #e74c3c; font-weight: bold;",
    "color: #9b59b6; font-weight: bold;",
    "color: #34495e;",
    "color: #e74c3c; font-weight: bold;",
    "color: #95a5a6;"
  );
  console.error("❌ Error:", error);
  console.groupEnd();
}

export async function fetcher<T>(
  endpoint: string,
  {
    baseUrl = process.env.NEXT_PUBLIC_API_URL!,
    query,
    headers,
    json,
    ...options
  }: FetcherOptions = {}
): Promise<T> {
  if (!baseUrl) {
    throw new Error(
      "API URL이 설정되지 않았습니다. NEXT_PUBLIC_API_URL 환경변수를 확인해주세요."
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
          "application/x-www-form-urlencoded;charset=UTF-8"
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

  // 요청 시간 측정 시작
  const startTime = performance.now();
  const method = options.method || "GET";

  // API 요청 로그 출력
  logApiRequest(method, url, hdrs, body);

  try {
    const res = await fetch(url, { ...options, headers: hdrs, body });
    const duration = Math.round(performance.now() - startTime);

    // 응답 데이터 추출 (에러 처리 전에 미리 읽어야 함)
    const respCt = res.headers.get("content-type") || "";
    let responseData: unknown = null;

    if (res.status === 204) {
      responseData = null;
    } else if (respCt.includes("application/json")) {
      try {
        responseData = await res.json();
      } catch {
        responseData = await res.text();
      }
    } else {
      responseData = await res.text();
    }

    if (!res.ok) {
      // 에러 응답 로그 출력
      logApiError(method, url, res.status, duration, responseData);
      const errJson = responseData as Record<string, string>;
      throw new Error(
        errJson?.message || `API 요청 실패: ${res.status} ${res.statusText}`
      );
    }

    // 성공 응답 로그 출력
    logApiResponse(method, url, res.status, duration, responseData);

    if (res.status === 204) return null as unknown as T;
    return responseData as T;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    // 네트워크 에러 등 예외 상황 로그 출력
    if (error instanceof Error && error.message.includes("API 요청 실패")) {
      // 이미 logApiError에서 처리됨
    } else {
      logApiError(method, url, 0, duration, error);
    }
    throw error;
  }
}
