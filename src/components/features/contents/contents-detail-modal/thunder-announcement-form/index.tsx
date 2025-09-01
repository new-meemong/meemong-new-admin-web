"use client";

import React, { useCallback, useEffect } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { CommonForm } from "@/components/shared/common-form";
import { Button } from "@/components/ui/button";
import { CommonFormButtonBox } from "@/components/shared/common-form/common-form-button-box";
import {
  useDeleteThunderAnnouncementMutation,
  useGetThunderAnnouncementByIdQuery,
  usePutThunderAnnouncementPremiumMutation,
} from "@/queries/thunderAnnouncements";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "@/utils/date";
import { ThunderAnnouncementImageType } from "@/models/thunderAnnouncements";
import ImageBox from "@/components/shared/image-box";
import { cn } from "@/lib/utils";
import { useDialog } from "@/components/shared/dialog/context";
import { toast } from "react-toastify";
import { parseImageUrl } from "@/utils/image";

const thunderAnnouncementSchema = z.object({
  title: z.string(),
  createdAt: z.string(),
  selectedServices: z.string(),
  location: z.string(),
  timeCondition: z.string(),
  priceType: z.string(),
  description: z.string(),
  images: z.array(
    z.object({
      id: z.number(),
      imgUrl: z.string(),
    }),
  ),
});

type ThunderAnnouncementFormType = z.infer<typeof thunderAnnouncementSchema>;

interface ThunderAnnouncementFormProps {
  contentsId?: number;
  onRefresh: () => void;
  onClose: () => void;
}

export default function ThunderAnnouncementForm({
  contentsId,
  onRefresh,
  onClose,
}: ThunderAnnouncementFormProps) {
  const dialog = useDialog();

  const form = useForm<ThunderAnnouncementFormType>({
    resolver: zodResolver(thunderAnnouncementSchema),
    defaultValues: {
      title: "",
      createdAt: "",
      selectedServices: "",
      location: "",
      timeCondition: "",
      priceType: "",
      description: "",
    },
  });

  const getThunderAnnouncementByIdQuery =
    useGetThunderAnnouncementByIdQuery(contentsId);
  const putThunderAnnouncementPremiumMutation =
    usePutThunderAnnouncementPremiumMutation();
  const deleteThunderAnnouncementMutation =
    useDeleteThunderAnnouncementMutation();

  const handleUpdatePremium = useCallback(
    async (isPremium: number) => {
      try {
        const isCancel = isPremium === 1;

        const confirmed = await dialog.confirm(
          `해당 게시물을 승인${isCancel ? "취소" : ""}하시겠습니까?`,
        );

        if (confirmed) {
          const result =
            await putThunderAnnouncementPremiumMutation.mutateAsync({
              thunderAnnouncementId: contentsId,
              isApproved: !isCancel,
            });

          if (result.isApproved !== undefined) {
            toast.success(
              `해당 공고를 ${result.isApproved ? "승인" : "승인 취소"}했습니다.`,
            );
            getThunderAnnouncementByIdQuery.refetch();
            onRefresh();
          } else {
            throw new Error();
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [contentsId, onRefresh],
  );

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm(`해당 게시물을 삭제하시겠습니까?`);

      if (confirmed) {
        await deleteThunderAnnouncementMutation.mutateAsync(contentsId!);
        toast.success("게시물을 삭제했습니다.");
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [contentsId]);

  useEffect(() => {
    if (getThunderAnnouncementByIdQuery.data) {
      form.reset({
        title: getThunderAnnouncementByIdQuery.data.title,
        createdAt: getThunderAnnouncementByIdQuery.data.createdAt,
        selectedServices: getThunderAnnouncementByIdQuery.data.selectedServices,
        location: getThunderAnnouncementByIdQuery.data.locations
          .map((location) => {
            const _location = [];
            if (location.upperRegion) {
              _location.push(location.upperRegion);
            }
            if (location.lowerRegion) {
              _location.push(location.lowerRegion);
            }
            return _location.join(" ");
          })
          .join(", "),
        timeCondition: getThunderAnnouncementByIdQuery.data.timeConditions
          .map((timeCondition) => timeCondition.conditionType)
          .join(", "),
        priceType: getThunderAnnouncementByIdQuery.data.priceType,
        description: getThunderAnnouncementByIdQuery.data.description,
        images: getThunderAnnouncementByIdQuery.data.images,
      });
    }
  }, [getThunderAnnouncementByIdQuery.data, form]);

  if (!getThunderAnnouncementByIdQuery.data) {
    return <></>;
  }

  return (
    <>
      <FormGroup title={"게시물 정보"}>
        <CommonForm.ReadonlyRow
          label={"제목"}
          value={form.watch("title") || "-"}
        />
        <CommonForm.ReadonlyRow
          label={"작성일자"}
          value={form.watch("createdAt")}
          formatter={(v) => {
            return v ? formatDate(v as string) : "-";
          }}
        />
        <CommonForm.ReadonlyRow
          label={"시술"}
          value={form.watch("selectedServices") || "-"}
        />
        <CommonForm.ReadonlyRow
          label={"위치"}
          value={form.watch("location") || "-"}
        />
        <CommonForm.ReadonlyRow
          label={"희망일시"}
          value={form.watch("timeCondition") || "-"}
        />
        <CommonForm.ReadonlyRow
          label={"재료비타입"}
          value={form.watch("priceType") || "-"}
        />
        <CommonForm.ReadonlyRow
          label={"본문내용"}
          value={form.watch("description") || "-"}
        />
        <CommonForm.ReadonlyRow<ThunderAnnouncementImageType[]>
          label={"사진"}
          value={form.watch("images")}
          formatter={(images) => {
            return (
              <div className={cn("flex flex-wrap gap-4")}>
                {images && Array.isArray(images) && images.length > 0
                  ? images.map((image, index) => (
                      <ImageBox
                        key={`thunder-announcement-image-url-${image.id}`}
                        src={parseImageUrl(image.imgUrl as string)}
                        images={images.map((image) => ({
                          src: image.imgUrl,
                        }))}
                        index={index}
                      />
                    ))
                  : "-"}
              </div>
            );
          }}
        />
      </FormGroup>
      <CommonFormButtonBox>
        {Number(getThunderAnnouncementByIdQuery.data?.isPremium) > 0 && (
          <Button
            variant={"submit"}
            size={"submit-multi"}
            onClick={() =>
              handleUpdatePremium(
                getThunderAnnouncementByIdQuery.data!.isPremium as number,
              )
            }
          >
            {getThunderAnnouncementByIdQuery.data?.isPremium === 1
              ? "승인취소"
              : "승인"}
          </Button>
        )}
        <Button
          variant={"negative"}
          size={"submit-multi"}
          onClick={handleDelete}
        >
          삭제
        </Button>
      </CommonFormButtonBox>
    </>
  );
}
