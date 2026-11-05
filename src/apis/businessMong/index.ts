import { fetcher } from "@/apis/core";

const BASE = "/api/v1/admins";
export interface BusinessMongGrantRequest {
  requestKey: string;
  businessName: string;
  businessRegistrationNumber: string;
  mongAmount: number;
  adminDescription: string;
}
export interface BusinessMongGrant extends BusinessMongGrantRequest {
  id: number;
  distributedMongAmount: number;
  remainingMongAmount: number;
  createdAt: string;
}
export interface BusinessMongRecipient {
  displayName: string;
  phone: string;
}
export interface BusinessMongDistributionRequest {
  requestKey: string;
  title: string;
  adminDescription: string;
  owner?: BusinessMongRecipient;
  recipientList: (BusinessMongRecipient & { amount: number })[];
}
export interface BusinessMongDistribution {
  id: number;
  businessMongGrantId: number;
  requestKey: string;
  title: string;
  adminDescription: string;
  totalAmount: number;
  createdAt: string;
  recipientList: {
    id: number;
    recipientUserId: number;
    recipientUserDisplayName: string;
    recipientUserPhone: string;
    amount: number;
    mongMoneyId: number;
  }[];
}
export interface BusinessMongPreset {
  id: number;
  title: string;
  mongBaseAmount: number;
  mongBonusAmount: number;
  mongAmount: number;
  supplyAmountKRW: number;
  paymentAmountKRW: number;
  isHidden: boolean;
}
export interface BusinessMongPage<T> {
  dataList: T[];
  dataCount: number;
  __nextCursor: string | null;
}
export const businessMongAPI = {
  presets: () =>
    fetcher<{ dataList: BusinessMongPreset[] }>(
      `${BASE}/business-mong-presets`,
    ),
  grants: (
    businessRegistrationNumber?: string,
    cursor?: string,
    signal?: AbortSignal,
  ) =>
    fetcher<BusinessMongPage<BusinessMongGrant>>(
      `${BASE}/business-mong-grants`,
      {
        query: {
          businessRegistrationNumber: businessRegistrationNumber || undefined,
          __limit: 20,
          __nextCursor: cursor,
        },
        signal,
      },
    ),
  grant: (id: number) =>
    fetcher<{ data: BusinessMongGrant }>(`${BASE}/business-mong-grants/${id}`),
  createGrant: (request: BusinessMongGrantRequest) =>
    fetcher<{ data: BusinessMongGrant }>(`${BASE}/business-mong-grants`, {
      method: "POST",
      json: request,
    }),
  distributions: (id: number, cursor?: string, signal?: AbortSignal) =>
    fetcher<BusinessMongPage<BusinessMongDistribution>>(
      `${BASE}/business-mong-grants/${id}/distributions`,
      {
        query: { __limit: 20, __nextCursor: cursor },
        signal,
      },
    ),
  distribute: (id: number, request: BusinessMongDistributionRequest) =>
    fetcher<{ data: BusinessMongDistribution }>(
      `${BASE}/business-mong-grants/${id}/distributions`,
      { method: "POST", json: request },
    ),
};
