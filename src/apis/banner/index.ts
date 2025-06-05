import { PaginatedResponse } from "@/apis/types";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import { IBanner } from "@/models/banner";

//const BASE_URL = "/api/admin/banners";

// TODO: 실제 api 값으로 변경

// 실제 API 대체용 더미 fetcher
function mockFetch<T>(data: T, params?: unknown, delay = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

// 더미 목록 데이터
export const dummyContents: PaginatedResponse<IBanner> = {
  content: [
    {
      id: 1,
      companyName: "모델김",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      location: "0",
      createdAt: "2024-05-01T10:00:00",
      endAt: "2024-05-08T10:00:00",
      clickCount: 0,
    },
    {
      id: 2,
      companyName: "디자이너최",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      location: "1",
      createdAt: "2024-05-02T14:00:00",
      endAt: "2024-05-09T14:00:00",
      clickCount: 0,
    },
    {
      id: 3,
      companyName: "디자인하우스",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      location: "0",
      createdAt: "2024-04-29T11:20:00",
      endAt: "2024-05-06T11:20:00",
      clickCount: 0,
    },
    {
      id: 4,
      companyName: "모집짱",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      location: "1",
      createdAt: "2024-04-28T09:00:00",
      endAt: "2024-05-05T09:00:00",
      clickCount: 0,
    },
  ],
  totalCount: 50,
  page: 1,
  size: 10,
};

export type GetBannersRequest = {
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetBannersResponse = PaginatedResponse<IBanner>;

export const bannerAPI = {
  getAll: ({
    searchKeyword,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  }: GetBannersRequest): Promise<GetBannersResponse> =>
    mockFetch(dummyContents, {
      searchKeyword,
      page,
      size,
    }),
};
