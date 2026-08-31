"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

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
  getKnownMongMoneyPaymentAmount,
  getMongMoneyDepositTypeLabel,
} from "@/utils/mongMoneys";
import { formatPrice } from "@/utils/price";
import { useGetAllMongMoneyGroupsQuery } from "@/queries/mongMoneys";

const EMPTY_MONG_MONEY_GROUPS: IMongMoneyGroup[] = [];

interface UserMongMoneyHistoryProps {
  userId: number;
}

interface MongMoneyHistoryTableProps {
  data: IMongMoneyGroup[];
  columns: ColumnDef<IMongMoneyGroup>[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function MongMoneyHistoryTable({
  data,
  columns,
  isLoading,
  isError,
  onRetry,
}: MongMoneyHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-10 border bg-white p-6 text-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-[8px] rounded-10 border bg-white p-6 text-center text-red-500">
        <span>내역을 불러오지 못했습니다.</span>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      </div>
    );
  }

  return <CommonTable<IMongMoneyGroup> data={data} columns={columns} />;
}

export default function UserMongMoneyHistory({
  userId,
}: UserMongMoneyHistoryProps) {
  const historyQuery = useGetAllMongMoneyGroupsQuery({
    userId,
  });
  const mongMoneyGroups =
    historyQuery.data?.dataList ?? EMPTY_MONG_MONEY_GROUPS;
  const { depositGroups, withdrawGroups } = useMemo(
    () => ({
      depositGroups: mongMoneyGroups.filter(
        (group) => group.type === "deposit",
      ),
      withdrawGroups: mongMoneyGroups.filter(
        (group) => group.type === "withdraw",
      ),
    }),
    [mongMoneyGroups],
  );

  const balanceLabel = historyQuery.isLoading
    ? "불러오는 중..."
    : historyQuery.isError
      ? "조회 실패"
      : formatMongAmount(getCurrentMongMoneyAmount(mongMoneyGroups));

  const depositColumns = useMemo<ColumnDef<IMongMoneyGroup>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "날짜",
        size: 150,
        cell: (info) =>
          formatDate(info.getValue() as string, "YYYY.MM.DD") || "-",
        enableSorting: false,
      },
      {
        accessorKey: "amount",
        header: "충전몽",
        size: 140,
        cell: (info) => formatMongAmount(Number(info.getValue() ?? 0)),
        enableSorting: false,
      },
      {
        id: "paymentAmount",
        header: "결제금액",
        size: 140,
        cell: (info) =>
          formatPrice(getKnownMongMoneyPaymentAmount(info.row.original)),
        enableSorting: false,
      },
      {
        id: "depositType",
        header: "타입",
        cell: (info) => getMongMoneyDepositTypeLabel(info.row.original),
        enableSorting: false,
      },
      {
        accessorKey: "adminDescription",
        header: "지급메모(처리자)",
        cell: (info) =>
          formatMongMoneyAdminDescription(info.getValue() as string | null),
        enableSorting: false,
      },
    ],
    [],
  );

  const withdrawColumns = useMemo<ColumnDef<IMongMoneyGroup>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "날짜",
        size: 150,
        cell: (info) =>
          formatDate(info.getValue() as string, "YYYY.MM.DD") || "-",
        enableSorting: false,
      },
      {
        accessorKey: "amount",
        header: "사용몽",
        size: 140,
        cell: (info) => formatMongAmount(Number(info.getValue() ?? 0)),
        enableSorting: false,
      },
      {
        accessorKey: "title",
        header: "구매대상",
        cell: (info) => String(info.getValue() || "-"),
        enableSorting: false,
      },
    ],
    [],
  );

  return (
    <>
      <FormGroup title="보유몽">
        <CommonForm.ReadonlyRow label="보유 몽" value={balanceLabel} />
      </FormGroup>
      <FormGroup title="몽 충전">
        <MongMoneyHistoryTable
          data={depositGroups}
          columns={depositColumns}
          isLoading={historyQuery.isLoading}
          isError={historyQuery.isError}
          onRetry={() => {
            void historyQuery.refetch();
          }}
        />
      </FormGroup>
      <FormGroup title="몽 소모">
        <MongMoneyHistoryTable
          data={withdrawGroups}
          columns={withdrawColumns}
          isLoading={historyQuery.isLoading}
          isError={historyQuery.isError}
          onRetry={() => {
            void historyQuery.refetch();
          }}
        />
      </FormGroup>
    </>
  );
}
