import React, { Suspense } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import ContentsPageContent from "@/components/features/contents/contents-page-content";
import ContentsTab from "@/components/features/contents/contents-tab";
import { ContentsProvider } from "@/components/contexts/contents-context";

export default function ContentsPage() {
  return (
    <Suspense>
      <ContentsProvider>
        <DashboardPageLayout>
          <DashboardPageLayoutHeader title={"컨텐츠 관리"}>
            <ContentsTab />
          </DashboardPageLayoutHeader>
          <DashboardPageLayoutBody>
            <ContentsPageContent />
          </DashboardPageLayoutBody>
        </DashboardPageLayout>
      </ContentsProvider>
    </Suspense>
  );
}
