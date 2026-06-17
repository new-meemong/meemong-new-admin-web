import dayjs from "dayjs";
import {
  ISalonPickProduct,
  ISalonPickProductCount,
} from "@/models/salonPickProducts";
import {
  SALON_PICK_PRODUCT_HAIR_CONCERNS,
  SALON_PICK_PRODUCT_LINK_URL_PREFIX,
  SALON_PICK_PRODUCT_SEX,
  SALON_PICK_PRODUCT_TREATMENT_TYPES,
  SalonPickProductHairConcern,
  SalonPickProductSex,
  SalonPickProductTreatmentType,
} from "@/constants/salonPickProducts";

export const SALON_PICK_PRODUCT_LINK_URL_EMPTY_ERROR_MESSAGE =
  "링크를 입력해주세요.";
export const SALON_PICK_PRODUCT_LINK_URL_PRODUCT_NUMBER_ERROR_MESSAGE =
  "상품 번호를 입력해주세요.";
export const SALON_PICK_PRODUCT_LINK_URL_INVALID_ERROR_MESSAGE =
  "올바른 상품 URL을 입력해주세요.";

export function normalizeSalonPickProductPrice(price?: string | null): string {
  return String(price ?? "").replace(/[^\d]/g, "");
}

function getValidSalonPickProductOptions<T extends string>(
  values: readonly string[] | null | undefined,
  options: readonly T[],
): T[] {
  const validOptions = values?.filter((value): value is T =>
    options.includes(value as T),
  );

  return validOptions?.length ? validOptions : [...options];
}

export function getSalonPickProductHairConcernsOrDefault(
  hairConcerns?: readonly string[] | null,
): SalonPickProductHairConcern[] {
  return getValidSalonPickProductOptions(
    hairConcerns,
    SALON_PICK_PRODUCT_HAIR_CONCERNS,
  );
}

export function getSalonPickProductTreatmentTypesOrDefault(
  treatmentTypes?: readonly string[] | null,
): SalonPickProductTreatmentType[] {
  return getValidSalonPickProductOptions(
    treatmentTypes,
    SALON_PICK_PRODUCT_TREATMENT_TYPES,
  );
}

export function getSalonPickProductSexOrDefault(
  sex?: unknown,
): SalonPickProductSex {
  if (sex === SALON_PICK_PRODUCT_SEX.MALE || sex === "남성") {
    return SALON_PICK_PRODUCT_SEX.MALE;
  }

  if (sex === SALON_PICK_PRODUCT_SEX.FEMALE || sex === "여성") {
    return SALON_PICK_PRODUCT_SEX.FEMALE;
  }

  return SALON_PICK_PRODUCT_SEX.ALL;
}

export function isSalonPickProductLinkUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const productLinkUrl = value.trim();
  if (!productLinkUrl) return false;

  try {
    const url = new URL(productLinkUrl);
    const expectedUrl = new URL(SALON_PICK_PRODUCT_LINK_URL_PREFIX);
    const productNumber = url.searchParams.get("product_no")?.trim();

    return (
      url.origin === expectedUrl.origin &&
      url.pathname === expectedUrl.pathname &&
      Boolean(productNumber && /^\d+$/.test(productNumber))
    );
  } catch {
    return false;
  }
}

export function getSalonPickProductLinkUrlOrDefault(
  value?: string | null,
): string {
  return value?.trim() ? value : SALON_PICK_PRODUCT_LINK_URL_PREFIX;
}

export function getSalonPickProductLinkUrlErrorMessage(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return SALON_PICK_PRODUCT_LINK_URL_EMPTY_ERROR_MESSAGE;
  }

  if (isSalonPickProductLinkUrl(value)) return undefined;

  try {
    const url = new URL(value.trim());
    const expectedUrl = new URL(SALON_PICK_PRODUCT_LINK_URL_PREFIX);
    const productNumber = url.searchParams.get("product_no")?.trim();

    if (
      url.origin === expectedUrl.origin &&
      url.pathname === expectedUrl.pathname &&
      !/^\d+$/.test(productNumber ?? "")
    ) {
      return SALON_PICK_PRODUCT_LINK_URL_PRODUCT_NUMBER_ERROR_MESSAGE;
    }
  } catch {
    return SALON_PICK_PRODUCT_LINK_URL_INVALID_ERROR_MESSAGE;
  }

  return SALON_PICK_PRODUCT_LINK_URL_INVALID_ERROR_MESSAGE;
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
        : isRecord(counts) && ("date" in counts || "dailyClickCount" in counts)
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

  return normalizeSalonPickProductCounts(
    product?.salonPickProductCounts,
  ).reduce((total, count) => total + count.dailyClickCount, 0);
}

export function getSalonPickProductPreviousDayClickCount(
  product?: Pick<ISalonPickProduct, "yesterdaySalonPickProductCount"> & {
    salonPickProductCounts?: unknown;
  },
): number {
  if (product?.yesterdaySalonPickProductCount === null) return 0;
  if (
    typeof product?.yesterdaySalonPickProductCount?.dailyClickCount === "number"
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
