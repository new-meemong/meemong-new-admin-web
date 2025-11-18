"use client";

import { BlockType, UserRoleType } from "@/models/users";
import React from "react";
import UserSearchForm, {
  IUserSearchParams
} from "@/components/features/user/user-search-form";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import UserTable from "@/components/features/user/user-table";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { useGetUsersQuery } from "@/queries/users";

interface UserPageContentProps {
  className?: string;
}

function UserPageContent({ className }: UserPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IUserSearchParams = {
    role: "ALL",
    blockType: "ALL",
    searchType: "NAME",
    searchKeyword: "",
    ...DEFAULT_PAGINATION,
    size: 10 // 10개씩 패치
  };

  const methods = useSearchMethods<IUserSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS
  });

  // 쿼리는 searchParams(제출된 값) 기준으로만 수행
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
      page: (methods.params.page as number) ?? DEFAULT_PAGINATION.page,
      size: (methods.params.size as number) ?? DEFAULT_PAGINATION.size
    },
    {
      enabled: true
    }
  );

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
        currentPage={(methods.params.page as number) ?? DEFAULT_PAGINATION.page}
        pageSize={(methods.params.size as number) ?? DEFAULT_PAGINATION.size}
        onRefresh={() => {
          getUsersQuery.refetch();
        }}
        onPageChange={(page) => {
          const next = Number(page);
          if (Number.isFinite(next)) methods.handleChangePage(next);
        }}
        onSizeChange={(size) => {
          const next = Number(size);
          if (Number.isFinite(next) && next > 0) methods.handleChangeSize(next);
        }}
        showPagination={true}
      />
    </div>
  );
}

export default UserPageContent;
