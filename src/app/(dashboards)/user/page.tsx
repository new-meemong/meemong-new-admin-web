import React, { Suspense } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import UserPageContent from "@/components/features/user/user-page-content";
import { UsersProvider } from "@/components/contexts/users-context";

export default function UserPage() {
  return (
    <Suspense>
      <UsersProvider>
        <DashboardPageLayout>
          <DashboardPageLayoutHeader title={"회원 관리"} />
          <DashboardPageLayoutBody>
            <UserPageContent />
          </DashboardPageLayoutBody>
        </DashboardPageLayout>
      </UsersProvider>
    </Suspense>
  );
}
