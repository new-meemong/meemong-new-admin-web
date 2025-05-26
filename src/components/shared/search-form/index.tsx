"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import IcRefresh from "@/assets/icons/ic_refresh.svg";
import { Label } from "@/components/ui/label";
import { Input, InputProps } from "@/components/ui/input";
import SelectBox, { SelectBoxProps } from "@/components/shared/select-box";

export interface SearchParams {
  [key: string]: string;
}

export interface SearchFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  children?: React.ReactNode;
  className?: string;
  params: SearchParams;
  onParamsChange: (params: SearchParams) => void;
  onSubmit: () => void;
}

function SearchForm({ children, className, onSubmit }: SearchFormProps) {
  const handleSubmit = useCallback(
    (event: React.MouseEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit();
    },
    [onSubmit],
  );

  return (
    <div className={cn("search-form w-[962px] h-[36px] mb-[42px]", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-row items-center justify-between")}
      >
        <div
          className={cn(
            "search-form-content flex-1 flex flex-row gap-x-[10px]",
          )}
        >
          {children}
        </div>
        <Button variant={"outline"} size={"icon"}>
          <IcRefresh />
        </Button>
      </form>
    </div>
  );
}

function SearchFormInput({
  name,
  title,
  ...props
}: InputProps & { name: string; title?: string }) {
  return (
    <SearchFormWrapper className={cn("search-form-input")}>
      {title && <Label className={cn("mr-[8px]")}>{title}</Label>}
      <Input name={name} size={"sm"} {...props} />
    </SearchFormWrapper>
  );
}

function SearchFormSelectBox({
  title,
  ...props
}: SelectBoxProps & {
  name: string;
  title?: string;
  params?: SearchParams;
  onParamsChange?: (params: SearchParams) => void;
}) {
  return (
    <SearchFormWrapper className={cn("search-form-select-box")}>
      {title && <Label className={cn("mr-[8px]")}>{title}</Label>}
      <SelectBox size={"md"} {...props} />
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
