import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import SelectBox from "@/components/shared/select-box";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface CommonPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

function range(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const PAGES_PER_BLOCK = 10;
const ICON_CLASS = "h-4 w-4";

export default function CommonPagination({
  currentPage,
  totalCount,
  pageSize = DEFAULT_PAGINATION.size,
  onPageChange,
  onSizeChange,
}: CommonPaginationProps) {
  const totalPageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const { blockStart, blockEnd } = React.useMemo(() => {
    const blockIndex = Math.floor((currentPage - 1) / PAGES_PER_BLOCK);
    const start = blockIndex * PAGES_PER_BLOCK + 1;
    const end = Math.min(start + PAGES_PER_BLOCK - 1, totalPageCount);
    return { blockStart: start, blockEnd: end };
  }, [currentPage, totalPageCount]);

  const pagesInBlock = React.useMemo(
    () => range(blockStart, blockEnd),
    [blockStart, blockEnd],
  );

  const canGoPrevPage = currentPage > 1;
  const canGoNextPage = currentPage < totalPageCount;
  const canGoPrevBlock = blockStart > 1;
  const canGoNextBlock = blockEnd < totalPageCount;

  const jumpToPrevBlock = () => {
    if (!canGoPrevBlock) return;
    onPageChange(Math.max(1, blockStart - PAGES_PER_BLOCK));
  };
  const jumpToNextBlock = () => {
    if (!canGoNextBlock) return;
    onPageChange(Math.min(totalPageCount, blockStart + PAGES_PER_BLOCK));
  };

  const PAGE_SIZE_OPTIONS = [
    { value: "10", label: "10 / page" },
    { value: "20", label: "20 / page" },
    { value: "50", label: "50 / page" },
  ];

  return (
    <div className="flex flex-row items-center justify-center mt-5 gap-[8px]">
      <Pagination>
        <PaginationContent>
          {/* << (이전 10페이지) */}
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="이전 10페이지"
              aria-disabled={!canGoPrevBlock}
              className={cn(
                !canGoPrevBlock && "pointer-events-none opacity-50",
              )}
              onClick={(e) => {
                e.preventDefault();
                jumpToPrevBlock();
              }}
            >
              <ChevronsLeft className={ICON_CLASS} />
            </PaginationLink>
          </PaginationItem>

          {/* < (이전 1페이지) */}
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="이전 페이지"
              aria-disabled={!canGoPrevPage}
              className={cn(!canGoPrevPage && "pointer-events-none opacity-50")}
              onClick={(e) => {
                e.preventDefault();
                if (canGoPrevPage) onPageChange(currentPage - 1);
              }}
            >
              <ChevronLeft className={ICON_CLASS} />
            </PaginationLink>
          </PaginationItem>

          {/* 현재 블록(10페이지) */}
          {pagesInBlock.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                aria-label={`${page}페이지`}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* > (다음 1페이지) */}
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="다음 페이지"
              aria-disabled={!canGoNextPage}
              className={cn(!canGoNextPage && "pointer-events-none opacity-50")}
              onClick={(e) => {
                e.preventDefault();
                if (canGoNextPage) onPageChange(currentPage + 1);
              }}
            >
              <ChevronRight className={ICON_CLASS} />
            </PaginationLink>
          </PaginationItem>

          {/* >> (다음 10페이지) */}
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="다음 10페이지"
              aria-disabled={!canGoNextBlock}
              className={cn(
                !canGoNextBlock && "pointer-events-none opacity-50",
              )}
              onClick={(e) => {
                e.preventDefault();
                jumpToNextBlock();
              }}
            >
              <ChevronsRight className={ICON_CLASS} />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <SelectBox
        className={cn("w-[118px]")}
        options={PAGE_SIZE_OPTIONS}
        value={String(pageSize)}
        size="sm"
        onChange={({ value }) => onSizeChange(Number(value))}
        name="pageSize"
      />
    </div>
  );
}
