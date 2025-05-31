"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import UserSearchForm from "@/components/features/user/user-search-form";
import useSearchForm from "@/components/shared/search-form/useSearchForm";
import UserTable from "@/components/features/user/user-table";
import { useGetUsersQuery } from "@/queries";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/search-table/common-pagination/contants";

interface UserPageContentProps {
  className?: string;
}

function UserPageContent({ className }: UserPageContentProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const searchForm = useSearchForm({
    defaultValues: { userType: "0", blockType: "0", searchKeyword: "" },
  });

  const { values } = searchForm;

  const getUsersQuery = useGetUsersQuery({
    page: currentPage - 1,
    size: DEFAULT_PAGE_SIZE,
    userType: searchForm.values.userType,
    blockType: searchForm.values.blockType,
    searchKeyword: searchForm.values.searchKeyword,
  });

  return (
    <div className={cn("user-page-content", className)}>
      <UserSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          setCurrentPage(1); // 검색 시 페이지 초기화
        }}
      />
      <UserTable
        data={getUsersQuery.data?.content ?? []}
        totalCount={getUsersQuery.data?.totalCount ?? 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default UserPageContent;
