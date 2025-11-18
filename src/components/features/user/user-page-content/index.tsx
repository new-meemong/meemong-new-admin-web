"use client";

import { BlockType, UserRoleType } from "@/models/users";
import React, { useCallback, useEffect, useRef, useState } from "react";
import UserSearchForm, {
  IUserSearchParams
} from "@/components/features/user/user-search-form";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IUser } from "@/models/users";
import UserTable from "@/components/features/user/user-table";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { userAPI } from "@/apis/user";

interface UserPageContentProps {
  className?: string;
}

function UserPageContent({ className }: UserPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IUserSearchParams = {
    role: "ALL",
    blockType: "ALL",
    searchType: "UID",
    searchKeyword: "",
    ...DEFAULT_PAGINATION
  };

  const methods = useSearchMethods<IUserSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS
  });

  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);
  const isInitialLoadRef = useRef(true);

  const INITIAL_PAGE_SIZE = 30;
  const PAGE_SIZE = 20;

  const loadMoreUsers = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    const nextPage = currentPageRef.current;
    const pageSize = isInitialLoadRef.current ? INITIAL_PAGE_SIZE : PAGE_SIZE;

    try {
      const result = await userAPI.getAll({
        role:
          methods.params.role === "ALL"
            ? undefined
            : (Number(methods.params.role) as UserRoleType),
        blockType:
          methods.params.blockType === "ALL"
            ? undefined
            : (methods.params.blockType as BlockType),
        searchType: methods.params.searchType,
        searchKeyword: methods.params.searchKeyword,
        page: nextPage,
        size: pageSize
      });

      if (result) {
        const newUsers = result.content || [];
        if (newUsers.length === 0) {
          setHasMore(false);
        } else {
          setAllUsers((prev) => [...prev, ...newUsers]);
          if (newUsers.length < pageSize) {
            setHasMore(false);
          } else {
            currentPageRef.current = nextPage + 1;
            setCurrentPage(nextPage + 1);
          }
        }
      }

      // 첫 번째 로드 후에는 초기 로드 플래그를 false로 설정
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, methods.params]);

  // 초기 로드 및 검색 파라미터 변경 시 첫 페이지 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setAllUsers([]);
      setCurrentPage(1);
      currentPageRef.current = 1;
      setHasMore(true);
      setIsLoading(true);
      isLoadingRef.current = true;
      isInitialLoadRef.current = true; // 초기 로드 플래그 설정

      try {
        const result = await userAPI.getAll({
          role:
            methods.params.role === "ALL"
              ? undefined
              : (Number(methods.params.role) as UserRoleType),
          blockType:
            methods.params.blockType === "ALL"
              ? undefined
              : (methods.params.blockType as BlockType),
          searchType: methods.params.searchType,
          searchKeyword: methods.params.searchKeyword,
          page: 1,
          size: INITIAL_PAGE_SIZE // 초기 로드는 30개
        });

        if (result) {
          const users = result.content || [];
          setAllUsers(users);
          if (users.length < INITIAL_PAGE_SIZE) {
            setHasMore(false);
          } else {
            currentPageRef.current = 2;
            setCurrentPage(2);
          }
        }
        isLoadingRef.current = false;
        setIsLoading(false);
        isInitialLoadRef.current = false; // 초기 로드 완료

        // 스크롤 가능 여부 체크 후 추가 로드 (스크롤이 생길 때까지 반복)
        const checkAndLoadMore = async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));

          const hasScrollbar =
            document.documentElement.scrollHeight >
            document.documentElement.clientHeight;
          const tableContainer = document.querySelector(".user-table-wrapper");
          const containerHasScroll = tableContainer
            ? (tableContainer as HTMLElement).scrollHeight >
              (tableContainer as HTMLElement).clientHeight
            : false;

          if (
            !hasScrollbar &&
            !containerHasScroll &&
            hasMore &&
            !isLoadingRef.current
          ) {
            await loadMoreUsers();
            // 추가 로드 완료 후 다시 체크
            await checkAndLoadMore();
          }
        };

        checkAndLoadMore();
      } catch {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [methods.searchParams, methods.params, hasMore, loadMoreUsers]);

  // Intersection Observer로 하단 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          loadMoreUsers();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadMoreUsers]);

  return (
    <div className={cn("user-page-content", className)}>
      <UserSearchForm
        methods={methods}
        onSubmit={() => {
          methods.handleSubmit();
        }}
        onRefresh={() => {
          methods.handleReset();
        }}
      />
      <UserTable
        data={allUsers}
        totalCount={allUsers.length}
        currentPage={1}
        pageSize={PAGE_SIZE}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onRefresh={() => {
          setAllUsers([]);
          setCurrentPage(1);
          currentPageRef.current = 1;
          setHasMore(true);
          setIsLoading(true);
          isLoadingRef.current = true;
          isInitialLoadRef.current = true; // 새로고침 시 초기 로드로 처리
          userAPI
            .getAll({
              role:
                methods.params.role === "ALL"
                  ? undefined
                  : (Number(methods.params.role) as UserRoleType),
              blockType:
                methods.params.blockType === "ALL"
                  ? undefined
                  : (methods.params.blockType as BlockType),
              searchType: methods.params.searchType,
              searchKeyword: methods.params.searchKeyword,
              page: 1,
              size: INITIAL_PAGE_SIZE // 새로고침 시에도 30개
            })
            .then((result) => {
              if (result) {
                const users = result.content || [];
                setAllUsers(users);
                if (users.length < INITIAL_PAGE_SIZE) {
                  setHasMore(false);
                } else {
                  currentPageRef.current = 2;
                  setCurrentPage(2);
                }
              }
              isLoadingRef.current = false;
              setIsLoading(false);
              isInitialLoadRef.current = false; // 초기 로드 완료
            })
            .catch(() => {
              isLoadingRef.current = false;
              setIsLoading(false);
              isInitialLoadRef.current = false;
            });
        }}
        showPagination={false}
      />
      <div ref={observerTarget} className={cn("h-4 w-full")} />
      {isLoading && (
        <div className={cn("w-full text-center py-4 text-foreground-weak")}>
          로딩 중...
        </div>
      )}
      {!hasMore && allUsers.length > 0 && (
        <div className={cn("w-full text-center py-4 text-foreground-weak")}>
          모든 데이터를 불러왔습니다.
        </div>
      )}
    </div>
  );
}

export default UserPageContent;
