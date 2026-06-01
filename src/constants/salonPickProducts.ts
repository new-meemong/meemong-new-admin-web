export const SALON_PICK_PRODUCT_CURSOR_ORDER = {
  ID_DESC: "idDesc",
} as const;

export type SalonPickProductCursorOrder =
  (typeof SALON_PICK_PRODUCT_CURSOR_ORDER)[keyof typeof SALON_PICK_PRODUCT_CURSOR_ORDER];

export const SALON_PICK_PRODUCT_PAGE_SIZE = 50;

export const SALON_PICK_PRODUCT_MAX_FETCH_PAGE_COUNT = 100;

export const MIN_ACTIVE_SALON_PICK_PRODUCT_COUNT = 2;

export const SALON_PICK_PRODUCT_LINK_URL_PREFIX =
  "https://beauty8891.cafe24.com/product/detail.html?product_no=";
