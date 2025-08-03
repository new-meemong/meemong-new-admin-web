import React from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import DeclarationPageContent from "@/components/features/declaration/declaration-page-content";

export default function DeclarationPage() {
  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader title={"신고 관리"} />
      <DashboardPageLayoutBody>
        <DeclarationPageContent />
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
