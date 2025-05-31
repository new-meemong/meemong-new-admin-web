// lib/api/user.ts
import { BlockType, IUser, IUserForm, UserType } from "@/models/user";
import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/search-table/common-pagination/contants";

const BASE_URL = "/api/admin/users";

// TODO: 실제 api 값으로 변경

// 실제 API 대체용 더미 fetcher
function mockFetch<T>(data: T, delay = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

// 더미 목록 데이터
const dummyUsers: PaginatedResponse<IUser> = {
  content: [
    {
      id: 1,
      userType: "1",
      nickname: "모델유저",
      createdAt: "2024-01-10T12:34:56",
      recentLoggedIndAt: "2025-05-29T10:00:00",
      isWithdraw: true,
      isBlocked: false,
    },
    {
      id: 2,
      userType: "2",
      nickname: "디자이너홍",
      createdAt: "2023-11-22T08:10:30",
      recentLoggedIndAt: "2025-05-25T15:44:12",
      isWithdraw: false,
      isBlocked: true,
    },
  ],
  totalCount: 50, // 총 50명이라고 가정
  page: 1, // 현재 페이지
  size: 10, // 페이지당 10개
};

// 더미 상세 데이터
const dummyUserDetail: IUserForm = {
  id: 1,
  userType: "1",
  nickname: "모델유저",
  createdAt: "2024-01-10T12:34:56",
  recentLoggedIndAt: "2025-05-29T10:00:00",
  isWithdraw: false,
  isBlocked: false,
  userNumber: "M123456",
  name: "홍길동",
  joinType: "0",
  profileUrl: "https://example.com/profile.jpg",
  phoneNumber: "010-1234-5678",
  email: "model@example.com",
  intro: "안녕하세요, 모델입니다.",
  pictureUrlList: [
    "https://example.com/pic1.jpg",
    "https://example.com/pic2.jpg",
  ],
  blockInfo: "",
};

export interface GetUsersRequest {
  userType?: UserType;
  blockType?: BlockType;
  searchKeyword?: string;
  page?: number;
  size?: number;
}
export interface GetUsersResponse extends PaginatedResponse<IUser> {}

export const userAPI = {
  /*  getAll: () => fetcher<IUser[]>(BASE_URL),

  getById: (id: number) => fetcher<IUserForm>(`${BASE_URL}/${id}`),*/
  getAll: ({
    userType,
    blockType,
    searchKeyword,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  }: GetUsersRequest): Promise<GetUsersResponse> => mockFetch(dummyUsers),
  getById: ({ userId }: { userId: number }): Promise<IUserForm> => {
    if (userId === 1) return mockFetch(dummyUserDetail);
    return Promise.reject(new Error("사용자 없음"));
  },
  create: (user: Omit<IUserForm, "id">) =>
    fetcher<IUser>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(user),
    }),

  update: (id: number, user: Partial<IUserForm>) =>
    fetcher<IUser>(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  delete: (id: number) =>
    fetcher<void>(`${BASE_URL}/${id}`, {
      method: "DELETE",
    }),
};
