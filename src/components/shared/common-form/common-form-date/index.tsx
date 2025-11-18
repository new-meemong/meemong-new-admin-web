"use client";

import * as React from "react";

import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

interface CommonFormCalendarProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  className?: string;
  showTime?: boolean;
  minDate?: Date;
}

export function CommonFormDate<TFieldValues extends FieldValues>({
  name,
  label,
  className,
  showTime = false,
  minDate
}: CommonFormCalendarProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <FormField<TFieldValues>
      control={control}
      name={name}
      render={({ field }) => {
        // field.value를 Date 객체로 변환하는 헬퍼 함수
        const getDateValue = (): Date | undefined => {
          if (!field.value) return undefined;

          if (typeof field.value === "string") {
            try {
              return new Date(field.value);
            } catch {
              return undefined;
            }
          }

          // Date 객체인지 확인 (타입 가드)
          const value = field.value as unknown;
          if (
            value &&
            typeof value === "object" &&
            "getTime" in value &&
            typeof (value as Date).getTime === "function"
          ) {
            return value as Date;
          }

          return undefined;
        };

        if (showTime) {
          // showTime이 true일 때 날짜와 시간을 모두 선택할 수 있도록 함 (24시간 형식)
          const dateValue = getDateValue();

          // 24시간 형식으로 시간 값 계산
          const getTimeValues = () => {
            if (dateValue) {
              const hours = dateValue.getHours();
              const minutes = dateValue.getMinutes();
              return {
                hour: String(hours).padStart(2, "0"),
                minute: String(minutes).padStart(2, "0")
              };
            }
            return { hour: "23", minute: "59" };
          };
          const timeValues = getTimeValues();

          // 시간 옵션 생성 (0-23)
          const hourOptions = Array.from({ length: 24 }, (_, i) => ({
            value: String(i).padStart(2, "0"),
            label: String(i).padStart(2, "0")
          }));

          // 분 옵션 생성 (0-59, 전체)
          const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
            value: String(i).padStart(2, "0"),
            label: String(i).padStart(2, "0")
          }));

          // 날짜 선택 시
          const handleDateSelect = (date: Date | undefined) => {
            if (date) {
              // 기존 시간을 유지
              const newDate = new Date(date);
              newDate.setHours(
                Number(timeValues.hour),
                Number(timeValues.minute),
                0,
                0
              );
              field.onChange(newDate.toISOString());
            } else {
              field.onChange(undefined);
            }
            setOpen(false);
          };

          // 시간 변경 시
          const handleTimeChange = (type: "hour" | "minute", value: string) => {
            const newHour = type === "hour" ? value : timeValues.hour;
            const newMinute = type === "minute" ? value : timeValues.minute;

            if (dateValue) {
              const newDate = new Date(dateValue);
              newDate.setHours(Number(newHour), Number(newMinute), 0, 0);
              field.onChange(newDate.toISOString());
            } else {
              // 날짜가 없으면 오늘 날짜에 시간만 설정
              const today = new Date();
              today.setHours(Number(newHour), Number(newMinute), 0, 0);
              field.onChange(today.toISOString());
            }
          };

          return (
            <FormItem
              className={cn("flex flex-col gap-1 mt-[20px]", className)}
            >
              <FormLabel>{label}</FormLabel>
              <div className={cn("flex gap-2")}>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal w-[140px]",
                          !dateValue && "text-muted-foreground"
                        )}
                      >
                        {dateValue
                          ? format(dateValue, "yyyy.MM.dd")
                          : "날짜 선택"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 z-[999]"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={dateValue}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) =>
                          minDate ? date < minDate : date < new Date()
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <div className={cn("flex gap-2")}>
                  <Select
                    value={timeValues.hour}
                    onValueChange={(value) => handleTimeChange("hour", value)}
                  >
                    <SelectTrigger className={cn("h-10 w-20 gap-1 px-2")}>
                      <SelectValue placeholder="시" />
                    </SelectTrigger>
                    <SelectContent>
                      {hourOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={timeValues.minute}
                    onValueChange={(value) => handleTimeChange("minute", value)}
                  >
                    <SelectTrigger className={cn("h-10 w-20 gap-1 px-2")}>
                      <SelectValue placeholder="분" />
                    </SelectTrigger>
                    <SelectContent>
                      {minuteOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormItem>
          );
        }

        return (
          <FormItem className={cn("flex flex-col gap-1 mt-[20px]", className)}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "pl-3 text-left font-normal w-full",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? format(field.value, "yyyy.MM.dd")
                      : "날짜 선택"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[999]" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setOpen(false);
                    }}
                    initialFocus
                    disabled={(date) =>
                      minDate ? date < minDate : date < new Date()
                    }
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
