"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { businessMongQueries } from "@/queries/businessMong";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/shared/common-table";
import { formatDate } from "@/utils/date";
import BusinessMongDistributionForm from "./distribution-form";
import { businessMongError } from "./validation";

export default function BusinessMongGrantDetail({ id }: { id: number }) {
  const detail = useQuery(businessMongQueries.grant(id));
  const history = useInfiniteQuery(businessMongQueries.distributions(id));
  const grant = detail.data?.data;
  const refresh = () => {
    void detail.refetch();
    void history.refetch();
  };
  return (
    <div className="rounded-10 border bg-white p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">지급 건 #{id} 상세</h3>
        <Button
          type="button"
          variant="outline"
          disabled={detail.isFetching || history.isFetching}
          onClick={refresh}
        >
          잔액 / 이력 새로고침
        </Button>
      </div>
      {detail.isError ? (
        <p role="alert">상세 조회 실패: {businessMongError(detail.error)}</p>
      ) : !grant ? (
        <p>지급 건을 불러오는 중...</p>
      ) : (
        <>
          <div className="space-y-2 text-sm">
            <p>
              {grant.businessName} · {grant.businessRegistrationNumber}
            </p>
            <p>
              등록 {formatDate(grant.createdAt, "YYYY.MM.DD HH:mm")} · 총{" "}
              {grant.mongAmount.toLocaleString()}몽 · 분배{" "}
              {grant.distributedMongAmount.toLocaleString()}몽 · 잔여{" "}
              {grant.remainingMongAmount.toLocaleString()}몽
            </p>
            <p className="whitespace-pre-wrap break-words">
              메모: {grant.adminDescription}
            </p>
            <p className="break-all text-gray-500">
              등록 요청 키: {grant.requestKey}
            </p>
          </div>
          <BusinessMongDistributionForm
            key={id}
            grant={grant}
            onRefresh={refresh}
            historyConfirmed={
              !!history.data?.pages.some((page) => page.dataList.length > 0) &&
              !history.isError
            }
          />
        </>
      )}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-semibold">분배 이력 (원장님 포함)</h4>
        {history.isPending && <p>이력을 불러오는 중...</p>}
        {history.isError && (
          <p role="alert">
            분배 이력 조회 실패: {businessMongError(history.error)}{" "}
            <button className="underline" onClick={() => history.refetch()}>
              다시 조회
            </button>
          </p>
        )}
        {history.data?.pages
          .flatMap((page) => page.dataList)
          .map((item) => (
            <div key={item.id} className="space-y-2 rounded border p-3 text-sm">
              <p className="font-semibold">
                분배 #{item.id} ·{" "}
                {formatDate(item.createdAt, "YYYY.MM.DD HH:mm")} · 총{" "}
                {item.totalAmount.toLocaleString()}몽
              </p>
              <p className="break-words">
                {item.title} / {item.adminDescription}
              </p>
              <p className="text-gray-500 break-all">
                요청 키: {item.requestKey}
              </p>
              <CommonTable
                data={item.recipientList}
                columns={[
                  {
                    accessorKey: "recipientUserId",
                    header: "회원 ID",
                    enableSorting: false,
                  },
                  {
                    accessorKey: "recipientUserDisplayName",
                    header: "지급 당시 닉네임",
                    enableSorting: false,
                  },
                  {
                    accessorKey: "recipientUserPhone",
                    header: "전화번호",
                    enableSorting: false,
                  },
                  {
                    accessorKey: "amount",
                    header: "지급 몽",
                    enableSorting: false,
                    cell: ({ row }) => row.original.amount.toLocaleString(),
                  },
                ]}
              />
            </div>
          ))}
        {history.isSuccess &&
          history.data.pages.every((page) => page.dataList.length === 0) && (
            <p className="text-sm text-gray-500">아직 분배 이력이 없습니다.</p>
          )}
        {history.hasNextPage && (
          <Button
            variant="outline"
            disabled={history.isFetching}
            onClick={() => history.fetchNextPage()}
          >
            분배 이력 더 보기
          </Button>
        )}
      </div>
    </div>
  );
}
