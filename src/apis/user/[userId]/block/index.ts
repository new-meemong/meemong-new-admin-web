import { IUserBlockDetail } from "@/models/user";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/admin/users";

// TODO: 실제 api 값으로 변경

// 실제 API 대체용 더미 fetcher
function mockFetch<T>(data: T, params?: unknown, delay = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

// 더미 차단 데이터
const dummyBlockDetail: IUserBlockDetail = {
  isBlocked: false,
  blockInfoList: [
    {
      isBlocked: true,
      blockedAt: "2025-05-29T10:00:00",
      description: "차단했습니다.",
    },
    {
      isBlocked: false,
      blockedAt: "2025-05-29T10:00:00",
      description: "차단 해제했습니다.",
    },
  ],
};

export const userBlockAPI = {
  /*

    getById: (id: number) => fetcher<IUserForm>(`${BASE_URL}/${id}`),*/
  getById: (userId: number): Promise<IUserBlockDetail> => {
    return mockFetch(dummyBlockDetail, { userId });
  },
  update: (id: number, blockDetail: Partial<IUserBlockDetail>) =>
    fetcher<IUserBlockDetail>(`${BASE_URL}/${id}/block`, {
      method: "PUT",
      body: JSON.stringify(blockDetail),
    }),
};
