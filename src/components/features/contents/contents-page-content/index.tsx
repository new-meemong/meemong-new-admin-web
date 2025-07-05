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
import { useGetJobPostingsQuery } from "@/queries/jobPostings";
import { JobPostingRoleType } from "@/models/jobPostings";
import { useGetResumeListQuery } from "@/queries/resumes";
import { ResumeRoleType } from "@/models/resumes";

interface ContentsPageContentProps {
  className?: string;
}

function ContentsPageContent({ className }: ContentsPageContentProps) {
  const { tabId } = useContentsContext();
  const isFirstRenderRef = useRef(true);

  const DEFAULT_SEARCH_PARAMS: IContentsSearchParams = {
    tabId,
    role: "ALL",
    jobPostingRole: "ALL",
    resumeRole: "ALL",
    approveType: "ALL",
    storeName: "",
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
      searchType: methods.params.searchType,
      searchKeyword: methods.params.searchKeyword,
      isPremium: tabId === "1",
      page: methods.params.page,
      size: methods.params.size,
    },
    {
      enabled: false,
    },
  );

  const getJobPostingsQuery = useGetJobPostingsQuery(
    {
      storeName: methods.params.storeName,
      role:
        methods.params.jobPostingRole === "ALL"
          ? undefined
          : (methods.params.jobPostingRole as JobPostingRoleType),
      searchType: methods.params.searchType,
      searchKeyword: methods.params.searchKeyword,
      page: methods.params.page,
      size: methods.params.size,
    },
    {
      enabled: false,
    },
  );

  const getResumesQuery = useGetResumeListQuery(
    {
      role:
        methods.params.resumeRole === "ALL"
          ? undefined
          : (methods.params.resumeRole as ResumeRoleType),
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
    } else if (tabId === "2") {
      return {
        data: parseContentsData(getJobPostingsQuery.data?.content) ?? [],
        totalCount: getJobPostingsQuery.data?.totalCount ?? 0,
        isLoading: getJobPostingsQuery.isLoading,
        refetch: getJobPostingsQuery.refetch,
      };
    } else if (tabId === "3") {
      return {
        data: parseContentsData(getResumesQuery.data?.content) ?? [],
        totalCount: getResumesQuery.data?.totalCount ?? 0,
        isLoading: getResumesQuery.isLoading,
        refetch: getResumesQuery.refetch,
      };
    }

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
    getJobPostingsQuery.data,
    getJobPostingsQuery.isLoading,
    getResumesQuery.data,
    getResumesQuery.isLoading,
  ]);

  useEffect(() => {
    const { size } = methods.params;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;

      return;
    }

    methods.setParams({
      ...DEFAULT_SEARCH_PARAMS,
      size,
      tabId,
      page: 1,
    });
    methods.setSearchParams({
      ...DEFAULT_SEARCH_PARAMS,
      size,
      tabId,
      page: 1,
    });
  }, [tabId]);

  useEffect(() => {
    // 최초 렌더 이후부터만 refetch 작동
    if (!isFirstRenderRef.current) {
      contentsData.refetch();
    }
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
        totalCount={contentsData.totalCount ?? 0}
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
