import { PaginatedResponse } from "@/apis/types";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IPopup, IPopupForm } from "@/models/popup";
import { fetcher } from "@/apis/core";
import { PopupType, PopupUserType } from "@/constants/popup";

const BASE_URL = "/api/v1/admins/popup";

export type GetPopupRequest = {
  userType?: PopupUserType;
  popupType?: PopupType;
  page?: number;
  size?: number;
};
export type GetPopupResponse = PaginatedResponse<IPopup>;

export type GetPopupDetailResponse = {
  data: IPopupForm;
};

export type PostPopupRequest = {
  popup: Partial<IPopupForm>;
};

export type PostPopupResponse = {
  success: boolean;
};

export type PutPopupRequest = {
  id: number;
  popup: Partial<IPopupForm>;
};

export type PutPopupResponse = {
  success: boolean;
};

export type PostPopupImageUploadRequest = FormData;

export type PostPopupImageUploadResponse = {
  data: {
    imageFile: {
      fileuri: string;
    };
  };
};

export const popupAPI = {
  getAll: ({
    userType,
    popupType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetPopupRequest) =>
    fetcher<GetPopupResponse>(BASE_URL, {
      query: {
        ...(userType && { userType }),
        ...(popupType && { popupType }),
        page,
        size,
      },
    }),
  getById: async (popupId?: number) => {
    const response = await fetcher<GetPopupDetailResponse>(
      `${BASE_URL}/${popupId}`,
    );
    return response.data;
  },
  post: async (request: PostPopupRequest) => {
    const response = await fetcher<PostPopupResponse>(`${BASE_URL}`, {
      method: "POST",
      body: JSON.stringify(request.popup),
    });

    return response;
  },
  update: async (request: PutPopupRequest) => {
    const response = await fetcher<PutPopupResponse>(
      `${BASE_URL}/${request.id}`,
      {
        method: "PUT",
        body: JSON.stringify(request.popup),
      },
    );

    return response;
  },
  uploadImage: async (request: PostPopupImageUploadRequest) => {
    const response = await fetcher<PostPopupImageUploadResponse>(
      `/api/v1/uploads/popup`,
      {
        method: "POST",
        body: request,
      },
    );

    return response;
  },
};
