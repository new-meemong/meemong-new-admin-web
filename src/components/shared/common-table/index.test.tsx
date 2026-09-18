import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CommonTable from "./index";

const columns = [{ accessorKey: "name", header: "제목" }];

describe("CommonTable empty results", () => {
  it("keeps headers and the existing default message", () => {
    const html = renderToStaticMarkup(
      <CommonTable<{ name: string }> data={[]} columns={columns} />,
    );
    expect(html).toContain("제목");
    expect(html).toContain("데이터가 없습니다.");
  });
  it("keeps headers with a domain-specific empty message", () => {
    const html = renderToStaticMarkup(
      <CommonTable<{ name: string }>
        data={[]}
        columns={columns}
        emptyMessage="조건에 맞는 리뷰특가가 없습니다."
      />,
    );
    expect(html).toContain("제목");
    expect(html).toContain("조건에 맞는 리뷰특가가 없습니다.");
    expect(html).not.toContain("데이터가 없습니다.");
  });
  it("does not show empty state when rows exist", () => {
    const html = renderToStaticMarkup(
      <CommonTable data={[{ name: "리뷰특가" }]} columns={columns} />,
    );
    expect(html).toContain("리뷰특가");
    expect(html).not.toContain("데이터가 없습니다.");
  });
});
