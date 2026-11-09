"use client";
import { useState } from "react";
import type {
  V3ConsultationDetail,
  V3ConsultationAnswerDetail,
} from "@/models/v3HairConsultations";
import {
  ConsultRequestDetail,
  CustomerInfoDetail,
  ConsultingCustomerDetail,
  ConsultingRequestDetail,
  ConsultingDiagnosisDetail,
} from "./source/entities/consultation/ui/question-information";
import { CustomerAnswerCard } from "./source/entities/consultation/ui/customer-answer-card";
import {
  AnswerDetail,
  DiagnosisDetail,
} from "./source/entities/consultation/ui/answer-detail";
import { AnswerCardDesignerHeader } from "./source/entities/consultation/ui/answer-card-designer-header";
import { MeemongDivider } from "./source/shared/ui/meemong-divider";
import { toQuestionPreview, toAnswerPreview } from "./adapter";
import PreviewFrame from "./frame";

export function ConsultationAppPreview({
  detail,
}: {
  detail: V3ConsultationDetail;
}) {
  const [tab, setTab] = useState("request");
  const question = toQuestionPreview(detail);
  const deep = detail.consultationType === "DEEP";
  const tabs = deep
    ? [
        ["customer", "내 정보"],
        ["request", "요청사항"],
        ["diagnosis", "진단 정보"],
      ]
    : [
        ["request", "상담 내용"],
        ["customer", "내 정보"],
      ];
  return (
    <PreviewFrame title="상담 앱 미리보기">
      <div className="bg-fill-white text-text-primary">
        <header className="flex h-[50px] items-center justify-center border-b border-border-weak meemong-title1-semi-bold">
          {deep ? "심층 컨설팅" : "간편상담"}
        </header>
        <nav
          aria-label="상담 정보"
          className="sticky top-0 z-10 flex bg-fill-white border-b border-border-weak"
        >
          {tabs.map(([value, title]) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
              className={`flex-1 py-3 meemong-title3-semi-bold ${tab === value ? "border-b-2 border-brand-core text-text-primary" : "text-text-tertiary"}`}
            >
              {title}
            </button>
          ))}
        </nav>
        {deep ? (
          <>
            {tab === "customer" && (
              <ConsultingCustomerDetail question={question} customer />
            )}
            {tab === "request" && (
              <ConsultingRequestDetail question={question} />
            )}
            {tab === "diagnosis" && (
              <ConsultingDiagnosisDetail question={question} />
            )}
          </>
        ) : (
          <>
            {tab === "request" && <ConsultRequestDetail question={question} />}
            {tab === "customer" && (
              <CustomerInfoDetail question={question} customer />
            )}
          </>
        )}
      </div>
    </PreviewFrame>
  );
}
export function ConsultationAnswerCard({
  detail,
  onSelect,
}: {
  detail: V3ConsultationAnswerDetail;
  onSelect: () => void;
}) {
  return (
    <PreviewFrame title={`고객용 답변 카드 #${detail.id}`} autoHeight>
      <div
        className="p-1"
        onClickCapture={(event) => {
          // All customer-card actions select the admin detail pane, including photos.
          event.stopPropagation();
          onSelect();
        }}
      >
        <CustomerAnswerCard
          answer={toAnswerPreview(detail)}
          onView={onSelect}
          onReview={onSelect}
          onChat={onSelect}
        />
      </div>
    </PreviewFrame>
  );
}
export function ConsultationAnswerAppPreview({
  detail,
  sex,
}: {
  detail: V3ConsultationAnswerDetail;
  sex: string;
}) {
  const answer = toAnswerPreview(detail);
  const deep = detail.answerType === "CONSULTING";
  return (
    <PreviewFrame title={`답변 앱 미리보기 #${detail.id}`}>
      <div className="bg-fill-white text-text-primary pb-6">
        <header className="flex h-[50px] items-center justify-center border-b border-border-weak meemong-title1-semi-bold">
          {deep ? "심층 컨설팅 답변" : "간편상담 답변"}
        </header>
        <div className="p-4">
          <AnswerCardDesignerHeader
            designer={answer.designer}
            variant={deep ? "diagnosis" : "quick"}
            submittedAt={detail.submittedAt}
          />
        </div>
        <MeemongDivider />
        {deep ? (
          <DiagnosisDetail answer={answer} sex={sex} />
        ) : (
          <AnswerDetail
            answer={answer}
            designerName={answer.designer?.userDisplayName ?? undefined}
          />
        )}
      </div>
    </PreviewFrame>
  );
}
