// @vitest-environment jsdom
import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import DashboardPageContent from "./index";
vi.mock("./dashboard.css", () => ({}));
vi.mock("./home-dashboard", () => ({ default: () => null }));
vi.mock("./payment-dashboard", () => ({ default: () => null }));
vi.mock("./review-sale-dashboard", () => ({ default: () => null }));
vi.mock("./activity-dashboard", () => ({ default: () => null }));
let root: Root | undefined;
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
afterEach(async () => {
  await act(async () => root?.unmount());
  vi.useRealTimers();
  document.body.innerHTML = "";
});
it("allows today after hydrating HTML generated the previous day and after midnight", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-12T01:00:00Z"));
  const container = document.createElement("div");
  document.body.append(container);
  container.innerHTML = renderToString(<DashboardPageContent />);
  vi.setSystemTime(new Date("2026-11-13T01:00:00Z"));
  await act(async () => {
    root = hydrateRoot(container, <DashboardPageContent />);
  });
  const assertToday = (date: string) => {
    const inputs =
      container.querySelectorAll<HTMLInputElement>('input[type="date"]');
    expect(inputs).toHaveLength(2);
    for (const input of inputs) {
      expect(input.max).toBe(date);
      input.value = date;
      expect(input.validity.rangeOverflow).toBe(false);
    }
  };
  assertToday("2026-11-13");
  const endInput = container.querySelector<HTMLInputElement>(
    'input[aria-label="마감일"]',
  )!;
  endInput.value = "2026-11-14";
  expect(endInput.validity.rangeOverflow).toBe(true);
  vi.setSystemTime(new Date("2026-11-14T00:00:00+09:00"));
  await act(async () => {
    vi.advanceTimersByTime(60_000);
  });
  assertToday("2026-11-14");
  vi.setSystemTime(new Date("2026-11-15T00:00:00+09:00"));
  await act(async () => {
    window.dispatchEvent(new Event("focus"));
  });
  assertToday("2026-11-15");
});
