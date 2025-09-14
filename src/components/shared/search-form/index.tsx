"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import IcSearch from "@/assets/icons/ic_search.svg";
import IcRefresh from "@/assets/icons/ic_refresh.svg";
import { Label } from "@/components/ui/label";
import { Input, InputProps } from "@/components/ui/input";
import SelectBox, { SelectBoxProps } from "@/components/shared/select-box";

export interface SearchFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  children?: React.ReactNode;
  className?: string;
  onSubmit?: () => void;
  onRefresh?: () => void;
}

function SearchForm({
  children,
  className,
  onSubmit,
  onRefresh,
}: SearchFormProps) {
  const handleSubmit = useCallback(
    (event: React.MouseEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit!();
    },
    [onSubmit],
  );

  const handleRefresh = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onRefresh!();
    },
    [onRefresh],
  );

  return (
    <div className={cn("search-form w-[962px] h-[36px] mb-[42px]", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-row items-center justify-start")}
      >
        <div
          className={cn(
            "search-form-content mr-[8px] flex flex-row items-center gap-x-[10px]",
          )}
        >
          {children}
          {onSubmit && (
            <Button type={"submit"} variant={"outline"} size={"icon"}>
              <IcSearch />
            </Button>
          )}
          {onRefresh && (
            <Button variant={"outline"} size={"icon"} onClick={handleRefresh}>
              <IcRefresh />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function SearchFormInput<T>({
  name,
  title,
  ...props
}: InputProps & { name: keyof T & string; title?: string }) {
  return (
    <SearchFormWrapper className={cn("search-form-input")}>
      {title && <Label className="mr-[8px]">{title}</Label>}
      <Input name={name} size={"sm"} className={cn("w-[185px]")} {...props} />
    </SearchFormWrapper>
  );
}

function SearchFormSelectBox<K>({
  className,
  title,
  ...props
}: SelectBoxProps<K> & {
  name: keyof K & string;
  title?: string;
}) {
  return (
    <SearchFormWrapper className="search-form-select-box">
      {title && <Label className="mr-[8px]">{title}</Label>}
      <SelectBox
        className={cn("rounded-none w-[182px]", className)}
        size="md"
        {...props}
      />
    </SearchFormWrapper>
  );
}

function SearchFormWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "search-form-wrapper flex flex-row items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { SearchForm, SearchFormInput, SearchFormSelectBox };
