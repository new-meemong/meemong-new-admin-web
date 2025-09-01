"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { BlockType } from "@/models/users";
import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import { PaginationType, SearchType } from "@/models/common";
import { SEARCH_TYPE_OPTIONS } from "@/constants/common";
import { Checkbox } from "@/components/ui/checkbox";
import { useUsersContext } from "@/components/contexts/users-context";

type BlockTypeWithAll = BlockType | "ALL";

export type IUserSearchParams = {
  role?: string;
  blockType?: BlockTypeWithAll;
  searchType?: SearchType;
  searchKeyword?: string;
} & PaginationType;

interface UserSearchFormProps extends SearchFormProps {
  methods: IUseSearchMethods<IUserSearchParams>;
  className?: string;
}

function UserSearchForm({ methods, className, ...props }: UserSearchFormProps) {
  const { isPhotoMode, setIsPhotoMode } = useUsersContext();

  const USER_ROLE_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "1", label: "모델" },
    { value: "2", label: "디자이너" },
  ];

  const BLOCK_TYPE_OPTIONS: { value: BlockType | "ALL"; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "1", label: "차단" },
    { value: "2", label: "탈퇴" },
  ];

  return (
    <>
      <SearchForm
        wrapperClassName={cn("user-search-form", "mb-0", className)}
        {...props}
      >
        <SearchFormSelectBox<IUserSearchParams>
          name="role"
          value={String(methods.params.role!)}
          defaultValue={"ALL"}
          onChange={methods.handleSelect}
          options={USER_ROLE_TYPE_OPTIONS}
          title="유저타입"
        />
        <SearchFormSelectBox<IUserSearchParams>
          name="blockType"
          value={methods.params.blockType!}
          defaultValue={"ALL"}
          onChange={methods.handleSelect}
          options={BLOCK_TYPE_OPTIONS}
          title="차단/탈퇴"
        />
        <SearchFormSelectBox<IUserSearchParams>
          className={cn("w-[114px] ml-[10px]")}
          name="searchType"
          value={methods.params.searchType!}
          defaultValue={"UID"}
          onChange={methods.handleSelect}
          options={SEARCH_TYPE_OPTIONS}
        />
        <SearchFormInput
          className={cn("w-[165px]")}
          name="searchKeyword"
          onChange={methods.handleChangeText}
          value={methods.params.searchKeyword}
        />
      </SearchForm>
      <div className={cn("w-full h-[42px] flex justify-end items-center")}>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <Checkbox
            checked={isPhotoMode}
            onCheckedChange={setIsPhotoMode}
          />
          <span>사진으로 보기</span>
        </label>
      </div>
    </>
  );
}

export default UserSearchForm;
