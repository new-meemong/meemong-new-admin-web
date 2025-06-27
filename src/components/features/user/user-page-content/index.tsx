"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import UserSearchForm, {
  IUserSearchParams,
} from "@/components/features/user/user-search-form";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import UserTable from "@/components/features/user/user-table";
import { useGetUsersQuery } from "@/queries/users";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { BlockType, UserRoleType } from "@/models/user";

interface UserPageContentProps {
  className?: string;
}

function UserPageContent({ className }: UserPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IUserSearchParams = {
    role: "ALL",
    blockType: "ALL",
    searchType: "UID",
    searchKeyword: "",
    ...DEFAULT_PAGINATION,
  };

  const [searchParams, setSearchParams] = useState<IUserSearchParams>(
    DEFAULT_SEARCH_PARAMS,
  );

  const methods = useSearchMethods<IUserSearchParams>({
    defaultValues: DEFAULT_SEARCH_PARAMS,
  });

  const getUsersQuery = useGetUsersQuery(
    {
      role:
        searchParams.role === "ALL"
          ? undefined
          : (Number(searchParams.role) as UserRoleType),
      blockType:
        searchParams.blockType === "ALL"
          ? undefined
          : (searchParams.blockType as BlockType),
      searchType: searchParams.searchType,
      searchKeyword: searchParams.searchKeyword,
      page: searchParams.page,
      size: searchParams.size,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    getUsersQuery.refetch();
  }, [searchParams]);

  return (
    <div className={cn("user-page-content", className)}>
      <UserSearchForm
        methods={methods}
        onSubmit={() => {
          setSearchParams({ ...methods.values, page: 1 });
        }}
        onRefresh={() => {
          methods.handleReset();
          setSearchParams({ ...DEFAULT_SEARCH_PARAMS });
        }}
      />
      <UserTable
        data={getUsersQuery.data?.content ?? []}
        totalCount={getUsersQuery.data?.totalCount ?? 0}
        currentPage={searchParams.page}
        pageSize={searchParams.size}
        onPageChange={(page) => {
          setSearchParams({
            ...searchParams,
            page,
          });
        }}
        onSizeChange={(size) => {
          setSearchParams({
            ...searchParams,
            page: 1,
            size,
          });
        }}
      />
    </div>
  );
}

export default UserPageContent;
