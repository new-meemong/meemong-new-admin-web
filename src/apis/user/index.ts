import { BlockType, IUser, IUserForm, UserRoleType } from "@/models/user";
import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";

const BASE_URL = "/api/v1/admins/users";

// TODO: 실제 api 값으로 변경

// 실제 API 대체용 더미 fetcher
function mockFetch<T>(data: T, params?: unknown, delay = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

// 더미 목록 데이터
/*
const dummyUsers: PaginatedResponse<IUser> = {
  content: [
    {
      id: 1,
      role: 1,
      nickname: "모델유저",
      createdAt: "2024-01-10T12:34:56",
      recentLoginTime: "2025-05-29T10:00:00",
      isWithdraw: true,
      isBlocked: false,
    },
    {
      id: 2,
      role: 2,
      nickname: "디자이너홍",
      createdAt: "2023-11-22T08:10:30",
      recentLoginTime: "2025-05-25T15:44:12",
      isWithdraw: false,
      isBlocked: true,
    },
  ],
  totalCount: 50, // 총 50명이라고 가정
  page: 1, // 현재 페이지
  size: 10, // 페이지당 10개
};
*/

// 더미 상세 데이터
const dummyUserDetail: IUserForm = {
  id: 1,
  role: 1,
  nickname: "모델유저",
  createdAt: "2024-01-10T12:34:56",
  recentLoginTime: "2025-05-29T10:00:00",
  isWithdraw: false,
  isBlocked: false,
  userNumber: "M123456",
  name: "홍길동",
  joinType: "0",
  profileUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
  phoneNumber: "010-1234-5678",
  email: "model@example.com",
  intro: "안녕하세요, 모델입니다.",
  pictureUrlList: [
    {
      src: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
      title: "profile 1",
    },
    {
      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      title: "profile 2",
    },
  ],
};

export type GetUsersRequest = {
  role?: UserRoleType;
  blockType?: BlockType;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetUsersResponse = PaginatedResponse<IUser>;

export const userAPI = {
  /*  getAll: () => fetcher<IUser[]>(BASE_URL),*/
  getAll: ({
    role,
    blockType,
    searchKeyword,
    searchType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetUsersRequest) =>
    fetcher<GetUsersResponse>(BASE_URL, {
      query: {
        ...(role && { role }),
        ...(blockType && { blockType }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size,
      },
    }),
  /*getAll: ({
    role,
    blockType,
    searchKeyword,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  }: GetUsersRequest): Promise<GetUsersResponse> =>
    mockFetch(dummyUsers, {
      role,
      blockType,
      searchKeyword,
      page,
      size,
    }),*/
  getById: ({ userId }: { userId: number }): Promise<IUserForm> => {
    return mockFetch(dummyUserDetail, { userId });
  },
  /*
  getById: (id: number) => fetcher<IUserForm>(`${BASE_URL}/${id}`),
*/
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
