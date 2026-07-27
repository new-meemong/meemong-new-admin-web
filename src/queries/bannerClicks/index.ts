import { useQuery } from "@tanstack/react-query";
import {
  getBannerClickCount,
  getBannerClicks,
} from "@/apis/firestore/bannerClicks";
import type { BannerClickDateRange } from "@/models/bannerClick";

export function useBannerClicksQuery(
  range: BannerClickDateRange,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [
      "GET_BANNER_CLICKS",
      range.from?.toISOString() ?? "all",
      range.to.toISOString(),
    ],
    queryFn: () => getBannerClicks(range),
    enabled: options.enabled ?? true,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useBannerClickCountQuery(
  range: BannerClickDateRange,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [
      "GET_BANNER_CLICK_COUNT",
      range.from?.toISOString() ?? "all",
      range.to.toISOString(),
    ],
    queryFn: () => getBannerClickCount(range),
    enabled: options.enabled ?? true,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
