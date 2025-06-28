"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
} from "@/components/shared/search-form";
import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import { PaginationType } from "@/models/common";

export type IBannerSearchParams = {
  searchKeyword?: string;
} & PaginationType;

interface BannerSearchFormProps extends SearchFormProps {
  methods: IUseSearchMethods<IBannerSearchParams>;
  className?: string;
}

function BannerSearchForm({
  methods,
  className,
  ...props
}: BannerSearchFormProps) {
  return (
    <SearchForm className={cn("banner-search-form", className)} {...props}>
      <SearchFormInput
        name="searchKeyword"
        onChange={methods.handleChangeText}
        placeholder="고객사명"
        value={methods.params.searchKeyword}
      />
    </SearchForm>
  );
}

export default BannerSearchForm;
