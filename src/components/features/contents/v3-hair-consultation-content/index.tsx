"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import CommonTable from "@/components/shared/common-table";
import SelectBox from "@/components/shared/select-box";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useContentsCursorPagination from "@/components/features/contents/hooks/useContentsCursorPagination";
import {
  useV3Consultations,
  useV3Statistics,
  v3ConsultationKeys,
} from "@/queries/v3HairConsultations";
import type { V3ConsultationFilters } from "@/apis/v3HairConsultations";
import type { V3ConsultationListItem } from "@/models/v3HairConsultations";
import { cn } from "@/lib/utils";
import {
  CursorPagination,
  QueryStatus,
  Rating,
  Section,
  ConsultationTypeBadge,
  date,
  label,
  paymentTypes,
  percent,
  readSummary,
} from "./presentation";
import V3ConsultationDetailModal from "./detail-modal";

const DEFAULT_FILTERS = {
  searchType: "NAME",
  searchKeyword: "",
  userId: "",
  consultationType: "ALL",
  visibility: "ALL",
} as const;
type FilterForm = {
  searchType: "NAME" | "PHONE";
  searchKeyword: string;
  userId: string;
  consultationType: "ALL" | "QUICK" | "DEEP";
  visibility: "ALL" | "VISIBLE" | "WITHDRAWN";
};

export default function V3HairConsultationContent({
  className,
}: {
  className?: string;
}) {
  const [draft, setDraft] = useState<FilterForm>(DEFAULT_FILTERS);
  const [filters, setFilters] = useState<V3ConsultationFilters>({
    visibility: "ALL",
  });
  const [filterError, setFilterError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const pagination = useContentsCursorPagination({ initialPageSize: 20 });
  const list = useV3Consultations({
    ...filters,
    __limit: pagination.pageSize,
    __nextCursor: pagination.currentCursor,
  });
  const statistics = useV3Statistics(filters);
  const client = useQueryClient();
  const columns: ColumnDef<V3ConsultationListItem>[] = [
    {
      accessorKey: "id",
      header: "상담 ID",
      size: 90,
      cell: ({ row }) => (
        <button
          type="button"
          className="cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-500"
          aria-label={`상담 ${row.original.id} 상세 열기`}
        >
          {row.original.id}
        </button>
      ),
    },
    {
      accessorKey: "consultationType",
      header: "상담 유형",
      size: 140,
      cell: ({ row }) => (
        <ConsultationTypeBadge type={row.original.consultationType} />
      ),
    },
    {
      accessorKey: "customerType",
      header: "상담 종류",
      cell: ({ row }) => label(row.original.customerType),
    },
    { accessorKey: "userId", header: "작성자 ID", size: 100 },
    {
      id: "name",
      header: "작성자",
      cell: ({ row: { original: item } }) =>
        `${item.user?.displayName ?? "정보 없음"}${item.user?.deletedAt ? " (탈퇴)" : ""}`,
    },
    {
      id: "phone",
      header: "전화번호",
      size: 135,
      cell: ({ row }) => row.original.user?.phone ?? "-",
    },
    {
      id: "visibility",
      header: "공개 상태",
      size: 90,
      cell: ({ row }) => (row.original.withdrawnAt ? "숨김" : "공개"),
    },
    {
      accessorKey: "answerCount",
      header: "받은 답변",
      size: 90,
      cell: ({ row }) => `${row.original.answerCount}개`,
    },
    {
      id: "payment",
      header: "결제 여부",
      size: 90,
      cell: ({ row }) =>
        row.original.deepStatistics
          ? row.original.deepStatistics.payment.isPaid
            ? "결제"
            : "미결제"
          : "-",
    },
    {
      id: "paymentType",
      header: "결제 수단",
      size: 130,
      cell: ({ row }) =>
        row.original.deepStatistics
          ? paymentTypes(
              row.original.deepStatistics.payment.purchaseList.map(
                (purchase) => purchase.paymentType,
              ),
            )
          : "-",
    },
    {
      id: "read",
      header: "답변 열람",
      size: 120,
      cell: ({ row }) =>
        row.original.deepStatistics
          ? readSummary(row.original.deepStatistics.read)
          : "-",
    },
    {
      id: "rate",
      header: "답변 구매율",
      size: 100,
      cell: ({ row }) =>
        percent(row.original.deepStatistics?.payment.paymentRate),
    },
    {
      id: "rating",
      header: "평균 별점",
      size: 90,
      cell: ({ row }) =>
        row.original.deepStatistics?.rating.averageRating ?? "-",
    },
    {
      accessorKey: "createdAt",
      header: "등록일 (KST)",
      size: 180,
      cell: ({ row }) => date(row.original.createdAt),
    },
  ] satisfies ColumnDef<V3ConsultationListItem>[];
  for (const column of columns) column.enableSorting = false;
  function submit() {
    if (
      draft.userId &&
      (!/^\d+$/.test(draft.userId) ||
        !Number.isSafeInteger(Number(draft.userId)) ||
        Number(draft.userId) < 1)
    ) {
      setFilterError("작성자 ID는 양의 정수로 입력해주세요.");
      return;
    }
    setFilterError("");
    pagination.resetPagination();
    setFilters({
      searchType: draft.searchKeyword.trim() ? draft.searchType : undefined,
      searchKeyword: draft.searchKeyword.trim() || undefined,
      userId: draft.userId ? Number(draft.userId) : undefined,
      consultationType:
        draft.consultationType === "ALL" ? undefined : draft.consultationType,
      visibility: draft.visibility,
    });
  }
  return (
    <div className={cn("space-y-5", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-wrap items-end gap-3 rounded-xl border p-4 bg-white"
      >
        <label className="space-y-2 text-sm">
          검색 기준
          <SelectBox
            name="searchType"
            value={draft.searchType}
            options={[
              { value: "NAME", label: "이름" },
              { value: "PHONE", label: "전화번호" },
            ]}
            onChange={({ value }) =>
              setDraft({
                ...draft,
                searchType: value as FilterForm["searchType"],
              })
            }
          />
        </label>
        <label className="space-y-2 text-sm">
          검색어 (정확히 일치)
          <Input
            aria-label="검색어"
            value={draft.searchKeyword}
            onChange={(e) =>
              setDraft({ ...draft, searchKeyword: e.target.value })
            }
            placeholder={
              draft.searchType === "PHONE" ? "전체 전화번호" : "이름 전체"
            }
          />
        </label>
        <label className="space-y-2 text-sm">
          작성자 ID
          <Input
            aria-label="작성자 ID"
            inputMode="numeric"
            value={draft.userId}
            onChange={(e) => setDraft({ ...draft, userId: e.target.value })}
            className="w-28"
          />
        </label>
        <label className="space-y-2 text-sm">
          상담 유형
          <SelectBox
            name="consultationType"
            value={draft.consultationType}
            options={[
              { value: "ALL", label: "전체" },
              { value: "QUICK", label: label("QUICK") },
              { value: "DEEP", label: label("DEEP") },
            ]}
            onChange={({ value }) =>
              setDraft({
                ...draft,
                consultationType: value as FilterForm["consultationType"],
              })
            }
          />
        </label>
        <label className="space-y-2 text-sm">
          공개 상태
          <SelectBox
            name="visibility"
            value={draft.visibility}
            options={[
              { value: "ALL", label: "전체" },
              { value: "VISIBLE", label: "공개" },
              { value: "WITHDRAWN", label: "숨김" },
            ]}
            onChange={({ value }) =>
              setDraft({
                ...draft,
                visibility: value as FilterForm["visibility"],
              })
            }
          />
        </label>
        <Button type="submit">검색</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDraft(DEFAULT_FILTERS);
            setFilters({ visibility: "ALL" });
            setFilterError("");
            pagination.resetPagination();
          }}
        >
          초기화
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void client.invalidateQueries({ queryKey: v3ConsultationKeys.all })
          }
        >
          새로고침
        </Button>
        {filterError && (
          <p role="alert" className="w-full text-sm text-red-600">
            {filterError}
          </p>
        )}
      </form>
      <Section title="전체 심층 컨설팅 통계">
        <p className="text-sm text-gray-500">
          검색한 작성자·공개 상태에 해당하는 모든 심층 컨설팅 기준입니다.
          간편상담과 페이지 조건은 제외됩니다.
        </p>
        <QueryStatus
          pending={statistics.isPending}
          error={statistics.error}
          retry={() => void statistics.refetch()}
        />
        {statistics.data && !statistics.isError && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                ["심층 컨설팅", `${statistics.data.consultationCount}건`],
                ["결제 상담", `${statistics.data.paidConsultationCount}건`],
                ["결제 전환율", percent(statistics.data.paymentRate)],
              ].map(([title, value]) => (
                <div key={title} className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">{title}</p>
                  <p className="mt-2 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <Rating rating={statistics.data.rating} />
          </>
        )}
        <p className="text-xs text-gray-500">
          결제 전환율 = 결제 발생 상담 / 전체 심층 컨설팅. 검증 성공·미환불 구매
          기준이며 미몽패스 무료 열람은 제외합니다. 숨긴 답변 이력은 포함하고
          숨긴 별점은 제외합니다.
        </p>
      </Section>
      <div className="flex justify-between text-sm">
        <h2 className="font-semibold">v3 헤어컨설팅</h2>
        <span>현재 페이지 {list.data?.dataCount ?? 0}건 · ID 내림차순</span>
      </div>
      <QueryStatus
        pending={list.isPending}
        error={list.error}
        retry={() => void list.refetch()}
      />
      {!list.isPending && !list.isError && (
        <div className="overflow-x-auto">
          <div className="min-w-[1740px]">
            <CommonTable
              data={list.data?.dataList ?? []}
              columns={columns}
              onClickRow={({ original }) => setSelectedId(original.id)}
            />
          </div>
        </div>
      )}
      <CursorPagination
        pagination={pagination}
        data={list.data}
        busy={list.isFetching || list.isError}
      />
      {selectedId !== null && (
        <V3ConsultationDetailModal
          key={selectedId}
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
