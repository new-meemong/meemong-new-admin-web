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
import { GetUsersRequest } from "@/apis/user";
import { IUseSearchForm } from "@/components/shared/search-form/useSearchForm";

interface UserSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchForm<GetUsersRequest>;
  className?: string;
}

function UserSearchForm({
  searchForm,
  className,
  ...props
}: UserSearchFormProps) {
  const USER_TYPE_OPTIONS: { value: UserType; label: string }[] = [
    { value: "0", label: "전체" },
    { value: "1", label: "모델" },
    { value: "2", label: "디자이너" },
  ];

  const BLOCK_TYPE_OPTIONS: { value: BlockType; label: string }[] = [
    { value: "0", label: "전체" },
    { value: "1", label: "차단" },
    { value: "2", label: "탈퇴" },
  ];

  return (
    <SearchForm className={cn("user-search-form", className)} {...props}>
      <SearchFormSelectBox<GetUsersRequest>
        name="userType"
        value={searchForm.values.userType!}
        onChange={searchForm.handleSelect}
        options={USER_TYPE_OPTIONS}
        title="유저타입"
      />
      <SearchFormSelectBox<GetUsersRequest>
        name="blockType"
        value={searchForm.values.blockType!}
        onChange={searchForm.handleSelect}
        options={BLOCK_TYPE_OPTIONS}
        title="차단/탈퇴"
      />
      <SearchFormInput
        name="searchKeyword"
        onChange={searchForm.handleChangeText}
        placeholder="uid/닉네임/전화번호"
        value={searchForm.values.searchKeyword}
      />
    </SearchForm>
  );
}

export default UserSearchForm;
