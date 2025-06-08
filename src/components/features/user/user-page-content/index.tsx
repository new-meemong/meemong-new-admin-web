"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import UserSearchForm, {
  IUserSearchForm,
} from "@/components/features/user/user-search-form";
import useSearchForm from "@/components/shared/search-form/useSearchForm";
import UserTable from "@/components/features/user/user-table";
import { useGetUsersQuery } from "@/queries/users";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import { BlockType, UserType } from "@/models/user";

interface UserPageContentProps {
  className?: string;
}

function UserPageContent({ className }: UserPageContentProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentSize, setCurrentSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const DEFAULT_SEARCH_FORM: IUserSearchForm = {
    userType: "ALL",
    blockType: "ALL",
    searchType: "UUID",
    searchKeyword: "",
  };

  const searchForm = useSearchForm<IUserSearchForm>({
    defaultValues: DEFAULT_SEARCH_FORM,
  });

  const getUsersQuery = useGetUsersQuery(
    {
      page: currentPage - 1,
      size: currentSize,
      userType:
        searchForm.values.userType === "ALL"
          ? undefined
          : (searchForm.values.userType as UserType),
      blockType:
        searchForm.values.blockType === "ALL"
          ? undefined
          : (searchForm.values.blockType as BlockType),
      searchKeyword: searchForm.values.searchKeyword,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    getUsersQuery.refetch();
  });

  return (
    <div className={cn("user-page-content", className)}>
      <UserSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          console.log(searchForm.values);
          getUsersQuery.refetch();
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
