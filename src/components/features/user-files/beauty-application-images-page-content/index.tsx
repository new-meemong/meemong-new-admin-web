"use client";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import React from "react";
import BeautyApplicationImagesSearchForm, {
  IBeautyApplicationImagesSearchParams
} from "@/components/features/user-files/beauty-application-images-search-form";
import BeautyApplicationImagesTable from "@/components/features/user-files/beauty-application-images-table";
import { cn } from "@/lib/utils";
import { useGetBeautyApplicationImagesQuery } from "@/queries/beautyApplicationImages";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";

interface BeautyApplicationImagesPageContentProps {
  className?: string;
}

function BeautyApplicationImagesPageContent({
  className
}: BeautyApplicationImagesPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IBeautyApplicationImagesSearchParams = {
    searchType: "NAME",
    searchKeyword: "",
    ...DEFAULT_PAGINATION,
    size: 10
  };

  const methods = useSearchMethods<IBeautyApplicationImagesSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS
  });

  const getBeautyApplicationImagesQuery = useGetBeautyApplicationImagesQuery(
    {
      searchType: methods.params.searchType,
      searchKeyword: methods.params.searchKeyword,
      page: methods.params.page,
      size: methods.params.size
    },
    {
      enabled: true
    }
  );

  return (
    <div className={cn("beauty-application-images-page-content", className)}>
      <BeautyApplicationImagesSearchForm
        methods={methods}
        onSubmit={() => {
          methods.handleSubmit();
        }}
        onRefresh={() => {
          methods.handleReset();
        }}
      />

      <div className={cn("w-full h-[42px]")} />

      <BeautyApplicationImagesTable
        data={getBeautyApplicationImagesQuery.data?.content ?? []}
        totalCount={getBeautyApplicationImagesQuery.data?.totalCount ?? 0}
        currentPage={methods.params.page}
        pageSize={methods.params.size}
        onRefresh={async () => {
          await getBeautyApplicationImagesQuery.refetch();
        }}
        onPageChange={(page) => {
          const next = Number(page);
          if (Number.isFinite(next)) methods.handleChangePage(next);
        }}
        onSizeChange={(size) => {
          const next = Number(size);
          if (Number.isFinite(next) && next > 0) methods.handleChangeSize(next);
        }}
      />
    </div>
  );
}

export default BeautyApplicationImagesPageContent;
