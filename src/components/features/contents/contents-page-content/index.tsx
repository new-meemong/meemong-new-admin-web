"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import ContentsSearchForm, {
  IContentsSearchParams,
} from "@/components/features/contents/contents-search-form";
import ContentsTable from "@/components/features/contents/contents-table";
import { useContentsContext } from "@/components/contexts/contents-context";
import { UserRoleType } from "@/models/users";
import { useGetThunderAnnouncementsQuery } from "@/queries/thunderAnnouncements";
import { IContents } from "@/models/contents";

interface ContentsPageContentProps {
  className?: string;
}

function ContentsPageContent({ className }: ContentsPageContentProps) {
  const { tabId } = useContentsContext();
  const isTabChangeRef = useRef(false);

  const DEFAULT_SEARCH_PARAMS: IContentsSearchParams = {
    role: "ALL",
    approveType: "ALL",
    company: "",
    jobCategory: "ALL",
    recruitment: "ALL",
    costType: "ALL",
    searchType: "UID",
    searchKeyword: "",
    ...DEFAULT_PAGINATION,
  };

  const methods = useSearchMethods<IContentsSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS,
  });

  const getThunderAnnouncementsQuery = useGetThunderAnnouncementsQuery(
    {
      role:
        methods.params.role === "ALL"
          ? undefined
          : (Number(methods.params.role) as UserRoleType),
      isPremium: tabId === "1",
      searchType: methods.params.searchType,
      searchKeyword: methods.params.searchKeyword,
      page: methods.params.page,
      size: methods.params.size,
    },
    {
      enabled: false,
    },
  );

  const parseContentsData = useCallback((data: unknown): IContents[] => {
    return data as IContents[];
  }, []);

  // === 공통 반환 데이터 추출 ===
  const contentsData: {
    data: IContents[];
    totalCount: number;
    isLoading: boolean;
    refetch: () => void;
  } = useMemo(() => {
    if (tabId === "0" || tabId === "1") {
      return {
        data:
          parseContentsData(getThunderAnnouncementsQuery.data?.content) ?? [],
        totalCount: getThunderAnnouncementsQuery.data?.totalCount ?? 0,
        isLoading: getThunderAnnouncementsQuery.isLoading,
        refetch: getThunderAnnouncementsQuery.refetch,
      };
    }

    // if (tabId === "2") return { data: ..., totalCount: ..., refetch: ... }
    return {
      data: [] as IContents[],
      totalCount: 0,
      isLoading: false,
      refetch: () => {},
    };
  }, [
    tabId,
    getThunderAnnouncementsQuery.data,
    getThunderAnnouncementsQuery.isLoading,
  ]);

  useEffect(() => {
    if (methods.params.page !== 1) {
      isTabChangeRef.current = true;
      methods.handleChangePage(1);
    } else {
      contentsData.refetch();
    }
  }, [tabId]);


  useEffect(() => {
    contentsData.refetch();
  }, [methods.searchParams]);

  return (
    <div className={cn("contents-page-content", className)}>
      <ContentsSearchForm
        methods={methods}
        onSubmit={() => {
          methods.handleSubmit();
        }}
        onRefresh={() => {
          methods.handleReset();
        }}
      />
      <ContentsTable
        data={contentsData.data ?? []}
        totalCount={getThunderAnnouncementsQuery.data?.totalCount ?? 0}
        currentPage={methods.params.page}
        pageSize={methods.params.size}
        onPageChange={(page) => {
          methods.handleChangePage(page);
        }}
        onSizeChange={(size) => {
          methods.handleChangeSize(size);
        }}
      />
    </div>
  );
}

export default ContentsPageContent;
