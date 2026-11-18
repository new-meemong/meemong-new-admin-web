// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useInvestigationLeaveGuard } from "./use-investigation-leave-guard";
function Guard({ enabled }: { enabled: boolean }) {
  useInvestigationLeaveGuard(enabled);
  return null;
}
it("guards navigation only while results may be lost and restores cancelled back navigation", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const host = document.createElement("div");
  const root = createRoot(host);
  window.history.replaceState(
    { next: "state" },
    "",
    "/sns-inducement-detections",
  );
  await act(async () => root.render(<Guard enabled />));
  const leaving = new Event("admin:before-navigation", { cancelable: true });
  expect(window.dispatchEvent(leaving)).toBe(false);
  const unloading = new Event("beforeunload", { cancelable: true });
  expect(window.dispatchEvent(unloading)).toBe(false);
  window.history.replaceState({}, "", "/user");
  window.dispatchEvent(new PopStateEvent("popstate"));
  expect(window.location.pathname).toBe("/sns-inducement-detections");
  expect(window.history.state).toEqual({ next: "state" });
  await act(async () => root.render(<Guard enabled={false} />));
  const count = confirm.mock.calls.length;
  expect(
    window.dispatchEvent(
      new Event("admin:before-navigation", { cancelable: true }),
    ),
  ).toBe(true);
  expect(confirm.mock.calls).toHaveLength(count);
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
