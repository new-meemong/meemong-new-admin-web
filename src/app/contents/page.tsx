import React, { Suspense } from "react";
import {
  AdminPageLayout,
  AdminPageLayoutBody,
  AdminPageLayoutHeader,
} from "@/components/layouts/admin-page-layout";
import ContentsPageContent from "@/components/features/contents/contents-page-content";
import ContentsTab from "@/components/features/contents/contents-tab";
import { ContentsProvider } from "@/components/contexts/contents-context";

export default function ContentsPage() {
  return (
    <Suspense>
      <ContentsProvider>
        <AdminPageLayout>
          <AdminPageLayoutHeader title={"컨텐츠 관리"}>
            <ContentsTab />
          </AdminPageLayoutHeader>
          <AdminPageLayoutBody>
            <ContentsPageContent />
          </AdminPageLayoutBody>
        </AdminPageLayout>
      </ContentsProvider>
    </Suspense>
  );
}
