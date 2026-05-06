"use client";

import {
  IUserFilesSearchParams,
  UserFilesLocationFilter,
  UserFilesUserRoleFilter
} from "@/components/features/user-files/user-files-search-form";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import React from "react";
import { UserFileType } from "@/models/userFiles";
import UserFilesSearchForm from "@/components/features/user-files/user-files-search-form";
import UserFilesTable from "@/components/features/user-files/user-files-table";
import { UserListRoleType } from "@/models/users";
import { cn } from "@/lib/utils";
import { useGetUserFilesQuery } from "@/queries/userFiles";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";

interface UserFilesPageContentProps {
  className?: string;
}

function toUserRoleFilter(
  userRole: UserFilesUserRoleFilter
): UserListRoleType | undefined {
  if (userRole === "ALL") {
    return undefined;
  }
  return Number(userRole) as UserListRoleType;
}

function toFileTypesFilter(
  locationType: UserFilesLocationFilter
): UserFileType[] | undefined {
  if (locationType === "ALL") {
    return undefined;
  }
  return [locationType];
}

function UserFilesPageContent({ className }: UserFilesPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IUserFilesSearchParams = {
    userRole: "ALL",
    locationType: "ALL",
    searchType: "NAME",
    searchKeyword: "",
    ...DEFAULT_PAGINATION,
    size: 10
  };

  const methods = useSearchMethods<IUserFilesSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS
  });

  const getUserFilesQuery = useGetUserFilesQuery(
    {
      userRole: toUserRoleFilter(methods.params.userRole ?? "ALL"),
      fileTypes: toFileTypesFilter(methods.params.locationType ?? "ALL"),
      searchType: methods.params.searchType,
      searchKeyword: methods.params.searchKeyword,
      page: methods.params.page,
      size: methods.params.size
    },
    {
      enabled: true
    }
  );

  return (
    <div className={cn("user-files-page-content", className)}>
      <UserFilesSearchForm
        methods={methods}
        onSubmit={() => {
          methods.handleSubmit();
        }}
        onRefresh={() => {
          methods.handleReset();
        }}
      />

      <div className={cn("w-full h-[42px]")} />

      <UserFilesTable
        data={getUserFilesQuery.data?.content ?? []}
        totalCount={getUserFilesQuery.data?.totalCount ?? 0}
        currentPage={methods.params.page}
        pageSize={methods.params.size}
        selectedUserRole={methods.params.userRole}
        onRefresh={() => {
          getUserFilesQuery.refetch();
        }}
        onPageChange={(page) => {
          const next = Number(page);
          if (Number.isFinite(next)) methods.handleChangePage(next);
        }}
        onSizeChange={(size) => {
          const next = Number(size);
          if (Number.isFinite(next) && next > 0) methods.handleChangeSize(next);
        }}
      />
    </div>
  );
}

export default UserFilesPageContent;
