import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import BrandTable from "./index";

vi.mock("@/components/shared/common-pagination", () => ({
  default: () => null,
}));

describe("brand list recommendation status", () => {
  it.each([true, false])(
    "shows read-only status for recommendation=%s",
    (isRecommended) => {
      const client = new QueryClient();
      try {
        const html = renderToStaticMarkup(
          <QueryClientProvider client={client}>
            <BrandTable
              data={[
                {
                  id: 1,
                  code: "brand",
                  name: "브랜드",
                  isRecommended,
                  createdAt: "2026-09-22",
                },
              ]}
              onRefresh={() => {}}
            />
          </QueryClientProvider>,
        );
        expect(html).not.toContain('role="switch"');
        expect(html).toContain(isRecommended ? ">추천<" : ">미추천<");
      } finally {
        client.clear();
      }
    },
  );
});
