"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { IUseSearchForm } from "@/components/shared/search-form/useSearchForm";
import { SearchType } from "@/models/common";
import { DeclarationStatusType } from "@/constants/declaration";

type DeclarationStatusWithAll = DeclarationStatusType | "ALL";

export type IDeclarationSearchForm = {
  status?: DeclarationStatusWithAll;
  searchType?: SearchType;
  searchKeyword?: string;
};

interface DeclarationSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchForm<IDeclarationSearchForm>;
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
    { value: "UUID", label: "uuid" },
    { value: "NICKNAME", label: "닉네임" },
    { value: "PHONE", label: "전화번호" },
  ];

  return (
    <SearchForm className={cn("declaration-search-form", className)} {...props}>
      <SearchFormSelectBox<IDeclarationSearchForm>
        name="status"
        value={searchForm.values.status!}
        defaultValue={"ALL"}
        onChange={searchForm.handleSelect}
        options={STATUS_TYPE_OPTIONS}
        title="처리상태"
      />
      <SearchFormSelectBox<IDeclarationSearchForm>
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
