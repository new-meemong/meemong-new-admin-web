import {
  BANNER_USER_TYPE,
  BANNER_TYPE_OPTIONS,
  BannerUserType,
  DEFAULT_BANNER_TYPE_BY_USER_TYPE,
} from "@/constants/banner";

export const isValidUserType = (v: unknown): v is BannerUserType =>
  typeof v === "string" &&
  (v === BANNER_USER_TYPE.MODEL || v === BANNER_USER_TYPE.DESIGNER);

export const isValidBannerTypeForUserType = (
  userType: BannerUserType,
  t: unknown,
): t is string =>
  typeof t === "string" && BANNER_TYPE_OPTIONS[userType].some((o) => o.value === t);

export const getDefaultBannerTypeForUserType = (userType: BannerUserType) =>
  DEFAULT_BANNER_TYPE_BY_USER_TYPE[userType];
