import {
  POPUP_USER_TYPE,
  POPUP_TYPE_OPTIONS,
  PopupUserType,
  DEFAULT_POPUP_TYPE_BY_USER_TYPE,
} from "@/constants/popup";

export const isValidUserType = (v: unknown): v is PopupUserType =>
  typeof v === "string" &&
  (v === POPUP_USER_TYPE.MODEL || v === POPUP_USER_TYPE.DESIGNER);

export const isValidPopupTypeForUserType = (
  userType: PopupUserType,
  t: unknown,
): t is string =>
  typeof t === "string" && POPUP_TYPE_OPTIONS[userType].some((o) => o.value === t);

export const getDefaultPopupTypeForUserType = (userType: PopupUserType) =>
  DEFAULT_POPUP_TYPE_BY_USER_TYPE[userType];
