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
import {
  ApproveType,
  CostType,
  JobCategoryType,
  RecruitmentType,
} from "@/models/contents";
import { useContentsContext } from "@/components/contexts/contents-context";
import { PaginationType, SearchType } from "@/models/common";

type ApproveTypeWithAll = ApproveType | "ALL";
type JobCategoryTypeWithAll = JobCategoryType | "ALL";
type RecruitmentTypeWithAll = RecruitmentType | "ALL";
type CostTypeWithAll = CostType | "ALL";

export type IContentsSearchParams = {
  categoryId: number;
  role?: string;
  approveType?: ApproveTypeWithAll;
  company?: string;
  jobCategory?: JobCategoryTypeWithAll;
  recruitment?: RecruitmentTypeWithAll;
  costType?: CostTypeWithAll;
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

  const USER_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "MODEL", label: "모델" },
    { value: "DESIGNER", label: "디자이너" },
  ];

  const APPROVE_TYPE_OPTIONS: { value: ApproveTypeWithAll; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "0", label: "승인" },
    { value: "1", label: "미승인" },
    { value: "2", label: "승인거절" },
  ];

  const JOB_CATEGORY_TYPE_OPTIONS: {
    value: JobCategoryTypeWithAll;
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "0", label: "인턴" },
    { value: "1", label: "디자이너" },
  ];

  const RECRUITMENT_TYPE_OPTIONS: {
    value: RecruitmentTypeWithAll;
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "0", label: "펌" },
    { value: "1", label: "탈색" },
    { value: "2", label: "메이크업" },
    { value: "3", label: "속눈썹" },
    { value: "4", label: "커트" },
    { value: "5", label: "염색" },
    { value: "6", label: "클리닉" },
    { value: "7", label: "매직" },
    { value: "8", label: "드라이" },
    { value: "9", label: "붙임머리" },
  ];

  const COST_TYPE_OPTIONS: {
    value: CostTypeWithAll;
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "0", label: "무료" },
    { value: "1", label: "재료비" },
    { value: "2", label: "모델료" },
  ];

  const SEARCH_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: "uuid", label: "uuid" },
    { value: "displayName", label: "닉네임" },
    { value: "phone", label: "전화번호" },
  ];

  const renderSearchForm = useCallback(() => {
    if (tabId === "2") {
      return (
        <>
          <SearchFormInput
            name="company"
            className={cn("w-[130px]")}
            onChange={methods.handleChangeText}
            placeholder="업체명"
            value={methods.params.company}
            title="업체명"
          />
          <SearchFormSelectBox<IContentsSearchParams>
            name="jobCategory"
            className={cn("w-[130px]")}
            value={methods.params.jobCategory!}
            onChange={methods.handleSelect}
            options={JOB_CATEGORY_TYPE_OPTIONS}
            title="모집타입"
          />
        </>
      );
    } else if (tabId === "3") {
      return (
        <>
          <SearchFormSelectBox<IContentsSearchParams>
            name="jobCategory"
            className={cn("w-[130px]")}
            value={methods.params.jobCategory!}
            onChange={methods.handleSelect}
            options={JOB_CATEGORY_TYPE_OPTIONS}
            title="구직타입"
          />
        </>
      );
    } else if (tabId === "4") {
      return (
        <>
          <SearchFormSelectBox<IContentsSearchParams>
            name="recruitment"
            className={cn("w-[130px]")}
            value={methods.params.recruitment!}
            onChange={methods.handleSelect}
            options={RECRUITMENT_TYPE_OPTIONS}
            title="모집타입"
          />
          <SearchFormSelectBox<IContentsSearchParams>
            name="costType"
            className={cn("w-[130px]")}
            value={methods.params.costType!}
            onChange={methods.handleSelect}
            options={COST_TYPE_OPTIONS}
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
            options={USER_TYPE_OPTIONS}
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
    COST_TYPE_OPTIONS,
    JOB_CATEGORY_TYPE_OPTIONS,
    RECRUITMENT_TYPE_OPTIONS,
    USER_TYPE_OPTIONS,
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
      methods.handleSelect({ key: "recruitment", value: "ALL" });
      methods.handleSelect({ key: "costType", value: "ALL" });
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
        defaultValue={"UUID"}
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
