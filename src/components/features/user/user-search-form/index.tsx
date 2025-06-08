"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { BlockType, UserType } from "@/models/user";
import { IUseSearchForm } from "@/components/shared/search-form/useSearchForm";
import { SearchType } from "@/models/common";

type UserTypeWithAll = UserType | "ALL";
type BlockTypeWithAll = BlockType | "ALL";

export type IUserSearchForm = {
  userType?: UserTypeWithAll;
  blockType?: BlockTypeWithAll;
  searchType?: SearchType;
  searchKeyword?: string;
};

interface UserSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchForm<IUserSearchForm>;
  className?: string;
}

function UserSearchForm({
  searchForm,
  className,
  ...props
}: UserSearchFormProps) {
  const USER_TYPE_OPTIONS: { value: UserType | "ALL"; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "MODEL", label: "모델" },
    { value: "DESIGNER", label: "디자이너" },
  ];

  const BLOCK_TYPE_OPTIONS: { value: BlockType | "ALL"; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "1", label: "차단" },
    { value: "2", label: "탈퇴" },
  ];

  const SEARCH_TYPE_OPTIONS: { value: SearchType; label: string }[] = [
    { value: "UUID", label: "uuid" },
    { value: "NICKNAME", label: "닉네임" },
    { value: "PHONE", label: "전화번호" },
  ];

  return (
    <SearchForm className={cn("user-search-form", className)} {...props}>
      <SearchFormSelectBox<IUserSearchForm>
        name="userType"
        value={searchForm.values.userType!}
        defaultValue={"ALL"}
        onChange={searchForm.handleSelect}
        options={USER_TYPE_OPTIONS}
        title="유저타입"
      />
      <SearchFormSelectBox<IUserSearchForm>
        name="blockType"
        value={searchForm.values.blockType!}
        defaultValue={"ALL"}
        onChange={searchForm.handleSelect}
        options={BLOCK_TYPE_OPTIONS}
        title="차단/탈퇴"
      />
      <SearchFormSelectBox<IUserSearchForm>
        className={cn("w-[114px] ml-[10px]")}
        name="searchType"
        value={searchForm.values.searchType!}
        defaultValue={"UUID"}
        onChange={searchForm.handleSelect}
        options={SEARCH_TYPE_OPTIONS}
      />
      <SearchFormInput
        className={cn("w-[165px]")}
        name="searchKeyword"
        onChange={searchForm.handleChangeText}
        value={searchForm.values.searchKeyword}
      />
    </SearchForm>
  );
}

export default UserSearchForm;
