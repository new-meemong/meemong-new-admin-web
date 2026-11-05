import { z } from "zod";
import { BusinessMongPresetValues } from "@/apis/businessMong";
const integer = (min: number) =>
  z.coerce
    .number()
    .int("정수로 입력해주세요.")
    .min(min, `${min} 이상 입력해주세요.`)
    .max(2147483647, "2,147,483,647 이하로 입력해주세요.");
export const businessMongPresetSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "상품명을 입력해주세요.")
      .max(100, "100자 이하로 입력해주세요."),
    mongBaseAmount: integer(1),
    mongBonusAmount: integer(0),
    supplyAmountKRW: integer(1),
    sortOrder: integer(0),
    isHidden: z.boolean(),
  })
  .refine(
    (values) => values.mongBaseAmount + values.mongBonusAmount <= 2147483647,
    {
      path: ["mongBonusAmount"],
      message: "기본 몽과 보너스 몽의 합은 2,147,483,647 이하여야 합니다.",
    },
  );
export function changedBusinessMongPresetFields(
  previous: BusinessMongPresetValues,
  values: BusinessMongPresetValues,
): Partial<BusinessMongPresetValues> {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) =>
        value !== previous[key as keyof BusinessMongPresetValues],
    ),
  );
}
