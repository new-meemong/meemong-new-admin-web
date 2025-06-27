import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import SelectBox from "@/components/shared/select-box";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";

export interface CommonPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  siblingCount?: number;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function CommonPagination({
  currentPage,
  totalCount,
  pageSize = DEFAULT_PAGINATION.size,
  onPageChange,
  onSizeChange,
  siblingCount = 1,
}: CommonPaginationProps) {
  const totalPageCount = Math.ceil(totalCount / pageSize);
  const DOTS = "...";

  const paginationRange = React.useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5;
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount,
    );
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPageCount - 1;
    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!showLeftDots && showRightDots) {
      const leftRange = range(1, 3 + 2 * siblingCount);
      return [...leftRange, DOTS, totalPageCount];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = range(
        totalPageCount - (3 + 2 * siblingCount) + 1,
        totalPageCount,
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (showLeftDots && showRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }, [currentPage, totalPageCount, siblingCount]);

  const PAGE_SIZE_OPTIONS: { value: string; label: string }[] = [
    {
      value: "10",
      label: "10 / page",
    },
    {
      value: "20",
      label: "20 / page",
    },
    {
      value: "50",
      label: "50 / page",
    },
  ];

  return (
    <div className="flex flex-row items-center justify-center mt-5 gap-[8px]">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          {paginationRange?.map((page, idx) =>
            page === DOTS ? (
              <PaginationItem key={`dots-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(Number(page))}
                  href="#"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPageCount && onPageChange(currentPage + 1)
              }
              aria-disabled={currentPage === totalPageCount}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <SelectBox
        className={cn("w-[118px]")}
        options={PAGE_SIZE_OPTIONS}
        value={String(pageSize)}
        size={"sm"}
        onChange={({ value }) => {
          onSizeChange(Number(value));
        }}
        name={"pageSize"}
      />
    </div>
  );
}
