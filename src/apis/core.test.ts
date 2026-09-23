import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { dashboardQueryOptions } from "@/queries/dashboards";
import { fetcher } from "./core";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  vi.spyOn(console, "group").mockImplementation(() => {});
  vi.spyOn(console, "groupEnd").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("request cancellation logging", () => {
  it.each(["users", "timeSales", "withdrawals"] as const)(
    "does not log %s query observer cancellation as an API error",
    async (key) => {
      const signals: AbortSignal[] = [];
      vi.stubGlobal(
        "fetch",
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
              const signal = init.signal!;
              signals.push(signal);
              signal.addEventListener("abort", () => reject(signal.reason), {
                once: true,
              });
            }),
        ),
      );
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      const options = dashboardQueryOptions[key]({
        startDateKST: "2026-08-25",
        endDateKST: "2026-09-23",
      });
      const observer = new QueryObserver(
        client,
        options as ReturnType<typeof dashboardQueryOptions.users>,
      );
      try {
        const unsubscribe = observer.subscribe(() => {});
        expect(signals).toHaveLength(1);
        unsubscribe();
        await Promise.resolve();
        await Promise.resolve();
        expect(signals[0].aborted).toBe(true);
        expect(signals[0].reason.name).toBe("AbortError");
        expect(console.error).not.toHaveBeenCalled();
        vi.mocked(fetch).mockResolvedValue(
          new Response(JSON.stringify({ dataList: [] }), {
            headers: { "content-type": "application/json" },
          }),
        );
        await expect(
          client.fetchQuery(
            options as ReturnType<typeof dashboardQueryOptions.users>,
          ),
        ).resolves.toEqual({ dataList: [] });
      } finally {
        client.clear();
      }
    },
  );
  it("preserves the original cancellation rejection", async () => {
    const controller = new AbortController();
    controller.abort();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(controller.signal.reason));
    await expect(
      fetcher("/example", { signal: controller.signal }),
    ).rejects.toBe(controller.signal.reason);
    expect(console.error).not.toHaveBeenCalled();
  });
  it("preserves cancellation while reading the response body without reading it again", async () => {
    const controller = new AbortController();
    const response = new Response("{}", {
      headers: { "content-type": "application/json" },
    });
    vi.spyOn(response, "json").mockImplementation(async () => {
      controller.abort();
      throw controller.signal.reason;
    });
    const text = vi.spyOn(response, "text");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    const request = fetcher("/example", { signal: controller.signal });
    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    await expect(request).rejects.toBe(controller.signal.reason);
    expect(text).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
  it("still logs timeouts even when their signal is aborted", async () => {
    const controller = new AbortController();
    const error = new DOMException("Timed out", "TimeoutError");
    controller.abort(error);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
    await expect(
      fetcher("/example", { signal: controller.signal }),
    ).rejects.toBe(error);
    expect(console.error).toHaveBeenCalledWith("❌ Error:", error);
  });
  it.each([
    new TypeError("Failed to fetch"),
    new DOMException("Timed out", "TimeoutError"),
    new DOMException("Unexpected abort", "AbortError"),
  ])("still logs real failures: %s", async (error) => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
    await expect(fetcher("/example")).rejects.toBe(error);
    expect(console.error).toHaveBeenCalledWith("❌ Error:", error);
  });
});
