import React, { Suspense } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import PopupPageContent from "@/components/features/popup/popup-page-content";
import { PopupProvider } from "@/components/contexts/popup-context";
import PopupTab from "@/components/features/popup/popup-tab";

export default function PopupPage() {
  return (
    <Suspense>
      <PopupProvider>
        <DashboardPageLayout>
          <DashboardPageLayoutHeader title={"팝업 관리"} className="mb-[12px]">
            <PopupTab />
          </DashboardPageLayoutHeader>
          <DashboardPageLayoutBody>
            <PopupPageContent />
          </DashboardPageLayoutBody>
        </DashboardPageLayout>
      </PopupProvider>
    </Suspense>
  );
}
