"use client";

import React, { useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { useDialog } from "@/components/shared/dialog/context";
import { IShampooRoom, ShampooRoomCategory } from "@/models/shampooRooms";
import {
  useGetShampooRoomByIdQuery,
  usePutShampooRoomMutation,
  useDeleteShampooRoomMutation
} from "@/queries/shampooRooms";
import { formatDate } from "@/utils/date";

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { value: "FREE", label: "자유" },
  { value: "EDUCATION", label: "교육" },
  { value: "PRODUCT", label: "제품" },
  { value: "MARKET", label: "마켓" }
];

const shampooRoomSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  category: z.string().min(1, "카테고리를 선택해주세요."),
  content: z.string().min(1, "내용을 입력해주세요.")
});

type ShampooRoomFormType = z.infer<typeof shampooRoomSchema>;

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

  const getShampooRoomQuery = useGetShampooRoomByIdQuery(shampooRoom.id, {
    enabled: isOpen
  });
  const detail = getShampooRoomQuery.data;

  const putShampooRoomMutation = usePutShampooRoomMutation();
  const deleteShampooRoomMutation = useDeleteShampooRoomMutation();

  const form = useForm<ShampooRoomFormType>({
    resolver: zodResolver(shampooRoomSchema),
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

      await putShampooRoomMutation.mutateAsync({
        id: shampooRoom.id,
        title: form.getValues("title"),
        category: form.getValues("category") as ShampooRoomCategory,
        content: form.getValues("content")
      });
      toast.success("게시글을 수정했습니다.");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [dialog, form, putShampooRoomMutation, shampooRoom.id, onRefresh]);

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm("해당 게시글을 삭제하시겠습니까?");
      if (!confirmed) return;

      await deleteShampooRoomMutation.mutateAsync(shampooRoom.id);
      toast.success("게시글을 삭제했습니다.");
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [dialog, deleteShampooRoomMutation, shampooRoom.id, onRefresh, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      closable={true}
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>
        콘텐츠 관리 <ChevronRight /> 샴푸실 <ChevronRight /> 상세페이지
      </ModalHeader>
      <ModalBody className={cn("overflow-y-auto")}>
        <FormProvider {...form}>
          <div className={cn("w-full flex flex-col gap-6")}>
            {/* 작성자 정보 */}
            <div className={cn("flex flex-col gap-2")}>
              <h3 className={cn("typo-title-2-semibold text-foreground")}>
                작성자 정보
              </h3>
              <div className={cn("border rounded-lg p-4 flex flex-col gap-2 text-sm")}>
                {detail ? (
                  <>
                    <div className={cn("flex gap-2")}>
                      <span className={cn("font-medium text-foreground-strong min-w-[80px]")}>이름</span>
                      <span>{detail.user.name || "-"}</span>
                    </div>
                    <div className={cn("flex gap-2")}>
                      <span className={cn("font-medium text-foreground-strong min-w-[80px]")}>역할</span>
                      <span>{detail.user.role === 1 ? "모델" : detail.user.role === 2 ? "디자이너" : "-"}</span>
                    </div>
                    <div className={cn("flex gap-2")}>
                      <span className={cn("font-medium text-foreground-strong min-w-[80px]")}>주소</span>
                      <span>{detail.user.address || "-"} {detail.user.address2 || ""}</span>
                    </div>
                  </>
                ) : (
                  <span className={cn("text-foreground-weak")}>불러오는 중...</span>
                )}
              </div>
            </div>

            {/* 게시글 정보 */}
            <div className={cn("flex flex-col gap-2")}>
              <div className={cn("flex items-center justify-between")}>
                <h3 className={cn("typo-title-2-semibold text-foreground")}>
                  게시글 정보
                </h3>
                <div className={cn("flex gap-2 text-sm text-foreground-weak")}>
                  <span>조회 {shampooRoom.viewCount}</span>
                  <span>좋아요 {shampooRoom.likeCount}</span>
                  <span>댓글 {shampooRoom.commentCount}</span>
                  <span>{formatDate(shampooRoom.createdAt, "YYYY.MM.DD / hh:mm")}</span>
                </div>
              </div>

              <div className={cn("border rounded-lg")}>
                <CommonForm.InputRow<ShampooRoomFormType>
                  name="title"
                  label="제목"
                />
                <CommonForm.SelectBox<ShampooRoomFormType>
                  name="category"
                  label="카테고리"
                  options={CATEGORY_OPTIONS}
                  align="row"
                  className={cn("border-b py-[10px] mt-0 px-0")}
                />
                <CommonForm.TextAreaRow<ShampooRoomFormType>
                  name="content"
                  label="내용"
                  rows={8}
                />
              </div>

              {/* 이미지 */}
              {detail && detail.images && detail.images.length > 0 && (
                <div className={cn("flex flex-col gap-2 mt-2")}>
                  <span className={cn("font-medium text-foreground-strong text-sm")}>이미지</span>
                  <div className={cn("flex flex-wrap gap-2")}>
                    {detail.images.map((img, index) => (
                      <img
                        key={index}
                        src={img.imageUrl}
                        alt={`shampoo-room-img-${index}`}
                        className={cn("w-[100px] h-[100px] object-cover rounded")}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className={cn("flex justify-end gap-2 pt-2 border-t border-border")}>
              <Button
                variant="outline"
                className={cn("text-negative border-negative hover:bg-negative/10")}
                onClick={handleDelete}
                disabled={deleteShampooRoomMutation.isPending}
              >
                삭제
              </Button>
              <Button
                variant="default"
                onClick={handleUpdate}
                disabled={putShampooRoomMutation.isPending}
              >
                수정
              </Button>
            </div>
          </div>
        </FormProvider>
      </ModalBody>
    </Modal>
  );
}
