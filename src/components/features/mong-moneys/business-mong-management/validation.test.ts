import { describe, expect, it } from "vitest";
import { ApiError } from "@/apis/core";
import {
  distributionFormSchema,
  grantFormSchema,
  validateDistribution,
  canReleaseBusinessMongGrantRequest,
  businessMongError,
  canReleaseBusinessMongDistributionRequest,
} from "./validation";

const owner = { displayName: "테스트 원장", phone: "010-0000-0001" };
const base = {
  title: "원장님의 선물",
  adminDescription: "입금 확인",
  owner,
  recipientList: [],
};
describe("one-time business mong distribution validation", () => {
  it("allows owner-only distribution and requires a valid owner for any remainder", () => {
    expect(
      validateDistribution(distributionFormSchema.parse(base), 4500),
    ).toEqual(base);
    expect(() =>
      validateDistribution(
        { ...base, owner: { displayName: "", phone: "" } },
        4500,
      ),
    ).toThrow();
  });
  it("omits the owner when staff receive the entire balance", () => {
    const recipientList = [
      { displayName: "직원", phone: "01000000002", amount: 4500 },
    ];
    expect(validateDistribution({ ...base, recipientList }, 4500)).toEqual({
      title: base.title,
      adminDescription: base.adminDescription,
      recipientList,
    });
  });
  it("rejects overspending and duplicate owner/staff after phone normalization", () => {
    expect(() =>
      validateDistribution(
        { ...base, recipientList: [{ ...owner, amount: 4501 }] },
        4500,
      ),
    ).toThrow("초과");
    expect(() =>
      validateDistribution(
        {
          ...base,
          recipientList: [{ ...owner, phone: "01000000001", amount: 1000 }],
        },
        4500,
      ),
    ).toThrow("중복");
  });
  it("enforces integer quantities and the staff limit", () => {
    for (const amount of [0, -1, 1.5, 2147483648]) {
      expect(
        distributionFormSchema.safeParse({
          ...base,
          recipientList: [{ ...owner, amount }],
        }).success,
      ).toBe(false);
    }
    expect(
      distributionFormSchema.safeParse({
        ...base,
        recipientList: Array.from({ length: 101 }, () => ({
          ...owner,
          amount: 1,
        })),
      }).success,
    ).toBe(false);
  });
  it("normalizes grant registration numbers and enforces required memo and quantity", () => {
    const grant = {
      businessName: " 사업자 ",
      businessRegistrationNumber: "123-45-67890",
      mongAmount: 4500,
      adminDescription: " 입금 ",
    };
    expect(grantFormSchema.parse(grant)).toMatchObject({
      businessName: "사업자",
      businessRegistrationNumber: "1234567890",
      adminDescription: "입금",
    });
    expect(
      grantFormSchema.safeParse({ ...grant, mongAmount: 1.5 }).success,
    ).toBe(false);
    expect(
      grantFormSchema.safeParse({ ...grant, adminDescription: " " }).success,
    ).toBe(false);
  });
  it("retains a previously uncertain request after retry authentication failure", () => {
    expect(
      canReleaseBusinessMongGrantRequest(new ApiError("expired", 401), true),
    ).toBe(false);
    expect(
      canReleaseBusinessMongGrantRequest(new ApiError("expired", 401), false),
    ).toBe(true);
    expect(
      canReleaseBusinessMongGrantRequest(
        new ApiError("balance", 409, "NOT_ENOUGH_BUSINESS_MONG"),
        false,
      ),
    ).toBe(true);
  });
  it("retains uncertain requests and conflicts but permits correcting rejected input", () => {
    expect(
      canReleaseBusinessMongGrantRequest(new TypeError("network"), false),
    ).toBe(false);
    expect(
      canReleaseBusinessMongGrantRequest(new ApiError("server", 500), false),
    ).toBe(false);
    expect(
      canReleaseBusinessMongGrantRequest(
        new ApiError("conflict", 409, "DISTRIBUTION_REQUEST_CONFLICT"),
        false,
      ),
    ).toBe(false);
    expect(
      canReleaseBusinessMongGrantRequest(
        new ApiError("missing", 400, "MONG_RECIPIENT_NOT_FOUND"),
        false,
      ),
    ).toBe(true);
    expect(
      businessMongError(new ApiError("owner", 400, "MONG_RECIPIENT_NOT_FOUND")),
    ).toContain("owner");
  });
});

describe("distribution retry release policy", () => {
  it.each([
    [400, "MONG_RECIPIENT_NOT_FOUND"],
    [400, "AMBIGUOUS_MONG_RECIPIENT"],
    [400, "DUPLICATE_MONG_RECIPIENT"],
    [400, "MONG_OWNER_REQUIRED"],
    [409, "NOT_ENOUGH_BUSINESS_MONG"],
  ])(
    "releases confirmed rejection %s %s after a lost response",
    (status, code) => {
      const error = new ApiError("rejected", status as number, code as string);
      expect(canReleaseBusinessMongDistributionRequest(error, true)).toBe(true);
      expect(canReleaseBusinessMongGrantRequest(error, true)).toBe(false);
    },
  );
  it.each([
    new ApiError("unauthorized", 401),
    new ApiError("forbidden", 403),
    new ApiError("gateway", 502),
    new ApiError("timeout", 504),
    new ApiError("conflict", 409, "DISTRIBUTION_REQUEST_CONFLICT"),
    new ApiError("distributed", 409, "BUSINESS_MONG_ALREADY_DISTRIBUTED"),
    new ApiError("unknown validation", 400, "UNKNOWN"),
    new TypeError("network"),
  ])("preserves uncertain retry: %s", (error) => {
    expect(canReleaseBusinessMongDistributionRequest(error, true)).toBe(false);
  });
});
