"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  SearchForm,
  SearchFormInput,
  SearchFormProps,
} from "@/components/shared/search-form";
import { BlockType } from "@/models/users";
import { IUseSearchMethods } from "@/components/shared/search-form/useSearchMethods";
import { PaginationType, SearchType } from "@/models/common";
import { formatNumberWithCommas } from "@/utils/number";
import { Button } from "@/components/ui/button";
import IcPush from "@/assets/icons/ic_push_menu.svg";

type BlockTypeWithAll = BlockType | "ALL";

export type IUserSearchParams = {
  role?: string;
  blockType?: BlockTypeWithAll;
  searchType?: SearchType;
  searchKeyword?: string;
} & PaginationType;

interface PushSearchFormProps extends SearchFormProps {
  className?: string;
}

function PushSearchForm({ className, ...props }: PushSearchFormProps) {
  const handleClickPushPostButton = useCallback(() => {}, []);

  return (
    <>
      <SearchForm
        wrapperClassName={cn("push-search-form", "w-full", className)}
        className={cn("w-full flex justify-between items-center")}
        {...props}
      >
        <div className="flex items-center gap-[10px]">
          <SearchFormInput
            className={cn("w-[165px] h-[36px] px-[12px] py-[8px]")}
            name="searchKeyword"
            onChange={() => {}}
            readOnly={true}
            value={formatNumberWithCommas(13928)}
            title={"알림허용 유저 수"}
          />
          <SearchFormInput
            className={cn("w-[165px] h-[36px] px-[12px] py-[8px]")}
            name="searchKeyword"
            onChange={() => {}}
            readOnly={true}
            value={formatNumberWithCommas(123)}
            title={"알림차단 유저 수"}
          />
        </div>
        <div>
          <Button
            variant={"outline"}
            size={"icon"}
            className={"text-black border-black"}
            onClick={handleClickPushPostButton}
          >
            <IcPush />
          </Button>
        </div>
      </SearchForm>
    </>
  );
}

export default PushSearchForm;
