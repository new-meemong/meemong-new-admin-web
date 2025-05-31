"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import useSearchForm, {
  IUseSearchForm,
} from "@/components/shared/search-form/useSearchForm";
import { BlockType, UserType } from "@/models/user";

interface UserSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchForm;
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
      <SearchFormSelectBox
        name={"userType"}
        value={searchForm.values.userType as string}
        onChange={searchForm.handleSelect}
        options={USER_TYPE_OPTIONS}
        title={"유저타입"}
      />
      <SearchFormSelectBox
        name={"blockType"}
        value={searchForm.values.blockType as string}
        onChange={searchForm.handleSelect}
        options={BLOCK_TYPE_OPTIONS}
        title={"차단/탈퇴"}
      />
      <SearchFormInput
        name={"searchKeyword"}
        onChange={searchForm.handleChangeText}
        placeholder={"uid/닉네임/전화번호"}
      />
    </SearchForm>
  );
}

export default UserSearchForm;
