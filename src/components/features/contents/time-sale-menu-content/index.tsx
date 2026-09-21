"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import React, { useCallback, useState } from "react";

import CommonPagination from "@/components/shared/common-pagination";
import CommonTable from "@/components/shared/common-table";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import {
  ITimeSaleMenu,
  TimeSaleMenuSearchType,
  TimeSaleMenuOrderBy,
  TimeSaleMenuTreatmentType,
  TIME_SALE_MENU_TREATMENT_TYPES,
} from "@/models/timeSaleMenus";
import {
  SearchForm,
  SearchFormInput,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  formatTimeSaleMenuReservationRate,
  formatTimeSaleMenuAnalysisTreatmentType,
} from "@/utils/timeSaleMenus";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { formatPrice } from "@/utils/price";
import { useGetTimeSaleMenusQuery } from "@/queries/timeSaleMenus";
import { useModal } from "@/components/shared/modal/useModal";

const TimeSaleMenuDetailModal = dynamic(
  () =>
    import(
      "@/components/features/contents/contents-detail-modal/time-sale-menu-detail-modal"
    ),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div className="flex items-center gap-3 rounded-xl bg-white p-6 shadow-xl">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          리뷰특가 상세를 불러오는 중입니다.
        </div>
      </div>
    ),
  },
);

type TimeSaleMenuFilterParams = {
  searchType: TimeSaleMenuSearchType;
  searchKeyword: string;
  orderBy: TimeSaleMenuOrderBy;
  createdAtStartKST: string;
  createdAtEndKST: string;
  treatmentTypes: TimeSaleMenuTreatmentType[];
};

const DEFAULT_FILTER_PARAMS: TimeSaleMenuFilterParams = {
  searchType: "NICKNAME",
  searchKeyword: "",
  orderBy: "latest",
  createdAtStartKST: "",
  createdAtEndKST: "",
  treatmentTypes: [],
};

const SEARCH_TYPE_OPTIONS: {
  value: TimeSaleMenuSearchType;
  label: string;
}[] = [
  { value: "NICKNAME", label: "닉네임" },
  { value: "PHONE", label: "연락처" },
  { value: "TITLE", label: "제목" },
  { value: "CONTENT", label: "내용" },
];

const COLUMNS: ColumnDef<ITimeSaleMenu>[] = [
  {
    accessorKey: "id",
    header: "메뉴 넘버",
    cell: (info) => info.getValue(),
    size: 100,
    enableSorting: false,
  },
  {
    id: "nickname",
    accessorFn: (item) =>
      item.userInfo?.displayName ?? item.designer?.displayName ?? "-",
    header: "닉네임",
    cell: (info) => info.getValue(),
    size: 130,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "제목",
    cell: (info) => (
      <span
        className="block truncate cursor-pointer text-secondary-foreground hover:underline"
        title={info.getValue() as string}
      >
        {info.getValue() as string}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "treatmentType",
    header: "시술 종류",
    cell: (info) => {
      const label = formatTimeSaleMenuAnalysisTreatmentType(
        info.getValue() as string | null,
      );
      return (
        <span className="block truncate" title={label}>
          {label}
        </span>
      );
    },
    size: 185,
    enableSorting: false,
  },
  ...(
    [
      ["viewCount", "조회수"],
      ["reservationRequestCount", "요청수"],
      ["reservationAcceptedCount", "수락수"],
    ] as const
  ).map(
    ([accessorKey, header]): ColumnDef<ITimeSaleMenu> => ({
      accessorKey,
      header,
      size: 95,
      enableSorting: false,
      cell: (info) =>
        (info.getValue() as number | undefined)?.toLocaleString("ko-KR") ?? "-",
    }),
  ),
  {
    accessorKey: "reservationRate",
    header: "예약률",
    cell: (info) =>
      formatTimeSaleMenuReservationRate(info.getValue() as number | undefined),
    size: 95,
    enableSorting: false,
  },
  {
    accessorKey: "originalPrice",
    header: "원가",
    cell: (info) => formatPrice(info.getValue() as number),
    size: 110,
    enableSorting: false,
  },
  {
    accessorKey: "discountPrice",
    header: "할인가",
    cell: (info) => formatPrice(info.getValue() as number),
    size: 110,
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "등록일",
    cell: (info) => formatDate(info.getValue() as string, "YY.MM.DD") ?? "-",
    size: 100,
    enableSorting: false,
  },
  {
    accessorKey: "updatedAt",
    header: "최종수정일",
    size: 110,
    enableSorting: false,
    cell: (info) => formatDate(info.getValue() as string, "YY.MM.DD") ?? "-",
  },
];

interface TimeSaleMenuContentProps {
  className?: string;
}

export default function TimeSaleMenuContent({
  className,
}: TimeSaleMenuContentProps) {
  const modal = useModal();
  const [selectedTimeSaleMenu, setSelectedTimeSaleMenu] =
    useState<ITimeSaleMenu | null>(null);
  const [filters, setFilters] = useState<TimeSaleMenuFilterParams>(
    DEFAULT_FILTER_PARAMS,
  );
  const [submittedFilters, setSubmittedFilters] =
    useState<TimeSaleMenuFilterParams>(DEFAULT_FILTER_PARAMS);
  const [page, setPage] = useState(DEFAULT_PAGINATION.page);
  const [size, setSize] = useState(DEFAULT_PAGINATION.size);

  const submittedSearchKeyword = submittedFilters.searchKeyword.trim();
  const getTimeSaleMenusQuery = useGetTimeSaleMenusQuery({
    ...(submittedSearchKeyword && {
      searchType: submittedFilters.searchType,
      searchKeyword: submittedSearchKeyword,
    }),
    orderBy: submittedFilters.orderBy,
    createdAtStartKST: submittedFilters.createdAtStartKST,
    createdAtEndKST: submittedFilters.createdAtEndKST,
    treatmentTypes: submittedFilters.treatmentTypes,
    page,
    size,
  });

  const [filterError, setFilterError] = useState("");
  const handleSearch = useCallback(() => {
    if (
      filters.createdAtStartKST &&
      filters.createdAtEndKST &&
      filters.createdAtStartKST > filters.createdAtEndKST
    ) {
      setFilterError("등록일 종료일은 시작일 이후로 선택해주세요.");
      return;
    }
    setFilterError("");
    const nextFilters = {
      ...filters,
      searchKeyword: filters.searchKeyword.trim(),
    };

    setFilters(nextFilters);
    setSubmittedFilters(nextFilters);
    setPage(DEFAULT_PAGINATION.page);
  }, [filters]);

  const handleReset = useCallback(() => {
    setFilterError("");
    setFilters(DEFAULT_FILTER_PARAMS);
    setSubmittedFilters(DEFAULT_FILTER_PARAMS);
    setPage(DEFAULT_PAGINATION.page);
  }, []);

  const handleSearchTypeChange = useCallback(
    ({ value }: { key: keyof TimeSaleMenuFilterParams; value: string }) => {
      setFilters((previous) => ({
        ...previous,
        searchType: value as TimeSaleMenuSearchType,
      }));
    },
    [],
  );

  const handleSearchKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((previous) => ({
        ...previous,
        searchKeyword: event.target.value,
      }));
    },
    [],
  );

  const handleClickRow = useCallback(
    (row: Row<ITimeSaleMenu>) => {
      setSelectedTimeSaleMenu(row.original);
      modal.open();
    },
    [modal],
  );

  const handleClose = useCallback(() => {
    modal.close();
    setSelectedTimeSaleMenu(null);
  }, [modal]);

  return (
    <div
      className={cn(
        "time-sale-menu-content flex min-w-0 flex-col gap-4",
        className,
      )}
    >
      <SearchForm
        onSubmit={handleSearch}
        onRefresh={handleReset}
        className="h-auto w-full mb-0 [&_form]:w-full [&_.search-form-content]:w-full [&_.search-form-content]:min-w-0 [&_.search-form-content]:mr-0 [&_.search-form-content]:flex-wrap [&_.search-form-content]:gap-y-3"
      >
        <div className="flex w-full flex-wrap items-end gap-4">
          <SearchFormSelectBox<TimeSaleMenuFilterParams>
            name="orderBy"
            title="정렬"
            className="w-[230px]"
            value={filters.orderBy}
            onChange={({ value }) =>
              setFilters((previous) => ({
                ...previous,
                orderBy: value as TimeSaleMenuOrderBy,
              }))
            }
            options={[
              { value: "latest", label: "최신순" },
              { value: "viewCountDesc", label: "조회수 높은 순" },
              {
                value: "reservationRequestCountDesc",
                label: "예약 요청수 높은 순",
              },
              {
                value: "reservationAcceptedCountDesc",
                label: "예약 수락수 높은 순",
              },
              { value: "reservationRateDesc", label: "예약률 높은 순" },
            ]}
          />
          <label className="text-sm">
            등록일 시작 (KST)
            <Input
              type="date"
              aria-label="등록일 시작 (KST)"
              value={filters.createdAtStartKST}
              max={filters.createdAtEndKST || "9999-12-31"}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  createdAtStartKST: event.target.value,
                }))
              }
            />
          </label>
          <label className="text-sm">
            등록일 종료 (KST)
            <Input
              type="date"
              aria-label="등록일 종료 (KST)"
              value={filters.createdAtEndKST}
              min={filters.createdAtStartKST || undefined}
              max="9999-12-31"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  createdAtEndKST: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <fieldset className="w-full">
          <legend className="mb-2 text-sm font-medium">
            시술 종류 (복수 선택 · 선택한 종류 중 하나에 해당 · 미선택 시 전체)
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {TIME_SALE_MENU_TREATMENT_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.treatmentTypes.includes(type)}
                  onCheckedChange={(checked) =>
                    setFilters((previous) => ({
                      ...previous,
                      treatmentTypes:
                        checked === true
                          ? [...previous.treatmentTypes, type]
                          : previous.treatmentTypes.filter(
                              (value) => value !== type,
                            ),
                    }))
                  }
                />
                {formatTimeSaleMenuAnalysisTreatmentType(type)}
              </label>
            ))}
          </div>
        </fieldset>
        <SearchFormSelectBox<TimeSaleMenuFilterParams>
          name="searchType"
          className="w-[114px]"
          value={filters.searchType}
          onChange={handleSearchTypeChange}
          options={SEARCH_TYPE_OPTIONS}
        />
        <SearchFormInput<TimeSaleMenuFilterParams>
          aria-label="검색어"
          name="searchKeyword"
          className="w-[165px]"
          onChange={handleSearchKeywordChange}
          value={filters.searchKeyword}
        />
      </SearchForm>

      {filterError && (
        <p role="alert" className="text-sm text-red-600">
          {filterError}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        조건을 선택한 후 검색 버튼을 누르면 적용됩니다.
      </p>
      {getTimeSaleMenusQuery.data && (
        <p role="status" className="min-h-5 text-sm text-muted-foreground">
          {getTimeSaleMenusQuery.isFetching
            ? "목록을 갱신하는 중입니다."
            : getTimeSaleMenusQuery.isError
              ? "목록 갱신에 실패했습니다. 기존 결과를 표시합니다."
              : ""}
        </p>
      )}
      {getTimeSaleMenusQuery.isError && !getTimeSaleMenusQuery.data ? (
        <div
          role="alert"
          className="flex items-center gap-3 text-sm text-red-600"
        >
          리뷰특가 목록을 불러오지 못했습니다.
          <Button
            variant="outline"
            onClick={() => getTimeSaleMenusQuery.refetch()}
          >
            다시 시도
          </Button>
        </div>
      ) : getTimeSaleMenusQuery.isLoading ? (
        <p role="status">리뷰특가를 불러오는 중입니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[1480px]">
            <CommonTable<ITimeSaleMenu>
              data={getTimeSaleMenusQuery.data?.content ?? []}
              columns={COLUMNS}
              emptyMessage="조건에 맞는 리뷰특가가 없습니다."
              onClickRow={handleClickRow}
            />
          </div>
        </div>
      )}

      <CommonPagination
        currentPage={page}
        totalCount={getTimeSaleMenusQuery.data?.totalCount ?? 0}
        pageSize={size}
        onPageChange={setPage}
        onSizeChange={(nextSize) => {
          setSize(nextSize);
          setPage(DEFAULT_PAGINATION.page);
        }}
      />

      {selectedTimeSaleMenu && (
        <TimeSaleMenuDetailModal
          isOpen={modal.isOpen}
          onClose={handleClose}
          timeSaleMenu={selectedTimeSaleMenu}
          onRefresh={() => getTimeSaleMenusQuery.refetch()}
        />
      )}
    </div>
  );
}
