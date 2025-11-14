"use client";

import React, { useCallback } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { useDialog } from "@/components/shared/dialog/context";
import { Accordion } from "@/components/shared/accordion";
import ResumeDetailItemTitle from "@/components/features/contents/contents-detail-modal/resume-detail-form/resume-detail-item-title";
import ResumeDetailItemContent from "@/components/features/contents/contents-detail-modal/resume-detail-form/resume-detail-item-content";
import {
  useDeleteResumeMutation,
  useGetResumesByUserIdQuery,
} from "@/queries/resumes";
import ResumeDeleteButtonBox from "@/components/features/contents/contents-detail-modal/resume-detail-form/resume-delete-button-box";
import { toast } from "react-toastify";

interface ResumeDetailFormProps {
  userId?: number;
}

export default function ResumeDetailForm({ userId }: ResumeDetailFormProps) {
  const dialog = useDialog();

  const getResumesByUserIdQuery = useGetResumesByUserIdQuery(userId!);
  const deleteResumeMutation = useDeleteResumeMutation();

  const resumeList = getResumesByUserIdQuery?.data?.content || [];

  const handleClickDeleteButton = useCallback(async (resumeId: number) => {
    try {
      const confirmed = await dialog.confirm("해당 이력서를 삭제하시겠습니까?");

      if (confirmed) {
        await deleteResumeMutation.mutateAsync(resumeId);
        toast.success("이력서를 삭제했습니다.");
        await getResumesByUserIdQuery.refetch();
      }
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  }, []);

  return (
    <FormGroup>
      <Accordion
        items={resumeList.map((resume) => ({
          title: <ResumeDetailItemTitle resume={resume} />,
          content: <ResumeDetailItemContent resume={resume} />,
          rightChild: (
            <ResumeDeleteButtonBox
              onClick={() => handleClickDeleteButton(resume.id)}
            />
          ),
        }))}
      />
    </FormGroup>
  );
}
