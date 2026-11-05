import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import BusinessMongManagement from "./index";
import BusinessMongGrantDetail from "./grant-detail";
import { businessMongQueries } from "@/queries/businessMong";

const grant = {
  id: 5,
  requestKey: "test-grant",
  businessName: "테스트 사업자",
  businessRegistrationNumber: "1234567890",
  mongAmount: 4500,
  distributedMongAmount: 0,
  remainingMongAmount: 4500,
  adminDescription: "입금 확인",
  createdAt: "2026-11-04T00:00:00Z",
};
describe("business mong management UI wiring", () => {
  it("renders the grant list and registration form through business queries", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { gcTime: 0 } },
    });
    client.setQueryData(businessMongQueries.grants().queryKey, {
      pages: [{ dataList: [grant], dataCount: 1, __nextCursor: null }],
      pageParams: [undefined],
    });
    client.setQueryData(businessMongQueries.presets().queryKey, {
      dataList: [],
    });
    try {
      const html = renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <BusinessMongManagement />
        </QueryClientProvider>,
      );
      expect(html).toContain("원장님 몽 지급관리");
      expect(html).toContain("테스트 사업자");
      expect(html).toContain("4,500");
      expect(html).toContain("상세 / 분배");
      expect(html).toContain("지급 등록 확인");
    } finally {
      client.clear();
    }
  });
  it("shows one-time owner distribution for an unused grant and disables a used grant", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { gcTime: 0 } },
    });
    client.setQueryData(businessMongQueries.distributions(5).queryKey, {
      pages: [{ dataList: [], __nextCursor: null }],
      pageParams: [undefined],
    });
    const render = () =>
      renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <BusinessMongGrantDetail id={5} />
        </QueryClientProvider>,
      );
    try {
      client.setQueryData(businessMongQueries.grant(5).queryKey, {
        data: grant,
      });
      const unused = render();
      expect(unused).toContain("원장님 닉네임 (잔여 몽 수령)");
      expect(unused).toContain("분배 내용 확인");
      client.setQueryData(businessMongQueries.grant(5).queryKey, {
        data: {
          ...grant,
          distributedMongAmount: 1000,
          remainingMongAmount: 3500,
        },
      });
      const used = render();
      expect(used).toContain("추가 분배할 수 없습니다");
      expect(used).not.toContain("분배 내용 확인");
    } finally {
      client.clear();
    }
  });
});
