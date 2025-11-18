"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import React, { useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { IAnnouncementForm } from "@/models/announcements";
import ImageBox from "@/components/shared/image-box";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { parseImageUrl } from "@/utils/image";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { useForm } from "react-hook-form";
import { usePutAnnouncementByIdMutation } from "@/queries/announcements";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const announcementSchema = z.object({
  description: z.string()
});

type AnnouncementFormType = z.infer<typeof announcementSchema>;

interface AnnouncementDetailItemProps {
  announcement: IAnnouncementForm;
  onDelete: () => void;
  onRefresh: () => void;
}

export default function AnnouncementDetailItem({
  announcement,
  onDelete,
  onRefresh
}: AnnouncementDetailItemProps) {
  const dialog = useDialog();
  const announcementImages = (announcement.images || []).map((image) => ({
    src: image.image
  }));

  const form = useForm<AnnouncementFormType>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      description: announcement.description || ""
    }
  });

  const putAnnouncementByIdMutation = usePutAnnouncementByIdMutation();

  useEffect(() => {
    form.reset({
      description: announcement.description || ""
    });
  }, [announcement.description, form]);

  const handleUpdate = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm(
        `해당 모집공고의 설명을 수정하시겠습니까?`
      );

      if (confirmed) {
        const result = await putAnnouncementByIdMutation.mutateAsync({
          announcementId: announcement.id,
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
  }, [announcement.id, dialog, putAnnouncementByIdMutation, form, onRefresh]);

  return (
    <Form {...form}>
      <div
        className={cn(
          "w-full flex flex-col gap-4 p-4 rounded-lg border border-border",
          "bg-background hover:border-foreground-weak transition-colors"
        )}
      >
        <div
          className={cn(
            "w-full flex flex-row items-center justify-between gap-4 pb-3 border-b border-border"
          )}
        >
          <div
            className={cn(
              "flex flex-row items-center gap-2 text-sm text-foreground-strong"
            )}
          >
            <span className={cn("font-medium")}>
              {announcement.category || "-"}
            </span>
            <span className={cn("text-foreground-weak")}>|</span>
            <span className={cn("truncate text-foreground")}>
              {announcement.priceType || "-"}
            </span>
            {announcement.price != null && announcement.price > 0 && (
              <>
                <span className={cn("text-foreground-weak")}>|</span>
                <span className={cn("text-foreground")}>
                  {announcement.price.toLocaleString()}원
                </span>
              </>
            )}
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
        <div className={cn("w-full flex flex-row items-start gap-4")}>
          {announcement.imgList && announcement.imgList.length > 0 && (
            <div className={cn("w-[40%] flex-shrink-0")}>
              <label
                className={cn(
                  "w-full shrink-0 text-foreground-strong mb-2 block"
                )}
              >
                사진
              </label>
              <div className={cn("flex flex-wrap gap-4")}>
                {announcement.imgList.map((image, index) => (
                  <ImageBox
                    key={`announcement-img-list-${announcement.id}-${image.id}`}
                    src={parseImageUrl(image.imageURL)}
                    images={announcement.imgList!.map((img) => ({
                      src: parseImageUrl(img.imageURL)
                    }))}
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
        {announcementImages && announcementImages.length > 0 && (
          <div className={cn("w-full pt-2")}>
            <div className={cn("w-fit grid grid-cols-4 gap-2")}>
              {announcementImages.map((image, index) => (
                <ImageBox
                  key={`announcement-${announcement.id}-${index}`}
                  src={image.src}
                  images={announcementImages}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}
