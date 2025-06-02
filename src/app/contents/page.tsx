import React from "react";
import {
  AdminPageLayout,
  AdminPageLayoutBody,
  AdminPageLayoutHeader,
} from "@/components/layouts/admin-page-layout";
import ContentsPageContent from "@/components/features/contents/contents-page-content";

export default function Contentspage() {
  return (
    <AdminPageLayout>
      <AdminPageLayoutHeader title={"컨텐츠 관리"} />
      <AdminPageLayoutBody>
        <ContentsPageContent />
      </AdminPageLayoutBody>
    </AdminPageLayout>
  );
}
