import { describe, expect, it } from "vitest";
import {
  businessMongPresetSchema,
  changedBusinessMongPresetFields,
} from "./preset-validation";
const values = {
  title: "상품",
  mongBaseAmount: 100,
  mongBonusAmount: 10,
  supplyAmountKRW: 1001,
  sortOrder: 0,
  isHidden: false,
};
describe("business mong preset input", () => {
  it("accepts zero bonus/order and strips computed fields", () => {
    expect(
      businessMongPresetSchema.parse({
        ...values,
        mongBonusAmount: 0,
        mongAmount: 999,
        paymentAmountKRW: 1,
      }),
    ).toEqual({ ...values, mongBonusAmount: 0 });
  });
  it.each([
    { title: " " },
    { mongBaseAmount: 0 },
    { mongBonusAmount: -1 },
    { supplyAmountKRW: 0 },
    { sortOrder: 0.5 },
    { mongBaseAmount: 2147483647, mongBonusAmount: 1 },
  ])("rejects invalid input %o", (invalid) => {
    expect(
      businessMongPresetSchema.safeParse({ ...values, ...invalid }).success,
    ).toBe(false);
  });
  it("sends only changed editable fields, including false and zero", () => {
    expect(
      changedBusinessMongPresetFields(
        { ...values, isHidden: true, sortOrder: 5 },
        values,
      ),
    ).toEqual({ isHidden: false, sortOrder: 0 });
    expect(changedBusinessMongPresetFields(values, values)).toEqual({});
  });
});
