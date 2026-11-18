import type { V3QuickStatistics } from "@/models/v3HairConsultations";
import { date, Fields } from "./presentation";

const mong = (value: number | null | undefined) =>
  value == null ? "확인 불가" : `${value.toLocaleString("ko-KR")}몽`;

export function QuickMongSummary({
  statistics,
}: {
  statistics: V3QuickStatistics | null | undefined;
}) {
  if (!statistics) return <span>몽 통계 확인 불가</span>;
  return (
    <span>
      차감 {mong(statistics.totalUsedMongAmount)} · 환불{" "}
      {mong(statistics.refundedUsedMongAmount)} · 순사용{" "}
      {mong(statistics.netUsedMongAmount)}
    </span>
  );
}

export default function QuickMongStatistics({
  statistics,
}: {
  statistics: V3QuickStatistics | null | undefined;
}) {
  return (
    <section
      aria-label="간편상담 몽 소모"
      className="space-y-3 border-t pt-3 text-sm"
    >
      <h4 className="font-semibold">간편상담 몽 소모</h4>
      <QuickMongSummary statistics={statistics} />
      <p className="text-xs text-gray-500">
        디자이너의 답변 발송 몽입니다. 차감에는 환불된 금액도 포함되며, 순사용은
        환불을 제외한 값입니다.
      </p>
      {statistics &&
        (statistics.historyList.length ? (
          <details>
            <summary className="cursor-pointer">
              몽 소모 내역 ({statistics.historyList.length}건)
            </summary>
            <div className="space-y-2 mt-2">
              {statistics.historyList.map((history) => (
                <div
                  key={history.mongOrderId}
                  className="rounded-lg border p-2 [&_dl]:grid-cols-1 [&_dl>div]:grid-cols-[90px_1fr]"
                >
                  <Fields
                    rows={[
                      ["주문 ID", history.mongOrderId],
                      ["답변 ID", history.v3HairConsultationAnswerId],
                      ["디자이너 ID", history.designerUserId],
                      ["차감량", mong(history.usedMongAmount)],
                      ["차감일 (KST)", date(history.createdAt)],
                      ["환불 상태", history.refundAt ? "환불 완료" : "미환불"],
                      ["환불일 (KST)", date(history.refundAt)],
                    ]}
                  />
                </div>
              ))}
            </div>
          </details>
        ) : (
          <p className="text-gray-500">몽 소모 내역이 없습니다.</p>
        ))}
    </section>
  );
}
