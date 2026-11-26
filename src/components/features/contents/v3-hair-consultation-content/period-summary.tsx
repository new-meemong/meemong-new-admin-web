"use client";
import { useState } from "react";
import type { V3ConsultationFilters } from "@/apis/v3HairConsultations";
import { useV3ConsultationSummary } from "@/queries/v3HairConsultations";
import {
  dateRange,
  formatNumber,
  validateRange,
} from "@/components/features/dashboard/statistics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Fields,
  money,
  percent,
  QueryStatus,
  Rating,
  Section,
} from "./presentation";

export default function ConsultationPeriodSummary({
  filters,
}: {
  filters: V3ConsultationFilters;
}) {
  const [range, setRange] = useState(() => dateRange(30));
  const [draft, setDraft] = useState(range);
  const [error, setError] = useState<string | null>(null);
  const query = useV3ConsultationSummary({ ...filters, ...range });
  const deep = query.data?.deepStatistics;
  const quick = query.data?.quickStatistics;
  return (
    <Section title="기간별 헤어컨설팅 통계">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const nextError = validateRange(draft);
          setError(nextError);
          if (!nextError) setRange(draft);
        }}
      >
        <label className="text-sm space-y-2">
          통계 시작일 (KST)
          <Input
            type="date"
            aria-label="통계 시작일"
            value={draft.startDateKST}
            onChange={(event) =>
              setDraft({ ...draft, startDateKST: event.target.value })
            }
          />
        </label>
        <label className="text-sm space-y-2">
          통계 종료일 (KST)
          <Input
            type="date"
            aria-label="통계 종료일"
            value={draft.endDateKST}
            onChange={(event) =>
              setDraft({ ...draft, endDateKST: event.target.value })
            }
          />
        </label>
        <Button type="submit">기간 적용</Button>
        {error && (
          <p role="alert" className="w-full text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
      <p className="text-sm text-gray-500">
        {range.startDateKST} ~ {range.endDateKST} · 검색어·ID·공개 상태를
        적용합니다. 상담 유형과 페이지 조건은 제외하고 심층·간편 모두
        집계합니다. 기간은 아래 상담 목록에는 적용되지 않습니다.
      </p>
      <QueryStatus
        pending={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {deep && quick && !query.isError && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(
              [
                ["심층 컨설팅", deep],
                ["간편상담", quick],
              ] as const
            ).map(([title, stats]) => (
              <div key={title} className="rounded-lg bg-gray-50 p-4 space-y-3">
                <h4 className="font-semibold">{title}</h4>
                <Fields
                  rows={[
                    [
                      "생성 상담",
                      formatNumber(stats.createdConsultationCount, "건"),
                    ],
                    [
                      "답변 받은 상담",
                      formatNumber(stats.answeredConsultationCount, "건"),
                    ],
                    ["총 답변 수", formatNumber(stats.answerCount, "건")],
                    ["답변율", percent(stats.answerRate)],
                    [
                      "등록 채팅방",
                      formatNumber(stats.openedChatChannelCount, "개"),
                    ],
                  ]}
                />
                <h5 className="font-medium">
                  {title === "간편상담"
                    ? "디자이너 답변 발송"
                    : "고객 답변 열람"}{" "}
                  · 몽 사용
                </h5>
                <Fields
                  rows={[
                    [
                      "차감",
                      formatNumber(stats.mongPayment.totalUsedMongAmount, "몽"),
                    ],
                    [
                      "환불",
                      formatNumber(
                        stats.mongPayment.refundedUsedMongAmount,
                        "몽",
                      ),
                    ],
                    [
                      "순사용",
                      formatNumber(stats.mongPayment.netUsedMongAmount, "몽"),
                    ],
                    [
                      "환불 상태 미확인",
                      formatNumber(
                        stats.mongPayment.unknownRefundStatusCount,
                        "건",
                      ),
                    ],
                  ]}
                />
              </div>
            ))}
          </div>
          <Fields
            rows={[
              [
                "심층 결제 상담",
                formatNumber(deep.paidConsultationCount, "건"),
              ],
              ["심층 결제 전환율", percent(deep.paymentRate)],
              ["원화 결제액", money(deep.storePayment.totalPaymentAmountKRW)],
              [
                "원화 환불액",
                money(deep.storePayment.refundedPaymentAmountKRW),
              ],
              [
                "확인된 원화 결제액",
                money(deep.storePayment.knownTotalPaymentAmountKRW),
              ],
              [
                "결제금액 미확인",
                formatNumber(deep.storePayment.unknownTotalPaymentCount, "건"),
              ],
            ]}
          />
          <Rating rating={deep.rating} />
        </>
      )}
      <p className="text-xs text-gray-500">
        상담·답변은 기간 내 생성된 상담에 종료일까지 등록된 답변 기준이며 일별
        답변 활동량 합계와 다를 수 있습니다. 원화는 구매일·구매자, 몽은
        차감일·사용 계정 기준입니다. 채팅방은 기간 내 등록일 기준이며 이전에
        생성된 상담의 채팅방도 포함합니다. 환불은 원래 구매일·차감일에
        반영합니다. 원화와 몽은 합산하지 않으며 Sandbox 구매는 대시보드 결제
        집계에서 제외됩니다. 확인되지 않는 값은 — 또는 -로 표시합니다.
      </p>
    </Section>
  );
}
