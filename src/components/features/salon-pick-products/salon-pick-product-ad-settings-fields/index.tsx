"use client";

import React, { useMemo } from "react";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import {
  SALON_PICK_PRODUCT_BEAUTY_TREATMENT_TYPES,
  SALON_PICK_PRODUCT_HAIR_CONCERNS,
  SALON_PICK_PRODUCT_HAIR_TREATMENT_TYPES,
  SALON_PICK_PRODUCT_SEX,
} from "@/constants/salonPickProducts";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type SalonPickProductAdSettingsVariant = "compact" | "detail";

type Option = {
  label: string;
  value: string;
};

type OptionGroup = {
  label?: string;
  options: readonly Option[];
};

interface OptionCheckboxGroupProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  groups: readonly OptionGroup[];
  variant: SalonPickProductAdSettingsVariant;
}

interface SexSegmentedControlProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  variant: SalonPickProductAdSettingsVariant;
}

interface SalonPickProductAdSettingsFieldsProps<
  TFieldValues extends FieldValues,
> {
  hairConcernsName: FieldPath<TFieldValues>;
  sexName: FieldPath<TFieldValues>;
  preferredTreatmentTypesName: FieldPath<TFieldValues>;
  bannerSlot?: React.ReactNode;
  className?: string;
  variant?: SalonPickProductAdSettingsVariant;
}

const hairConcernOptions: Option[] = SALON_PICK_PRODUCT_HAIR_CONCERNS.map(
  (value) => ({
    label: value,
    value,
  }),
);

const beautyTreatmentOptions: Option[] =
  SALON_PICK_PRODUCT_BEAUTY_TREATMENT_TYPES.map((value) => ({
    label: value,
    value,
  }));

const hairTreatmentOptions: Option[] =
  SALON_PICK_PRODUCT_HAIR_TREATMENT_TYPES.map((value) => ({
    label: value,
    value,
  }));

const sexOptions: Option[] = [
  SALON_PICK_PRODUCT_SEX.ALL,
  SALON_PICK_PRODUCT_SEX.MALE,
  SALON_PICK_PRODUCT_SEX.FEMALE,
].map((value) => ({
  label: value,
  value,
}));

const hairConcernGroups: OptionGroup[] = [{ options: hairConcernOptions }];

const treatmentTypeGroups: OptionGroup[] = [
  {
    label: "뷰티",
    options: beautyTreatmentOptions,
  },
  {
    label: "헤어",
    options: hairTreatmentOptions,
  },
];

function OptionCheckboxGroup<TFieldValues extends FieldValues>({
  name,
  label,
  groups,
  variant,
}: OptionCheckboxGroupProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field, fieldState } = useController({ name, control });
  const options = useMemo(
    () => groups.flatMap((group) => group.options),
    [groups],
  );
  const selectedValues = Array.isArray(field.value)
    ? (field.value as string[])
    : [];
  const isAllChecked =
    options.length > 0 &&
    options.every((option) => selectedValues.includes(option.value));
  const gridClassName = variant === "compact" ? "grid-cols-2" : "grid-cols-3";

  const handleToggleAll = (checked: boolean) => {
    field.onChange(checked ? options.map((option) => option.value) : []);
  };

  const handleToggleOption = (optionValue: string, checked: boolean) => {
    if (checked) {
      field.onChange(
        selectedValues.includes(optionValue)
          ? selectedValues
          : [...selectedValues, optionValue],
      );
      return;
    }

    field.onChange(selectedValues.filter((value) => value !== optionValue));
  };

  return (
    <div>
      <div className="mb-[8px] flex items-center justify-between gap-[12px]">
        <FormLabel className="text-[12px] font-semibold leading-normal text-[#333340]">
          {label}
        </FormLabel>
        <label className="flex cursor-pointer select-none items-center gap-[6px] text-[12px] leading-normal text-[#4d4d59]">
          <Checkbox
            checked={isAllChecked}
            onCheckedChange={(checked) => handleToggleAll(checked === true)}
            className="h-[16px] w-[16px]"
          />
          전체
        </label>
      </div>
      <div className="space-y-[10px] rounded-[6px] border border-[#d9ddea] bg-[#fafaff] p-[12px]">
        {groups.map((group) => (
          <div key={group.label ?? "options"}>
            {group.label ? (
              <p className="mb-[6px] text-[11px] font-semibold leading-normal text-[#6b7280]">
                {group.label}
              </p>
            ) : null}
            <div className={cn("grid gap-x-[10px] gap-y-[8px]", gridClassName)}>
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-[24px] cursor-pointer select-none items-center gap-[6px] text-[12px] leading-normal text-[#1a1a26]"
                >
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleToggleOption(option.value, checked === true)
                    }
                    className="h-[16px] w-[16px]"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {fieldState.error?.message ? (
        <p className="mt-[4px] text-[11px] font-normal leading-normal text-[#ff4d4f]">
          {fieldState.error.message}
        </p>
      ) : null}
    </div>
  );
}

function SexSegmentedControl<TFieldValues extends FieldValues>({
  name,
  variant,
}: SexSegmentedControlProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field, fieldState } = useController({ name, control });
  const widthClassName = variant === "compact" ? "w-full" : "w-[360px]";

  return (
    <div>
      <FormLabel className="mb-[8px] block text-[12px] font-semibold leading-normal text-[#333340]">
        노출성별
      </FormLabel>
      <div
        className={cn(
          "grid grid-cols-3 overflow-hidden rounded-[6px] border border-[#cfd6e6]",
          widthClassName,
        )}
      >
        {sexOptions.map((option) => {
          const isSelected = field.value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              className={cn(
                "h-[34px] border-r border-[#cfd6e6] text-[12px] font-medium leading-normal last:border-r-0",
                isSelected
                  ? "bg-[#3171ff] text-white"
                  : "bg-white text-[#4d4d59]",
              )}
              onClick={() => field.onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {fieldState.error?.message ? (
        <p className="mt-[4px] text-[11px] font-normal leading-normal text-[#ff4d4f]">
          {fieldState.error.message}
        </p>
      ) : null}
    </div>
  );
}

export default function SalonPickProductAdSettingsFields<
  TFieldValues extends FieldValues,
>({
  hairConcernsName,
  sexName,
  preferredTreatmentTypesName,
  bannerSlot,
  className,
  variant = "compact",
}: SalonPickProductAdSettingsFieldsProps<TFieldValues>) {
  return (
    <section className={cn("space-y-[18px]", className)}>
      <h3 className="text-[14px] font-semibold leading-normal text-[#1a1a26]">
        광고 타겟팅 옵션
      </h3>
      <OptionCheckboxGroup<TFieldValues>
        name={hairConcernsName}
        label="관련 고민 선택"
        groups={hairConcernGroups}
        variant={variant}
      />
      <SexSegmentedControl<TFieldValues> name={sexName} variant={variant} />
      {bannerSlot}
      <OptionCheckboxGroup<TFieldValues>
        name={preferredTreatmentTypesName}
        label="시술종류 선택"
        groups={treatmentTypeGroups}
        variant={variant}
      />
    </section>
  );
}
