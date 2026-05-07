"use client";

import React from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import DashboardHeaderTabGroup from "@/components/shared/dashboard-header-tab-group";
import ReportsPageContent from "@/components/features/declaration/declaration-page-content";
import { REPORT_MANAGEMENT_OPTIONS } from "@/constants/userReports";
import { ReportManagementType } from "@/models/reports";

export default function ReportsPage() {
  const [reportType, setReportType] =
    React.useState<ReportManagementType>("MYPAGE");

  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader title={"신고 관리"}>
        <DashboardHeaderTabGroup<ReportManagementType>
          options={REPORT_MANAGEMENT_OPTIONS}
          value={reportType}
          onChange={setReportType}
        />
      </DashboardPageLayoutHeader>
      <DashboardPageLayoutBody>
        <ReportsPageContent reportType={reportType} />
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
