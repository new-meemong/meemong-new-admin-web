"use client";

import React, { useState } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import MongMoneyDepositManagementPageContent from "@/components/features/mong-moneys/mong-money-deposit-management-page-content";
import BusinessMongManagement from "@/components/features/mong-moneys/business-mong-management";
import DashboardHeaderTabGroup from "@/components/shared/dashboard-header-tab-group";

type MongDepositTab = "manual" | "business";

export default function MongMoneyDepositsPage() {
  const [activeTab, setActiveTab] = useState<MongDepositTab>("manual");
  const [hasOpenedBusinessTab, setHasOpenedBusinessTab] = useState(false);

  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader title="몽지급 관리" className="mb-[20px]">
        <DashboardHeaderTabGroup<MongDepositTab>
          options={[
            { value: "manual", label: "기존 몽 내역" },
            { value: "business", label: "원장님 몽 내역" },
          ]}
          value={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            if (tab === "business") setHasOpenedBusinessTab(true);
          }}
        />
      </DashboardPageLayoutHeader>
      <DashboardPageLayoutBody>
        <div hidden={activeTab !== "manual"}>
          <MongMoneyDepositManagementPageContent />
        </div>
        {hasOpenedBusinessTab && (
          <div hidden={activeTab !== "business"}>
            <BusinessMongManagement />
          </div>
        )}
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
