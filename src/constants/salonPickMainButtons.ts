export const SALON_PICK_MAIN_BUTTON_CURSOR_ORDER = {
  ID_DESC: "idDesc",
} as const;

export type SalonPickMainButtonCursorOrder =
  (typeof SALON_PICK_MAIN_BUTTON_CURSOR_ORDER)[keyof typeof SALON_PICK_MAIN_BUTTON_CURSOR_ORDER];

export const SALON_PICK_MAIN_BUTTON_PAGE_SIZE = 20;
