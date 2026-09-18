import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import TimeSaleMenuPreviewImageViewer from "./image-viewer";

const images = [
  { src: "https://example.test/first.jpg" },
  { src: "https://example.test/second.jpg" },
];

describe("phone preview image viewer", () => {
  it("renders inside its host instead of a document-body portal", () => {
    const html = renderToStaticMarkup(
      <section aria-label="phone">
        <TimeSaleMenuPreviewImageViewer
          returnFocusTo={null}
          images={images}
          initialIndex={1}
          onClose={() => {}}
        />
      </section>,
    );
    expect(html).toContain('<section aria-label="phone"><div role="dialog"');
    expect(html).toContain('aria-label="앱 미리보기 사진 확대"');
    expect(html).toContain('aria-live="polite">2 / 2</span>');
    expect(html).toContain('aria-label="확대 사진 닫기"');
    expect(html).toContain('aria-label="다음 확대 사진" disabled=""');
    expect(html).toContain('src="https://example.test/second.jpg"');
  });
  it("omits image navigation for a single photo", () => {
    const html = renderToStaticMarkup(
      <TimeSaleMenuPreviewImageViewer
        images={[images[0]]}
        initialIndex={0}
        onClose={() => {}}
      />,
    );
    expect(html).toContain('aria-live="polite">1 / 1</span>');
    expect(html).not.toContain('aria-label="다음 확대 사진"');
    expect(html).not.toContain('type="submit"');
  });
});
