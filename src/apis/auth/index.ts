import { fetcher } from "@/apis/core";
import { IAuthUser, ILoginResponse } from "@/models/auth";

const BASE_URL = "/api/v1/auth/admins";

export type GetAdminMeResponse = {
  data: IAuthUser;
};

export type PostAdminLoginRequest = {
  name: string;
  password: string;
};

export type PostAdminLoginResponse = {
  data: ILoginResponse;
};

export const authAPI = {
  me: async () => {
    const response = await fetcher<GetAdminMeResponse>(`${BASE_URL}/me`, {
      method: "GET",
    });

    return response.data;
  },
  login: async (request: PostAdminLoginRequest) => {
    const response = await fetcher<PostAdminLoginResponse>(
      `${BASE_URL}/login`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
    return response.data;
  },
};
