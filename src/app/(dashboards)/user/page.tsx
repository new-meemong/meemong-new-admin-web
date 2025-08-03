import React from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import UserPageContent from "@/components/features/user/user-page-content";

export default function UserPage() {
  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader title={"회원 관리"} />
      <DashboardPageLayoutBody>
        <UserPageContent />
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
