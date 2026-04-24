"use client";

import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox
} from "@/components/shared/search-form";
import {
  UserFileSearchType,
  UserFileType
} from "@/models/userFiles";

import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import { PaginationType } from "@/models/common";
import React from "react";
import { cn } from "@/lib/utils";

export type UserFilesUserTypeFilter = "ALL" | "1" | "2";
export type UserFilesLocationFilter = "ALL" | UserFileType;

export type IUserFilesSearchParams = {
  userType?: UserFilesUserTypeFilter;
  locationType?: UserFilesLocationFilter;
  searchType?: UserFileSearchType;
  searchKeyword?: string;
} & PaginationType;

interface UserFilesSearchFormProps extends SearchFormProps {
  methods: IUseSearchMethods<IUserFilesSearchParams>;
  className?: string;
}

const USER_TYPE_OPTIONS: { value: UserFilesUserTypeFilter; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "2", label: "디자이너" },
  { value: "1", label: "모델" }
];

const LOCATION_TYPE_OPTIONS: {
  value: UserFilesLocationFilter;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "profilePhoto", label: "프로필" },
  { value: "portfolio", label: "포트폴리오" },
  { value: "shop", label: "매장" }
];

const SEARCH_TYPE_OPTIONS: { value: UserFileSearchType; label: string }[] = [
  { value: "NAME", label: "닉네임" },
  { value: "PHONE", label: "전화번호" }
];

function UserFilesSearchForm({
  methods,
  className,
  ...props
}: UserFilesSearchFormProps) {
  const userTypeValue = methods.params.userType ?? "ALL";
  const locationTypeValue = methods.params.locationType ?? "ALL";
  const searchTypeValue = methods.params.searchType ?? "NAME";
  const searchKeywordValue = methods.params.searchKeyword ?? "";

  return (
    <SearchForm className={cn("user-files-search-form", "mb-0", className)} {...props}>
      <SearchFormSelectBox<IUserFilesSearchParams>
        name="userType"
        value={userTypeValue}
        onChange={methods.handleSelect}
        options={USER_TYPE_OPTIONS}
        title="유저타입"
      />
      <SearchFormSelectBox<IUserFilesSearchParams>
        name="locationType"
        value={locationTypeValue}
        onChange={methods.handleSelect}
        options={LOCATION_TYPE_OPTIONS}
        title="위치"
      />
      <SearchFormSelectBox<IUserFilesSearchParams>
        className={cn("w-[114px] ml-[10px]")}
        name="searchType"
        value={searchTypeValue}
        onChange={methods.handleSelect}
        options={SEARCH_TYPE_OPTIONS}
      />
      <SearchFormInput
        className={cn("w-[165px]")}
        name="searchKeyword"
        onChange={methods.handleChangeText}
        value={searchKeywordValue}
      />
    </SearchForm>
  );
}

export default UserFilesSearchForm;
