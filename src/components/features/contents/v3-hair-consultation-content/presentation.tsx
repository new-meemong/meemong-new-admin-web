import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import CommonPagination from "@/components/shared/common-pagination";
import useContentsCursorPagination from "@/components/features/contents/hooks/useContentsCursorPagination";
import type { V3CursorResponse } from "@/apis/v3HairConsultations";
import type {
  V3ConsultationType,
  V3ConsultationImage,
  V3RatingStatistics,
} from "@/models/v3HairConsultations";

const LABELS: Record<string, string> = {
  QUICK: "간편상담",
  DEEP: "심층 컨설팅",
  CONSULTING: "전체 컨설팅",
  PARTIAL_STYLE: "부분 스타일",
  PARTIAL_COLOR: "부분 컬러",
  QUOTE_EXTENSION: "붙임머리 견적",
  QUOTE_OTHER: "기타 견적",
  PARTIAL: "부분 상담",
  QUOTE: "견적",
  ASAP: "최대한 빨리",
  WITHIN_WEEK: "일주일 이내",
  NEGOTIABLE: "협의 가능",
  CUSTOM: "직접 입력",
  FIXED: "스타일 확정",
  UNKNOWN: "미정",
  STYLE: "스타일",
  COLOR: "컬러",
  EXTENSION: "붙임머리",
  PAID: "유료",
  QUICK_FREE: "간편상담 무료",
  FREE_OVERFLOW: "초과 무료",
  CURRENT: "현재 사진",
  ASPIRATION: "희망 사진",
  FRONT: "정면",
  SIDE: "측면",
  HAIR: "모발",
  UPLOAD: "업로드",
  PORTFOLIO: "포트폴리오",
  CAPACITY_REACHED: "답변 모집 완료",
  CUSTOMER_CLOSED: "고객 종료",
  EXPIRED: "기간 만료",
};
export const label = (value?: string | null) =>
  value ? (LABELS[value] ?? value) : "-";
export const percent = (value?: number | null) =>
  value == null ? "-" : `${value}%`;
export const date = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
    : "-";
export const money = (value?: number | null) =>
  value == null ? "-" : `${value.toLocaleString("ko-KR")}원`;
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-5 space-y-4">
      <h3 className="font-semibold text-base">{title}</h3>
      {children}
    </section>
  );
}
export function Fields({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
      {rows.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[130px_1fr] gap-3">
          <dt className="text-gray-500">{key}</dt>
          <dd className="whitespace-pre-wrap break-words">
            {value === null || value === undefined || value === ""
              ? "-"
              : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function Rating({ rating }: { rating: V3RatingStatistics }) {
  return (
    <div className="space-y-2 text-sm">
      <p>
        평균 별점 <strong>{rating.averageRating ?? "-"}</strong> · 평가 답변{" "}
        {rating.ratedAnswerCount}건
      </p>
      <div className="flex gap-4 flex-wrap">
        {rating.ratingCountList.map((item) => (
          <span key={item.rating}>
            {item.rating}점 <strong>{item.count}건</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
export function Images({ images }: { images: V3ConsultationImage[] }) {
  if (!images.length)
    return <p className="text-sm text-gray-500">등록된 사진이 없습니다.</p>;
  return (
    <div className="flex flex-wrap gap-4">
      {images.map((image, i) => (
        <figure key={image.id} className="space-y-2">
          <a
            href={image.imageUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`사진 ${i + 1} 원본 보기`}
          >
            {/* 원본 URL을 그대로 사용해 관리자에게 전체 사진을 제공합니다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.imageUrl}
              alt={`${label(image.type ?? image.source)} ${label(image.subType)} ${i + 1}`}
              loading="lazy"
              className="w-36 h-36 rounded-lg border object-contain"
            />
          </a>
          <figcaption className="text-xs text-gray-500">
            {label(image.type ?? image.source)}{" "}
            {image.subType && label(image.subType)}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
export function QueryStatus({
  pending,
  error,
  retry,
}: {
  pending: boolean;
  error: Error | null;
  retry: () => void;
}) {
  if (error)
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm"
      >
        {error.message}{" "}
        <Button variant="outline" size="sm" onClick={retry}>
          다시 시도
        </Button>
      </div>
    );
  if (pending)
    return (
      <p role="status" className="p-4 text-sm text-gray-500">
        불러오는 중...
      </p>
    );
  return null;
}
export function CursorPagination({
  pagination,
  data,
  busy,
}: {
  pagination: ReturnType<typeof useContentsCursorPagination>;
  data?: V3CursorResponse<unknown>;
  busy: boolean;
}) {
  return (
    <CommonPagination
      currentPage={pagination.currentPage}
      pageSize={pagination.pageSize}
      totalCount={pagination.getReachableTotalCount(data)}
      canChangePage={(page) =>
        !busy && pagination.canChangePage(page, data?.__nextCursor)
      }
      onPageChange={(page) =>
        pagination.handlePageChange(page, data?.__nextCursor)
      }
      onSizeChange={pagination.handleSizeChange}
    />
  );
}

export function ConsultationTypeBadge({ type }: { type: V3ConsultationType }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${type === "QUICK" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
    >
      {label(type)}
    </span>
  );
}
