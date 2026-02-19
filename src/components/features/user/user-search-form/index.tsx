"use client";

import { PaginationType, SearchType } from "@/models/common";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
  SearchFormSelectBox
} from "@/components/shared/search-form";

import { BlockType } from "@/models/users";
import { Checkbox } from "@/components/ui/checkbox";
import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import React from "react";
import { SEARCH_TYPE_OPTIONS } from "@/constants/common";
import { cn } from "@/lib/utils";
import { useGetBrandsQuery } from "@/queries/brands";
import { useUsersContext } from "@/components/contexts/users-context";

type BlockTypeWithAll = BlockType | "ALL";

export type IUserSearchParams = {
  role?: string;
  blockType?: BlockTypeWithAll;
  searchType?: SearchType;
  searchKeyword?: string;
  brandId?: string;
} & PaginationType;

interface UserSearchFormProps extends SearchFormProps {
  methods: IUseSearchMethods<IUserSearchParams>;
  className?: string;
}

function UserSearchForm({ methods, className, ...props }: UserSearchFormProps) {
  const { isPhotoMode, setIsPhotoMode } = useUsersContext();

  const USER_ROLE_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "1", label: "모델" },
    { value: "2", label: "디자이너" }
  ];

  const BLOCK_TYPE_OPTIONS: { value: BlockType | "ALL"; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "1", label: "차단" },
    { value: "2", label: "탈퇴" }
  ];

  // ✅ value는 항상 정의된 값으로(컨트롤드 보장)
  const roleValue = methods.params.role ?? "ALL";
  const blockTypeValue = (methods.params.blockType ??
    "ALL") as BlockTypeWithAll;
  const searchTypeValue = (methods.params.searchType ?? "NAME") as SearchType;
  const searchKeywordValue = methods.params.searchKeyword ?? "";
  const brandIdValue = methods.params.brandId ?? "ALL";
  const isDesignerRole = roleValue === "2";
  const isBrandSearch = isDesignerRole && searchTypeValue === "BRAND";

  const getBrandsQuery = useGetBrandsQuery(
    { page: 1, size: 1000 },
    {
      enabled: isBrandSearch
    }
  );

  const searchTypeOptions = React.useMemo(() => {
    if (!isDesignerRole) return SEARCH_TYPE_OPTIONS;
    return [...SEARCH_TYPE_OPTIONS, { value: "BRAND", label: "브랜드" }];
  }, [isDesignerRole]);

  const brandOptions = React.useMemo(
    () => [
      { value: "ALL", label: "브랜드 선택" },
      ...((getBrandsQuery.data?.content ?? []).map((brand) => ({
        value: String(brand.id),
        label: `${brand.name} (${brand.code})`
      })) ?? [])
    ],
    [getBrandsQuery.data?.content]
  );

  const updateSearchParams = React.useCallback(
    (updater: (prev: IUserSearchParams) => IUserSearchParams) => {
      methods.setParams(updater);
      methods.setSearchParams(updater);
    },
    [methods]
  );

  const handleRoleChange = React.useCallback(
    ({ value }: { key: keyof IUserSearchParams; value: string }) => {
      updateSearchParams((prev) => {
        const nextRole = value;
        const nextParams: IUserSearchParams = {
          ...prev,
          role: nextRole,
          page: 1
        };

        if (nextRole !== "2" && prev.searchType === "BRAND") {
          nextParams.searchType = "NAME";
          nextParams.brandId = undefined;
        }

        return nextParams;
      });
    },
    [updateSearchParams]
  );

  const handleSearchTypeChange = React.useCallback(
    ({ value }: { key: keyof IUserSearchParams; value: string }) => {
      const nextSearchType =
        !isDesignerRole && value === "BRAND" ? "NAME" : (value as SearchType);

      updateSearchParams((prev) => ({
        ...prev,
        searchType: nextSearchType,
        page: 1,
        ...(nextSearchType === "BRAND"
          ? { searchKeyword: "" }
          : { brandId: undefined })
      }));
    },
    [isDesignerRole, updateSearchParams]
  );

  const handleBrandChange = React.useCallback(
    ({ value }: { key: keyof IUserSearchParams; value: string }) => {
      updateSearchParams((prev) => ({
        ...prev,
        brandId: value === "ALL" ? undefined : value,
        page: 1
      }));
    },
    [updateSearchParams]
  );

  return (
    <>
      <SearchForm
        className={cn("user-search-form", "mb-0", className)}
        {...props}
      >
        <SearchFormSelectBox<IUserSearchParams>
          name="role"
          value={roleValue}
          // ❌ defaultValue 제거 (controlled만 사용)
          onChange={handleRoleChange}
          options={USER_ROLE_TYPE_OPTIONS}
          title="유저타입"
        />
        <SearchFormSelectBox<IUserSearchParams>
          name="blockType"
          value={blockTypeValue}
          onChange={methods.handleSelect}
          options={BLOCK_TYPE_OPTIONS}
          title="차단/탈퇴"
        />
        <SearchFormSelectBox<IUserSearchParams>
          className={cn("w-[114px] ml-[10px]")}
          name="searchType"
          value={searchTypeValue}
          onChange={handleSearchTypeChange}
          options={searchTypeOptions}
        />
        {isBrandSearch ? (
          <SearchFormSelectBox<IUserSearchParams>
            className={cn("w-[165px]")}
            name="brandId"
            value={brandIdValue}
            onChange={handleBrandChange}
            options={brandOptions}
            disabled={getBrandsQuery.isPending}
          />
        ) : (
          <SearchFormInput
            className={cn("w-[165px]")}
            name="searchKeyword"
            onChange={methods.handleChangeText}
            value={searchKeywordValue}
          />
        )}
      </SearchForm>

      <div className={cn("w-full h-[42px] flex justify-end items-center")}>
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <Checkbox
            checked={isPhotoMode}
            // Radix: boolean | "indeterminate" → boolean으로 정규화
            onCheckedChange={(v) => setIsPhotoMode(v === true)}
          />
          <span>사진으로 보기</span>
        </label>
      </div>
    </>
  );
}

export default UserSearchForm;
