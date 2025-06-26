"use client";

import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import UserSearchForm, {
  IUserSearchForm,
} from "@/components/features/user/user-search-form";
import useSearchForm from "@/components/shared/search-form/useSearchForm";
import UserTable from "@/components/features/user/user-table";
import { useGetUsersQuery } from "@/queries/users";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import { BlockType, UserType } from "@/models/user";

const DEFAULT_SEARCH_FORM: IUserSearchForm = {
  userType: "ALL",
  blockType: "ALL",
  searchType: "UUID",
  searchKeyword: "",
};

interface UserPageContentProps {
  className?: string;
}

function UserPageContent({ className }: UserPageContentProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentSize, setCurrentSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [searchParams, setSearchParams] =
    useState<IUserSearchForm>(DEFAULT_SEARCH_FORM);

  const searchForm = useSearchForm<IUserSearchForm>({
    defaultValues: DEFAULT_SEARCH_FORM,
  });

  const getUsersQuery = useGetUsersQuery(
    {
      page: currentPage,
      size: currentSize,
      userType:
        searchParams.userType === "ALL"
          ? undefined
          : (searchParams.userType as UserType),
      blockType:
        searchParams.blockType === "ALL"
          ? undefined
          : (searchParams.blockType as BlockType),
      searchType: searchParams.searchType,
      searchKeyword: searchParams.searchKeyword,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    getUsersQuery.refetch();
  }, [currentPage, currentSize, searchParams]);

  return (
    <div className={cn("user-page-content", className)}>
      <UserSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          setSearchParams({ ...searchForm.values }); // 검색 조건을 state로 저장
          setCurrentPage(1); // 검색 시 페이지 초기화
        }}
        onRefresh={() => {
          searchForm.handleReset();
        }}
      />
      <UserTable
        data={getUsersQuery.data?.content ?? []}
        totalCount={getUsersQuery.data?.totalCount ?? 0}
        currentPage={currentPage}
        pageSize={currentSize}
        onPageChange={setCurrentPage}
        onSizeChange={setCurrentSize}
      />
    </div>
  );
}

export default UserPageContent;
