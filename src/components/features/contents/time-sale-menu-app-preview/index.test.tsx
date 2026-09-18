import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ITimeSaleMenu } from "@/models/timeSaleMenus";

vi.mock("next/font/local", () => ({
  default: () => ({ className: "app-font" }),
}));
import TimeSaleMenuAppPreview from "./index";

const menu = {
  id: 1,
  name: "레이어드 펌",
  description: "첫 줄\n둘째 줄 <script>alert(1)</script>",
  originalPrice: 80000,
  discountPrice: 30000,
  treatmentType: "두피케어",
  cutOption: "컷트 포함",
  images: [],
  thumbnailImageUrl: null,
  designer: null,
} as unknown as ITimeSaleMenu;

const render = (changes: Partial<ITimeSaleMenu> = {}) =>
  renderToStaticMarkup(
    <TimeSaleMenuAppPreview menu={{ ...menu, ...changes }} />,
  );

describe("customer app menu preview", () => {
  it("renders saved content and Flutter pricing/category presentation safely", () => {
    const html = render();
    expect(html).toContain("레이어드 펌");
    expect(html).toContain("80,000");
    expect(html).toContain("30,000");
    expect(html).toContain("63%");
    expect(html).toContain("헤드스파, 컷트 포함");
    expect(html).toContain("첫 줄\n둘째 줄 &lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("매장명 미등록");
    expect(html).toContain("주소 정보가 없습니다.");
    expect(html).toContain("default-profile.png");
  });
  it.each([
    { originalPrice: 0 },
    { discountPrice: 80000 },
    { discountPrice: 90000 },
  ])("omits discount rate when the app does: %j", (changes) => {
    expect(render(changes)).not.toMatch(/>\d+%</);
  });
  it("uses display order without mutating server data", () => {
    const images = [
      { id: 2, imageUrl: "https://example.test/second.jpg", displayOrder: 2 },
      { id: 1, imageUrl: "https://example.test/first.jpg", displayOrder: 1 },
    ];
    const html = render({ images });
    expect(html).toContain('src="https://example.test/first.jpg"');
    expect(html).toContain("다음 메뉴 사진");
    expect(images[0].id).toBe(2);
  });
  it("falls back to a thumbnail and preserves unknown treatment labels", () => {
    const html = render({
      thumbnailImageUrl: "https://example.test/thumbnail.jpg",
      treatmentType: "네일",
      cutOption: null,
    });
    expect(html).toContain('src="https://example.test/thumbnail.jpg"');
    expect(html).toContain("네일");
    expect(html).not.toContain("다음 메뉴 사진");
  });
});

it("renders portfolio and shop photos from the admin user photo contract", () => {
  const html = renderToStaticMarkup(
    <TimeSaleMenuAppPreview
      menu={menu}
      photos={[
        {
          id: 1,
          fileType: "portfolio",
          s3Path: "https://example.test/portfolio.jpg",
        },
        { id: 2, fileType: "shop", s3Path: "https://example.test/shop.jpg" },
        {
          id: 3,
          fileType: "profilePhoto",
          s3Path: "https://example.test/profile.jpg",
        },
      ]}
    />,
  );
  expect(html).toContain("포트폴리오 사진 1 확대");
  expect(html).toContain("매장 사진 1 확대");
  expect(html).toContain('src="https://example.test/portfolio.jpg"');
  expect(html).toContain('src="https://example.test/shop.jpg"');
  expect(html).not.toContain('src="https://example.test/profile.jpg"');
  expect(html).toContain('aria-label="매장 위치 지도"');
});

it("does not present a photo fetch failure as an empty portfolio", () => {
  const html = renderToStaticMarkup(
    <TimeSaleMenuAppPreview menu={menu} photosError onRetryPhotos={() => {}} />,
  );
  expect(html).toContain("사진을 불러오지 못했습니다.");
  expect(html).toContain("다시 시도");
});
