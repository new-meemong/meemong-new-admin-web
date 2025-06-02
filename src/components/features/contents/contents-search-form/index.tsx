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
import { GetContentsRequest } from "@/apis/contents";
import { IUseSearchForm } from "@/components/shared/search-form/useSearchForm";
import {
  ContentsCategoryType,
  CostType,
  JobCategoryType,
  RecruitmentType,
} from "@/models/contents";

interface ContentsSearchFormProps extends SearchFormProps {
  searchForm: IUseSearchForm<GetContentsRequest>;
  className?: string;
  onChangeCategory: () => void;
}

function ContentsSearchForm({
  searchForm,
  className,
  onChangeCategory,
  ...props
}: ContentsSearchFormProps) {
  const CATEGORY_TYPE_OPTIONS: {
    value: ContentsCategoryType;
    label: string;
  }[] = [
    { value: "0", label: "번개/일반" },
    { value: "1", label: "번개/프리미엄" },
    { value: "2", label: "구인공고" },
    { value: "3", label: "이력서" },
    { value: "4", label: "모집공고" },
  ];

  const USER_TYPE_OPTIONS: { value: UserType | "ALL"; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "1", label: "모델" },
    { value: "2", label: "디자이너" },
  ];

  const JOB_CATEGORY_TYPE_OPTIONS: {
    value: JobCategoryType | "ALL";
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "0", label: "인턴" },
    { value: "1", label: "디자이너" },
  ];

  const RECRUITMENT_TYPE_OPTIONS: {
    value: RecruitmentType | "ALL";
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
    value: CostType | "ALL";
    label: string;
  }[] = [
    { value: "ALL", label: "전체" },
    { value: "0", label: "무료" },
    { value: "1", label: "재료비" },
    { value: "2", label: "모델료" },
  ];

  const renderSearchForm = useCallback(() => {
    const categoryType = String(
      searchForm.values.categoryId,
    ) as ContentsCategoryType;

    if (categoryType === "2") {
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
        </>
      );
    } else if (categoryType === "3") {
      return (
        <>
          <SearchFormSelectBox<GetContentsRequest>
            name="jobCategory"
            className={cn("w-[130px]")}
            value={searchForm.values.jobCategory!}
            onChange={searchForm.handleSelect}
            options={JOB_CATEGORY_TYPE_OPTIONS}
            title="구직타입"
          />
        </>
      );
    } else if (categoryType === "4") {
      return (
        <>
          <SearchFormSelectBox<GetContentsRequest>
            name="recruitment"
            className={cn("w-[130px]")}
            value={searchForm.values.recruitment!}
            onChange={searchForm.handleSelect}
            options={RECRUITMENT_TYPE_OPTIONS}
            title="모집타입"
          />
          <SearchFormSelectBox<GetContentsRequest>
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
          <SearchFormSelectBox<GetContentsRequest>
            name="userType"
            className={cn("w-[130px]")}
            value={searchForm.values.userType!}
            onChange={searchForm.handleSelect}
            options={USER_TYPE_OPTIONS}
            title="유저타입"
          />
        </>
      );
    }
  }, [
    searchForm.values,
    searchForm.handleChangeText,
    searchForm.handleSelect,
    COST_TYPE_OPTIONS,
    JOB_CATEGORY_TYPE_OPTIONS,
    RECRUITMENT_TYPE_OPTIONS,
    USER_TYPE_OPTIONS,
  ]);

  useEffect(() => {
    const categoryType = String(searchForm.values.categoryId) as ContentsCategoryType;

    if (categoryType === "0" || categoryType === "1") {
      searchForm.handleSelect({ key: "userType", value: "ALL" });
    } else if (categoryType === "2") {
      searchForm.handleChangeText({
        target: { name: "company", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    } else if (categoryType === "3") {
      searchForm.handleSelect({ key: "jobCategory", value: "ALL" });
    } else if (categoryType === "4") {
      searchForm.handleSelect({ key: "recruitment", value: "ALL" });
      searchForm.handleSelect({ key: "costType", value: "ALL" });
    }
    searchForm.handleChangeText({
      target: { name: "searchKeyword", value: "" },
    } as React.ChangeEvent<HTMLInputElement>);

    onChangeCategory();
  }, [searchForm.values.categoryId]);

  return (
    <SearchForm className={cn("contents-search-form", className)} {...props}>
      <SearchFormSelectBox<GetContentsRequest>
        name="categoryId"
        className={cn("w-[130px]")}
        value={String(searchForm.values.categoryId!)}
        onChange={searchForm.handleSelect}
        options={CATEGORY_TYPE_OPTIONS}
        title="카테고리"
      />
      {renderSearchForm()}
      <SearchFormInput
        name="searchKeyword"
        className={cn("w-[185px]")}
        onChange={searchForm.handleChangeText}
        placeholder="uid/닉네임/전화번호"
        value={searchForm.values.searchKeyword}
      />
    </SearchForm>
  );
}

export default ContentsSearchForm;
