"use client";
import { useEffect, useRef } from "react";

/** Results are memory-only. Guard same-tab links, logout, reload and back/forward. */
export function useInvestigationLeaveGuard(enabled: boolean) {
  const dirty = useRef(enabled);
  dirty.current = enabled;
  useEffect(() => {
    const originalUrl = window.location.href;
    const originalState = window.history.state;
    const confirm = () =>
      !dirty.current ||
      window.confirm("조사 결과는 저장되지 않습니다. 이 화면을 떠날까요?");
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const click = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const target = new URL(anchor.href, originalUrl);
      if (
        target.origin === window.location.origin &&
        target.pathname === window.location.pathname &&
        target.search === window.location.search
      )
        return;
      if (!confirm()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const programmatic = (event: Event) => {
      if (!confirm()) event.preventDefault();
    };
    const pop = (event: PopStateEvent) => {
      if (!dirty.current || window.location.href === originalUrl) return;
      if (!confirm()) {
        // Capture before Next unmounts the page. Keep the current investigation
        // mounted and restore its URL/state when the user cancels navigation.
        event.stopImmediatePropagation();
        window.history.pushState(originalState, "", originalUrl);
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    window.addEventListener("admin:before-navigation", programmatic);
    window.addEventListener("popstate", pop, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
      window.removeEventListener("admin:before-navigation", programmatic);
      window.removeEventListener("popstate", pop, true);
    };
  }, []);
}
