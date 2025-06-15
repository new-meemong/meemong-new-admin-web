"use client";

import React, { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { UserType } from "@/models/user";
import { IUseSearchForm } from "@/components/shared/search-form/useSearchForm";
import {
  ApproveType,
  CostType,
  JobCategoryType,
  RecruitmentType,
} from "@/models/contents";
import { useContentsContext } from "@/components/contexts/contents-context";
import { SearchType } from "@/models/common";

type UserTypeWithAll = UserType | "ALL";
type ApproveTypeWithAll = ApproveType | "ALL";
type JobCategoryTypeWithAll = JobCategoryType | "ALL";
type RecruitmentTypeWithAll = RecruitmentType | "ALL";
type CostTypeWithAll = CostType | "ALL";

export type IContentsSearchForm = {
  categoryId: number;
  userType?: UserTypeWithAll;
  approveType?: ApproveTypeWithAll;
  company?: string;
  jobCategory?: JobCategoryTypeWithAll;
  recruitment?: RecruitmentTypeWithAll;
  costType?: CostTypeWithAll;
  searchType?: SearchType;
  searchKeyword?: string;
};

interface ContentsSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchForm<IContentsSearchForm>;
  className?: string;
}

function ContentsSearchForm({
  searchForm,
  className,
  ...props
}: ContentsSearchFormProps) {
  const { tabId } = useContentsContext();

  const USER_TYPE_OPTIONS: { value: UserTypeWithAll; label: string }[] = [
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

  const SEARCH_TYPE_OPTIONS: { value: SearchType; label: string }[] = [
    { value: "UUID", label: "uuid" },
    { value: "NICKNAME", label: "닉네임" },
    { value: "PHONE", label: "전화번호" },
  ];

  const renderSearchForm = useCallback(() => {
    if (tabId === "2") {
      return (
        <>
          <SearchFormInput
            name="company"
            className={cn("w-[130px]")}
            onChange={searchForm.handleChangeText}
            placeholder="업체명"
            value={searchForm.values.company}
            title="업체명"
          />
          <SearchFormSelectBox<IContentsSearchForm>
            name="jobCategory"
            className={cn("w-[130px]")}
            value={searchForm.values.jobCategory!}
            onChange={searchForm.handleSelect}
            options={JOB_CATEGORY_TYPE_OPTIONS}
            title="모집타입"
          />
        </>
      );
    } else if (tabId === "3") {
      return (
        <>
          <SearchFormSelectBox<IContentsSearchForm>
            name="jobCategory"
            className={cn("w-[130px]")}
            value={searchForm.values.jobCategory!}
            onChange={searchForm.handleSelect}
            options={JOB_CATEGORY_TYPE_OPTIONS}
            title="구직타입"
          />
        </>
      );
    } else if (tabId === "4") {
      return (
        <>
          <SearchFormSelectBox<IContentsSearchForm>
            name="recruitment"
            className={cn("w-[130px]")}
            value={searchForm.values.recruitment!}
            onChange={searchForm.handleSelect}
            options={RECRUITMENT_TYPE_OPTIONS}
            title="모집타입"
          />
          <SearchFormSelectBox<IContentsSearchForm>
            name="costType"
            className={cn("w-[130px]")}
            value={searchForm.values.costType!}
            onChange={searchForm.handleSelect}
            options={COST_TYPE_OPTIONS}
            title="비용타입"
          />
        </>
      );
    } else {
      return (
        <>
          <SearchFormSelectBox<IContentsSearchForm>
            name="userType"
            className={cn("w-[130px]")}
            value={searchForm.values.userType!}
            defaultValue={"ALL"}
            onChange={searchForm.handleSelect}
            options={USER_TYPE_OPTIONS}
            title="유저타입"
          />
          {tabId === "1" && (
            <SearchFormSelectBox<IContentsSearchForm>
              name="approveType"
              className={cn("w-[130px]")}
              value={searchForm.values.approveType!}
              defaultValue={"ALL"}
              onChange={searchForm.handleSelect}
              options={APPROVE_TYPE_OPTIONS}
              title="승인타입"
            />
          )}
        </>
      );
    }
  }, [
    tabId,
    searchForm.values,
    searchForm.handleChangeText,
    searchForm.handleSelect,
    COST_TYPE_OPTIONS,
    JOB_CATEGORY_TYPE_OPTIONS,
    RECRUITMENT_TYPE_OPTIONS,
    USER_TYPE_OPTIONS,
  ]);

  useEffect(() => {
    if (tabId === "0" || tabId === "1") {
      searchForm.handleSelect({ key: "userType", value: "ALL" });
      if (tabId === "1" && !searchForm.values.approveType) {
        searchForm.handleSelect({ key: "approveType", value: "ALL" });
      }
    } else if (tabId === "2") {
      searchForm.handleChangeText({
        target: { name: "company", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      searchForm.handleSelect({ key: "jobCategory", value: "ALL" });
    } else if (tabId === "3") {
      searchForm.handleSelect({ key: "jobCategory", value: "ALL" });
    } else if (tabId === "4") {
      searchForm.handleSelect({ key: "recruitment", value: "ALL" });
      searchForm.handleSelect({ key: "costType", value: "ALL" });
    }
    searchForm.handleChangeText({
      target: { name: "searchKeyword", value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [tabId]);

  return (
    <SearchForm className={cn("contents-search-form", className)} {...props}>
      {renderSearchForm()}
      <SearchFormSelectBox<IContentsSearchForm>
        className={cn("w-[114px] ml-[10px]")}
        name="searchType"
        value={searchForm.values.searchType!}
        defaultValue={"UUID"}
        onChange={searchForm.handleSelect}
        options={SEARCH_TYPE_OPTIONS}
      />
      <SearchFormInput
        name="searchKeyword"
        className={cn("w-[165px]")}
        onChange={searchForm.handleChangeText}
        value={searchForm.values.searchKeyword}
      />
    </SearchForm>
  );
}

export default ContentsSearchForm;
