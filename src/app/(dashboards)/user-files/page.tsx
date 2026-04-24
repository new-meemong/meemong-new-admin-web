"use client";

import React, { Suspense, useState } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader
} from "@/components/layouts/dashboard-page-layout";

import ImageManagementPageContent from "@/components/features/user-files/image-management-page-content";
import ImageManagementTab, {
  ImageManagementTabType
} from "@/components/features/user-files/image-management-tab";

export default function UserFilesPage() {
  const [imageTabType, setImageTabType] =
    useState<ImageManagementTabType>("USER_FILES");

  return (
    <Suspense>
      <DashboardPageLayout>
        <DashboardPageLayoutHeader title={"이미지 관리"}>
          <ImageManagementTab value={imageTabType} onChange={setImageTabType} />
        </DashboardPageLayoutHeader>
        <DashboardPageLayoutBody>
          <ImageManagementPageContent imageTabType={imageTabType} />
        </DashboardPageLayoutBody>
      </DashboardPageLayout>
    </Suspense>
  );
}
