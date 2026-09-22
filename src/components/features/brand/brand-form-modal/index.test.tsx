import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import BrandFormModal from "./index";

// Exercise the real form; only replace the effect/portal-driven modal shell.
vi.mock("@/components/shared/modal", async () => {
  const { ModalProvider } = await import("@/components/shared/modal/context");
  return {
    Modal: ({
      isOpen,
      children,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
    }) => (isOpen ? <ModalProvider>{children}</ModalProvider> : null),
  };
});
vi.mock("@/components/shared/modal/modal-header", () => ({
  ModalHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@/components/shared/dialog/context", () => ({
  useDialog: () => ({ confirm: vi.fn() }),
}));

describe("brand creation recommendation field", () => {
  it("renders an initially unchecked recommendation switch in the open form", () => {
    const client = new QueryClient();
    try {
      const html = renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <BrandFormModal isOpen onClose={() => {}} onSubmit={() => {}} />
        </QueryClientProvider>,
      );
      expect(html).toContain('role="switch"');
      expect(html).toContain('aria-checked="false"');
      expect(html).toContain('for="brand-recommended"');
      expect(html).toContain(
        'aria-describedby="brand-recommended-description"',
      );
      expect(html).toContain('id="brand-recommended-description"');
      expect(html).toContain(">미추천</span>");
    } finally {
      client.clear();
    }
  });
});
