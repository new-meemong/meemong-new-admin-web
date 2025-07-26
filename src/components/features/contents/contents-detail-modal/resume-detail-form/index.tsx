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

interface ResumeDetailFormProps {
  userId?: number;
}

export default function ResumeDetailForm({
  userId,
}: ResumeDetailFormProps) {
  const dialog = useDialog();

  const getResumesByUserIdQuery = useGetResumesByUserIdQuery(userId!);
  const deleteResumeMutation = useDeleteResumeMutation();

  const resumeList = getResumesByUserIdQuery?.data?.content || [];

  const handleClickDeleteButton = useCallback(async (resumeId: number) => {
    const confirmed = await dialog.confirm("해당 구인공고를 삭제하시겠습니까?");

    if (confirmed) {
      // TODO: toast 로 교체하기
      await deleteResumeMutation.mutateAsync(resumeId);
      getResumesByUserIdQuery.refetch();
    }
  }, []);

  return (
    <FormGroup title={"게시물 정보"}>
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
