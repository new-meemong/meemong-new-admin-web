import React from "react";
import {
  AdminPageLayout,
  AdminPageLayoutBody,
  AdminPageLayoutHeader,
} from "@/components/layouts/admin-page-layout";
import BannerPageContent from "@/components/features/banner/banner-page-content";

export default function BannerPage() {
  return (
    <AdminPageLayout>
      <AdminPageLayoutHeader title={"배너 관리"} />
      <AdminPageLayoutBody>
        <BannerPageContent />
      </AdminPageLayoutBody>
    </AdminPageLayout>
  );
}
