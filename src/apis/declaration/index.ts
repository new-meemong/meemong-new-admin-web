import { PaginatedResponse } from "@/apis/types";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IDeclaration, IDeclarationForm } from "@/models/declaration";
import { DeclarationStatusType } from "@/constants/declaration";
import { SearchType } from "@/models/common";

//const BASE_URL = "/api/admin/declarations";

// TODO: 실제 api 값으로 변경

// 실제 API 대체용 더미 fetcher
function mockFetch<T>(data: T, params?: unknown, delay = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

// 더미 목록 데이터
export const dummyBanners: PaginatedResponse<IDeclaration> = {
  content: [
    {
      id: 1,
      reporter: "홍길동",
      respondent: "김철수",
      content: "욕설 및 부적절한 언행",
      status: "0",
      declarationAt: "2025-06-14T10:23:00Z",
      reactAt: "",
    },
    {
      id: 2,
      reporter: "이영희",
      respondent: "박지민",
      content: "스팸 메시지 전송",
      status: "1",
      declarationAt: "2025-06-10T09:10:00Z",
      reactAt: "2025-06-11T15:45:00Z",
    },
  ],
  totalCount: 50,
  page: 1,
  size: 10,
};

const dummyBannerForm: IDeclarationForm = {
  id: 1,
  reporter: "hong123", // 신고자 닉네임
  respondent: "kim456", // 피신고자 닉네임
  content: "욕설 및 협박성 메시지를 반복적으로 보냄",
  status: "0",
  declarationAt: "2025-06-14T10:23:00Z",
  reactAt: "",

  reporterName: "홍길동",
  reporterUid: "UID123456",
  respondentName: "김철수",
  respondentUid: "UID654321",
  declarationImageUrlList: [
    "https://images.unsplash.com/photo-1517841905240-472988babdf9",
  ],
  location: "서울 강남구 역삼동",
  memo: "여러 차례 경고했으나 개선되지 않음. 확인 바랍니다.",
};

export type GetDeclarationsRequest = {
  status?: DeclarationStatusType;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetDeclarationsResponse = PaginatedResponse<IDeclaration>;

export const declarationAPI = {
  getAll: ({
    status,
    searchType,
    searchKeyword,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetDeclarationsRequest): Promise<GetDeclarationsResponse> =>
    mockFetch(dummyBanners, {
      status,
      searchType,
      searchKeyword,
      page,
      size,
    }),
  getById: ({
    declarationId,
  }: {
    declarationId: number;
  }): Promise<IDeclarationForm> => {
    return mockFetch(dummyBannerForm, { declarationId });
  },
};
