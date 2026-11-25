import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import BrandTable from "./index";

vi.mock("next/font/local", () => ({
  default: () => ({ className: "app-font" }),
}));

vi.mock("@/components/shared/common-pagination", () => ({
  default: () => null,
}));

describe("brand list recommendation status", () => {
  it.each([true, false])(
    "shows home and time-sale toggles with green 추천 for recommendation=%s",
    (isRecommended) => {
      const client = new QueryClient();
      try {
        const html = renderToStaticMarkup(
          <QueryClientProvider client={client}>
            <BrandTable
              totalCount={1}
              currentPage={1}
              onPageChange={() => {}}
              onSizeChange={() => {}}
              data={[
                {
                  id: 1,
                  code: "brand",
                  name: "브랜드",
                  isRecommended,
                  isTimeSaleRecommended: !isRecommended,
                  createdAt: "2026-09-22",
                },
              ]}
              onRefresh={() => {}}
            />
          </QueryClientProvider>,
        );
        expect(html).toContain("홈 추천 여부");
        expect(html).toContain("리뷰특가 추천 여부");
        // 두 플래그를 반대로 두어 각 열의 토글이 자기 필드를 읽는지 확인한다.
        const switchState = (label: string) =>
          html.match(
            new RegExp(
              `aria-checked="(true|false)"[^>]*aria-label="브랜드 ${label}"`,
            ),
          )?.[1];
        expect(switchState("홈 추천 여부")).toBe(String(isRecommended));
        expect(switchState("리뷰특가 추천 여부")).toBe(String(!isRecommended));
        expect(html.match(/text-green-500[^>]*>추천</g)).toHaveLength(1);
      } finally {
        client.clear();
      }
    },
  );
});
