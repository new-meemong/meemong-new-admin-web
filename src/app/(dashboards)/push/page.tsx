import React, { Suspense } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import { UsersProvider } from "@/components/contexts/users-context";
import PushPageContent from "@/components/features/push/push-page-content";

export default function PushPage() {
  return (
    <Suspense>
      <UsersProvider>
        <DashboardPageLayout>
          <DashboardPageLayoutHeader title={"푸시알림"} />
          <DashboardPageLayoutBody>
            <PushPageContent />
          </DashboardPageLayoutBody>
        </DashboardPageLayout>
      </UsersProvider>
    </Suspense>
  );
}
