"use client";

import React from "react";
import { IResumeForm } from "@/models/resumes";
import { CommonForm } from "@/components/shared/common-form";
import ImageBox from "@/components/shared/image-box";
import { parseImageUrl } from "@/utils/image";

interface ResumeDetailItemContentProps {
  resume: IResumeForm;
}

export default function ResumeDetailItemContent({
  resume,
}: ResumeDetailItemContentProps) {
  return (
    <>
      <CommonForm.ReadonlyRow
        label={"프로필 사진"}
        value={resume.profileImageUri}
        formatter={(profileImageUri) => {
          return profileImageUri ? (
            <ImageBox
              src={parseImageUrl(profileImageUri as string)}
              images={[{ src: parseImageUrl(profileImageUri) }]}
              index={0}
            />
          ) : (
            "-"
          );
        }}
      />
      <CommonForm.ReadonlyRow
        label={"한 줄 소개"}
        value={resume.shortDescription}
      />
      <CommonForm.ReadonlyRow label={"이름"} value={resume.userName} />
      <CommonForm.ReadonlyRow
        label={"근무 희망 지역"}
        value={resume.preferredStoreRegions}
      />
      <CommonForm.ReadonlyRow label={"생년월일"} value={resume.birthday} />
      <CommonForm.ReadonlyRow label={"성별"} value={resume.sex} />
      <CommonForm.ReadonlyRow label={"지원분야"} value={resume.appliedRole} />
      <CommonForm.ReadonlyRow label={"근무형태"} value={resume.workType} />
      <CommonForm.ReadonlyRow
        label={"정착지원금"}
        value={resume.settlementAllowance}
      />
      <CommonForm.ReadonlyRow
        label={"미용 라이선스"}
        value={resume.designerLicenses}
      />
      <CommonForm.ReadonlyRow
        label={"경력"}
        value={
          resume.appliedRole === "디자이너"
            ? resume.designerMajorExperienceDuration || "-"
            : resume.internMajorExperienceDuration || "-"
        }
      />
      <CommonForm.ReadonlyRow
        label={"대표 경력 업체"}
        value={
          resume.appliedRole === "디자이너"
            ? resume.designerMajorExperienceCompanyName || "-"
            : resume.internMajorExperienceCompanyName || "-"
        }
      />
      <CommonForm.ReadonlyRow
        label={"근무기간"}
        value={
          resume.appliedRole === "디자이너"
            ? resume.designerExperienceYearNumber || "-"
            : resume.internExperienceYearNumber || "-"
        }
      />
      <CommonForm.ReadonlyRow
        label={"직급"}
        value={
          resume.appliedRole === "디자이너"
            ? resume.designerMajorExperienceRole || "-"
            : resume.internMajorExperienceDuration || "-"
        }
      />
      <CommonForm.ReadonlyRow
        label={"학력"}
        value={resume.completedEducationLevels}
      />
      <CommonForm.ReadonlyRow
        label={"희망휴무"}
        value={resume.preferredOffDays}
      />
      <CommonForm.ReadonlyRow
        label={"근무주기"}
        value={resume.workCycleTypes}
      />
      <CommonForm.ReadonlyRow
        label={"기숙사 지원"}
        value={
          resume.isPreferredDormitorySupport !== undefined
            ? resume.isPreferredDormitorySupport
              ? "O"
              : "X"
            : "-"
        }
      />
      <CommonForm.ReadonlyRow
        label={"희망교육"}
        value={resume.preferredMonthlyEducationCount}
      />
      <CommonForm.ReadonlyRow
        label={"식대지원"}
        value={
          resume.isPreferredMealSupport !== undefined
            ? resume.isPreferredMealSupport
              ? "O"
              : "X"
            : "-"
        }
      />
      <CommonForm.ReadonlyRow
        label={"주차"}
        value={
          resume.isPreferredParking !== undefined
            ? resume.isPreferredParking
              ? "O"
              : "X"
            : "-"
        }
      />
      <CommonForm.ReadonlyRow label={"mbti"} value={resume.mbti} />
      <CommonForm.ReadonlyRow label={"자기소개"} value={resume.description} />
    </>
  );
}
