// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it } from "vitest";
import { KrwPaymentSection } from "./krw-payment-sections";
import { dashboardQueryOptions } from "@/queries/dashboards";
import fixture from "@/apis/dashboards/__fixtures__/payment-statistics.json";

it("resets a hidden historical category filter when the selected period changes", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, enabled: false } },
  });
  const before = { startDateKST: "2026-09-10", endDateKST: "2026-09-10" };
  const after = { startDateKST: "2026-09-11", endDateKST: "2026-09-11" };
  const historical = structuredClone(fixture);
  historical.dataList[0].itemList.push({
    ...historical.dataList[0].itemList[0],
    paymentCategory: "THUNDER",
    productId: "legacy.thunder",
  });
  client.setQueryData(
    dashboardQueryOptions.payments(before).queryKey,
    historical,
  );
  client.setQueryData(dashboardQueryOptions.payments(after).queryKey, fixture);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const render = (range: typeof before) =>
    act(async () => {
      root.render(
        <QueryClientProvider client={client}>
          <KrwPaymentSection range={range} role="all" />
        </QueryClientProvider>,
      );
    });
  const click = async (label: string) => {
    const button = [...host.querySelectorAll("button")].find(
      (b) => b.textContent === label,
    )!;
    await act(async () => button.click());
  };
  try {
    await render(before);
    await click("상품별");
    await click("빠른매칭");
    expect(host.textContent).toContain("legacy.thunder");
    await render(after);
    const filters = host.querySelector('[aria-label="결제 유형"]')!;
    expect(filters.textContent).not.toContain("빠른매칭");
    expect(filters.querySelector('[aria-pressed="true"]')?.textContent).toBe(
      "전체",
    );
    expect(host.textContent).toContain("100몽");
    expect(host.textContent).not.toContain("legacy.thunder");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    client.clear();
  }
});
