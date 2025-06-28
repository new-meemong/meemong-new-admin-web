"use client";

import React, { useEffect } from "react";
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

  const methods = useSearchMethods<IUserSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS,
  });

  const getUsersQuery = useGetUsersQuery(
    {
      role:
        methods.params.role === "ALL"
          ? undefined
          : (Number(methods.params.role) as UserRoleType),
      blockType:
        methods.params.blockType === "ALL"
          ? undefined
          : (methods.params.blockType as BlockType),
      searchType: methods.params.searchType,
      searchKeyword: methods.params.searchKeyword,
      page: methods.params.page,
      size: methods.params.size,
    },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    getUsersQuery.refetch();
  }, [methods.params]);

  return (
    <div className={cn("user-page-content", className)}>
      <UserSearchForm
        methods={methods}
        onSubmit={() => {
          methods.handleSubmit();
        }}
        onRefresh={() => {
          methods.handleReset();
        }}
      />
      <UserTable
        data={getUsersQuery.data?.content ?? []}
        totalCount={getUsersQuery.data?.totalCount ?? 0}
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

export default UserPageContent;
