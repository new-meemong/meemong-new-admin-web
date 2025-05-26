import React from "react";
import {
  AdminPageLayout,
  AdminPageLayoutBody,
  AdminPageLayoutHeader,
} from "@/components/layouts/admin-page-layout";
import UserPageContent from "@/components/features/user/user-page-content";

export default function UserPage() {
  return (
    <AdminPageLayout>
      <AdminPageLayoutHeader title={"회원 관리"} />
      <AdminPageLayoutBody>
        <UserPageContent />
      </AdminPageLayoutBody>
    </AdminPageLayout>
  );
}
