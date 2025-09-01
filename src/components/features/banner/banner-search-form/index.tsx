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
  company?: string;
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
    <SearchForm wrapperClassName={cn("banner-search-form", className)} {...props}>
      <SearchFormInput
        name="company"
        onChange={methods.handleChangeText}
        placeholder="고객사명"
        value={methods.params.company}
      />
    </SearchForm>
  );
}

export default BannerSearchForm;
