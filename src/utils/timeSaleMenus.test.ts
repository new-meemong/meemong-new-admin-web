import { describe, expect, it } from "vitest";

import { formatReservationTime } from "@/utils/timeSaleMenus";

describe("formatReservationTime", () => {
  it("formats compact HHmm values", () => {
    expect(formatReservationTime("0930")).toBe("09:30");
  });

  it("normalizes colon-separated values", () => {
    expect(formatReservationTime("09:30")).toBe("09:30");
    expect(formatReservationTime("09:30:00")).toBe("09:30");
  });

  it("keeps an unknown value unchanged", () => {
    expect(formatReservationTime("9:30")).toBe("9:30");
  });
});
