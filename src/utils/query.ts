type Primitive = string | number | boolean | null;
type JsonLike = Primitive | JsonLike[] | { [k: string]: JsonLike };

export type NormalizeOptions<T extends Record<string, unknown>> = {
  /** undefined 키 제거 (기본값: true) */
  dropUndefined?: boolean;
  /** null 키 제거 (기본값: false) */
  dropNull?: boolean;
  /**
   * 배열 정렬 여부
   * - true: 모든 배열 정렬
   * - false: 정렬 안함
   * - Record: 특정 키만 정렬 여부 지정
   * 기본값: true
   */
  sortArrays?: boolean | Partial<Record<keyof T, boolean>>;
  /** 숫자로 캐스팅할 필드 키 목록 (예: ["page","size"]) */
  numericFields?: readonly (keyof T)[];
  /** Date → ISO 문자열로 캐스팅할 필드 키 목록 */
  dateFields?: readonly (keyof T)[];
};

const isPlainObj = (v: unknown): v is Record<string, unknown> =>
  Object.prototype.toString.call(v) === "[object Object]";

function normalizeArray(
  arr: unknown[],
  keyPath: string[],
  shouldSort: boolean,
): JsonLike[] {
  const normed = arr.map((item, idx) =>
    normalizeValue(item, keyPath.concat(String(idx)), shouldSort),
  );
  if (!shouldSort) return normed;

  // 안정 정렬: 원소가 원시값이면 기본 정렬, 객체면 JSON 문자열로 정렬
  return [...normed].sort((a, b) => {
    const sa = typeof a === "object" ? JSON.stringify(a) : String(a);
    const sb = typeof b === "object" ? JSON.stringify(b) : String(b);
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
}

function normalizeObject(
  obj: Record<string, unknown>,
  keyPath: string[],
  sortArraysGlobally: boolean,
): Record<string, JsonLike> {
  const out: Record<string, JsonLike> = {};
  for (const k of Object.keys(obj).sort()) {
    const v = obj[k];
    out[k] = normalizeValue(v, keyPath.concat(k), sortArraysGlobally);
  }
  return out;
}

function normalizeValue(
  v: unknown,
  keyPath: string[],
  sortArraysGlobally: boolean,
): JsonLike {
  if (v == null) return v as null; // null/undefined 그대로(필터링은 상위에서)
  if (Array.isArray(v)) return normalizeArray(v, keyPath, sortArraysGlobally);
  if (isPlainObj(v)) return normalizeObject(v, keyPath, sortArraysGlobally);
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "string")
    return v as Primitive;
  // 기타 타입(예: File, Map 등)은 안전하게 문자열화
  return String(v);
}

/**
 * 어떤 파라미터든 안정적으로 비교/캐싱 가능한 형태로 정규화
 */
export function normalizeParams<T extends Record<string, unknown>>(
  input: T,
  options: NormalizeOptions<T> = {},
): Readonly<T> & Readonly<Record<string, JsonLike>> {
  const {
    dropUndefined = true,
    dropNull = false,
    sortArrays = true,
    numericFields = [] as const,
    dateFields = [] as const,
  } = options;

  // 1) 1차 키 순서 고정 + 필드별 캐스팅(numeric/date) + undefined/null 필터링
  const firstPass: Record<string, unknown> = {};
  for (const key of Object.keys(input).sort() as (keyof T & string)[]) {
    const k = key as keyof T;
    let v: unknown = input[k];

    // 필터링(키 제외 여부는 여기서만 결정)
    if (v === undefined && dropUndefined) continue;
    if (v === null && dropNull) continue;

    // 숫자 캐스팅(문자열 숫자 → number)
    if (numericFields.includes(k) && typeof v === "string") {
      const n = Number(v);
      v = Number.isFinite(n) ? n : v;
    }

    // 날짜 캐스팅(Date → ISO)
    if (dateFields.includes(k) && v instanceof Date) {
      v = v.toISOString();
    }

    firstPass[key] = v;
  }

  // 2) 깊은 정규화(배열 정렬/내부 키 정렬 등)
  const sortArraysGlobally =
    typeof sortArrays === "boolean" ? sortArrays : true;

  const deeply: Record<string, JsonLike> = normalizeObject(
    firstPass,
    [],
    sortArraysGlobally,
  );

  // 3) 키별 배열 정렬 제어(옵션이 객체인 경우)
  if (typeof sortArrays === "object") {
    for (const key of Object.keys(deeply)) {
      const shouldSort = sortArrays[key as keyof T];
      const val: JsonLike = deeply[key];
      if (Array.isArray(val) && typeof shouldSort === "boolean") {
        deeply[key] = normalizeArray(val, [key], shouldSort);
      }
    }
  }

  // 구조적으로 T의 키 집합을 유지하지만 값은 JsonLike로 정규화됨
  return deeply as unknown as Readonly<T> &
    Readonly<Record<string, JsonLike>>;
}

/**
 * TanStack Query에서 사용할 때 편한 키 빌더
 * - baseKey는 문자열 혹은 문자열 배열(네임스페이스)
 */

// 구현
export function buildQueryKey<T extends Record<string, unknown>>(
  baseKey: string | readonly unknown[],
  params: T,
  options?: NormalizeOptions<T>,
) {
  const norm = normalizeParams(params, options);
  return Array.isArray(baseKey)
    ? ([...baseKey, norm] as const)
    : ([baseKey, norm] as const);
}
