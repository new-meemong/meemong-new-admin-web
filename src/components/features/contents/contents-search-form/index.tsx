"use client";

import React, { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import { JobCategoryType } from "@/models/contents";
import { useContentsContext } from "@/components/contexts/contents-context";
import { PaginationType, SearchType } from "@/models/common";
import { SEARCH_TYPE_OPTIONS } from "@/constants/common";

type JobCategoryTypeWithAll = JobCategoryType | "ALL";

export type IContentsSearchParams = {
  tabId?: string;
  role?: string;
  jobPostingRole?: string;
  resumeRole?: string;
  approveType?: string;
  storeName?: string;
  jobCategory?: JobCategoryTypeWithAll;
  announcementCategory?: string;
  priceType?: string;
  searchType?: SearchType;
  searchKeyword?: string;
} & PaginationType;

interface ContentsSearchFormProps extends SearchFormProps {
  methods: IUseSearchMethods<IContentsSearchParams>;
  className?: string;
}

function ContentsSearchForm({
  methods,
  className,
  ...props
}: ContentsSearchFormProps) {
  const { tabId } = useContentsContext();

  const USER_ROLE_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "1", label: "모델" },
    { value: "2", label: "디자이너" },
  ];

  const APPROVE_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "PREMIUM_APPROVED", label: "승인" },
    { value: "PREMIUM_UNAPPROVED", label: "미승인" },
    { value: "PREMIUM_REJECTED", label: "승인거절" },
  ];

  const JOB_POSTING_ROLE_TYPE_OPTIONS: {
    value: string;
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "인턴", label: "인턴" },
    { value: "디자이너", label: "디자이너" },
  ];

  const RESUME_ROLE_TYPE_OPTIONS: {
    value: string;
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "인턴", label: "인턴" },
    { value: "디자이너", label: "디자이너" },
  ];

  const ANNOUNCEMENT_CATEGORY_TYPE_OPTIONS: {
    value: string;
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "펌", label: "펌" },
    { value: "탈색", label: "탈색" },
    { value: "메이크업", label: "메이크업" },
    { value: "속눈썹", label: "속눈썹" },
    { value: "컷트", label: "컷트" },
    { value: "염색", label: "염색" },
    { value: "클리닉", label: "클리닉" },
    { value: "매직", label: "매직" },
    { value: "드라이", label: "드라이" },
    { value: "붙임머리", label: "붙임머리" },
  ];

  const PRICE_TYPE_OPTIONS: {
    value: string;
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "무료", label: "무료" },
    { value: "재료비", label: "재료비" },
    { value: "모델료", label: "모델료" },
  ];

  const renderSearchForm = useCallback(() => {
    if (tabId === "2") {
      return (
        <>
          <SearchFormInput
            name="storeName"
            className={cn("w-[130px]")}
            onChange={methods.handleChangeText}
            placeholder="업체명"
            value={methods.params.storeName}
            title="업체명"
          />
          <SearchFormSelectBox<IContentsSearchParams>
            name="jobPostingRole"
            className={cn("w-[130px]")}
            value={methods.params.jobPostingRole!}
            onChange={methods.handleSelect}
            options={JOB_POSTING_ROLE_TYPE_OPTIONS}
            title="모집타입"
          />
        </>
      );
    } else if (tabId === "3") {
      return (
        <>
          <SearchFormSelectBox<IContentsSearchParams>
            name="resumeRole"
            className={cn("w-[130px]")}
            value={methods.params.resumeRole!}
            onChange={methods.handleSelect}
            options={RESUME_ROLE_TYPE_OPTIONS}
            title="구직타입"
          />
        </>
      );
    } else if (tabId === "4") {
      return (
        <>
          <SearchFormSelectBox<IContentsSearchParams>
            name="announcementCategory"
            className={cn("w-[130px]")}
            value={methods.params.announcementCategory!}
            onChange={methods.handleSelect}
            options={ANNOUNCEMENT_CATEGORY_TYPE_OPTIONS}
            title="모집타입"
          />
          <SearchFormSelectBox<IContentsSearchParams>
            name="priceType"
            className={cn("w-[130px]")}
            value={methods.params.priceType!}
            onChange={methods.handleSelect}
            options={PRICE_TYPE_OPTIONS}
            title="비용타입"
          />
        </>
      );
    } else {
      return (
        <>
          <SearchFormSelectBox<IContentsSearchParams>
            name="role"
            className={cn("w-[130px]")}
            value={String(methods.params.role!)}
            defaultValue={"ALL"}
            onChange={methods.handleSelect}
            options={USER_ROLE_TYPE_OPTIONS}
            title="유저타입"
          />
          {tabId === "1" && (
            <SearchFormSelectBox<IContentsSearchParams>
              name="approveType"
              className={cn("w-[130px]")}
              value={methods.params.approveType!}
              defaultValue={"ALL"}
              onChange={methods.handleSelect}
              options={APPROVE_TYPE_OPTIONS}
              title="승인타입"
            />
          )}
        </>
      );
    }
  }, [
    tabId,
    methods.params,
    methods.handleChangeText,
    methods.handleSelect,
    PRICE_TYPE_OPTIONS,
    JOB_POSTING_ROLE_TYPE_OPTIONS,
    ANNOUNCEMENT_CATEGORY_TYPE_OPTIONS,
    USER_ROLE_TYPE_OPTIONS,
  ]);

  useEffect(() => {
    if (tabId === "0" || tabId === "1") {
      methods.handleSelect({ key: "role", value: "ALL" });
      if (tabId === "1" && !methods.params.approveType) {
        methods.handleSelect({ key: "approveType", value: "ALL" });
      }
    } else if (tabId === "2") {
      methods.handleChangeText({
        target: { name: "company", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      methods.handleSelect({ key: "jobCategory", value: "ALL" });
    } else if (tabId === "3") {
      methods.handleSelect({ key: "jobCategory", value: "ALL" });
    } else if (tabId === "4") {
      methods.handleSelect({ key: "announcementCategory", value: "ALL" });
      methods.handleSelect({ key: "priceType", value: "ALL" });
    }
    methods.handleChangeText({
      target: { name: "searchKeyword", value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [tabId]);

  return (
    <SearchForm className={cn("contents-search-form", className)} {...props}>
      {renderSearchForm()}
      <SearchFormSelectBox<IContentsSearchParams>
        className={cn("w-[114px] ml-[10px]")}
        name="searchType"
        value={methods.params.searchType!}
        defaultValue={tabId === "0" || tabId === "1" || tabId === "4" ? "NAME" : "UID"}
        onChange={methods.handleSelect}
        options={SEARCH_TYPE_OPTIONS}
      />
      <SearchFormInput
        name="searchKeyword"
        className={cn("w-[165px]")}
        onChange={methods.handleChangeText}
        value={methods.params.searchKeyword}
      />
    </SearchForm>
  );
}

export default ContentsSearchForm;
