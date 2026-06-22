import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { useCallback, useState } from "react";

export type ContentsCursorPageResponse = {
  dataCount?: number;
  dataList?: unknown[];
  __nextCursor?: string | null;
};

interface UseContentsCursorPaginationProps {
  initialPageSize?: number;
}

export default function useContentsCursorPagination({
  initialPageSize = DEFAULT_PAGINATION.size,
}: UseContentsCursorPaginationProps = {}) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGINATION.page);

  const currentCursor = cursorStack[currentPage - 1];

  const resetPagination = useCallback(() => {
    setCursorStack([undefined]);
    setCurrentPage(DEFAULT_PAGINATION.page);
  }, []);

  const handleSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCursorStack([undefined]);
    setCurrentPage(DEFAULT_PAGINATION.page);
  }, []);

  const canChangePage = useCallback(
    (targetPage: number, currentNextCursor?: string | null) => {
      if (targetPage < DEFAULT_PAGINATION.page) {
        return false;
      }

      if (targetPage <= cursorStack.length) {
        return true;
      }

      return (
        targetPage === cursorStack.length + 1 && Boolean(currentNextCursor)
      );
    },
    [cursorStack.length],
  );

  const handlePageChange = useCallback(
    (targetPage: number, currentNextCursor?: string | null) => {
      if (
        !canChangePage(targetPage, currentNextCursor) ||
        targetPage === currentPage
      ) {
        return;
      }

      if (targetPage <= cursorStack.length) {
        setCurrentPage(targetPage);
        return;
      }

      setCursorStack([...cursorStack, currentNextCursor || undefined]);
      setCurrentPage(targetPage);
    },
    [canChangePage, currentPage, cursorStack],
  );

  const getReachableTotalCount = useCallback(
    (response?: ContentsCursorPageResponse) => {
      if (!response) {
        return Math.max(cursorStack.length, currentPage) * pageSize;
      }

      const currentPageItemCount = response?.dataList?.length ?? 0;
      const hasNextCursor = Boolean(response?.__nextCursor);

      if (!hasNextCursor) {
        return (currentPage - 1) * pageSize + Math.max(currentPageItemCount, 1);
      }

      const visiblePageCount = Math.max(cursorStack.length, currentPage + 1);

      return visiblePageCount * pageSize;
    },
    [currentPage, cursorStack.length, pageSize],
  );

  return {
    currentCursor,
    currentPage,
    pageSize,
    resetPagination,
    handlePageChange,
    handleSizeChange,
    canChangePage,
    getReachableTotalCount,
  };
}
