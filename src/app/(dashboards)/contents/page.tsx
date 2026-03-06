import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader
} from "@/components/layouts/dashboard-page-layout";
import React, { Suspense } from "react";

import ContentsPageContent from "@/components/features/contents/contents-page-content";
import { ContentsProvider } from "@/components/contexts/contents-context";
import ContentsTab from "@/components/features/contents/contents-tab";

export default function ContentsPage() {
  return (
    <Suspense>
      <ContentsProvider>
        <DashboardPageLayout>
          <DashboardPageLayoutHeader title={"콘텐츠 관리"}>
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
