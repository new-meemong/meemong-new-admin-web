import dayjs from "dayjs";
import {
  ISalonPickProduct,
  ISalonPickProductCount,
} from "@/models/salonPickProducts";

export function normalizeSalonPickProductPrice(price?: string | null): string {
  return String(price ?? "").replace(/[^\d]/g, "");
}

export function formatSalonPickProductPrice(price?: string | null): string {
  const normalized = normalizeSalonPickProductPrice(price);
  if (!normalized) return "-";

  return Number(normalized).toLocaleString("ko-KR");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeSalonPickProductCounts(
  counts: unknown,
): ISalonPickProductCount[] {
  const source = Array.isArray(counts)
    ? counts
    : isRecord(counts) && Array.isArray(counts.dataList)
      ? counts.dataList
      : isRecord(counts) && Array.isArray(counts.content)
        ? counts.content
        : isRecord(counts) &&
            ("date" in counts || "dailyClickCount" in counts)
          ? [counts]
          : [];

  return source
    .filter(isRecord)
    .map((count) => ({
      id: Number(count.id ?? 0),
      date: String(count.date ?? ""),
      dailyClickCount: Number(count.dailyClickCount ?? 0),
      createdAt: String(count.createdAt ?? ""),
      updatedAt: String(count.updatedAt ?? ""),
      salonPickProductId: Number(count.salonPickProductId ?? 0),
    }))
    .filter((count) => count.date);
}

export function getSalonPickProductTotalClickCount(
  product?: Pick<ISalonPickProduct, "clickCount"> & {
    salonPickProductCounts?: unknown;
  },
): number {
  if (typeof product?.clickCount === "number") return product.clickCount;

  return normalizeSalonPickProductCounts(product?.salonPickProductCounts).reduce(
    (total, count) => total + count.dailyClickCount,
    0,
  );
}

export function getSalonPickProductPreviousDayClickCount(
  product?: Pick<ISalonPickProduct, "yesterdaySalonPickProductCount"> & {
    salonPickProductCounts?: unknown;
  },
): number {
  if (product?.yesterdaySalonPickProductCount === null) return 0;
  if (
    typeof product?.yesterdaySalonPickProductCount?.dailyClickCount ===
    "number"
  ) {
    return product.yesterdaySalonPickProductCount.dailyClickCount;
  }

  const previousDay = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  return (
    normalizeSalonPickProductCounts(product?.salonPickProductCounts).find(
      (count) => dayjs(count.date).format("YYYY-MM-DD") === previousDay,
    )?.dailyClickCount ?? 0
  );
}

export function sortSalonPickProductCountsByDateDesc(
  counts: unknown,
): ISalonPickProductCount[] {
  return normalizeSalonPickProductCounts(counts).sort((a, b) =>
    dayjs(b.date).diff(dayjs(a.date)),
  );
}
