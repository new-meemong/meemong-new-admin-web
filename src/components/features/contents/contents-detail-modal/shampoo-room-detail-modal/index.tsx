"use client";

import {
  Calendar,
  ChevronRight,
  Eye,
  Heart,
  MapPin,
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
import { IShampooRoom, ShampooRoomCategory } from "@/models/shampooRooms";
import React, { useCallback, useEffect } from "react";
import {
  useDeleteShampooRoomMutation,
  useGetShampooRoomByIdQuery,
  usePutShampooRoomMutation
} from "@/queries/shampooRooms";

import { Button } from "@/components/ui/button";
import ImageBox from "@/components/shared/image-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import SelectBox from "@/components/shared/select-box";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/date";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { value: "FREE", label: "자유" },
  { value: "EDUCATION", label: "교육" },
  { value: "PRODUCT", label: "제품" },
  { value: "MARKET", label: "마켓" }
];

const CATEGORY_LABEL: Record<string, string> = {
  FREE: "자유",
  EDUCATION: "교육",
  PRODUCT: "제품",
  MARKET: "마켓"
};

const schema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  category: z.string().min(1, "카테고리를 선택해주세요."),
  content: z.string().min(1, "내용을 입력해주세요.")
});

type FormType = z.infer<typeof schema>;

interface ShampooRoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shampooRoom: IShampooRoom;
  onRefresh: () => void;
}

export default function ShampooRoomDetailModal({
  isOpen,
  onClose,
  shampooRoom,
  onRefresh
}: ShampooRoomDetailModalProps) {
  const dialog = useDialog();

  const detailQuery = useGetShampooRoomByIdQuery(shampooRoom.id, {
    enabled: isOpen
  });
  const detail = detailQuery.data;

  const putMutation = usePutShampooRoomMutation();
  const deleteMutation = useDeleteShampooRoomMutation();

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: shampooRoom.title,
      category: shampooRoom.category,
      content: shampooRoom.content
    }
  });

  useEffect(() => {
    if (detail) {
      form.reset({
        title: detail.title,
        category: detail.category,
        content: detail.content
      });
    }
  }, [detail, form]);

  const handleUpdate = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    try {
      const confirmed = await dialog.confirm("해당 게시글을 수정하시겠습니까?");
      if (!confirmed) return;
      await putMutation.mutateAsync({
        id: shampooRoom.id,
        title: form.getValues("title"),
        category: form.getValues("category") as ShampooRoomCategory,
        content: form.getValues("content")
      });
      toast.success("게시글을 수정했습니다.");
      detailQuery.refetch();
      onRefresh();
    } catch {
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [dialog, form, putMutation, shampooRoom.id, detailQuery, onRefresh]);

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm("해당 게시글을 삭제하시겠습니까?");
      if (!confirmed) return;
      await deleteMutation.mutateAsync(shampooRoom.id);
      toast.success("게시글을 삭제했습니다.");
      onRefresh();
      onClose();
    } catch {
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [dialog, deleteMutation, shampooRoom.id, onRefresh, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      closable
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>
        콘텐츠 관리 <ChevronRight className="w-4 h-4" /> 샴푸실{" "}
        <ChevronRight className="w-4 h-4" /> 상세페이지
      </ModalHeader>

      <ModalBody className="overflow-hidden flex flex-row gap-0 p-0 !space-y-0">
        <FormProvider {...form}>
          {/* ── 좌측 패널: 작성자 + 편집 ── */}
          <div className="w-[40%] flex-shrink-0 flex flex-col border-r border-border px-6 py-5 gap-5 overflow-y-auto">
            {/* 작성자 정보 */}
            {detail ? (
              <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 bg-muted/20">
                <div className="w-10 h-10 rounded-full bg-secondary-background flex items-center justify-center text-base font-bold text-secondary-foreground flex-shrink-0">
                  {detail.user.name?.slice(0, 1) ?? "?"}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-semibold">
                      {detail.user.name || "-"}
                    </span>
                    {detail.user.role === 2 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary-background/60 px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        <Scissors className="w-3 h-3" />
                        디자이너
                      </span>
                    )}
                    {detail.user.role === 1 && (
                      <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                        모델
                      </span>
                    )}
                  </div>
                  {(detail.user.address || detail.user.address2) && (
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <MapPin className="w-3 h-3 text-foreground-weak" />
                      <span>
                        {[detail.user.address, detail.user.address2]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-16 rounded-xl bg-muted animate-pulse" />
            )}

            {/* 통계 */}
            <div className="flex items-center gap-3 flex-wrap">
              <StatChip
                icon={<Eye className="w-3.5 h-3.5" />}
                value={shampooRoom.viewCount}
                label="조회"
              />
              <StatChip
                icon={<Heart className="w-3.5 h-3.5" />}
                value={shampooRoom.likeCount}
                label="좋아요"
              />
              <StatChip
                icon={<MessageCircle className="w-3.5 h-3.5" />}
                value={shampooRoom.commentCount}
                label="댓글"
              />
              <div className="flex items-center gap-1 text-sm text-foreground">
                <Calendar className="w-3.5 h-3.5 text-foreground-weak" />
                <span>{formatDate(shampooRoom.createdAt, "YYYY.MM.DD")}</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* 편집 폼 */}
            <div className="flex flex-col gap-4 flex-1">
              <EditTitle />
              <EditCategory />
              <EditContent />
            </div>

            {/* 액션 버튼 */}
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

          {/* ── 우측 패널: 게시글 내용 미리보기 + 이미지 ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 py-5 gap-6">
            {/* 카테고리 뱃지 + 제목 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-secondary-background/50 px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {CATEGORY_LABEL[shampooRoom.category] ?? shampooRoom.category}
                </span>
                {shampooRoom.isEdited && (
                  <span className="text-xs text-foreground-weak">(수정됨)</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground leading-snug">
                {shampooRoom.title}
              </h2>
            </div>

            <div className="h-px bg-border" />

            {/* 본문 내용 */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground-weak">
                내용
              </span>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap rounded-xl border border-border px-4 py-3 bg-muted/10">
                {shampooRoom.content}
              </p>
            </div>

            {/* 이미지 */}
            {detail && detail.images && detail.images.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-foreground-weak">
                  이미지 ({detail.images.length})
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {detail.images.map((img, i) => (
                    <ImageBox
                      key={i}
                      src={img.imageUrl}
                      images={detail.images.map((m) => ({ src: m.imageUrl }))}
                      index={i}
                      width={120}
                      height={120}
                      className="rounded-xl border border-border overflow-hidden w-full aspect-square"
                    />
                  ))}
                </div>
              </div>
            )}

            {detail && detail.images?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-2 rounded-xl border border-dashed border-border">
                <span className="text-sm text-foreground-weak">
                  이미지가 없습니다.
                </span>
              </div>
            )}
          </div>
        </FormProvider>
      </ModalBody>
    </Modal>
  );
}

// ── 공통 통계 칩 ──────────────────────────────────────────────────────────────
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

// ── 폼 필드 ──────────────────────────────────────────────────────────────────
function EditTitle() {
  const { control } = useFormContext<FormType>();
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1.5">
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

function EditCategory() {
  const { control } = useFormContext<FormType>();
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">카테고리</Label>
          <FormControl>
            <SelectBox
              name="category"
              options={CATEGORY_OPTIONS}
              value={field.value}
              onChange={({ value }) => field.onChange(value)}
              className="w-full"
              size="md"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function EditContent() {
  const { control } = useFormContext<FormType>();
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1.5 flex-1">
          <Label className="text-sm font-medium">내용</Label>
          <FormControl>
            <Textarea
              placeholder="내용을 입력하세요"
              className="resize-none min-h-[200px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
