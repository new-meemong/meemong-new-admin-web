import { describe, expect, it } from "vitest";

import {
  formatReservationTime,
  formatTimeSaleMenuAppTreatmentType,
  formatTimeSaleMenuAnalysisTreatmentType,
  formatTimeSaleMenuReservationRate,
} from "@/utils/timeSaleMenus";

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

describe("formatTimeSaleMenuReservationRate", () => {
  it("converts the server fraction into a percentage", () => {
    expect(formatTimeSaleMenuReservationRate(0.125)).toBe("12.5%");
    expect(formatTimeSaleMenuReservationRate(0)).toBe("0%");
    expect(formatTimeSaleMenuReservationRate(0.123456)).toBe("12.35%");
    expect(formatTimeSaleMenuReservationRate(undefined)).toBe("-");
  });
});

describe("treatment display contracts", () => {
  it("preserves distinct server categories while exposing Flutter display aliases", () => {
    expect(formatTimeSaleMenuAppTreatmentType("두피케어")).toBe("헤드스파");
    expect(formatTimeSaleMenuAnalysisTreatmentType("두피케어")).toBe(
      "두피케어 (앱: 헤드스파)",
    );
    expect(formatTimeSaleMenuAnalysisTreatmentType("헤드스파")).toBe(
      "헤드스파",
    );
    expect(formatTimeSaleMenuAnalysisTreatmentType("커트")).toBe(
      "커트 (앱: 컷트)",
    );
    expect(formatTimeSaleMenuAnalysisTreatmentType("네일")).toBe("네일");
    expect(formatTimeSaleMenuAnalysisTreatmentType(null)).toBe("-");
  });
});
