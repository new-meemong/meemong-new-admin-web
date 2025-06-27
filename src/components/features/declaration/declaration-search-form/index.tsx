"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import { PaginationType, SearchType } from "@/models/common";
import { DeclarationStatusType } from "@/constants/declaration";

type DeclarationStatusWithAll = DeclarationStatusType | "ALL";

export type IDeclarationSearchParams = {
  status?: DeclarationStatusWithAll;
  searchType?: SearchType;
  searchKeyword?: string;
} & PaginationType;

interface DeclarationSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchMethods<IDeclarationSearchParams>;
  className?: string;
}

function DeclarationSearchForm({
  searchForm,
  className,
  ...props
}: DeclarationSearchFormProps) {
  const STATUS_TYPE_OPTIONS: {
    value: DeclarationStatusWithAll;
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "0", label: "미확인" },
    { value: "1", label: "확인" },
    { value: "2", label: "대기" },
    { value: "3", label: "처리완료" },
  ];

  const SEARCH_TYPE_OPTIONS: { value: SearchType; label: string }[] = [
    { value: "UID", label: "uuid" },
    { value: "NAME", label: "닉네임" },
    { value: "PHONE", label: "전화번호" },
  ];

  return (
    <SearchForm className={cn("declaration-search-form", className)} {...props}>
      <SearchFormSelectBox<IDeclarationSearchParams>
        name="status"
        value={searchForm.values.status!}
        defaultValue={"ALL"}
        onChange={searchForm.handleSelect}
        options={STATUS_TYPE_OPTIONS}
        title="처리상태"
      />
      <SearchFormSelectBox<IDeclarationSearchParams>
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

export default DeclarationSearchForm;
