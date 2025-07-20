"use client";

import React, { useCallback } from "react";
import { FormGroup } from "@/components/ui/form-group";
import { useDialog } from "@/components/shared/dialog/context";
import { Accordion } from "@/components/shared/accordion";
import JobPostingDetailItemTitle from "@/components/features/contents/contents-detail-modal/job-posting-detail-form/job-posting-detail-item-title";
import JobPostingDetailItemContent from "@/components/features/contents/contents-detail-modal/job-posting-detail-form/job-posting-detail-item-content";
import {
  useDeleteJobPostingMutation,
  useGetJobPostingsByUserIdQuery,
} from "@/queries/jobPostings";
import JobPostingDeleteButtonBox from "@/components/features/contents/contents-detail-modal/job-posting-detail-form/job-posting-delete-button-box";

interface JobPostingDetailFormProps {
  userId?: number;
}

export default function JobPostingDetailForm({
  userId,
}: JobPostingDetailFormProps) {
  const dialog = useDialog();

  const getJobPostingsByUserIdQuery = useGetJobPostingsByUserIdQuery(userId!);
  const deleteJobPostingMutation = useDeleteJobPostingMutation();

  const jobPostingList = getJobPostingsByUserIdQuery?.data?.content || [];

  const handleClickDeleteButton = useCallback(async (jobPostingId: number) => {
    const confirmed = await dialog.confirm("해당 구인공고를 삭제하시겠습니까?");

    if (confirmed) {
      // TODO: toast 로 교체하기
      await deleteJobPostingMutation.mutateAsync(jobPostingId);
      getJobPostingsByUserIdQuery.refetch();
    }
  }, []);

  return (
    <FormGroup title={"게시물 정보"}>
      <Accordion
        items={jobPostingList.map((jobPosting) => ({
          title: <JobPostingDetailItemTitle jobPosting={jobPosting} />,
          content: <JobPostingDetailItemContent jobPosting={jobPosting} />,
          rightChild: (
            <JobPostingDeleteButtonBox
              onClick={() => handleClickDeleteButton(jobPosting.id)}
            />
          ),
        }))}
      />
    </FormGroup>
  );
}
