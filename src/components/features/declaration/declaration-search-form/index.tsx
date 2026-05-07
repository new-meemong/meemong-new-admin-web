"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormProps,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import { PaginationType } from "@/models/common";
import {
  USER_REPORT_ROLE_OPTIONS,
  USER_REPORT_STATUS_OPTIONS,
  UserReportRoleWithAll,
  UserReportReasonWithAll,
  UserReportStatusWithAll,
  getUserReportReasonOptions,
} from "@/constants/userReports";

export type IUserReportSearchParams = {
  userRole: UserReportRoleWithAll;
  status: UserReportStatusWithAll;
  reason: UserReportReasonWithAll;
} & PaginationType;

interface DeclarationSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchMethods<IUserReportSearchParams>;
  className?: string;
}

function DeclarationSearchForm({
  searchForm,
  className,
  ...props
}: DeclarationSearchFormProps) {
  const reasonOptions = useMemo(
    () => getUserReportReasonOptions(searchForm.params.userRole),
    [searchForm.params.userRole],
  );

  const handleSelect = ({
    key,
    value,
  }: {
    key: keyof IUserReportSearchParams;
    value: string;
  }) => {
    if (key === "userRole") {
      searchForm.setParams((prev) => ({
        ...prev,
        userRole: value as UserReportRoleWithAll,
        reason: "ALL",
        page: 1,
      }));
      searchForm.setSearchParams((prev) => ({
        ...prev,
        userRole: value as UserReportRoleWithAll,
        reason: "ALL",
        page: 1,
      }));
      return;
    }

    searchForm.handleSelect({
      key,
      value: value as IUserReportSearchParams[keyof IUserReportSearchParams],
    });
  };

  return (
    <SearchForm className={cn("declaration-search-form", className)} {...props}>
      <SearchFormSelectBox<IUserReportSearchParams>
        name="userRole"
        value={searchForm.params.userRole}
        defaultValue={"ALL"}
        onChange={handleSelect}
        options={USER_REPORT_ROLE_OPTIONS}
        title="유저구분"
      />
      <SearchFormSelectBox<IUserReportSearchParams>
        className={cn("w-[132px]")}
        name="status"
        value={searchForm.params.status}
        defaultValue={"ALL"}
        onChange={handleSelect}
        options={USER_REPORT_STATUS_OPTIONS}
        title="처리"
      />
      <SearchFormSelectBox<IUserReportSearchParams>
        className={cn("w-[150px]")}
        name="reason"
        value={searchForm.params.reason}
        defaultValue={"ALL"}
        onChange={handleSelect}
        options={reasonOptions}
        title="사유"
      />
    </SearchForm>
  );
}

export default DeclarationSearchForm;
