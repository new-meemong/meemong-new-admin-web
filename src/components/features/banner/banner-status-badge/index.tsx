import type { BannerStatus } from "@/utils/banner";
import { cn } from "@/lib/utils";

const BANNER_STATUS_STYLES: Record<BannerStatus, string> = {
  활성화: "bg-green-500 text-white",
  비활성화: "bg-gray-500 text-white",
  종료됨: "bg-gray-300 text-white",
};

interface BannerStatusBadgeProps {
  status: BannerStatus;
}

export default function BannerStatusBadge({ status }: BannerStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium",
        BANNER_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
