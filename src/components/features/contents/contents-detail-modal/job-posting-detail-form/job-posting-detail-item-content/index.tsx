"use client";

import React from "react";
import { IJobPostingForm } from "@/models/jobPostings";
import { FormGroup } from "@/components/ui/form-group";
import { CommonForm } from "@/components/shared/common-form";
import ImageBox from "@/components/shared/image-box";
import { parseImageUrl } from "@/utils/image";

interface JobPostingDetailItemContentProps {
  jobPosting: IJobPostingForm;
}

export default function JobPostingDetailItemContent({
  jobPosting,
}: JobPostingDetailItemContentProps) {
  return (
    <>
      <FormGroup title={"기본 정보"}>
        <CommonForm.ReadonlyRow label={"모집분야"} value={jobPosting.role} />
        <CommonForm.ReadonlyRow
          label={"게시물 제목"}
          value={jobPosting.postingTitle}
        />
        <CommonForm.ReadonlyRow
          label={"매장주소"}
          value={jobPosting.storeAddress}
        />
        <CommonForm.ReadonlyRow
          label={"공고노출지역"}
          value={jobPosting.postingRegions}
        />
        <CommonForm.ReadonlyRow
          label={"교육"}
          value={jobPosting.monthlyEducationCount}
        />
        <CommonForm.ReadonlyRow
          label={"휴뮤가능일"}
          value={jobPosting.availableOffDays}
        />
        {jobPosting.role === "디자이너" && (
          <>
            <CommonForm.ReadonlyRow
              label={"정착지원금"}
              value={jobPosting.settlementAllowance}
            />
            <CommonForm.ReadonlyRow
              label={"월매출 1000 인센티브"}
              value={jobPosting.incentive}
            />
          </>
        )}
        {jobPosting.role === "인턴" && (
          <>
            <CommonForm.ReadonlyRow
              label={"급여"}
              value={jobPosting.settlementAllowance}
            />
          </>
        )}
      </FormGroup>
      <FormGroup title={"구인 정보"}>
        <CommonForm.ReadonlyRow label={"성별"} value={jobPosting.sex} />
        <CommonForm.ReadonlyRow label={"구인 연령대"} value={jobPosting.age} />
        <CommonForm.ReadonlyRow
          label={"미용 라이선스"}
          value={
            jobPosting.designerLicense !== undefined
              ? jobPosting.designerLicense
                ? "O"
                : "X"
              : "-"
          }
        />
        <CommonForm.ReadonlyRow
          label={"근무형태"}
          value={jobPosting.workType}
        />
        <CommonForm.ReadonlyRow
          label={"근무주기"}
          value={jobPosting.workCycleTypes}
        />
        {jobPosting.role === "디자이너" && (
          <>
            <CommonForm.ReadonlyRow
              label={"경력"}
              value={jobPosting.designerExperienceYearNumber}
            />
            <CommonForm.ReadonlyRow
              label={"직전매출"}
              value={jobPosting.salesLast3MonthsAvg}
            />
          </>
        )}
        {jobPosting.role === "인턴" && (
          <>
            <CommonForm.ReadonlyRow
              label={"경력"}
              value={jobPosting.internExperienceYearNumber}
            />
            <CommonForm.ReadonlyRow
              label={"4대보험"}
              value={
                jobPosting.isExistedFourInsurances !== undefined
                  ? jobPosting.isExistedFourInsurances
                    ? "O"
                    : "X"
                  : "-"
              }
            />
            <CommonForm.ReadonlyRow
              label={"퇴직금"}
              value={
                jobPosting.isExistedRetirementPay !== undefined
                  ? jobPosting.isExistedRetirementPay
                    ? "O"
                    : "X"
                  : "-"
              }
            />
          </>
        )}
      </FormGroup>
      <FormGroup title={"매장 정보"}>
        <CommonForm.ReadonlyRow
          label={"매장형태"}
          value={jobPosting.storeTypes}
        />
        <CommonForm.ReadonlyRow
          label={"직원수"}
          value={jobPosting.employeeCount}
        />
        <CommonForm.ReadonlyRow
          label={"인턴배정"}
          value={
            jobPosting.isExistedInternSystem !== undefined
              ? jobPosting.isExistedInternSystem
                ? "O"
                : "X"
              : "-"
          }
        />
        {jobPosting.role === "인턴" && (
          <CommonForm.ReadonlyRow
            label={"승급기간"}
            value={jobPosting.designerPromotionPeriod}
          />
        )}
        <CommonForm.ReadonlyRow
          label={"매장인테리어"}
          value={jobPosting.storeInteriorRenovationAgo}
        />
        {jobPosting.role === "디자이너" && (
          <CommonForm.ReadonlyRow
            label={"교육비지원"}
            value={
              jobPosting.isExistedEducationSupport !== undefined
                ? jobPosting.isExistedEducationSupport
                  ? "O"
                  : "X"
                : "-"
            }
          />
        )}
        <CommonForm.ReadonlyRow
          label={"식대지원"}
          value={
            jobPosting.isExistedMealSupport !== undefined
              ? jobPosting.isExistedMealSupport
                ? "O"
                : "X"
              : "-"
          }
        />
        <CommonForm.ReadonlyRow
          label={"식사시간"}
          value={jobPosting.mealTime}
        />
        <CommonForm.ReadonlyRow
          label={"시술제품지원"}
          value={
            jobPosting.isExistedProductSupport !== undefined
              ? jobPosting.isExistedProductSupport
                ? "O"
                : "X"
              : "-"
          }
        />
        <CommonForm.ReadonlyRow
          label={"기숙사"}
          value={
            jobPosting.isExistedDormitorySupport !== undefined
              ? jobPosting.isExistedDormitorySupport
                ? "O"
                : "X"
              : "-"
          }
        />
        <CommonForm.ReadonlyRow
          label={"점판수당"}
          value={jobPosting.salesCommission}
        />
        <CommonForm.ReadonlyRow
          label={"지하철접근성"}
          value={jobPosting.subwayAccessibility}
        />
        <CommonForm.ReadonlyRow
          label={"관리자성별"}
          value={jobPosting.adminSex}
        />
        <CommonForm.ReadonlyRow
          label={"관리자나이"}
          value={jobPosting.adminAge}
        />
        <CommonForm.ReadonlyRow
          label={"휴가일수"}
          value={jobPosting.leaveDayCount}
        />
        <CommonForm.ReadonlyRow
          label={"매장주차가능대수"}
          value={jobPosting.parkingSpotCount}
        />
        <CommonForm.ReadonlyRow
          label={"청소업체"}
          value={
            jobPosting.isExistedCleaningSupplier !== undefined
              ? jobPosting.isExistedCleaningSupplier
                ? "O"
                : "X"
              : "-"
          }
        />
        <CommonForm.ReadonlyRow
          label={"수건업체"}
          value={
            jobPosting.isExistedTowelSupplier !== undefined
              ? jobPosting.isExistedTowelSupplier
                ? "O"
                : "X"
              : "-"
          }
        />
        <CommonForm.ReadonlyRow
          label={"샵매니저상주"}
          value={
            jobPosting.isOnsiteManager !== undefined
              ? jobPosting.isOnsiteManager
                ? "O"
                : "X"
              : "-"
          }
        />
        <CommonForm.ReadonlyRow
          label={"기본커트가격"}
          value={jobPosting.basicCutPrice}
        />
      </FormGroup>
      <FormGroup title={"기타"}>
        <CommonForm.ReadonlyRow
          label={"매장이미지"}
          value={jobPosting.storeImages}
          formatter={(storeImages) => {
            return storeImages && storeImages.length > 0 ? (
              <div className={"grid grid-cols-4 gap-2"}>
                {storeImages.map((image, index) => (
                  <ImageBox
                    key={`store-image-${index}-${jobPosting.id}`}
                    src={parseImageUrl(image?.uri as string)}
                    images={storeImages.map((image) => ({
                      src: parseImageUrl(image?.uri as string),
                    }))}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              "-"
            );
          }}
        />
        <CommonForm.ReadonlyRow
          label={"근무시간"}
          value={`${jobPosting.startWorkTime} ~ ${jobPosting.endWorkTime}`}
        />
        <CommonForm.ReadonlyRow
          label={"매장링크"}
          value={jobPosting.storeUrl}
        />
        <CommonForm.ReadonlyRow
          label={"메인 염모제"}
          value={jobPosting.mainHairDye}
        />
        <CommonForm.ReadonlyRow
          label={"상세설명"}
          value={jobPosting.description}
        />
      </FormGroup>
    </>
  );
}
