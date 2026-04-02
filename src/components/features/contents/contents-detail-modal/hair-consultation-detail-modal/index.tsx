"use client";

import {
  Calendar,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  Scissors,
  Trash2
} from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import {
  IHairConsultationAnswer,
  IHairConsultationComment,
  IHairConsultationDetail,
  IHairConsultationListItem
} from "@/models/hairConsultations";
import React, { useCallback, useEffect, useState } from "react";
import {
  useDeleteHairConsultationMutation,
  useGetHairConsultationAnswerByIdQuery,
  useGetHairConsultationAnswersQuery,
  useGetHairConsultationByIdQuery,
  useGetHairConsultationCommentsQuery,
  usePutHairConsultationMutation
} from "@/queries/hairConsultations";

import { Button } from "@/components/ui/button";
import ImageBox from "@/components/shared/image-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요.")
});

type FormType = z.infer<typeof schema>;
type TabType = "info" | "comments" | "answers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: IHairConsultationListItem;
  onRefresh: () => void;
}

export default function HairConsultationDetailModal({
  isOpen,
  onClose,
  item,
  onRefresh
}: Props) {
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  const detailQuery = useGetHairConsultationByIdQuery(item.id, {
    enabled: isOpen
  });
  const commentsQuery = useGetHairConsultationCommentsQuery(
    { hairConsultationId: item.id, __limit: 50 },
    { enabled: isOpen }
  );
  const answersQuery = useGetHairConsultationAnswersQuery(
    { hairConsultationId: item.id, __limit: 50 },
    { enabled: isOpen }
  );

  const putMutation = usePutHairConsultationMutation();
  const deleteMutation = useDeleteHairConsultationMutation();
  const detail = detailQuery.data;

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: { title: item.title, content: item.content }
  });

  useEffect(() => {
    if (detail) form.reset({ title: detail.title, content: detail.content });
  }, [detail, form]);

  const handleUpdate = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    try {
      const confirmed = await dialog.confirm("해당 게시글을 수정하시겠습니까?");
      if (!confirmed) return;
      await putMutation.mutateAsync({
        hairConsultationId: item.id,
        title: form.getValues("title"),
        content: form.getValues("content")
      });
      toast.success("게시글을 수정했습니다.");
      detailQuery.refetch();
      onRefresh();
    } catch {
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [dialog, form, putMutation, item.id, detailQuery, onRefresh]);

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm("해당 게시글을 삭제하시겠습니까?");
      if (!confirmed) return;
      await deleteMutation.mutateAsync(item.id);
      toast.success("게시글을 삭제했습니다.");
      onRefresh();
      onClose();
    } catch {
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [dialog, deleteMutation, item.id, onRefresh, onClose]);

  const commentCount = commentsQuery.data?.dataCount ?? item.commentCount;
  const answerCount = answersQuery.data?.dataCount;

  const TABS: { key: TabType; label: string }[] = [
    { key: "info", label: "상세정보" },
    {
      key: "comments",
      label: `댓글${commentCount > 0 ? ` (${commentCount})` : ""}`
    },
    {
      key: "answers",
      label: `컨설팅 답변${answerCount != null ? ` (${answerCount})` : ""}`
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      closable
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>
        콘텐츠 관리 <ChevronRight className="w-4 h-4" /> 헤어컨설팅{" "}
        <ChevronRight className="w-4 h-4" /> 상세페이지
      </ModalHeader>

      <ModalBody className="overflow-hidden flex flex-row gap-0 p-0 !space-y-0">
        <FormProvider {...form}>
          {/* ── 좌측 패널: 게시글 편집 ── */}
          <div className="w-[38%] flex-shrink-0 flex flex-col border-r border-border px-6 py-5 gap-5 overflow-y-auto">
            {/* 작성자 & 통계 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-secondary-background flex items-center justify-center text-base font-bold text-secondary-foreground">
                  {item.hairConsultationCreateUserId?.toString().slice(-2) ??
                    "?"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-foreground-weak">
                    작성자 ID
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {item.hairConsultationCreateUserId ?? "-"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <StatChip
                  icon={<Eye className="w-3.5 h-3.5" />}
                  value={item.viewCount}
                  label="조회"
                />
                <StatChip
                  icon={<Heart className="w-3.5 h-3.5" />}
                  value={item.likeCount}
                  label="좋아요"
                />
                <StatChip
                  icon={<MessageCircle className="w-3.5 h-3.5" />}
                  value={item.commentCount}
                  label="댓글"
                />
                <div className="flex items-center gap-1 text-sm text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-foreground-weak" />
                  <span>{formatDate(item.createdAt, "YYYY.MM.DD")}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* 편집 폼 */}
            <div className="flex flex-col gap-4 flex-1">
              <EditFormTitle />
              <EditFormContent />
            </div>

            {/* 버튼 */}
            <div className="flex justify-between pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-destructive border-destructive hover:bg-destructive/10 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={putMutation.isPending}
                className="gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                수정 저장
              </Button>
            </div>
          </div>

          {/* ── 우측 패널: 상세정보 / 댓글 / 답변 탭 ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* 탭 바 */}
            <div className="flex border-b border-border px-6 pt-4 gap-1 flex-shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-t-lg transition-colors relative",
                    activeTab === tab.key
                      ? "text-secondary-foreground bg-secondary-background/40 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-secondary-foreground"
                      : "text-foreground-weak hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 탭 콘텐츠 */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeTab === "info" && (
                <DetailInfoTab
                  detail={detail}
                  isLoading={detailQuery.isLoading}
                />
              )}
              {activeTab === "comments" && (
                <CommentsTab
                  comments={commentsQuery.data?.dataList ?? []}
                  isLoading={commentsQuery.isLoading}
                />
              )}
              {activeTab === "answers" && (
                <AnswersTab
                  answers={answersQuery.data?.dataList ?? []}
                  isLoading={answersQuery.isLoading}
                  hairConsultationId={item.id}
                />
              )}
            </div>
          </div>
        </FormProvider>
      </ModalBody>
    </Modal>
  );
}

// ── 통계 칩 ──────────────────────────────────────────────────────────────────
function StatChip({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-foreground">
      {icon}
      <span className="font-semibold">{value}</span>
      <span className="text-foreground-weak">{label}</span>
    </div>
  );
}

// ── 편집 폼 필드 (FormProvider 내부에서 사용) ─────────────────────────────────
function EditFormTitle() {
  const { control } = useFormContext<FormType>();
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem className="gap-1.5 flex flex-col">
          <Label className="text-sm font-medium">제목</Label>
          <FormControl>
            <Input placeholder="제목을 입력하세요" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function EditFormContent() {
  const { control } = useFormContext<FormType>();
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem className="gap-1.5 flex flex-col flex-1">
          <Label className="text-sm font-medium">내용</Label>
          <FormControl>
            <Textarea
              placeholder="내용을 입력하세요"
              className="flex-1 resize-none min-h-[200px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ── 상세정보 탭 ───────────────────────────────────────────────────────────────
function DetailInfoTab({
  detail,
  isLoading
}: {
  detail: IHairConsultationDetail | undefined;
  isLoading: boolean;
}) {
  if (isLoading) return <LoadingState />;
  if (!detail) return null;

  const infoRows: { label: string; value: React.ReactNode }[] = [
    { label: "지역", value: detail.hairConsultationCreateUserRegion || "-" },
    {
      label: "희망비용",
      value:
        detail.desiredCostPrice != null
          ? `${detail.desiredCostPrice.toLocaleString()}원`
          : "-"
    },
    { label: "모발상태", value: detail.texture || "-" },
    { label: "퍼스널컬러", value: detail.personalColor || "-" },
    {
      label: "희망스타일",
      value:
        detail.aspirationImageTypes?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {detail.aspirationImageTypes.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          "-"
        )
    },
    {
      label: "스타일 설명",
      value: detail.aspirationImageDescription || "-"
    },
    { label: "시술이력", value: detail.hairConsultTreatmentDescription || "-" },
    {
      label: "시술",
      value: detail.treatment
        ? `${detail.treatment.treatmentType}${detail.treatment.treatmentDate ? ` (${detail.treatment.treatmentDate})` : ""}`
        : "-"
    },
    {
      label: "최종수정",
      value: formatDate(detail.contentUpdatedAt, "YYYY.MM.DD / hh:mm")
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 정보 그리드 */}
      <div className="rounded-xl border border-border overflow-hidden">
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "flex items-start gap-4 px-4 py-3",
              i !== infoRows.length - 1 && "border-b border-border"
            )}
          >
            <span className="w-[80px] flex-shrink-0 text-sm font-medium text-foreground-weak pt-0.5">
              {row.label}
            </span>
            <span className="text-sm text-foreground flex-1 font-medium">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* 이미지 섹션 */}
      {detail.myImages?.length > 0 && (
        <ImageSection title="내 사진">
          {detail.myImages.map((img, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <ImageBox
                src={img.imageUrl}
                images={detail.myImages.map((m) => ({ src: m.imageUrl }))}
                index={i}
                width={80}
                height={80}
                className="rounded-lg border border-border overflow-hidden"
              />
              <span className="text-xs text-foreground">{img.subType}</span>
            </div>
          ))}
        </ImageSection>
      )}

      {detail.aspirationImages?.length > 0 && (
        <ImageSection title="희망 이미지">
          {detail.aspirationImages.map((img, i) => (
            <ImageBox
              key={i}
              src={img.imageUrl}
              images={detail.aspirationImages.map((a) => ({ src: a.imageUrl }))}
              index={i}
              width={80}
              height={80}
              className="rounded-lg border border-border overflow-hidden"
            />
          ))}
        </ImageSection>
      )}
    </div>
  );
}

function ImageSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// ── 댓글 탭 ───────────────────────────────────────────────────────────────────
function CommentsTab({
  comments,
  isLoading
}: {
  comments: IHairConsultationComment[];
  isLoading: boolean;
}) {
  if (isLoading) return <LoadingState />;
  if (!comments.length) return <EmptyState message="댓글이 없습니다." />;

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-xl border border-border bg-background overflow-hidden"
        >
          <div className="flex items-start gap-3 p-4">
            <UserAvatar name={comment.user.name} role={comment.user.role} />
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">
                    {comment.user.name}
                  </span>
                  <RoleBadge role={comment.user.role} />
                </div>
                <span className="text-sm text-foreground flex-shrink-0">
                  {formatDate(comment.createdAt, "YYYY.MM.DD / hh:mm")}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>

          {comment.replies?.length > 0 && (
            <div className="border-t border-border bg-muted/30">
              {comment.replies.map((reply, i) => (
                <div
                  key={reply.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3",
                    i !== comment.replies.length - 1 &&
                      "border-b border-border/50"
                  )}
                >
                  <div className="w-4 flex-shrink-0" />
                  <UserAvatar
                    name={reply.user.name}
                    role={reply.user.role}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">
                          {reply.user.name}
                        </span>
                        <RoleBadge role={reply.user.role} />
                      </div>
                      <span className="text-sm text-foreground flex-shrink-0">
                        {formatDate(reply.createdAt, "YYYY.MM.DD / hh:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── 컨설팅 답변 탭 ────────────────────────────────────────────────────────────
function AnswersTab({
  answers,
  isLoading,
  hairConsultationId
}: {
  answers: IHairConsultationAnswer[];
  isLoading: boolean;
  hairConsultationId: number;
}) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);

  if (isLoading) return <LoadingState />;
  if (!answers.length) return <EmptyState message="컨설팅 답변이 없습니다." />;

  if (selectedAnswerId !== null) {
    return (
      <AnswerDetailView
        hairConsultationId={hairConsultationId}
        answerId={selectedAnswerId}
        onBack={() => setSelectedAnswerId(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {answers.map((answer) => (
        <button
          key={answer.id}
          onClick={() => setSelectedAnswerId(answer.id)}
          className={cn(
            "w-full text-left rounded-xl border border-border bg-background overflow-hidden",
            "hover:border-secondary-foreground hover:shadow-sm transition-all",
            answer.deletedAt && "opacity-60"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                name={answer.user.displayName}
                role={answer.user.role}
              />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">
                    {answer.user.displayName}
                  </span>
                  <RoleBadge role={answer.user.role} />
                </div>
                <span className="text-sm text-foreground">
                  {formatDate(answer.createdAt, "YYYY.MM.DD / hh:mm")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {answer.deletedAt && (
                <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  삭제됨
                </span>
              )}
              <div className="text-right">
                <p className="text-sm font-semibold">{answer.title}</p>
                <p className="text-sm text-foreground font-medium">
                  {answer.priceType === "RANGE"
                    ? `${answer.minPrice?.toLocaleString()}원 ~ ${answer.maxPrice?.toLocaleString()}원`
                    : answer.price != null
                      ? `${answer.price.toLocaleString()}원`
                      : "가격 미정"}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 flex flex-wrap gap-1.5">
            {answer.faceShape && (
              <HairTag label="얼굴형" value={answer.faceShape} />
            )}
            {answer.bangsTypes.map((v, i) => (
              <HairTag key={i} label="앞머리" value={v} />
            ))}
            {answer.hairLengths.map((v, i) => (
              <HairTag key={i} label="길이" value={v} />
            ))}
            {answer.hairLayers.map((v, i) => (
              <HairTag key={i} label="레이어" value={v} />
            ))}
            {answer.hairCurls.map((v, i) => (
              <HairTag key={i} label="컬" value={v} />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── 컨설팅 답변 상세 뷰 ───────────────────────────────────────────────────────
function AnswerDetailView({
  hairConsultationId,
  answerId,
  onBack
}: {
  hairConsultationId: number;
  answerId: number;
  onBack: () => void;
}) {
  const { data: answer, isLoading } = useGetHairConsultationAnswerByIdQuery(
    hairConsultationId,
    answerId
  );

  if (isLoading) return <LoadingState />;
  if (!answer) return <EmptyState message="답변을 불러올 수 없습니다." />;

  const priceText =
    answer.priceType === "RANGE"
      ? `${answer.minPrice?.toLocaleString()}원 ~ ${answer.maxPrice?.toLocaleString()}원`
      : answer.price != null
        ? `${answer.price.toLocaleString()}원`
        : "가격 미정";

  const infoRows: { label: string; value: React.ReactNode }[] = [
    { label: "제목", value: answer.title },
    { label: "가격", value: priceText },
    { label: "가격유형", value: answer.priceType || "-" },
    {
      label: "얼굴형",
      value: answer.faceShape
        ? `${answer.faceShape}${answer.isFaceShapeAdvice ? " (어드바이스)" : ""}`
        : "-"
    },
    {
      label: "앞머리",
      value:
        answer.bangsTypes.length > 0
          ? `${answer.bangsTypes.join(", ")}${answer.isBangsTypeAdvice ? " (어드바이스)" : ""}`
          : "-"
    },
    {
      label: "헤어길이",
      value:
        answer.hairLengths.length > 0
          ? `${answer.hairLengths.join(", ")}${answer.isHairLengthAdvice ? " (어드바이스)" : ""}`
          : "-"
    },
    {
      label: "레이어",
      value:
        answer.hairLayers.length > 0
          ? `${answer.hairLayers.join(", ")}${answer.isHairLayerAdvice ? " (어드바이스)" : ""}`
          : "-"
    },
    {
      label: "컬",
      value:
        answer.hairCurls.length > 0
          ? `${answer.hairCurls.join(", ")}${answer.isHairCurlAdvice ? " (어드바이스)" : ""}`
          : "-"
    },
    {
      label: "작성일",
      value: formatDate(answer.createdAt, "YYYY.MM.DD / hh:mm")
    },
    {
      label: "수정일",
      value: formatDate(answer.updatedAt, "YYYY.MM.DD / hh:mm")
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground-weak hover:text-foreground transition-colors w-fit"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        답변 목록으로
      </button>

      {/* 답변자 정보 */}
      <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 bg-muted/20">
        <UserAvatar name={answer.user.displayName} role={answer.user.role} />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold">
              {answer.user.displayName}
            </span>
            <RoleBadge role={answer.user.role} />
          </div>
          <span className="text-sm text-foreground">ID: {answer.user.id}</span>
        </div>
        {answer.deletedAt && (
          <span className="ml-auto inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-sm font-medium text-destructive">
            삭제됨
          </span>
        )}
      </div>

      {/* 상세 정보 */}
      <div className="rounded-xl border border-border overflow-hidden">
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "flex items-start gap-4 px-4 py-3",
              i !== infoRows.length - 1 && "border-b border-border"
            )}
          >
            <span className="w-[80px] flex-shrink-0 text-sm font-medium text-foreground-weak pt-0.5">
              {row.label}
            </span>
            <span className="text-sm font-medium text-foreground flex-1">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* 설명 */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">설명</span>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap rounded-xl border border-border px-4 py-3">
          {answer.description}
        </p>
      </div>

      {/* 스타일 이미지 */}
      {answer.styleImages?.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">
            스타일 이미지
          </span>
          <div className="flex flex-wrap gap-2">
            {answer.styleImages.map((url, i) => (
              <ImageBox
                key={i}
                src={url}
                images={answer.styleImages.map((u) => ({ src: u }))}
                index={i}
                width={96}
                height={96}
                className="rounded-lg border border-border overflow-hidden"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 공통 서브 컴포넌트 ────────────────────────────────────────────────────────
function UserAvatar({
  name,
  role,
  size = "md"
}: {
  name: string;
  role: number;
  size?: "sm" | "md";
}) {
  const initials = name?.slice(0, 1) ?? "?";
  const isDesigner = role === 2;
  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 flex items-center justify-center font-bold",
        size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-sm",
        isDesigner
          ? "bg-secondary-background text-secondary-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: number }) {
  if (role !== 2) return null;
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary-background/60 px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
      <Scissors className="w-2.5 h-2.5" />
      디자이너
    </span>
  );
}

function HairTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-sm">
      <span className="text-foreground-weak">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-base text-foreground">{message}</p>
    </div>
  );
}
