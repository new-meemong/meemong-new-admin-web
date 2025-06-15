import React from "react";
import {
  AdminPageLayout,
  AdminPageLayoutBody,
  AdminPageLayoutHeader,
} from "@/components/layouts/admin-page-layout";
import DeclarationPageContent from "@/components/features/declaration/declaration-page-content";

export default function DeclarationPage() {
  return (
    <AdminPageLayout>
      <AdminPageLayoutHeader title={"신고 관리"} />
      <AdminPageLayoutBody>
        <DeclarationPageContent />
      </AdminPageLayoutBody>
    </AdminPageLayout>
  );
}
