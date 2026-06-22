"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import React, { useCallback, useState } from "react";

import CommonPagination from "@/components/shared/common-pagination";
import CommonTable from "@/components/shared/common-table";
import { GetHairConsultationsRequest } from "@/apis/hairConsultations";
import HairConsultationDetailModal from "@/components/features/contents/contents-detail-modal/hair-consultation-detail-modal";
import {
  IHairConsultationListItem,
  HairConsultationSearchType,
} from "@/models/hairConsultations";
import {
  SearchForm,
  SearchFormInput,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import useContentsCursorPagination from "@/components/features/contents/hooks/useContentsCursorPagination";
import { useGetHairConsultationsQuery } from "@/queries/hairConsultations";
import { useModal } from "@/components/shared/modal/useModal";

type HairConsultationSearchParams = {
  searchType: HairConsultationSearchType;
  searchKeyword: string;
};

const DEFAULT_SEARCH_PARAMS: HairConsultationSearchParams = {
  searchType: "NAME",
  searchKeyword: "",
};

const SEARCH_TYPE_OPTIONS: {
  value: HairConsultationSearchType;
  label: string;
}[] = [
  { value: "NAME", label: "닉네임" },
  { value: "PHONE", label: "전화번호" },
];

const getHairConsultationUserId = (item: IHairConsultationListItem) =>
  item.user?.id ?? item.hairConsultationCreateUserId;

const COLUMNS: ColumnDef<IHairConsultationListItem>[] = [
  {
    accessorKey: "id",
    header: "No",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false,
  },
  {
    id: "userId",
    accessorFn: getHairConsultationUserId,
    header: "작성자 ID",
    cell: (info) => info.getValue() || "-",
    size: 120,
    enableSorting: false,
  },
  {
    id: "userDisplayName",
    accessorFn: (item) => item.user?.displayName ?? "-",
    header: "닉네임",
    cell: (info) => info.getValue(),
    size: 120,
    enableSorting: false,
  },
  {
    id: "userPhone",
    accessorFn: (item) => item.user?.phone ?? "-",
    header: "전화번호",
    cell: (info) => info.getValue(),
    size: 130,
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: "제목",
    cell: (info) => (
      <span
        className={cn(
          "cursor-pointer text-secondary-foreground hover:underline",
        )}
      >
        {info.getValue() as string}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "desiredCostPrice",
    header: "희망비용",
    cell: (info) => {
      const price = info.getValue() as number | null;
      return price != null ? `${price.toLocaleString()}원` : "-";
    },
    size: 120,
    enableSorting: false,
  },
  {
    accessorKey: "viewCount",
    header: "조회수",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false,
  },
  {
    accessorKey: "commentCount",
    header: "댓글",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "생성일",
    cell: (info) => formatDate(info.getValue() as string, "YYYY.MM.DD HH:mm"),
    size: 160,
    enableSorting: true,
  },
];

interface HairConsultationContentProps {
  className?: string;
}

export default function HairConsultationContent({
  className,
}: HairConsultationContentProps) {
  const modal = useModal();
  const [selected, setSelected] = useState<IHairConsultationListItem | null>(
    null,
  );
  const [searchParams, setSearchParams] =
    useState<HairConsultationSearchParams>(DEFAULT_SEARCH_PARAMS);
  const [submittedSearchParams, setSubmittedSearchParams] =
    useState<HairConsultationSearchParams>(DEFAULT_SEARCH_PARAMS);

  const submittedSearchKeyword = submittedSearchParams.searchKeyword.trim();

  const buildHairConsultationsRequest = useCallback(
    (
      cursor: string | undefined,
      pageSize: number,
    ): GetHairConsultationsRequest => ({
      __limit: pageSize,
      __nextCursor: cursor,
      __orderColumn: "contentUpdatedAt",
      __order: "desc",
      ...(submittedSearchKeyword && {
        searchType: submittedSearchParams.searchType,
        searchKeyword: submittedSearchKeyword,
      }),
    }),
    [submittedSearchKeyword, submittedSearchParams.searchType],
  );

  const {
    currentCursor,
    currentPage,
    pageSize,
    resetPagination,
    handlePageChange,
    handleSizeChange,
    getReachableTotalCount,
  } = useContentsCursorPagination();

  const getHairConsultationsQuery = useGetHairConsultationsQuery(
    buildHairConsultationsRequest(currentCursor, pageSize),
  );

  const dataList = getHairConsultationsQuery.data?.dataList ?? [];
  const nextCursor = getHairConsultationsQuery.data?.__nextCursor ?? null;

  const handleSearch = useCallback(() => {
    const nextSearchParams = {
      ...searchParams,
      searchKeyword: searchParams.searchKeyword.trim(),
    };

    setSearchParams(nextSearchParams);
    setSubmittedSearchParams(nextSearchParams);
    resetPagination();
  }, [searchParams, resetPagination]);

  const handleReset = useCallback(() => {
    setSearchParams(DEFAULT_SEARCH_PARAMS);
    setSubmittedSearchParams(DEFAULT_SEARCH_PARAMS);
    resetPagination();
  }, [resetPagination]);

  const handleSearchTypeChange = useCallback(
    ({ value }: { key: keyof HairConsultationSearchParams; value: string }) => {
      setSearchParams((prev) => ({
        ...prev,
        searchType: value as HairConsultationSearchType,
      }));
    },
    [],
  );

  const handleSearchKeywordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((prev) => ({
        ...prev,
        searchKeyword: event.target.value,
      }));
    },
    [],
  );

  const handleClickRow = useCallback(
    (row: Row<IHairConsultationListItem>) => {
      setSelected(row.original);
      modal.open();
    },
    [modal],
  );

  const handleClose = useCallback(() => {
    modal.close();
    setSelected(null);
  }, [modal]);

  return (
    <div
      className={cn("hair-consultation-content flex flex-col gap-4", className)}
    >
      <SearchForm onSubmit={handleSearch} onRefresh={handleReset}>
        <SearchFormSelectBox<HairConsultationSearchParams>
          name="searchType"
          className={cn("w-[114px]")}
          value={searchParams.searchType}
          onChange={handleSearchTypeChange}
          options={SEARCH_TYPE_OPTIONS}
        />
        <SearchFormInput<HairConsultationSearchParams>
          name="searchKeyword"
          className={cn("w-[165px]")}
          onChange={handleSearchKeywordChange}
          value={searchParams.searchKeyword}
          placeholder={
            searchParams.searchType === "PHONE" ? "전화번호" : "닉네임"
          }
        />
      </SearchForm>

      <CommonTable<IHairConsultationListItem>
        data={dataList}
        columns={COLUMNS}
        onClickRow={handleClickRow}
      />

      <CommonPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={getReachableTotalCount(getHairConsultationsQuery.data)}
        onPageChange={(page) => {
          handlePageChange(page, nextCursor);
        }}
        onSizeChange={handleSizeChange}
      />

      {selected && (
        <HairConsultationDetailModal
          isOpen={modal.isOpen}
          onClose={handleClose}
          item={selected}
          onRefresh={() => getHairConsultationsQuery.refetch()}
        />
      )}
    </div>
  );
}
