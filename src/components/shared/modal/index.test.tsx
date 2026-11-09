// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./index";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("Modal background scroll lock", () => {
  it("locks body scroll while visible and restores it after the close animation", async () => {
    vi.useFakeTimers();
    document.body.style.overflow = "auto";
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const render = (isOpen: boolean) =>
      act(async () => {
        root.render(
          <Modal isOpen={isOpen} onClose={() => {}}>
            content
          </Modal>,
        );
      });

    await render(true);
    expect(document.body.style.overflow).toBe("hidden");

    await render(false);
    expect(document.body.style.overflow).toBe("hidden");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(document.body.style.overflow).toBe("auto");

    await act(async () => root.unmount());
  });
});
