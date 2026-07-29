import { describe, expect, it } from "vitest";

import { formatPrice } from "@/utils/price";

describe("formatPrice", () => {
  it("formats a number as Korean won", () => {
    expect(formatPrice(50000)).toBe("50,000원");
    expect(formatPrice(0)).toBe("0원");
  });

  it("returns a placeholder for a missing price", () => {
    expect(formatPrice(null)).toBe("-");
    expect(formatPrice(undefined)).toBe("-");
  });
});
