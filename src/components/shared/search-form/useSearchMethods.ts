import { ChangeEventHandler, useEffect, useState } from "react";

type Primitive = string | number | string[];
type BaseParams = { page: number; size: number } & Record<string, Primitive>;

interface UseSearchMethodsProps<T extends BaseParams> {
  defaultParams: T;
}

export interface IUseSearchMethods<T extends BaseParams> {
  params: T;
  setParams: (value: T | ((prev: T) => T)) => void;
  searchParams: T;
  setSearchParams: (value: T | ((prev: T) => T)) => void;
  handleSubmit: () => void;
  handleReset: () => void;
  handleChangeText: ChangeEventHandler<HTMLInputElement>;
  handleSelect: (params: { key: keyof T; value: T[keyof T] }) => void;
  handleChangePage: (page: number) => void;
  handleChangeSize: (size: number) => void;
}

export default function useSearchMethods<T extends BaseParams>({
  defaultParams,
}: UseSearchMethodsProps<T>): IUseSearchMethods<T> {
  const [params, _setParams] = useState<T>(defaultParams);
  const [searchParams, _setSearchParams] = useState<T>(defaultParams);

  const setParams: IUseSearchMethods<T>["setParams"] = (value) => {
    _setParams((prev) =>
      typeof value === "function" ? (value as (p: T) => T)(prev) : value,
    );
  };

  const setSearchParams: IUseSearchMethods<T>["setSearchParams"] = (value) => {
    _setSearchParams((prev) =>
      typeof value === "function" ? (value as (p: T) => T)(prev) : value,
    );
  };

  // defaultParams(탭 등) 변경 시: page=1로 리셋, size는 보존
  useEffect(() => {
/*    setParams((prev) => {
      const next: T = {
        ...prev, // 기존 값 보존
        ...defaultParams, // 탭 값 덮어쓰기
        page: 1, // 페이지는 초기화
        size: prev.size ?? defaultParams.size, // size 보존
      };
      return shallowEqual(prev, next) ? prev : next;
    });

    setSearchParams((prev) => {
      const next: T = {
        ...prev,
        ...defaultParams,
        page: 1,
        size: prev.size ?? defaultParams.size,
      };
      return shallowEqual(prev, next) ? prev : next;
    });*/
  }, [defaultParams]);

  const handleSubmit = () => {
    // 제출 시 page=1로 확정 커밋
    setParams((prev) => ({ ...prev, page: 1 }));
    setSearchParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    // 기본값으로 초기화(현재 size 유지)
    setParams((prev) => ({ ...defaultParams, size: prev.size }));
    setSearchParams((prev) => ({ ...defaultParams, size: prev.size }));
  };

  const handleChangeText: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setParams((prev) => {
      const key = name as keyof T;
      const cur = prev[key];
      const nextVal = (
        typeof cur === "number" ? Number(value) : value
      ) as T[keyof T];
      return { ...prev, [key]: nextVal };
    });
  };

  const handleSelect = ({
    key,
    value,
  }: {
    key: keyof T;
    value: T[keyof T];
  }) => {
    // UI 폼 상태 업데이트
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }));

    // 즉시 커밋해서 쿼리 트리거
    setSearchParams((prev) => {
      const sameKey = prev[key] === value;
      const samePage = prev.page === 1;
      console.log(prev,sameKey, samePage, key, value);
      if (sameKey && samePage) return prev; // 불필요한 리렌더 방지
      return { ...prev, [key]: value, page: 1 };
    });
  };

  const handleChangePage = (page: number) => {
    console.log(params.page, searchParams.page, page);
    setParams((prev) => (prev.page === page ? prev : { ...prev, page }));
    setSearchParams((prev) => (prev.page === page ? prev : { ...prev, page }));
  };

  const handleChangeSize = (size: number) => {
    // size 변경 시 첫 페이지로
    setParams((prev) => ({ ...prev, size, page: 1 }));
    setSearchParams((prev) => ({ ...prev, size, page: 1 }));
  };

  return {
    params,
    setParams,
    searchParams,
    setSearchParams,
    handleSubmit,
    handleReset,
    handleChangeText,
    handleSelect,
    handleChangePage,
    handleChangeSize,
  };
}
