export const safeDecode = (v: string | null): string | null => {
  if (v == null) return v;
  try {
    // 이미 디코딩된 문자열일 수도 있으니, '%'가 있을 때만 시도해도 됨
    return v.includes("%") ? decodeURIComponent(v) : v;
  } catch {
    return v; // 잘못 인코딩된 경우 그대로 사용
  }
};
