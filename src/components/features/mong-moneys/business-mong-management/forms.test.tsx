// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetcher } from "@/apis/core";
import BusinessMongManagement from "./index";
import BusinessMongGrantForm from "./grant-form";
import BusinessMongDistributionForm from "./distribution-form";

vi.mock("@/apis/core", async (original) => ({
  ...(await original<typeof import("@/apis/core")>()),
  fetcher: vi.fn(),
}));
const grant = {
  id: 5,
  requestKey: "grant-test",
  businessName: "테스트 사업자",
  businessRegistrationNumber: "1234567890",
  mongAmount: 4500,
  distributedMongAmount: 0,
  remainingMongAmount: 4500,
  adminDescription: "입금 확인",
  createdAt: "2026-11-04T00:00:00Z",
};
const request = {
  requestKey: "distribution-test",
  title: "원장님의 선물",
  adminDescription: "확인",
  owner: { displayName: "원장", phone: "01000000001" },
  recipientList: [{ displayName: "직원", phone: "01000000002", amount: 1000 }],
};
let host: HTMLDivElement;
let root: Root;
let client: QueryClient;
async function flush(action: () => void) {
  await act(async () => {
    action();
    await new Promise((resolve) => setTimeout(resolve, 15));
  });
}
async function mount(node: React.ReactNode) {
  await flush(() =>
    root.render(
      <QueryClientProvider client={client}>{node}</QueryClientProvider>,
    ),
  );
}
function button(text: string) {
  const found = Array.from(document.querySelectorAll("button")).find(
    (item) => item.textContent === text,
  );
  if (!found) throw new Error(`Missing button: ${text}`);
  return found;
}
async function input(name: string, value: string, scope: ParentNode = host) {
  const element = scope.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `[name="${name}"]`,
  )!;
  const prototype =
    element.tagName === "TEXTAREA"
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  await flush(() => {
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(
      element,
      value,
    );
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // jsdom에는 Radix Checkbox가 크기 측정에 쓰는 ResizeObserver가 없다.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  sessionStorage.clear();
  vi.mocked(fetcher).mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  host.remove();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("business mong forms", () => {
  it.each([
    [400, "MONG_RECIPIENT_NOT_FOUND"],
    [400, "AMBIGUOUS_MONG_RECIPIENT"],
    [400, "DUPLICATE_MONG_RECIPIENT"],
    [400, "MONG_OWNER_REQUIRED"],
    [409, "NOT_ENOUGH_BUSINESS_MONG"],
  ])(
    "unlocks and restores the persisted distribution after %s %s",
    async (status, code) => {
      const key = "business-mong:distribution:5";
      sessionStorage.setItem(key, JSON.stringify(request));
      vi.mocked(fetcher).mockRejectedValue(
        new ApiError("검증 실패", status as number, code as string),
      );
      await mount(
        <BusinessMongDistributionForm
          grant={grant}
          historyConfirmed={false}
          onRefresh={vi.fn()}
        />,
      );
      expect(host.querySelector("fieldset")!.disabled).toBe(true);
      await flush(() => button("동일 요청 재시도").click());
      expect(fetcher).toHaveBeenCalledWith(
        "/api/v1/admins/business-mong-grants/5/distributions",
        { method: "POST", json: request },
      );
      expect(sessionStorage.getItem(key)).toBeNull();
      expect(host.querySelector("fieldset")!.disabled).toBe(false);
      expect(
        host.querySelector<HTMLInputElement>(
          '[name="recipientList.0.displayName"]',
        )!.value,
      ).toBe("직원");
      expect(
        host.querySelector<HTMLInputElement>('[name="owner.phone"]')!.value,
      ).toBe("01000000001");
    },
  );
  it("keeps an uncertain distribution locked after an authentication error", async () => {
    const key = "business-mong:distribution:5";
    sessionStorage.setItem(key, JSON.stringify(request));
    vi.mocked(fetcher).mockRejectedValue(new ApiError("인증 실패", 401));
    await mount(
      <BusinessMongDistributionForm
        grant={grant}
        historyConfirmed={false}
        onRefresh={vi.fn()}
      />,
    );
    await flush(() => button("동일 요청 재시도").click());
    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual(request);
    expect(host.querySelector("fieldset")!.disabled).toBe(true);
  });
  it("resets the controlled preset after manual quantity input and successful registration", async () => {
    vi.mocked(fetcher).mockImplementation(async (url) => {
      if (url.endsWith("business-mong-presets"))
        return {
          dataList: [
            {
              id: 1,
              title: "상품",
              mongAmount: 4500,
              paymentAmountKRW: 165000,
              isHidden: false,
            },
          ],
        };
      return { data: grant };
    });
    await mount(<BusinessMongGrantForm onCreated={vi.fn()} />);
    // TanStack Query notifies after the initial request resolves.
    await flush(() => {});
    const select = host.querySelector("select")!;
    const choose = () => {
      select.value = "1";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    };
    await flush(choose);
    expect(select.value).toBe("1");
    expect(
      host.querySelector<HTMLInputElement>('[name="mongAmount"]')!.value,
    ).toBe("4500");
    await input("mongAmount", "5000");
    expect(select.value).toBe("");
    expect(
      host.querySelector<HTMLInputElement>('[name="mongAmount"]')!.value,
    ).toBe("5000");
    await flush(choose);
    await input("businessName", "테스트 사업자");
    await input("businessRegistrationNumber", "1234567890");
    await input("adminDescription", "입금 확인");
    await flush(() =>
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    await flush(() => button("등록 확정").click());
    expect(select.value).toBe("");
    expect(
      host.querySelector<HTMLInputElement>('[name="mongAmount"]')!.value,
    ).toBe("");
    expect(sessionStorage.getItem("business-mong:grant-request")).toBeNull();
  });
});

it("opens details in a modal and keeps it open when the nested confirmation is dismissed", async () => {
  vi.mocked(fetcher).mockImplementation(async (url) => {
    if (url.endsWith("business-mong-presets")) return { dataList: [] };
    if (url.endsWith("/distributions"))
      return { dataList: [], dataCount: 0, __nextCursor: null };
    if (url.endsWith("/5")) return { data: grant };
    return { dataList: [grant], dataCount: 1, __nextCursor: null };
  });
  await mount(<BusinessMongManagement />);
  await flush(() => {});
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  await flush(() => button("상세 / 분배").click());
  await flush(() => {});
  const detail = document.querySelector<HTMLElement>('[role="dialog"]')!;
  expect(detail.textContent).toContain("원장님 몽 상세 / 분배");
  expect(host.contains(detail)).toBe(false);
  await input("title", "원장님의 선물", detail);
  await input("adminDescription", "분배 확인", detail);
  await input("owner.displayName", "원장", detail);
  await input("owner.phone", "01000000001", detail);
  await flush(() => button("분배 내용 확인").click());
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);
  await flush(() => button("수정").click());
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  expect(
    detail.querySelector<HTMLInputElement>('[name="owner.displayName"]')!.value,
  ).toBe("원장");
  await flush(() => button("Close").click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it("manages presets in a modal and refreshes the grant selector after update/create", async () => {
  let products = [
    {
      id: 1,
      title: "기존 상품",
      mongBaseAmount: 100,
      mongBonusAmount: 10,
      mongAmount: 110,
      supplyAmountKRW: 1001,
      vatAmountKRW: 100,
      paymentAmountKRW: 1101,
      isHidden: false,
      sortOrder: 0,
    },
  ];
  vi.mocked(fetcher).mockImplementation(async (url, options) => {
    if (url.includes("business-mong-presets")) {
      if (options?.method === "PUT") {
        products = products.map((product) => ({
          ...product,
          ...(options.json as object),
          mongAmount: 210,
        }));
        return { data: products[0] };
      }
      if (options?.method === "POST") {
        const created = {
          ...products[0],
          ...(options.json as object),
          id: 2,
          mongAmount: 300,
          paymentAmountKRW: 2200,
          vatAmountKRW: 200,
        };
        products = [...products, created];
        return { data: created };
      }
      return { dataList: products };
    }
    return { dataList: [], dataCount: 0, __nextCursor: null };
  });
  await mount(<BusinessMongManagement />);
  await flush(() => {});
  const select = host.querySelector("select")!;
  await flush(() => {
    select.value = "1";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(select.value).toBe("1");
  await flush(() => button("상품 관리").click());
  const modal = document.querySelector<HTMLElement>('[role="dialog"]')!;
  expect(modal.textContent).toContain("원장님 몽 상품 관리");
  await flush(() =>
    modal
      .querySelector<HTMLButtonElement>('[aria-label="기존 상품 수정"]')!
      .click(),
  );
  await flush(() => button("상품 수정 저장").click());
  expect(modal.textContent).toContain("변경된 내용이 없습니다.");
  expect(
    vi
      .mocked(fetcher)
      .mock.calls.some(([, options]) => options?.method === "PUT"),
  ).toBe(false);
  await input("mongBaseAmount", "200", modal);
  await flush(() =>
    modal.querySelector<HTMLButtonElement>('[role="checkbox"]')!.click(),
  );
  await flush(() => button("상품 수정 저장").click());
  await flush(() => {});
  expect(fetcher).toHaveBeenCalledWith(
    "/api/v1/admins/business-mong-presets/1",
    { method: "PUT", json: { mongBaseAmount: 200, isHidden: true } },
  );
  expect(select.value).toBe("");
  expect(select.querySelector('option[value="1"]')).toBeNull();
  expect(modal.textContent).toContain("숨김");
  expect(
    host.querySelector<HTMLInputElement>('[name="mongAmount"]')!.value,
  ).toBe("110");
  await input("title", "신규 상품", modal);
  await input("mongBaseAmount", "300", modal);
  await input("supplyAmountKRW", "2000", modal);
  await flush(() => button("상품 등록").click());
  await flush(() => {});
  expect(fetcher).toHaveBeenCalledWith("/api/v1/admins/business-mong-presets", {
    method: "POST",
    json: {
      title: "신규 상품",
      mongBaseAmount: 300,
      mongBonusAmount: 0,
      supplyAmountKRW: 2000,
      sortOrder: 0,
      isHidden: false,
    },
  });
  expect(select.querySelector('option[value="2"]')?.textContent).toContain(
    "신규 상품",
  );
  expect(modal.textContent).toContain("상품을 등록했습니다.");
});

it.each([false, true])(
  "confirms deletion, removes the preset and clears its editor (hidden=%s)",
  async (isHidden) => {
    let products = [
      {
        id: 7,
        title: "삭제할 상품",
        mongBaseAmount: 100,
        mongBonusAmount: 0,
        mongAmount: 100,
        supplyAmountKRW: 1000,
        vatAmountKRW: 100,
        paymentAmountKRW: 1100,
        isHidden,
        sortOrder: 0,
      },
    ];
    vi.mocked(fetcher).mockImplementation(async (url, options) => {
      if (options?.method === "DELETE") {
        products = [];
        return null;
      }
      if (url.endsWith("business-mong-presets")) return { dataList: products };
      return { dataList: [], dataCount: 0, __nextCursor: null };
    });
    await mount(<BusinessMongManagement />);
    await flush(() => {});
    const select = host.querySelector("select")!;
    if (!isHidden)
      await flush(() => {
        select.value = "7";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    await flush(() => button("상품 관리").click());
    const modal = document.querySelector<HTMLElement>('[role="dialog"]')!;
    await flush(() =>
      modal
        .querySelector<HTMLButtonElement>('[aria-label="삭제할 상품 수정"]')!
        .click(),
    );
    const deleteButton = modal.querySelector<HTMLButtonElement>(
      '[aria-label="삭제할 상품 삭제"]',
    )!;
    await flush(() => deleteButton.click());
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);
    expect(
      vi
        .mocked(fetcher)
        .mock.calls.some(([, options]) => options?.method === "DELETE"),
    ).toBe(false);
    await flush(() => button("취소").click());
    expect(modal.querySelector<HTMLInputElement>('[name="title"]')!.value).toBe(
      "삭제할 상품",
    );
    await flush(() =>
      modal
        .querySelector<HTMLButtonElement>('[aria-label="삭제할 상품 삭제"]')!
        .click(),
    );
    await flush(() => button("삭제 확정").click());
    await flush(() => {});
    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/admins/business-mong-presets/7",
      { method: "DELETE" },
    );
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(modal.querySelector('[aria-label="삭제할 상품 수정"]')).toBeNull();
    expect(modal.querySelector<HTMLInputElement>('[name="title"]')!.value).toBe(
      "",
    );
    expect(select.querySelector('option[value="7"]')).toBeNull();
    expect(select.value).toBe("");
  },
);

it.each([403, 404])(
  "handles deletion error %s without silently succeeding",
  async (status) => {
    let products = [
      {
        id: 7,
        title: "삭제할 상품",
        mongBaseAmount: 100,
        mongBonusAmount: 0,
        mongAmount: 100,
        supplyAmountKRW: 1000,
        vatAmountKRW: 100,
        paymentAmountKRW: 1100,
        isHidden: false,
        sortOrder: 0,
      },
    ];
    vi.mocked(fetcher).mockImplementation(async (url, options) => {
      if (options?.method === "DELETE") {
        if (status === 404) products = [];
        throw new ApiError(
          "삭제 실패",
          status,
          status === 404 ? "NOT_FOUND_ERROR" : "FORBIDDEN",
        );
      }
      if (url.endsWith("business-mong-presets")) return { dataList: products };
      return { dataList: [], dataCount: 0, __nextCursor: null };
    });
    await mount(<BusinessMongManagement />);
    await flush(() => {});
    await flush(() => button("상품 관리").click());
    const modal = document.querySelector<HTMLElement>('[role="dialog"]')!;
    await flush(() =>
      modal
        .querySelector<HTMLButtonElement>('[aria-label="삭제할 상품 삭제"]')!
        .click(),
    );
    await flush(() => button("삭제 확정").click());
    await flush(() => {});
    if (status === 404) {
      expect(document.body.textContent).toContain(
        "이미 삭제되었거나 존재하지 않는 상품",
      );
      expect(modal.querySelector('[aria-label="삭제할 상품 삭제"]')).toBeNull();
    } else {
      expect(document.querySelector('[role="alert"]')?.textContent).toContain(
        "삭제 실패",
      );
      expect(
        modal.querySelector('[aria-label="삭제할 상품 삭제"]'),
      ).not.toBeNull();
    }
    expect(
      vi
        .mocked(fetcher)
        .mock.calls.filter(([, options]) => options?.method === "DELETE"),
    ).toHaveLength(1);
  },
);
