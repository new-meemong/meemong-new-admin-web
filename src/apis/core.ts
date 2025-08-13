// lib/fetcher.ts
export interface FetcherOptions extends RequestInit {
  baseUrl?: string;
  query?: Record<string, string | number>;
}

export async function fetcher<T>(
  endpoint: string,
  {
    baseUrl = process.env.NEXT_PUBLIC_API_URL,
    query,
    headers,
    ...options
  }: FetcherOptions = {}
): Promise<T> {
  // API URL이 설정되지 않은 경우 에러 처리
  if (!baseUrl) {
    throw new Error(
      "API URL이 설정되지 않았습니다. NEXT_PUBLIC_API_URL 환경변수를 확인해주세요."
    );
  }

  const url = new URL(baseUrl + endpoint, window.location.origin);

  // 쿼리 파라미터 붙이기
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  // Authorization 설정
  const headersObject = headers as Record<string, unknown>;
  let authorization = headersObject?.Authorization;

  if (!authorization) {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (token) {
      authorization = token;
    }
  }

  // Request 로깅
  console.group("🚀 API Request");
  console.log("URL:", url.toString());
  console.log("Method:", options.method || "GET");
  console.log("Headers:", {
    "Content-Type": "application/json",
    ...headers,
    ...(authorization ? { Authorization: authorization } : {})
  });

  // Query parameters 로깅
  if (url.searchParams.toString()) {
    console.log(
      "Query Params:",
      Object.fromEntries(url.searchParams.entries())
    );
  }

  // Body 로깅 (POST, PUT, PATCH 요청의 경우)
  if (
    options.body &&
    ["POST", "PUT", "PATCH"].includes(options.method || "GET")
  ) {
    try {
      if (typeof options.body === "string") {
        const parsedBody = JSON.parse(options.body);
        console.log("Request Body:", parsedBody);
      } else {
        console.log("Request Body:", options.body);
      }
    } catch {
      console.log("Request Body (raw):", options.body);
    }
  }
  console.groupEnd();

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(authorization ? { Authorization: authorization } : {})
    },
    ...options
  } as FetcherOptions);

  // Response 로깅
  console.group("✅ API Response");
  console.log("URL:", url.toString());
  console.log("Method:", options.method || "GET");
  console.log("Status:", res.status, res.statusText);
  console.log("Response Headers:", Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    // Error Response 로깅
    console.group("❌ API Error");
    console.log("URL:", url.toString());
    console.log("Method:", options.method || "GET");
    console.log("Status:", res.status, res.statusText);

    // 응답이 JSON인지 확인
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorBody = await res.json().catch(() => ({}));
      console.log("Error Response Body:", errorBody);
      console.groupEnd(); // Error 로깅 그룹 종료
      console.groupEnd(); // Response 로깅 그룹 종료
      throw new Error(
        errorBody?.message || `API 요청 실패: ${res.status} ${res.statusText}`
      );
    } else {
      // HTML 응답인 경우 (서버 에러 페이지 등)
      const errorText = await res.text();
      console.log("Error Response Body (HTML):", errorText.substring(0, 200));
      console.groupEnd(); // Error 로깅 그룹 종료
      console.groupEnd(); // Response 로깅 그룹 종료
      throw new Error(
        `서버 에러: ${res.status} ${res.statusText}. API URL을 확인해주세요.`
      );
    }
  }

  // Success Response Body 로깅
  try {
    const responseClone = res.clone();
    const body = await responseClone.text();
    if (body) {
      try {
        const parsedBody = JSON.parse(body);
        console.log("Response Body:", parsedBody);
      } catch {
        console.log("Response Body (raw):", body);
      }
    }
  } catch (error) {
    console.log("Response Body: [Unable to read]", error);
  }

  console.groupEnd(); // Response 로깅 그룹 종료

  return res.json();
}
