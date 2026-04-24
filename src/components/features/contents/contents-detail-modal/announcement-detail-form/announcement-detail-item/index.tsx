"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { IBeautyApplicationDetail } from "@/models/beautyApplications";
import ImageBox from "@/components/shared/image-box";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { parseImageUrl } from "@/utils/image";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { useForm } from "react-hook-form";
import { usePutBeautyApplicationMutation } from "@/queries/beautyApplications";
import { useDeleteBeautyApplicationImageMutation } from "@/queries/beautyApplicationImages";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const announcementSchema = z.object({
  description: z.string()
});

type AnnouncementFormType = z.infer<typeof announcementSchema>;

interface AnnouncementDetailItemProps {
  announcement: IBeautyApplicationDetail;
  onDelete: () => void;
  onRefresh: () => Promise<void> | void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={cn("flex flex-row gap-2 text-sm")}>
      <span className={cn("text-foreground-weak shrink-0 w-24")}>{label}</span>
      <span className={cn("text-foreground")}>{value || "-"}</span>
    </div>
  );
}

export default function AnnouncementDetailItem({
  announcement,
  onDelete,
  onRefresh
}: AnnouncementDetailItemProps) {
  const dialog = useDialog();

  const form = useForm<AnnouncementFormType>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      description: announcement.description || ""
    }
  });

  const putBeautyApplicationMutation = usePutBeautyApplicationMutation();
  const deleteBeautyApplicationImageMutation =
    useDeleteBeautyApplicationImageMutation();
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  useEffect(() => {
    form.reset({
      description: announcement.description || ""
    });
  }, [announcement.description, form]);

  useEffect(() => {
    setDeletedImageIds([]);
  }, [announcement.id]);

  const visibleImages = useMemo(
    () =>
      (announcement.imgList || []).filter(
        (image) => !deletedImageIds.includes(image.id)
      ),
    [announcement.imgList, deletedImageIds]
  );

  const handleUpdate = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm(
        `해당 모집공고의 설명을 수정하시겠습니까?`
      );

      if (confirmed) {
        const result = await putBeautyApplicationMutation.mutateAsync({
          beautyApplicationId: announcement.id,
          description: form.getValues("description")
        });

        if (result.success) {
          toast.success("모집공고를 수정했습니다.");
          onRefresh();
        } else {
          throw new Error();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [announcement.id, dialog, putBeautyApplicationMutation, form, onRefresh]);

  const handleDeleteAnnouncementImage = useCallback(
    async (image: { id?: number }) => {
      if (!image.id) {
        window.alert("삭제할 수 없는 이미지입니다.");
        return false;
      }

      try {
        const confirmed = window.confirm("해당 모집공고 이미지를 삭제하시겠습니까?");
        if (!confirmed) return false;

        await deleteBeautyApplicationImageMutation.mutateAsync(image.id);
        toast.success("모집공고 이미지를 삭제했습니다.");
        setDeletedImageIds((prev) => [...prev, image.id!]);
        await onRefresh();
        return true;
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
        return false;
      }
    },
    [deleteBeautyApplicationImageMutation, onRefresh]
  );

  return (
    <Form {...form}>
      <div
        className={cn(
          "w-full flex flex-col gap-4 p-4 rounded-lg border border-border",
          "bg-background hover:border-foreground-weak transition-colors"
        )}
      >
        {/* 헤더 */}
        <div
          className={cn(
            "w-full flex flex-row items-center justify-between gap-4 pb-3 border-b border-border"
          )}
        >
          <div className={cn("flex flex-row items-center gap-2 text-sm text-foreground-strong")}>
            {announcement.title && (
              <>
                <span className={cn("font-semibold")}>{announcement.title}</span>
                <span className={cn("text-foreground-weak")}>|</span>
              </>
            )}
            <span className={cn("font-medium")}>{announcement.category || "-"}</span>
            <span className={cn("text-foreground-weak")}>|</span>
            <span className={cn("truncate text-foreground")}>{announcement.priceType || "-"}</span>
            <span className={cn("text-foreground-weak")}>|</span>
            <span className={cn("text-foreground-weak")}>
              {announcement.createdAt
                ? formatDate(announcement.createdAt, "YYYY.MM.DD")
                : "-"}
            </span>
          </div>
          <Button
            variant={"outline"}
            size={"sm"}
            className={cn("w-[60px] shrink-0")}
            onClick={onDelete}
          >
            삭제
          </Button>
        </div>

        {/* 기본 정보 */}
        <div className={cn("flex flex-col gap-2")}>
          <InfoRow
            label="카테고리"
            value={announcement.categories?.join(", ")}
          />
          <InfoRow
            label="가격"
            value={
              announcement.price != null && announcement.price > 0
                ? `${announcement.price.toLocaleString()}원`
                : "-"
            }
          />
          <InfoRow label="모집 성별" value={announcement.recruitGender} />
          <InfoRow label="촬영 타입" value={announcement.shootingType} />
          <InfoRow label="업무 형태" value={announcement.workType} />
          <InfoRow
            label="예외 시간(분)"
            value={
              announcement.exceptMinutes != null
                ? `${announcement.exceptMinutes}분`
                : null
            }
          />
          <InfoRow
            label="리뷰 타입"
            value={
              announcement.reviewTypes?.length > 0
                ? announcement.reviewTypes.join(", ")
                : null
            }
          />
          <InfoRow
            label="예약 시간"
            value={
              announcement.appointmentTime
                ? formatDate(announcement.appointmentTime, "YYYY.MM.DD HH:mm")
                : null
            }
          />
          <InfoRow
            label="활성 여부"
            value={announcement.activated ? "활성" : "비활성"}
          />
          <InfoRow
            label="얼굴 공개"
            value={announcement.faceReveal ? "공개" : "비공개"}
          />
        </div>

        {/* 사진 + 설명 */}
        <div className={cn("w-full flex flex-row items-start gap-4 pt-2 border-t border-border")}>
          {visibleImages && visibleImages.length > 0 && (
            <div className={cn("w-[40%] flex-shrink-0")}>
              <label
                className={cn(
                  "w-full shrink-0 text-foreground-strong mb-2 block text-sm"
                )}
              >
                사진
              </label>
              <div className={cn("flex flex-wrap gap-4")}>
                {visibleImages.map((image, index) => (
                  <ImageBox
                    key={`announcement-img-list-${announcement.id}-${image.id}`}
                    src={parseImageUrl(image.imageURL)}
                    images={visibleImages.map((img) => ({
                      id: img.id,
                      src: parseImageUrl(img.imageURL),
                      deletable: true
                    }))}
                    onDeleteImage={handleDeleteAnnouncementImage}
                    index={index}
                    width={120}
                    height={120}
                  />
                ))}
              </div>
            </div>
          )}
          <div className={cn("flex-1 min-w-0 flex flex-col gap-2")}>
            <div
              className={cn("flex flex-row items-center justify-between mb-2")}
            >
              <FormLabel className={cn("text-foreground-strong shrink-0")}>
                설명
              </FormLabel>
              <Button
                variant={"default"}
                size={"sm"}
                className={cn("w-[60px] shrink-0")}
                onClick={handleUpdate}
              >
                수정
              </Button>
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className={cn("flex flex-col gap-0")}>
                  <FormControl>
                    <Textarea
                      className={cn("w-full rounded-none resize-none")}
                      placeholder={"설명을 입력해주세요."}
                      rows={14}
                      style={{ minHeight: "230px", height: "230px" }}
                      {...field}
                    />
                  </FormControl>
                  <CommonForm.ErrorMessage name="description" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </Form>
  );
}
