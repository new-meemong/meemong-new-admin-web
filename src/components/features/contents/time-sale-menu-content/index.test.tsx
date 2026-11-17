// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import TimeSaleMenuContent from "./index";

vi.mock("@/assets/icons/ic_search.svg", () => ({ default: () => null }));
vi.mock("@/assets/icons/ic_refresh.svg", () => ({ default: () => null }));

it("renders server review-special positions between nickname and title, preserving unknown and missing values", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  const positions = [
    "디자이너",
    "수석디자이너",
    "실장",
    "수석실장",
    "팀장",
    "부원장",
    "원장점장",
    "새직급",
    null,
    undefined,
  ];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      expect(new URL(url).pathname).toBe("/api/v1/admins/time-sale-menus");
      return new Response(
        JSON.stringify({
          data: {
            dataList: [
              ...positions.map((position, index) => ({
                id: index + 1,
                name: `메뉴${index}`,
                designer: {
                  displayName: `작성자${index}`,
                  timeSalePosition: position,
                },
                originalPrice: 10000,
                discountPrice: 5000,
                createdAt: "2026-11-17",
                updatedAt: "2026-11-17",
              })),
              {
                id: 11,
                name: "디자이너 없음",
                designer: null,
                originalPrice: 10000,
                discountPrice: 5000,
                createdAt: "2026-11-17",
                updatedAt: "2026-11-17",
              },
            ],
            totalCount: 11,
            page: 1,
            size: 15,
          },
        }),
        { headers: { "content-type": "application/json" } },
      );
    }),
  );
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  try {
    await act(async () => {
      root.render(
        <QueryClientProvider client={client}>
          <TimeSaleMenuContent />
        </QueryClientProvider>,
      );
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    const rows = Array.from(host.querySelectorAll(".grid"));
    expect(
      Array.from(rows[0].children)
        .slice(0, 4)
        .map((cell) => cell.textContent),
    ).toEqual(["메뉴 넘버", "닉네임", "직급", "제목"]);
    // Figma 10996:32355: the position column is 90px wide.
    expect(
      (rows[0] as HTMLElement).style.gridTemplateColumns.split(" ")[2],
    ).toBe("90px");
    expect(rows.slice(1).map((row) => row.children[2].textContent)).toEqual([
      "디자이너",
      "수석디자이너",
      "실장",
      "수석실장",
      "팀장",
      "부원장",
      "원장·점장",
      "새직급",
      "-",
      "-",
      "-",
    ]);
  } finally {
    await act(async () => root.unmount());
    client.clear();
    host.remove();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  }
});
