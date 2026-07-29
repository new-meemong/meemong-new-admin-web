"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import React, { useCallback, useState } from "react";

import CommonPagination from "@/components/shared/common-pagination";
import CommonTable from "@/components/shared/common-table";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { ITimeSaleMenu, TimeSaleMenuSearchType } from "@/models/timeSaleMenus";
import {
  SearchForm,
  SearchFormInput,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import TimeSaleMenuDetailModal from "@/components/features/contents/contents-detail-modal/time-sale-menu-detail-modal";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { formatPrice } from "@/utils/price";
import { useGetTimeSaleMenusQuery } from "@/queries/timeSaleMenus";
import { useModal } from "@/components/shared/modal/useModal";

type TimeSaleMenuSearchParams = {
  searchType: TimeSaleMenuSearchType;
  searchKeyword: string;
};

const DEFAULT_SEARCH_PARAMS: TimeSaleMenuSearchParams = {
  searchType: "NICKNAME",
  searchKeyword: "",
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
      <span className="cursor-pointer text-secondary-foreground hover:underline">
        {info.getValue() as string}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: "내용",
    cell: (info) => (info.getValue() as string) || "-",
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
    header: "작성일",
    cell: (info) => formatDate(info.getValue() as string, "YY.MM.DD") ?? "-",
    size: 100,
    enableSorting: false,
  },
  {
    accessorKey: "updatedAt",
    header: "최종수정일",
    cell: (info) => formatDate(info.getValue() as string, "YY.MM.DD") ?? "-",
    size: 110,
    enableSorting: false,
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
  const [searchParams, setSearchParams] = useState<TimeSaleMenuSearchParams>(
    DEFAULT_SEARCH_PARAMS,
  );
  const [submittedSearchParams, setSubmittedSearchParams] =
    useState<TimeSaleMenuSearchParams>(DEFAULT_SEARCH_PARAMS);
  const [page, setPage] = useState(DEFAULT_PAGINATION.page);
  const [size, setSize] = useState(DEFAULT_PAGINATION.size);

  const submittedSearchKeyword = submittedSearchParams.searchKeyword.trim();
  const getTimeSaleMenusQuery = useGetTimeSaleMenusQuery({
    ...(submittedSearchKeyword && {
      searchType: submittedSearchParams.searchType,
      searchKeyword: submittedSearchKeyword,
    }),
    page,
    size,
  });

  const handleSearch = useCallback(() => {
    const nextSearchParams = {
      ...searchParams,
      searchKeyword: searchParams.searchKeyword.trim(),
    };

    setSearchParams(nextSearchParams);
    setSubmittedSearchParams(nextSearchParams);
    setPage(DEFAULT_PAGINATION.page);
  }, [searchParams]);

  const handleReset = useCallback(() => {
    setSearchParams(DEFAULT_SEARCH_PARAMS);
    setSubmittedSearchParams(DEFAULT_SEARCH_PARAMS);
    setPage(DEFAULT_PAGINATION.page);
  }, []);

  const handleSearchTypeChange = useCallback(
    ({ value }: { key: keyof TimeSaleMenuSearchParams; value: string }) => {
      setSearchParams((previous) => ({
        ...previous,
        searchType: value as TimeSaleMenuSearchType,
      }));
    },
    [],
  );

  const handleSearchKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((previous) => ({
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
      className={cn("time-sale-menu-content flex flex-col gap-4", className)}
    >
      <SearchForm onSubmit={handleSearch} onRefresh={handleReset}>
        <SearchFormSelectBox<TimeSaleMenuSearchParams>
          name="searchType"
          className="w-[114px]"
          value={searchParams.searchType}
          onChange={handleSearchTypeChange}
          options={SEARCH_TYPE_OPTIONS}
        />
        <SearchFormInput<TimeSaleMenuSearchParams>
          name="searchKeyword"
          className="w-[165px]"
          onChange={handleSearchKeywordChange}
          value={searchParams.searchKeyword}
        />
      </SearchForm>

      <CommonTable<ITimeSaleMenu>
        data={getTimeSaleMenusQuery.data?.content ?? []}
        columns={COLUMNS}
        onClickRow={handleClickRow}
      />

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
