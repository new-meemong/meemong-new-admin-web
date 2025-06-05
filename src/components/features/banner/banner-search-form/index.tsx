"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
} from "@/components/shared/search-form";
import { BlockType, UserType } from "@/models/user";
import { IUseSearchForm } from "@/components/shared/search-form/useSearchForm";

export type BannerSearchFormValues = {
  searchKeyword?: string;
};

interface BannerSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchForm<BannerSearchFormValues>;
  className?: string;
}

function BannerSearchForm({
  searchForm,
  className,
  ...props
}: BannerSearchFormProps) {
  return (
    <SearchForm className={cn("banner-search-form", className)} {...props}>
      <SearchFormInput
        name="searchKeyword"
        onChange={searchForm.handleChangeText}
        placeholder="고객사명"
        value={searchForm.values.searchKeyword}
      />
    </SearchForm>
  );
}

export default BannerSearchForm;
