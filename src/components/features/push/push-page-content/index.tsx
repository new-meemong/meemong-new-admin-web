"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { useGetUsersQuery } from "@/queries/users";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { BlockType, UserRoleType } from "@/models/users";
import PushSearchForm, {
  IUserSearchParams,
} from "@/components/features/push/push-search-form";
import PushTable from "@/components/features/push/push-table";

interface PushPageContentProps {
  className?: string;
}

function PushPageContent({ className }: PushPageContentProps) {
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
  }, [methods.searchParams]);

  return (
    <div className={cn("user-page-content", className)}>
      <PushSearchForm />
      <PushTable
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
        onRefresh={() => {
          getUsersQuery.refetch();
        }}
      />
    </div>
  );
}

export default PushPageContent;
