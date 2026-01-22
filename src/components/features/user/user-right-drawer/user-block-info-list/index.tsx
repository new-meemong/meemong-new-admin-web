"use client";

import React, {
  ChangeEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetUserBlockHistoriesQuery,
  useGetUserBlockStatusQuery,
  usePostUserBlockMutation,
  usePostUserUnblockMutation,
} from "@/queries/blocks";

import { Button } from "@/components/ui/button";
import { IUserForm } from "@/models/users";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

interface UserBlockInfoListProps {
  user: IUserForm;
  onUpdate: () => void;
}

function BlockInfoListItem({
  leftArea,
  rightArea,
}: {
  leftArea: React.ReactNode;
  rightArea: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "user-block-info-list-item",
        "flex flex-row justify-start w-full border-b typo-body-2-regular py-[6px]",
      )}
    >
      <div className={cn("description-box w-[120px] text-left flex items-center")}>
        {leftArea}
      </div>
      <div className={cn("button-box flex-1 ml-[8px]")}>{rightArea}</div>
    </li>
  );
}

const BLOCK_REASON_OPTIONS = [
  "스팸/홍보 및 타 플랫폼 유도",
  "약속 불이행 및 비매너 행위",
  "부적절한 언행",
  "부적절한 영업 행위",
  "개인정보 침해 및 노출",
  "허위 정보/사칭",
  "불성실한 컨설팅 답변",
  "기타 운영정책 위반",
  "직접 입력",
] as const;

const BLOCK_DAYS_OPTIONS = [
  { label: "1일", value: "1" },
  { label: "3일", value: "3" },
  { label: "7일", value: "7" },
  { label: "30일", value: "30" },
  { label: "직접 입력", value: "custom" },
] as const;

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;
const MINUTE_IN_MS = 60 * 1000;

export default function UserBlockInfoList({
  user,
  onUpdate,
}: UserBlockInfoListProps) {
  const [selectedReason, setSelectedReason] = useState<string>(
    "",
  );
  const [customReason, setCustomReason] = useState<string>("");
  const [selectedBlockDays, setSelectedBlockDays] = useState<string>(
    "",
  );
  const [customBlockDays, setCustomBlockDays] = useState<string>("");
  const getUserBlockStatusQuery = useGetUserBlockStatusQuery({
    userId: user.id!,
  });
  const getUserBlockHistoriesQuery = useGetUserBlockHistoriesQuery({
    userId: user.id!,
  });
  const createUserBlockMutation = usePostUserBlockMutation();
  const postUserUnblockMutation = usePostUserUnblockMutation();

  const dialog = useDialog();

  const isBlocked = useMemo(() => {
    return Boolean(getUserBlockStatusQuery.data?.data?.isBlocked);
  }, [getUserBlockStatusQuery.data?.data?.isBlocked]);

  const isCustomReason = selectedReason === "직접 입력";
  const isCustomBlockDays = selectedBlockDays === "custom";
  const resolvedReason = isCustomReason
    ? customReason.trim()
    : selectedReason;
  const resolvedBlockDays = isCustomBlockDays
    ? Number(customBlockDays)
    : Number(selectedBlockDays);
  const isReasonSelected = Boolean(selectedReason) && Boolean(resolvedReason);
  const isBlockDaysSelected =
    Boolean(selectedBlockDays) &&
    Number.isFinite(resolvedBlockDays) &&
    resolvedBlockDays > 0;
  const isActionEnabled = isBlocked || (isReasonSelected && isBlockDaysSelected);

  const handleChangeCustomReason: ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setCustomReason(event.target.value);
    }, []);

  const handleChangeCustomBlockDays: ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setCustomBlockDays(event.target.value);
    }, []);

  const getBlockDays = useCallback((startAt?: string, endAt?: string) => {
    if (!startAt || !endAt) return undefined;
    const startMs = new Date(startAt).getTime();
    const endMs = new Date(endAt).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return undefined;
    const diffDays = Math.ceil((endMs - startMs) / DAY_IN_MS);
    return diffDays > 0 ? diffDays : undefined;
  }, []);

  const getRemainingTime = useCallback((endAt?: string) => {
    if (!endAt) return undefined;
    const endMs = new Date(endAt).getTime();
    if (!Number.isFinite(endMs)) return undefined;
    const diffMs = endMs - Date.now();
    if (diffMs <= 0) return undefined;
    const days = Math.floor(diffMs / DAY_IN_MS);
    const hours = Math.floor((diffMs % DAY_IN_MS) / HOUR_IN_MS);
    const minutes = Math.floor((diffMs % HOUR_IN_MS) / MINUTE_IN_MS);
    return { days, hours, minutes };
  }, []);

  const handleSubmit = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (!isBlocked && !isReasonSelected) {
        toast.info("이용정지 사유를 선택하거나 입력해주세요.");
        return;
      }

      if (!isBlocked && !isBlockDaysSelected) {
        toast.info("정지 기간을 입력해주세요.");
        return;
      }

      try {
        const confirmed = await dialog.confirm(
          `${user?.displayName}(${user?.name || "-"}) 님을 ${isBlocked ? "이용정지 해제" : "이용정지"}하시겠습니까?`,
        );

        if (!confirmed) return;

        if (isBlocked) {
          const result = await postUserUnblockMutation.mutateAsync({
            userId: user.id,
          });

          if (result.data?.id !== undefined) {
            toast.success("해당 회원을 이용정지 해제했습니다.");
            setCustomReason("");
            setCustomBlockDays("");
            getUserBlockStatusQuery.refetch();
            getUserBlockHistoriesQuery.refetch();
            onUpdate();
          } else {
            throw new Error();
          }
        } else {
          const result = await createUserBlockMutation.mutateAsync({
            userId: user.id,
            reason: resolvedReason,
            blockDays: resolvedBlockDays,
          });

          if (result.data?.id !== undefined) {
            toast.success("해당 회원을 이용정지했습니다.");
            setCustomReason("");
            setCustomBlockDays("");
            getUserBlockStatusQuery.refetch();
            getUserBlockHistoriesQuery.refetch();
            onUpdate();
          } else {
            throw new Error();
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [
      user?.id,
      user?.displayName,
      user?.name,
      isBlocked,
      dialog,
      isReasonSelected,
      isBlockDaysSelected,
      resolvedReason,
      resolvedBlockDays,
    ],
  );

  return (
    <ul className={cn("user-block-info-list", "flex flex-col w-full")}>
      <BlockInfoListItem
        leftArea={
          <>
            <div className={cn("date-area text-left")}>
              {formatDate(new Date(), "YYYY.MM.DD")}
            </div>
          </>
        }
        rightArea={
          <div className={cn("flex flex-col gap-[8px]")}>
            <div className={cn("flex flex-wrap items-center gap-[8px]")}>
              <div className={cn("flex-1 min-w-[160px]")}>
                <Select
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                  disabled={isBlocked}
                >
                  <SelectTrigger className={cn("w-full")}>
                    <SelectValue placeholder="정지사유" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_REASON_OPTIONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={cn("w-[140px]")}>
                <Select
                  value={selectedBlockDays}
                  onValueChange={setSelectedBlockDays}
                  disabled={isBlocked}
                >
                  <SelectTrigger className={cn("w-full")}>
                    <SelectValue placeholder="정지기간" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_DAYS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSubmit}
                variant={"outline"}
                size={"sm"}
                disabled={!isActionEnabled}
                className={cn(isBlocked && "hidden")}
              >
                {isBlocked ? "이용정지 해제" : "이용정지"}
              </Button>
            </div>
            {isCustomReason && (
              <Input
                size="sm"
                value={customReason}
                onChange={handleChangeCustomReason}
                placeholder="정지 사유를 입력해주세요."
                disabled={isBlocked}
              />
            )}
            {isCustomBlockDays && (
              <Input
                size="sm"
                type="number"
                min={1}
                value={customBlockDays}
                onChange={handleChangeCustomBlockDays}
                placeholder="정지기간(일)을 입력해주세요."
                disabled={isBlocked}
              />
            )}
          </div>
        }
      />
      {(getUserBlockHistoriesQuery.data?.content || []).map(
        (blockInfo, index) => {
          const blockDays = getBlockDays(
            blockInfo.createdAt,
            blockInfo.blockEndAt,
          );
          const blockedAt = formatDate(
            blockInfo.createdAt,
            "YYYY.MM.DD HH:mm",
          );
          const unblockedAt = formatDate(
            blockInfo.blockEndAt,
            "YYYY.MM.DD HH:mm",
          );
          const remaining = getRemainingTime(blockInfo.blockEndAt);
          const isActive = Boolean(remaining);

          return (
            <BlockInfoListItem
              key={`block-info-list-item-${index}`}
              leftArea={<div />}
              rightArea={
                <div className={cn("flex flex-col gap-[8px] pt-[8px] pb-[8px]")}>
                  <div className={cn("flex flex-wrap items-center gap-[8px]")}>
                    <div className={cn("min-w-[420px]")}>
                      <span className={cn("text-foreground-sub")}>
                        정지사유:
                      </span>{" "}
                      <span
                        className={cn("text-foreground-strong font-semibold")}
                      >
                        {blockInfo.reason}
                      </span>
                    </div>
                    <div className={cn("w-[140px]")}>
                      <span className={cn("text-foreground-sub")}>
                        정지기간:
                      </span>{" "}
                      <span
                        className={cn("text-foreground-strong font-semibold")}
                      >
                        {blockDays ? `${blockDays}일` : "-"}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "typo-body-2-regular text-left flex items-center justify-between gap-[8px] w-full",
                    )}
                  >
                    <div className={cn("flex flex-wrap items-center gap-[8px]")}>
                      <span className={cn("text-foreground-sub")}>상태</span>{" "}
                      <span
                        className={cn("text-foreground-strong font-semibold")}
                      >
                        {blockedAt} 정지
                      </span>{" "}
                      <span className={cn("text-foreground-sub")}>/</span>{" "}
                      <span
                        className={cn("text-foreground-strong font-semibold")}
                      >
                        {unblockedAt} {isActive ? "해제 예정" : "해제"}
                      </span>
                    </div>
                    {isActive && (
                      <Button
                        onClick={handleSubmit}
                        variant={"outline"}
                        size={"sm"}
                      >
                        이용정지 해제
                      </Button>
                    )}
                  </div>
                  {remaining && (
                    <div
                      className={cn(
                        "typo-body-2-regular text-red-500 font-semibold",
                      )}
                    >
                      {remaining.days}일 {remaining.hours}시간{" "}
                      {remaining.minutes}분 남음
                    </div>
                  )}
                </div>
              }
            />
          );
        },
      )}
    </ul>
  );
}
