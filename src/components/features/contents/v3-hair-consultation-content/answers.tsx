"use client";
import { useState } from "react";
import { Dialog } from "@/components/shared/dialog";
import { Button } from "@/components/ui/button";
import useContentsCursorPagination from "@/components/features/contents/hooks/useContentsCursorPagination";
import {
  useV3Answers,
  useV3Answer,
  useV3ConsultationActions,
} from "@/queries/v3HairConsultations";
import {
  ConsultationAnswerCard,
  ConsultationAnswerAppPreview,
} from "@/components/features/contents/v3-hair-consultation-preview";
import { CursorPagination, Fields, QueryStatus, date } from "./presentation";

export default function V3ConsultationAnswers({
  consultationId,
  selectedId,
  onSelect,
}: {
  consultationId: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const pagination = useContentsCursorPagination({ initialPageSize: 10 });
  const query = useV3Answers(consultationId, {
    __limit: pagination.pageSize,
    __nextCursor: pagination.currentCursor,
  });
  return (
    <section
      aria-label="답변 목록"
      className="flex min-h-0 flex-col border-t pt-3"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">받은 답변</h3>
        <span className="text-xs text-gray-500">
          현재 페이지 {query.data?.dataCount ?? 0}건 · 카드를 클릭하면 오른쪽에
          답변이 표시됩니다.
        </span>
      </div>
      <QueryStatus
        pending={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {!query.isPending && !query.isError && (
        <div className="min-h-0 overflow-auto">
          <div className="grid grid-cols-3 gap-3 items-start p-1">
            {query.data?.dataList.map((answer) => (
              <AnswerCard
                key={answer.id}
                consultationId={consultationId}
                answerId={answer.id}
                selected={selectedId === answer.id}
                onSelect={() => onSelect(answer.id)}
              />
            ))}
          </div>
          {!query.data?.dataList.length && (
            <p className="text-sm text-gray-500 p-4">등록된 답변이 없습니다.</p>
          )}
        </div>
      )}
      <CursorPagination
        pagination={pagination}
        data={query.data}
        busy={query.isFetching || query.isError}
      />
    </section>
  );
}
function AnswerCard({
  consultationId,
  answerId,
  selected,
  onSelect,
}: {
  consultationId: number;
  answerId: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const query = useV3Answer(consultationId, answerId);
  return (
    <div
      className={`rounded-xl border-2 p-1 ${selected ? "border-blue-500" : "border-transparent"}`}
    >
      <div className="flex justify-between px-2 pb-1 text-xs text-gray-500">
        <span>답변 #{answerId}</span>
        <span>
          {query.data?.hiddenAt ? "숨김" : "공개"}
          {query.data?.deepStatus
            ? ` · ${query.data.deepStatus.isPaid ? "결제" : "미결제"}`
            : ""}
        </span>
      </div>
      <QueryStatus
        pending={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {query.data && !query.isError && (
        <ConsultationAnswerCard detail={query.data} onSelect={onSelect} />
      )}
    </div>
  );
}
export function V3AnswerDetailPanel({
  consultationId,
  answerId,
  sex,
  onClose,
}: {
  consultationId: number;
  answerId: number;
  sex: string;
  onClose: () => void;
}) {
  const query = useV3Answer(consultationId, answerId);
  const { hideAnswer } = useV3ConsultationActions(consultationId);
  const [confirmHide, setConfirmHide] = useState(false);
  const [message, setMessage] = useState("");
  const detail = query.data;
  return (
    <section
      aria-label="선택한 답변"
      className="flex min-h-0 h-full flex-col gap-3"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">답변 #{answerId}</h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          콘텐츠 수정으로
        </Button>
      </div>
      <QueryStatus
        pending={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {detail && !query.isError && (
        <>
          <div className="flex-1 min-h-0 w-full max-w-[375px] mx-auto rounded-xl overflow-hidden border">
            <ConsultationAnswerAppPreview detail={detail} sex={sex} />
          </div>
          <details className="shrink-0 max-h-40 overflow-y-auto text-sm">
            <summary className="cursor-pointer">결제·리뷰 운영 정보</summary>
            <div className="space-y-3 pt-3">
              <Fields
                rows={[
                  ["디자이너 ID", detail.designerUserId],
                  ["전화번호", detail.designerUser?.phone],
                  ["상태", detail.hiddenAt ? "숨김" : "공개"],
                  [
                    "실제 결제",
                    detail.deepStatus
                      ? detail.deepStatus.isPaid
                        ? "결제"
                        : "미결제"
                      : "-",
                  ],
                  ["현재 별점", detail.deepStatus?.review?.rating],
                ]}
              />
              {detail.reviewList?.length ? (
                detail.reviewList.map((review) => (
                  <div key={review.id} className="rounded-lg border p-2">
                    <p>
                      {review.rating}점 · {review.hiddenAt ? "숨김" : "공개"} ·{" "}
                      {date(review.ratedAt)}
                    </p>
                    <p className="whitespace-pre-wrap">
                      {review.content || "내용 없음"}
                    </p>
                  </div>
                ))
              ) : (
                <p>리뷰가 없습니다.</p>
              )}
            </div>
          </details>
          <Button
            variant="outline"
            className="bg-white text-gray-600 hover:bg-gray-50"
            disabled={hideAnswer.isPending}
            onClick={() => setConfirmHide(true)}
          >
            답변 숨김 처리
          </Button>
        </>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <Dialog
        isOpen={confirmHide}
        title="답변을 숨김 처리할까요?"
        description="답변 슬롯·회차 접수 수·구매·리뷰·사진은 보존됩니다. 구매 취소나 환불, 몽 취소는 실행되지 않습니다."
        confirmText={hideAnswer.isPending ? "처리 중..." : "숨김 처리"}
        onCancel={() => {
          if (!hideAnswer.isPending) setConfirmHide(false);
        }}
        onConfirm={() => {
          if (hideAnswer.isPending) return;
          hideAnswer.mutate(answerId, {
            onSuccess: () => {
              setConfirmHide(false);
              setMessage("답변을 숨김 처리했습니다.");
            },
            onError: (error) => {
              setConfirmHide(false);
              setMessage(error.message);
            },
          });
        }}
      />
    </section>
  );
}
