"use client";

import React, { ReactNode, useCallback, useId, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import SelectBox, { SelectBoxProps } from "@/components/shared/select-box";
import { FormLabel } from "@/components/ui/form";

type Layout = "row" | "column";

type SingleConfig<K> = Omit<SelectBoxProps<K>, "onChange"> & {
  onChange?: (args: { key: keyof K; value: string }) => void;
  wrapperClassName?: string;
  /** 고정 너비 (px 숫자나 CSS 문자열). 설정하면 반대편은 flex-1로 꽉 채움 */
  width?: number | string;
  /** 필요하면 인라인 스타일도 허용 */
  wrapperStyle?: CSSProperties;
};

export interface CommonFormDoubleSelectBoxProps<KL, KR> {
  label?: ReactNode;
  labelClassName?: string;
  required?: boolean;
  left: SingleConfig<KL>;
  right: SingleConfig<KR>;
  onChange?: (
    args:
      | { which: "left"; key: keyof KL; value: string }
      | { which: "right"; key: keyof KR; value: string },
  ) => void;
  align?: Layout; // 기본: row
  gapClassName?: string;
  className?: string;
  renderSeparator?: ReactNode;
}

export default function CommonFormDoubleSelectBox<KL, KR>({
  label,
  labelClassName,
  required = false,
  left,
  right,
  onChange,
  align = "row",
  gapClassName,
  className,
  renderSeparator,
}: CommonFormDoubleSelectBoxProps<KL, KR>) {
  const isRow = align === "row";
  const titleId = useId();

  const handleLeftChange = useCallback(
    ({ key, value }: { key: keyof KL; value: string }) => {
      left.onChange?.({ key, value });
      onChange?.({ which: "left", key, value });
    },
    [left, onChange],
  );

  const handleRightChange = useCallback(
    ({ key, value }: { key: keyof KR; value: string }) => {
      right.onChange?.({ key, value });
      onChange?.({ which: "right", key, value });
    },
    [right, onChange],
  );

  // --- width 계산 (row에서만 의미 있음) ---
  const leftFixed = left.width != null && left.width !== "";
  const rightFixed = right.width != null && right.width !== "";

  const toWidthStyle = (w?: number | string): CSSProperties | undefined =>
    w == null || w === ""
      ? undefined
      : { width: typeof w === "number" ? `${w}px` : w };

  // row일 때의 wrapper 클래스/스타일
  const leftWrapperClass = cn(
    isRow
      ? leftFixed
        ? "min-w-0" // 고정 폭이지만 내용 overflow 방지
        : rightFixed
          ? "flex-1 min-w-0" // 반대편 고정이면 이쪽이 꽉 채움
          : "flex-1 min-w-0" // 둘 다 미지정이면 양쪽 flex
      : "w-full",
    left.wrapperClassName,
  );
  const rightWrapperClass = cn(
    isRow
      ? rightFixed
        ? "min-w-0"
        : leftFixed
          ? "flex-1 min-w-0"
          : "flex-1 min-w-0"
      : "w-full",
    right.wrapperClassName,
  );

  const leftWrapperStyle: CSSProperties | undefined = isRow
    ? { ...left.wrapperStyle, ...toWidthStyle(left.width) }
    : left.wrapperStyle;

  const rightWrapperStyle: CSSProperties | undefined = isRow
    ? { ...right.wrapperStyle, ...toWidthStyle(right.width) }
    : right.wrapperStyle;

  return (
    <div
      className={cn(
        "flex w-full",
        isRow ? "flex-row items-center gap-3" : "flex-col gap-1",
        className,
      )}
      role="group"
      aria-labelledby={label ? titleId : undefined}
    >
      {label && (
        <FormLabel
          id={titleId}
          className={cn(
            "text-foreground-strong shrink-0",
            isRow ? "min-w-[60px] text-left" : "mb-2",
            labelClassName,
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
      )}

      <div
        className={cn(
          "flex w-full",
          isRow ? "flex-row items-center" : "flex-col",
          gapClassName ?? (isRow ? "gap-3" : "gap-2"),
          !label && isRow && "w-full",
        )}
      >
        <div className={leftWrapperClass} style={leftWrapperStyle}>
          <SelectBox<KL>
            options={left.options}
            value={left.value}
            defaultValue={left.defaultValue}
            onChange={handleLeftChange}
            name={left.name}
            placeholder={left.placeholder ?? "선택하세요"}
            size={left.size ?? "md"}
            className={cn("w-full", left.className)}
            disabled={left.disabled}
            readOnly={left.readOnly}
          />
        </div>

        {renderSeparator && <div>{renderSeparator}</div>}

        <div className={rightWrapperClass} style={rightWrapperStyle}>
          <SelectBox<KR>
            options={right.options}
            value={right.value}
            defaultValue={right.defaultValue}
            onChange={handleRightChange}
            name={right.name}
            placeholder={right.placeholder ?? "선택하세요"}
            size={right.size ?? "md"}
            className={cn("w-full", right.className)}
            disabled={right.disabled}
            readOnly={right.readOnly}
          />
        </div>
      </div>
    </div>
  );
}
