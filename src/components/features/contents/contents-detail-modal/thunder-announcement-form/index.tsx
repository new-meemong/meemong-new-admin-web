"use client";

import React, { useCallback, useEffect } from "react";
import {
  useDeleteThunderAnnouncementMutation,
  useGetThunderAnnouncementByIdQuery,
  usePutThunderAnnouncementMutation
} from "@/queries/thunderAnnouncements";

import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { CommonFormButtonBox } from "@/components/shared/common-form/common-form-button-box";
import { ContentsCategoryType } from "@/models/contents";
import { Form } from "@/components/ui/form";
import { FormGroup } from "@/components/ui/form-group";
import ImageBox from "@/components/shared/image-box";
import { ThunderAnnouncementImageType } from "@/models/thunderAnnouncements";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { parseImageUrl } from "@/utils/image";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const thunderAnnouncementSchema = z.object({
  title: z.string(),
  createdAt: z.string(),
  selectedServices: z.array(z.string()),
  location: z.string(),
  timeCondition: z.string(),
  priceType: z.string(),
  description: z.string(),
  images: z.array(
    z.object({
      id: z.number(),
      imgUrl: z.string()
    })
  )
});

type ThunderAnnouncementFormType = z.infer<typeof thunderAnnouncementSchema>;

interface ThunderAnnouncementFormProps {
  contentsId?: number;
  categoryId?: ContentsCategoryType;
  onRefresh: () => void;
  onClose: () => void;
}

export default function ThunderAnnouncementForm({
  contentsId,
  categoryId,
  onRefresh,
  onClose
}: ThunderAnnouncementFormProps) {
  const dialog = useDialog();

  const form = useForm<ThunderAnnouncementFormType>({
    resolver: zodResolver(thunderAnnouncementSchema),
    defaultValues: {
      title: "",
      createdAt: "",
      selectedServices: [],
      location: "",
      timeCondition: "",
      priceType: "",
      description: ""
    }
  });

  const getThunderAnnouncementByIdQuery =
    useGetThunderAnnouncementByIdQuery(contentsId);
  const putThunderAnnouncementMutation = usePutThunderAnnouncementMutation();
  const deleteThunderAnnouncementMutation =
    useDeleteThunderAnnouncementMutation();

  const handleUpdatePremium = useCallback(async () => {
    try {
      const isPremium = categoryId === "1";
      const confirmed = await dialog.confirm(
        isPremium
          ? `해당 게시물을 일반공고로 변경하시겠습니까?`
          : `해당 게시물을 프리미엄으로 변경하시겠습니까?`
      );

      if (confirmed) {
        const result = await putThunderAnnouncementMutation.mutateAsync({
          thunderAnnouncementId: contentsId!,
          isPremium: isPremium ? 0 : 1
        });

        if (result.isSuccess) {
          toast.success(
            isPremium
              ? "해당 공고를 일반공고로 변경했습니다."
              : "해당 공고를 프리미엄으로 변경했습니다."
          );
          getThunderAnnouncementByIdQuery.refetch();
          onRefresh();
          onClose();
        } else {
          throw new Error();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, [
    categoryId,
    getThunderAnnouncementByIdQuery,
    contentsId,
    onRefresh,
    onClose,
    putThunderAnnouncementMutation,
    dialog
  ]);

  const handleUpdate = useCallback(async () => {
    try {
      const confirmed = await dialog.confirm(
        `해당 게시물의 제목과 본문내용을 수정하시겠습니까?`
      );

      if (confirmed) {
        const result = await putThunderAnnouncementMutation.mutateAsync({
          thunderAnnouncementId: contentsId!,
          title: form.getValues("title"),
          description: form.getValues("description")
        });

        if (result.isSuccess) {
          toast.success("게시물을 수정했습니다.");
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
  }, [
    contentsId,
    dialog,
    putThunderAnnouncementMutation,
    form,
    getThunderAnnouncementByIdQuery,
    onRefresh
  ]);

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
  }, [
    contentsId,
    dialog,
    deleteThunderAnnouncementMutation,
    onRefresh,
    onClose
  ]);

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
        images: getThunderAnnouncementByIdQuery.data.images
      });
    }
  }, [getThunderAnnouncementByIdQuery.data, form]);

  if (!getThunderAnnouncementByIdQuery.data) {
    return <></>;
  }

  return (
    <Form {...form}>
      <FormGroup>
        <CommonForm.Input
          name={"title"}
          label={"제목"}
          placeholder={"제목을 입력해주세요."}
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
          value={
            Array.isArray(form.watch("selectedServices"))
              ? form.watch("selectedServices").join(", ")
              : "-"
          }
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
        <CommonForm.Textarea
          name={"description"}
          label={"본문내용"}
          placeholder={"본문내용을 입력해주세요."}
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
                          src: image.imgUrl
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
        {categoryId === "0" && (
          <Button
            variant={"submit"}
            size={"submit-multi"}
            onClick={() => handleUpdatePremium()}
          >
            프리미엄으로 변경
          </Button>
        )}
        {categoryId === "1" && (
          <Button
            variant={"submit"}
            size={"submit-multi"}
            onClick={() => handleUpdatePremium()}
          >
            일반공고로 변경
          </Button>
        )}
        <Button
          variant={"default"}
          size={"submit-multi"}
          onClick={handleUpdate}
        >
          수정
        </Button>
        <Button
          variant={"negative"}
          size={"submit-multi"}
          onClick={handleDelete}
        >
          삭제
        </Button>
      </CommonFormButtonBox>
    </Form>
  );
}
