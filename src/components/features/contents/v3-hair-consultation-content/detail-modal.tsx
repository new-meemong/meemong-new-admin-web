"use client";
import { useState } from "react";
import { Modal } from "@/components/shared/modal";
import { Dialog } from "@/components/shared/dialog";
import { Button } from "@/components/ui/button";
import {
  useV3Consultation,
  useV3ConsultationActions,
} from "@/queries/v3HairConsultations";
import {
  buildV3ConsultationUpdate,
  V3_EDIT_FIELDS,
} from "@/apis/v3HairConsultations";
import type {
  V3ConsultationDetail,
  V3ConsultationEditable,
} from "@/models/v3HairConsultations";
import { ConsultationAppPreview } from "@/components/features/contents/v3-hair-consultation-preview";
import {
  Fields,
  QueryStatus,
  Rating,
  date,
  label,
  percent,
  ConsultationTypeBadge,
} from "./presentation";
import V3ConsultationAnswers, { V3AnswerDetailPanel } from "./answers";

export default function V3ConsultationDetailModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const query = useV3Consultation(id);
  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      className="h-[calc(100dvh-32px)] max-h-[1040px]"
    >
      <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold">
          콘텐츠 관리 › v3 헤어컨설팅 › #{id}
        </h2>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
      </div>
      <QueryStatus
        pending={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {query.data && !query.isError && (
        <ConsultationDetail detail={query.data} />
      )}
    </Modal>
  );
}
function ConsultationDetail({ detail }: { detail: V3ConsultationDetail }) {
  const actions = useV3ConsultationActions(detail.id);
  const [confirmHide, setConfirmHide] = useState(false);
  const [editBase, setEditBase] = useState<V3ConsultationDetail | null>(null);
  const [draft, setDraft] = useState<V3ConsultationEditable | null>(null);
  const [message, setMessage] = useState("");
  const [answerId, setAnswerId] = useState<number | null>(null);
  const busy = actions.update.isPending || actions.hide.isPending;
  const values = draft ?? detail;
  async function save() {
    if (!draft || !editBase) return;
    try {
      const body = buildV3ConsultationUpdate(
        editBase,
        draft,
        detail.consultationType,
      );
      if (!Object.keys(body).length) {
        setMessage("변경된 내용이 없습니다.");
        return;
      }
      await actions.update.mutateAsync(body);
      setDraft(null);
      setEditBase(null);
      setMessage("저장했습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "저장에 실패했습니다.",
      );
    }
  }
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4 p-5">
      <div className="grid flex-1 min-h-0 grid-cols-[240px_375px_minmax(375px,1fr)] gap-5">
        <aside
          aria-label="상담 운영 정보"
          className="overflow-y-auto min-h-0 space-y-5 pr-2"
        >
          <h3 className="font-semibold">유저·운영 정보</h3>
          <ConsultationTypeBadge type={detail.consultationType} />
          <div className="[&_dl]:grid-cols-1 [&_dl>div]:grid-cols-[90px_1fr]">
            <Fields
              rows={[
                ["상담 종류", label(detail.customerType)],
                ["작성자", detail.user?.displayName ?? "정보 없음"],
                ["작성자 ID", detail.userId],
                ["전화번호", detail.user?.phone],
                [
                  "회원 상태",
                  detail.user
                    ? detail.user.deletedAt
                      ? "탈퇴"
                      : "가입"
                    : "정보 없음",
                ],
                ["공개 상태", detail.withdrawnAt ? "숨김" : "공개"],
                ["숨김일", date(detail.withdrawnAt)],
                ["등록일", date(detail.createdAt)],
                ["수정일", date(detail.updatedAt)],
              ]}
            />
          </div>
          {detail.deepStatistics && (
            <details open className="space-y-3 border-t pt-3">
              <summary className="cursor-pointer font-semibold">
                결제·별점
              </summary>
              <p className="text-sm">
                {detail.deepStatistics.payment.isPaid ? "결제" : "미결제"} ·
                답변 구매율 {percent(detail.deepStatistics.payment.paymentRate)}
              </p>
              <p className="text-xs text-gray-500">
                구매 / 유료 답변 {detail.deepStatistics.payment.paidAnswerCount}{" "}
                / {detail.deepStatistics.payment.payableAnswerCount}건
              </p>
              <Rating rating={detail.deepStatistics.rating} />
            </details>
          )}
          <details className="border-t pt-3">
            <summary className="font-semibold cursor-pointer">
              상담 회차 ({detail.roundList?.length ?? 0})
            </summary>
            {detail.roundList?.map((round) => (
              <div className="py-3 border-b text-sm space-y-1" key={round.id}>
                <p>
                  {round.roundNumber}회차 · 접수 {round.acceptedAnswerCount}/
                  {round.targetAnswerCount}
                </p>
                <p>시작 {date(round.openedAt)}</p>
                <p>만료 {date(round.expiresAt)}</p>
                <p>
                  종료 {date(round.closedAt)} · {label(round.closeReason)}
                </p>
              </div>
            ))}
          </details>
          <Button
            className="w-full bg-white text-gray-600 hover:bg-gray-50"
            variant="outline"
            disabled={busy}
            onClick={() => setConfirmHide(true)}
          >
            상담 숨김 처리
          </Button>
        </aside>
        <section
          aria-label="상담 미리보기 영역"
          className="flex min-h-0 flex-col gap-3"
        >
          <h3 className="font-semibold">앱 미리보기</h3>
          <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl border">
            <ConsultationAppPreview key={detail.id} detail={detail} />
          </div>
        </section>
        <div className="min-h-0">
          {answerId !== null ? (
            <V3AnswerDetailPanel
              key={answerId}
              consultationId={detail.id}
              answerId={answerId}
              sex={detail.sex}
              onClose={() => setAnswerId(null)}
            />
          ) : (
            <section
              aria-label="콘텐츠 수정"
              className="h-full overflow-y-auto space-y-4 pr-1"
            >
              <h3 className="font-semibold">콘텐츠 수정</h3>
              <fieldset disabled={busy} className="space-y-3">
                {V3_EDIT_FIELDS.map((field) => (
                  <label key={field.key} className="block text-sm space-y-1">
                    <span>
                      {field.label} ({field.max}자 이내)
                    </span>
                    <textarea
                      aria-label={field.label}
                      value={values[field.key] ?? ""}
                      readOnly={!draft}
                      maxLength={field.max}
                      rows={field.max === 30 ? 1 : 2}
                      className="w-full border rounded-lg p-2 read-only:bg-gray-50"
                      onChange={(e) =>
                        setDraft((current) =>
                          current
                            ? { ...current, [field.key]: e.target.value }
                            : current,
                        )
                      }
                    />
                  </label>
                ))}
                <label className="flex gap-2 text-sm items-center">
                  <input
                    type="checkbox"
                    checked={values.isAllowedStyleVoting}
                    disabled={
                      !draft ||
                      (detail.consultationType !== "DEEP" &&
                        !values.isAllowedStyleVoting)
                    }
                    onChange={(e) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              isAllowedStyleVoting: e.target.checked,
                            }
                          : current,
                      )
                    }
                  />
                  스타일 투표 허용 (심층 컨설팅만 가능)
                </label>
                <div className="flex gap-2">
                  {draft ? (
                    <>
                      <Button onClick={() => void save()}>저장</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDraft(null);
                          setEditBase(null);
                          setMessage("");
                        }}
                      >
                        수정 취소
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setEditBase(detail);
                        setDraft({ ...detail });
                        setMessage("");
                      }}
                    >
                      수정
                    </Button>
                  )}
                </div>
              </fieldset>
            </section>
          )}
        </div>
      </div>
      {message && (
        <p role="status" className="shrink-0 text-sm">
          {message}
        </p>
      )}
      <div className="h-[260px] shrink-0 min-h-0 [&>section]:h-full">
        <V3ConsultationAnswers
          key={detail.id}
          consultationId={detail.id}
          selectedId={answerId}
          onSelect={setAnswerId}
        />
      </div>
      <Dialog
        isOpen={confirmHide}
        title="상담을 숨김 처리할까요?"
        description="열린 회차가 종료되고 미사용 답변 세션이 무효화됩니다. 답변·구매·채팅·사진은 보존되며 환불이나 몽 취소는 실행되지 않습니다."
        confirmText={actions.hide.isPending ? "처리 중..." : "숨김 처리"}
        onCancel={() => {
          if (!actions.hide.isPending) setConfirmHide(false);
        }}
        onConfirm={() => {
          if (actions.hide.isPending) return;
          actions.hide.mutate(undefined, {
            onSuccess: () => {
              setConfirmHide(false);
              setMessage("상담을 숨김 처리했습니다.");
            },
            onError: (error) => {
              setConfirmHide(false);
              setMessage(error.message);
            },
          });
        }}
      />
    </div>
  );
}
