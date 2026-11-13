"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MongMoneyHistoryType,
  MONG_MONEY_GROUP_PAGE_LIMIT,
} from "@/apis/mongMoneys";
import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import CommonTable from "@/components/shared/common-table";
import { FormGroup } from "@/components/ui/form-group";
import { IMongMoneyGroup } from "@/models/mongMoneys";
import { formatDate } from "@/utils/date";
import {
  formatMongAmount,
  formatMongMoneyAdminDescription,
  getCurrentMongMoneyAmount,
} from "@/utils/mongMoneys";
import { formatPrice } from "@/utils/price";
import {
  useMongMoneyBalanceQuery,
  useMongMoneyHistoryQuery,
} from "@/queries/mongMoneys";

const HISTORY_TYPES: { value: MongMoneyHistoryType; label: string }[] = [
  { value: "purchase", label: "충전" },
  { value: "reward", label: "보상" },
  { value: "withdraw", label: "소비" },
];

export default function UserMongMoneyHistory({
  userId,
  type,
  onTypeChange,
}: {
  userId: number;
  type: MongMoneyHistoryType;
  onTypeChange: (type: MongMoneyHistoryType) => void;
}) {
  const historyQuery = useMongMoneyHistoryQuery({ userId, type });
  const balanceQuery = useMongMoneyBalanceQuery(userId);
  const groups = useMemo(
    () => historyQuery.data?.pages.flatMap((page) => page.dataList) ?? [],
    [historyQuery.data],
  );
  const balanceLabel = balanceQuery.isPending
    ? "불러오는 중..."
    : balanceQuery.isError
      ? "조회 실패"
      : formatMongAmount(getCurrentMongMoneyAmount(balanceQuery.data.dataList));

  const columns = useMemo<ColumnDef<IMongMoneyGroup>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "날짜",
        size: 130,
        cell: (info) =>
          formatDate(info.getValue() as string, "YYYY.MM.DD") || "-",
        enableSorting: false,
      },
      {
        accessorKey: "amount",
        header:
          type === "withdraw"
            ? "사용몽"
            : type === "reward"
              ? "보상몽"
              : "충전몽",
        size: 110,
        cell: (info) => formatMongAmount(Number(info.getValue() ?? 0)),
        enableSorting: false,
      },
      ...(type === "purchase"
        ? [
            {
              accessorKey: "paymentAmountKRW",
              header: "결제금액",
              size: 120,
              cell: (info) => formatPrice(info.getValue() as number | null),
              enableSorting: false,
            } satisfies ColumnDef<IMongMoneyGroup>,
          ]
        : []),
      {
        accessorKey: "title",
        header: "거래명 / 사유",
        enableSorting: false,
        cell: (info) => (
          <span title={String(info.getValue() || "-")}>
            {String(info.getValue() || "-")}
          </span>
        ),
      },
      ...(type !== "purchase"
        ? [
            {
              accessorKey: "adminDescription",
              header: "관리자 메모(처리자)",
              enableSorting: false,
              cell: (info) => {
                const memo = formatMongMoneyAdminDescription(
                  info.getValue() as string | null,
                );
                return <span title={memo}>{memo}</span>;
              },
            } satisfies ColumnDef<IMongMoneyGroup>,
          ]
        : []),
    ],
    [type],
  );

  return (
    <>
      <FormGroup title="보유몽">
        <CommonForm.ReadonlyRow label="보유 몽" value={balanceLabel} />
        {balanceQuery.isError && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void balanceQuery.refetch()}
          >
            다시 시도
          </Button>
        )}
      </FormGroup>
      <FormGroup title="몽 이용 내역">
        <div className="flex gap-2 my-3" role="group" aria-label="몽 내역 유형">
          {HISTORY_TYPES.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={type === item.value ? "default" : "outline"}
              aria-pressed={type === item.value}
              onClick={() => onTypeChange(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        {historyQuery.isPending ? (
          <div className="p-6 text-center text-gray-500">불러오는 중...</div>
        ) : (
          <>
            {historyQuery.data && (
              <CommonTable data={groups} columns={columns} />
            )}
            {historyQuery.isError && (
              <div role="alert" className="p-3 text-center text-red-500">
                {historyQuery.isFetchNextPageError
                  ? "추가 내역을 불러오지 못했습니다."
                  : "내역을 불러오지 못했습니다."}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={historyQuery.isFetching}
                  onClick={() => {
                    if (historyQuery.isFetchNextPageError)
                      void historyQuery.fetchNextPage();
                    else void historyQuery.refetch();
                  }}
                >
                  다시 시도
                </Button>
              </div>
            )}
            {historyQuery.hasNextPage && !historyQuery.isFetchNextPageError && (
              <div className="mt-3 text-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={historyQuery.isFetching}
                  onClick={() => void historyQuery.fetchNextPage()}
                >
                  {historyQuery.isFetchingNextPage
                    ? "불러오는 중..."
                    : `${MONG_MONEY_GROUP_PAGE_LIMIT}개 더보기`}
                </Button>
              </div>
            )}
          </>
        )}
      </FormGroup>
    </>
  );
}
