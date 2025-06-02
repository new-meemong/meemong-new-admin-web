import { PaginatedResponse } from "@/apis/types";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import { IContents } from "@/models/contents";

//const BASE_URL = "/api/admin/contents";

// TODO: 실제 api 값으로 변경

// 실제 API 대체용 더미 fetcher
function mockFetch<T>(data: T, params?: unknown, delay = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

// 더미 목록 데이터
export const dummyContents: PaginatedResponse<IContents> = {
  content: [
    {
      id: 1,
      nickname: "모델김",
      userType: "1",
      title: "번개 알바 구합니다",
      createdAt: "2024-05-01T10:00:00",
      isDeleted: false,
      isApproved: true,
    },
    {
      id: 2,
      nickname: "디자이너최",
      userType: "2",
      title: "디자인 프리미엄 번개 모집",
      createdAt: "2024-05-02T14:00:00",
      isDeleted: false,
      isApproved: false,
    },
    {
      id: 3,
      nickname: "홍디자",
      userType: "1",
      title: "강남 스튜디오 디자이너 모집",
      company: "디자인하우스",
      createdAt: "2024-04-29T11:20:00",
      isDeleted: false,
      isApproved: true,
    },
    {
      id: 4,
      nickname: "모집짱",
      userType: "2",
      title: "대형 촬영 모집 공고",
      recruitment: "1",
      costType: "2",
      createdAt: "2024-04-28T09:00:00",
      isDeleted: false,
      isApproved: true,
    },
  ],
  totalCount: 50,
  page: 1,
  size: 10,
};

export type GetContentsRequest = {
  categoryId: number;
  userType?: string;
  company?: string;
  jobCategory?: string;
  recruitment?: string;
  costType?: string;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetContentsResponse = PaginatedResponse<IContents>;

export const contentsAPI = {
  getAll: ({
    categoryId,
    userType,
    company,
    jobCategory,
    recruitment,
    costType,
    searchKeyword,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  }: GetContentsRequest): Promise<PaginatedResponse<IContents>> =>
    mockFetch(dummyContents, {
      categoryId,
      userType,
      company,
      jobCategory,
      recruitment,
      costType,
      searchKeyword,
      page,
      size,
    }),
};
