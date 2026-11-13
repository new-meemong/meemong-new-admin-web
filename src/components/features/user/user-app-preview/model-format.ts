import type { UserModelInfo } from "@/models/user-profile";

// Flutter ModelProfileInfoMapper / HairLengthMapper의 표시 규칙.
const clean = (value: string | null | undefined) =>
  !value || value.trim().toLowerCase() === "null" ? "" : value.trim();
export function modelHairLength(value: string | null | undefined) {
  const raw = clean(value);
  return (
    (
      {
        "턱선 위": "단발",
        "턱선 아래": "중단발",
        "어깨 위": "미디엄",
        "어깨 아래": "미디엄 롱",
        미디엄롱: "미디엄 롱",
        "가슴선 아래": "롱",
      } as Record<string, string>
    )[raw] ?? raw
  );
}
export function modelPersonalColor(value: string | null | undefined) {
  const parts = clean(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length === 1 && parts[0] === "잘모름"
    ? "퍼스널컬러 모름"
    : parts.join(", ");
}
export function modelHopePrice(info: UserModelInfo["modelInfoHopePrice"]) {
  const raw = clean(info?.priceType);
  if (!raw) return "";
  const label = [
    "비용 지불가능",
    "재료비는 낼 수 있어요",
    "비용지불 가능해요",
    "재료비 발생",
  ].includes(raw)
    ? "재료비"
    : ["무료 시술 받을래요", "무료시술", "무료시술 원해요"].includes(raw)
      ? "무료시술 원해요"
      : [
            "모델페이 원해요",
            "모델비 받을래요",
            "모델페이",
            "모델료",
            "모델비",
          ].includes(raw)
        ? "모델페이"
        : raw;
  return label !== "무료시술 원해요" && info?.price != null && info.price > 0
    ? `${label} · ${info.price.toLocaleString("ko-KR")}원`
    : label;
}
export function modelShooting(info: UserModelInfo["modelInfoShootingType"]) {
  const raw = clean(info?.shootingType);
  if (!raw) return "";
  const groups = [
    ["촬영을 원하지 않아요", "촬영 없음", "촬영없음"],
    ["헤어 촬영", "사진"],
    ["얼굴 촬영", "모델 촬영", "짧은영상"],
    ["연출 촬영", "연출 콘텐츠"],
    ["상관없음", "상관 없음", "촬영타입 상관없음"],
  ];
  return (
    groups.find((group) => group.includes(raw))?.[0] ??
    [raw, clean(info?.shootingRange)].filter(Boolean).join(" · ")
  );
}
export function modelReviews(info: UserModelInfo["modelInfoReviewType"]) {
  if (!info) return [];
  const labels: Record<string, string> = {
    "카카오맵 리뷰": "카카오 리뷰",
    "구글맵 리뷰": "구글 리뷰",
    "인스타 릴스": "릴스",
    "기타(직접입력)": "기타",
  };
  const values = (info.reviewTypeList ?? [])
    .map((value) => labels[clean(value)] ?? clean(value))
    .map((value) =>
      value.includes("기타") && clean(info.reviewTypeDescription)
        ? `기타: ${clean(info.reviewTypeDescription)}`
        : value,
    );
  return [...new Set([...values, clean(info.description)].filter(Boolean))];
}
