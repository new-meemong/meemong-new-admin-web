"use client";

import {
  IUserFilesSearchParams,
  UserFilesLocationFilter,
  UserFilesUserTypeFilter
} from "@/components/features/user-files/user-files-search-form";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import React from "react";
import { UserFileType, UserFileUserType } from "@/models/userFiles";
import UserFilesSearchForm from "@/components/features/user-files/user-files-search-form";
import UserFilesTable from "@/components/features/user-files/user-files-table";
import { UserListRoleType } from "@/models/users";
import { cn } from "@/lib/utils";
import { useGetUserFilesQuery } from "@/queries/userFiles";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";

interface UserFilesPageContentProps {
  className?: string;
}

function toRoleFilter(role: UserFilesUserTypeFilter): UserListRoleType | undefined {
  if (role === "ALL") {
    return undefined;
  }
  return Number(role) as UserListRoleType;
}

function toUserTypeFilter(role: UserFilesUserTypeFilter): UserFileUserType | undefined {
  if (role === "1") {
    return "MODEL";
  }
  if (role === "2") {
    return "DESIGNER";
  }
  return undefined;
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
    userType: "ALL",
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
      role: toRoleFilter(methods.params.userType ?? "ALL"),
      userType: toUserTypeFilter(methods.params.userType ?? "ALL"),
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
        selectedUserType={methods.params.userType}
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
