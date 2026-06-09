import {
  SALON_PICK_MAIN_BUTTON_CURSOR_ORDER,
  SalonPickMainButtonCursorOrder,
} from "@/constants/salonPickMainButtons";
import { fetcher } from "@/apis/core";
import { ISalonPickMainButton } from "@/models/salonPickMainButtons";
import { normalizeSalonPickMainButtonDailyClickCounts } from "@/utils/salonPickMainButtons";

const BASE_URL = "/api/v1/admins/salon-pick-main-buttons";

export type GetSalonPickMainButtonsRequest = {
  __cursorOrder?: SalonPickMainButtonCursorOrder;
  __nextCursor?: string;
  __limit?: number;
};

type ServerSalonPickMainButton = Omit<
  ISalonPickMainButton,
  "dailyClickCounts" | "yesterdayDailyClickCount"
> & {
  salonPickProductCounts?: unknown;
  yesterdaySalonPickProductCount?: unknown;
  dailyClickCounts?: unknown;
  yesterdayDailyClickCount?: unknown;
};

type ServerSalonPickMainButtonsResponse = {
  dataCount?: number;
  dataList?: ServerSalonPickMainButton[];
  __nextCursor?: string;
};

type ServerSalonPickMainButtonDetailResponse = {
  data: ServerSalonPickMainButton;
};

export type GetSalonPickMainButtonsResponse = {
  content: ISalonPickMainButton[];
  totalCount: number;
  nextCursor?: string;
};

export type GetSalonPickMainButtonDetailResponse = ISalonPickMainButton;

function normalizeSalonPickMainButton(
  mainButton: ServerSalonPickMainButton,
): ISalonPickMainButton {
  const dailyClickCounts = normalizeSalonPickMainButtonDailyClickCounts(
    mainButton.dailyClickCounts ?? mainButton.salonPickProductCounts,
  );
  const yesterdayDailyClickCountSource =
    mainButton.yesterdayDailyClickCount ??
    mainButton.yesterdaySalonPickProductCount;
  const yesterdayDailyClickCount =
    yesterdayDailyClickCountSource === undefined
      ? undefined
      : yesterdayDailyClickCountSource === null
        ? null
        : (normalizeSalonPickMainButtonDailyClickCounts(
            yesterdayDailyClickCountSource,
          )[0] ?? null);

  return {
    id: Number(mainButton.id ?? 0),
    code: String(mainButton.code ?? ""),
    clickCount: Number(mainButton.clickCount ?? 0),
    createdAt: String(mainButton.createdAt ?? ""),
    updatedAt: String(mainButton.updatedAt ?? ""),
    dailyClickCounts,
    ...(yesterdayDailyClickCount !== undefined && {
      yesterdayDailyClickCount,
    }),
  };
}

function normalizeSalonPickMainButtonsResponse(
  response:
    | ServerSalonPickMainButtonsResponse
    | { data: ServerSalonPickMainButtonsResponse },
): GetSalonPickMainButtonsResponse {
  const payload = "data" in response ? response.data : response;
  const content = (payload.dataList ?? []).map(normalizeSalonPickMainButton);

  return {
    content,
    totalCount: payload.dataCount ?? content.length,
    nextCursor: payload.__nextCursor,
  };
}

export const salonPickMainButtonsAPI = {
  getAll: async ({
    __cursorOrder = SALON_PICK_MAIN_BUTTON_CURSOR_ORDER.ID_DESC,
    __nextCursor,
    __limit,
  }: GetSalonPickMainButtonsRequest = {}) => {
    const response = await fetcher<
      | ServerSalonPickMainButtonsResponse
      | { data: ServerSalonPickMainButtonsResponse }
    >(BASE_URL, {
      query: {
        __cursorOrder,
        ...(__nextCursor && { __nextCursor }),
        ...(__limit && { __limit }),
      },
    });

    return normalizeSalonPickMainButtonsResponse(response);
  },

  getById: async (salonPickMainButtonId: number) => {
    const response = await fetcher<ServerSalonPickMainButtonDetailResponse>(
      `${BASE_URL}/${salonPickMainButtonId}`,
    );

    return normalizeSalonPickMainButton(response.data);
  },
};
