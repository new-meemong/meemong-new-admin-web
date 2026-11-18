import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import DetectionPageContent from "@/components/features/sns-inducement-detections/page-content";

export default function SnsInducementDetectionsPage() {
  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader title="외부 서비스 안내 탐지" />
      <DashboardPageLayoutBody>
        <DetectionPageContent />
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
