// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import BrandRecommendationToggle from "./index";

const mocks = vi.hoisted(() => ({
  patch: vi.fn(),
  rowClick: vi.fn(),
}));
vi.mock("@/queries/brands", () => ({
  usePatchBrandMutation: () => ({ isPending: false, mutateAsync: mocks.patch }),
}));

const brand = {
  id: 30,
  code: "L2826",
  name: "로위",
  isRecommended: true,
  isTimeSaleRecommended: false,
  createdAt: "2025-12-15",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

const render = async (onChanged: () => unknown) => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  await act(async () =>
    root.render(
      <div onClick={mocks.rowClick}>
        <BrandRecommendationToggle
          brand={brand}
          kind="timeSale"
          onChanged={onChanged}
        />
      </div>,
    ),
  );
  const toggle = host.querySelector('[role="switch"]') as HTMLButtonElement;
  return { root, toggle };
};

it("바꾼 추천 필드만 PATCH하고 재조회가 끝날 때까지 요청 값 유지·잠금하며 행 클릭으로 번지지 않는다", async () => {
  let finishRefetch!: () => void;
  const onChanged = vi.fn(
    () => new Promise<void>((resolve) => (finishRefetch = resolve)),
  );
  mocks.patch.mockResolvedValue({ data: {} });
  const { root, toggle } = await render(onChanged);
  expect(toggle.getAttribute("aria-label")).toBe("로위 리뷰특가 추천 여부");
  // 미추천 트랙은 공용 진한 배경 대신 연한 회색으로 덮어쓴다.
  expect(toggle.className).toContain("data-[state=unchecked]:bg-gray-300");

  await act(async () => toggle.click());
  expect(mocks.patch).toHaveBeenCalledExactlyOnceWith({
    id: 30,
    isTimeSaleRecommended: true,
  });
  expect(onChanged).toHaveBeenCalledOnce();
  expect(mocks.rowClick).not.toHaveBeenCalled();
  expect(toggle.getAttribute("aria-checked")).toBe("true");
  // 재조회가 끝날 때까지 잠겨 다시 눌러도 PATCH가 더 나가지 않는다.
  expect(toggle.disabled).toBe(true);
  await act(async () => toggle.click());
  expect(mocks.patch).toHaveBeenCalledOnce();

  // 재조회 결과(brand prop)가 여전히 false면 서버 값으로 돌아간다.
  await act(async () => finishRefetch());
  expect(toggle.getAttribute("aria-checked")).toBe("false");
  await act(async () => root.unmount());
});

it("저장에 실패하면 재조회 없이 서버 값으로 되돌린다", async () => {
  const onChanged = vi.fn();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.patch.mockRejectedValue(new Error("실패"));
  const { root, toggle } = await render(onChanged);

  await act(async () => toggle.click());
  expect(onChanged).not.toHaveBeenCalled();
  expect(toggle.getAttribute("aria-checked")).toBe("false");
  await act(async () => root.unmount());
});
