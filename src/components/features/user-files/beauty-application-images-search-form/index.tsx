"use client";

import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox
} from "@/components/shared/search-form";

import { BeautyApplicationImageSearchType } from "@/models/beautyApplicationImages";
import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import { PaginationType } from "@/models/common";
import { cn } from "@/lib/utils";

export type IBeautyApplicationImagesSearchParams = {
  searchType?: BeautyApplicationImageSearchType;
  searchKeyword?: string;
} & PaginationType;

interface BeautyApplicationImagesSearchFormProps extends SearchFormProps {
  methods: IUseSearchMethods<IBeautyApplicationImagesSearchParams>;
  className?: string;
}

const SEARCH_TYPE_OPTIONS: {
  value: BeautyApplicationImageSearchType;
  label: string;
}[] = [
  { value: "NAME", label: "닉네임" },
  { value: "PHONE", label: "전화번호" }
];

function BeautyApplicationImagesSearchForm({
  methods,
  className,
  ...props
}: BeautyApplicationImagesSearchFormProps) {
  const searchTypeValue = methods.params.searchType ?? "NAME";
  const searchKeywordValue = methods.params.searchKeyword ?? "";

  return (
    <SearchForm
      className={cn("beauty-application-images-search-form", "mb-0", className)}
      {...props}
    >
      <SearchFormSelectBox<IBeautyApplicationImagesSearchParams>
        className={cn("w-[114px]")}
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

export default BeautyApplicationImagesSearchForm;
