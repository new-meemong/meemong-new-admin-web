"use client";

import { useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { BusinessMongGrant } from "@/apis/businessMong";
import { businessMongQueries } from "@/queries/businessMong";
import CommonTable from "@/components/shared/common-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/date";
import BusinessMongPresetManagement from "./preset-management";
import BusinessMongGrantForm from "./grant-form";
import BusinessMongGrantDetail from "./grant-detail";
import { businessMongError, registrationNumberSchema } from "./validation";

export default function BusinessMongManagement() {
  const [search, setSearch] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [searchError, setSearchError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const client = useQueryClient();
  const grants = useInfiniteQuery(
    businessMongQueries.grants(registrationNumber),
  );
  const rows = grants.data?.pages.flatMap((page) => page.dataList) ?? [];
  const allPagesLoaded = grants.data?.pages.at(-1)?.__nextCursor === null;
  const created = (grant: BusinessMongGrant) => {
    setSelectedId(grant.id);
    setSearch(grant.businessRegistrationNumber);
    setRegistrationNumber(grant.businessRegistrationNumber);
    client.setQueryData(businessMongQueries.grant(grant.id).queryKey, {
      data: grant,
    });
    void client.invalidateQueries({ queryKey: ["business-mong", "grants"] });
  };
  return (
    <section
      className="mb-10 space-y-5"
      aria-labelledby="business-mong-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="business-mong-heading" className="text-xl font-semibold">
            원장님 몽 지급관리
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            사업자 입금 확인 → 지급 등록 → 직원 및 원장님 분배
          </p>
        </div>
        <BusinessMongPresetManagement />
      </div>
      <BusinessMongGrantForm onCreated={created} />
      <div className="space-y-3">
        <div className="flex flex-wrap justify-between gap-3 items-end">
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const result = search.trim()
                ? registrationNumberSchema.safeParse(search)
                : { success: true as const, data: "" };
              if (!result.success) {
                setSearchError(result.error.issues[0].message);
                return;
              }
              setSearchError("");
              setRegistrationNumber(result.data);
            }}
          >
            <label className="text-sm space-y-2">
              사업자등록번호 검색
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="전체 또는 사업자등록번호"
              />
            </label>
            <Button type="submit" variant="outline">
              검색
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setRegistrationNumber("");
                setSearchError("");
              }}
            >
              전체 보기
            </Button>
          </form>
          <Button
            variant="outline"
            disabled={grants.isFetching}
            onClick={() => grants.refetch()}
          >
            목록 새로고침
          </Button>
        </div>
        {searchError && (
          <p role="alert" className="text-sm text-red-600">
            {searchError}
          </p>
        )}
        {grants.isError && (
          <p role="alert">
            지급 목록 조회 실패: {businessMongError(grants.error)}
          </p>
        )}
        {grants.isPending ? (
          <p>지급 목록을 불러오는 중...</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              <CommonTable
                data={rows}
                columns={[
                  {
                    accessorKey: "id",
                    header: "지급 건",
                    size: 80,
                    enableSorting: false,
                  },
                  {
                    accessorKey: "businessName",
                    header: "사업자명",
                    enableSorting: false,
                  },
                  {
                    accessorKey: "businessRegistrationNumber",
                    header: "사업자등록번호",
                    size: 140,
                    enableSorting: false,
                  },
                  {
                    accessorKey: "mongAmount",
                    header: "총 몽",
                    size: 100,
                    enableSorting: false,
                    cell: ({ row }) => row.original.mongAmount.toLocaleString(),
                  },
                  {
                    accessorKey: "distributedMongAmount",
                    header: "분배 몽",
                    size: 100,
                    enableSorting: false,
                    cell: ({ row }) =>
                      row.original.distributedMongAmount.toLocaleString(),
                  },
                  {
                    accessorKey: "remainingMongAmount",
                    header: "잔여 몽",
                    size: 100,
                    enableSorting: false,
                    cell: ({ row }) =>
                      row.original.remainingMongAmount.toLocaleString(),
                  },
                  {
                    accessorKey: "createdAt",
                    header: "등록일",
                    size: 150,
                    enableSorting: false,
                    cell: ({ row }) =>
                      formatDate(row.original.createdAt, "YYYY.MM.DD HH:mm"),
                  },
                  {
                    id: "detail",
                    header: "관리",
                    size: 110,
                    cell: ({ row }) => (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(row.original.id)}
                      >
                        상세 / 분배
                      </Button>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        )}
        {grants.hasNextPage && (
          <Button
            variant="outline"
            disabled={grants.isFetching}
            onClick={() => grants.fetchNextPage()}
          >
            지급 내역 더 보기
          </Button>
        )}
        {registrationNumber && grants.isSuccess && (
          <p className="text-sm text-gray-600">
            {allPagesLoaded
              ? "사업자 전체 잔여 몽"
              : "현재 불러온 지급 건의 잔여 몽 소계"}
            :{" "}
            {rows
              .reduce((sum, item) => sum + item.remainingMongAmount, 0)
              .toLocaleString()}
            몽
            {!allPagesLoaded &&
              " · 전체 잔액은 모든 지급 내역을 불러온 후 확인할 수 있습니다."}
          </p>
        )}
      </div>
      <Dialog
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>원장님 몽 상세 / 분배</DialogTitle>
            <DialogDescription>
              지급 건의 잔액을 확인하고 직원과 원장님에게 몽을 분배합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto">
            {selectedId !== null && (
              <BusinessMongGrantDetail key={selectedId} id={selectedId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
