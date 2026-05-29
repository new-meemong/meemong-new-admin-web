"use client";

import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useGetMongMoneysQuery,
  usePostMongMoneyDepositMutation,
} from "@/queries/mongMoneys";

import { Button } from "@/components/ui/button";
import { IUserForm } from "@/models/users";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { useGetAdminAuth } from "@/queries/auth";

const MANUAL_DEPOSIT_TITLE = "관리자 몽 지급";
const MONG_MONEY_HISTORY_LIMIT = 100;

interface UserMongMoneyDepositFormProps {
  user: IUserForm;
  onUpdate: () => void;
}

function MongMoneyDepositFormItem({
  leftArea,
  rightArea,
}: {
  leftArea: React.ReactNode;
  rightArea: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "user-mong-money-deposit-form-item",
        "flex flex-row justify-start w-full border-b typo-body-2-regular py-[6px]",
      )}
    >
      <div className={cn("w-[120px] text-left flex items-center")}>
        {leftArea}
      </div>
      <div className={cn("flex-1 ml-[8px]")}>{rightArea}</div>
    </li>
  );
}

function MongMoneyDepositConfirmRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-start gap-[8px] typo-body-1-semibold")}>
      <div className={cn("w-[64px] shrink-0 text-black")}>{label}:</div>
      <div className={cn("min-w-0 flex-1 text-black")}>{children}</div>
    </div>
  );
}

function MongMoneyDepositConfirmDescription({
  user,
  amount,
  memo,
}: {
  user: IUserForm;
  amount: number;
  memo: string;
}) {
  return (
    <div className={cn("flex flex-col gap-[8px]")}>
      <MongMoneyDepositConfirmRow label="닉네임">
        {user.displayName || "-"}
      </MongMoneyDepositConfirmRow>
      <MongMoneyDepositConfirmRow label="지급몽">
        {amount}
      </MongMoneyDepositConfirmRow>
      <MongMoneyDepositConfirmRow label="지급메모">
        <div
          className={cn(
            "min-h-[30px] border border-border-alternative px-[12px] py-[5px]",
            "typo-body-2-regular break-words",
          )}
        >
          {memo}
        </div>
      </MongMoneyDepositConfirmRow>
    </div>
  );
}

function getValidDepositAmount(value: string) {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0) {
    return undefined;
  }

  return amount;
}

function getMongMoneyDepositReason(adminDescription?: string) {
  return adminDescription?.replace(/^\[처리자:\s*[^\]]+\]\s*/, "") || "-";
}

export default function UserMongMoneyDepositForm({
  user,
  onUpdate,
}: UserMongMoneyDepositFormProps) {
  const [depositMemo, setDepositMemo] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [sessionAdminName, setSessionAdminName] = useState("");
  const dialog = useDialog();
  const getAdminAuthQuery = useGetAdminAuth(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const {
    data: mongMoneysData,
    isLoading: isMongMoneysLoading,
    refetch: refetchMongMoneys,
  } = useGetMongMoneysQuery({
    __limit: MONG_MONEY_HISTORY_LIMIT,
    __cursorOrder: "idDesc",
  });
  const postMongMoneyDepositMutation = usePostMongMoneyDepositMutation();

  const mongMoneyHistories = mongMoneysData?.dataList;
  const userDepositHistories = useMemo(
    () =>
      (mongMoneyHistories ?? []).filter(
        (mongMoney) =>
          mongMoney.userId === user.id && mongMoney.type === "deposit",
      ),
    [mongMoneyHistories, user.id],
  );
  const trimmedDepositMemo = depositMemo.trim();
  const depositAmount = useMemo(
    () => getValidDepositAmount(amountValue),
    [amountValue],
  );
  const adminName = getAdminAuthQuery.data?.name || sessionAdminName || "-";
  const isActionEnabled =
    Boolean(trimmedDepositMemo) &&
    Boolean(depositAmount) &&
    !postMongMoneyDepositMutation.isPending;

  useEffect(() => {
    setSessionAdminName(sessionStorage.getItem("adminName") ?? "");
  }, []);

  const handleChangeDepositMemo: ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setDepositMemo(event.target.value);
    }, []);

  const handleChangeAmount: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setAmountValue(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (!trimmedDepositMemo) {
        toast.info("지급메모를 입력해주세요.");
        return;
      }

      if (!depositAmount) {
        toast.info("지급몽은 1 이상의 정수로 입력해주세요.");
        return;
      }

      try {
        const confirmed = await dialog.confirm(
          <MongMoneyDepositConfirmDescription
            user={user}
            amount={depositAmount}
            memo={trimmedDepositMemo}
          />,
          {
            title: "해당 유저에게 몽을 지급하시겠습니까?",
            confirmText: "확인",
            cancelText: "닫기",
            size: "md",
          },
        );

        if (!confirmed) return;

        const result = await postMongMoneyDepositMutation.mutateAsync({
          userId: user.id,
          amount: depositAmount,
          title: MANUAL_DEPOSIT_TITLE,
          adminDescription: `[처리자: ${adminName}] ${trimmedDepositMemo}`,
        });

        if (result.data?.id !== undefined) {
          toast.success("해당 회원에게 몽을 지급했습니다.");
          setDepositMemo("");
          setAmountValue("");
          await refetchMongMoneys();
          onUpdate();
        } else {
          throw new Error();
        }
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [
      adminName,
      depositAmount,
      dialog,
      onUpdate,
      postMongMoneyDepositMutation,
      refetchMongMoneys,
      trimmedDepositMemo,
      user,
    ],
  );

  return (
    <ul className={cn("user-mong-money-deposit-form", "flex flex-col w-full")}>
      <MongMoneyDepositFormItem
        leftArea={
          <div className={cn("date-area text-left")}>
            {formatDate(new Date(), "YYYY.MM.DD")}
          </div>
        }
        rightArea={
          <div className={cn("flex flex-wrap items-center gap-[8px]")}>
            <div className={cn("flex-1 min-w-[220px]")}>
              <Input
                size="sm"
                className={cn("w-full")}
                value={depositMemo}
                onChange={handleChangeDepositMemo}
                placeholder="지급메모(처리자)"
              />
            </div>
            <div className={cn("w-[140px]")}>
              <Input
                size="sm"
                type="number"
                min={1}
                step={1}
                className={cn("w-full")}
                value={amountValue}
                onChange={handleChangeAmount}
                placeholder="지급몽"
              />
            </div>
            <Button
              onClick={handleSubmit}
              variant="outline"
              size="sm"
              className={cn("w-[76px]")}
              disabled={!isActionEnabled}
            >
              지급하기
            </Button>
          </div>
        }
      />
      {isMongMoneysLoading && (
        <MongMoneyDepositFormItem
          leftArea={<div />}
          rightArea={
            <div className={cn("typo-body-2-regular text-foreground-sub")}>
              지급 히스토리를 불러오는 중입니다.
            </div>
          }
        />
      )}
      {userDepositHistories.map((mongMoney) => (
        <MongMoneyDepositFormItem
          key={`mong-money-deposit-history-${mongMoney.id}`}
          leftArea={<div />}
          rightArea={
            <div className={cn("flex items-start gap-[8px]")}>
              <div
                className={cn(
                  "my-[5px] min-h-[72px] min-w-0 flex-1 rounded-[7px]",
                  "border border-border-alternative bg-white px-[13px] py-[10px]",
                  "text-[12px] leading-[22px] text-black",
                )}
              >
                <div
                  className={cn(
                    "grid grid-cols-[62px_minmax(0,1fr)_66px_48px] gap-x-0",
                  )}
                >
                  <div>지급사유</div>
                  <div className={cn("truncate pr-[12px]")}>
                    {getMongMoneyDepositReason(mongMoney.adminDescription)}
                  </div>
                  <div>지급몽</div>
                  <div>{mongMoney.amount.toLocaleString()}</div>
                </div>
                <div
                  className={cn(
                    "grid grid-cols-[62px_minmax(0,1fr)] gap-x-0 mt-[11px]",
                  )}
                >
                  <div>처리날짜</div>
                  <div>
                    {formatDate(mongMoney.createdAt, "YYYY.MM.DD HH:mm") || "-"}
                  </div>
                </div>
              </div>
              <div className={cn("w-[76px] shrink-0")} />
            </div>
          }
        />
      ))}
    </ul>
  );
}
