import { z } from "zod";
import { ApiError } from "@/apis/core";

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "필수 입력입니다.")
    .max(max, `${max}자 이하로 입력해주세요.`);
const amount = z.coerce
  .number()
  .int("정수로 입력해주세요.")
  .min(1, "1 이상 입력해주세요.")
  .max(2147483647);
export const registrationNumberSchema = z
  .string()
  .trim()
  .regex(
    /^(\d{10}|\d{3}-\d{2}-\d{5})$/,
    "사업자등록번호 10자리를 입력해주세요.",
  )
  .transform((value) => value.replaceAll("-", ""));
export const grantFormSchema = z.object({
  businessName: text(100),
  businessRegistrationNumber: registrationNumberSchema,
  mongAmount: amount,
  adminDescription: text(2000),
});
const recipient = z.object({
  displayName: text(100),
  phone: z
    .string()
    .trim()
    .min(10, "전화번호를 확인해주세요.")
    .max(20)
    .regex(/^0[\d -]+$/, "0으로 시작하는 전화번호를 입력해주세요."),
});
export const distributionFormSchema = z.object({
  title: text(255),
  adminDescription: text(255),
  owner: z.object({ displayName: z.string(), phone: z.string() }),
  recipientList: z.array(recipient.extend({ amount })).max(100),
});
export function validateDistribution(
  values: z.infer<typeof distributionFormSchema>,
  balance: number,
) {
  const sum = values.recipientList.reduce(
    (total, item) => total + item.amount,
    0,
  );
  if (sum > balance) throw new Error("직원 분배 합계가 잔여 몽을 초과합니다.");
  const owner = sum < balance ? recipient.parse(values.owner) : undefined;
  const recipients = [...values.recipientList, ...(owner ? [owner] : [])];
  const identities = recipients.map(
    (item) => `${item.displayName.trim()}\n${item.phone.replace(/[ -]/g, "")}`,
  );
  if (new Set(identities).size !== identities.length)
    throw new Error(
      "같은 수령자가 중복되었습니다. 원장님은 직원 목록에서 제외해주세요.",
    );
  return {
    title: values.title,
    adminDescription: values.adminDescription,
    recipientList: values.recipientList,
    ...(owner ? { owner } : {}),
  };
}
const messages: Record<string, string> = {
  MONG_RECIPIENT_NOT_FOUND:
    "닉네임과 전화번호가 일치하는 회원이 없습니다. 입력 정보를 확인해주세요.",
  AMBIGUOUS_MONG_RECIPIENT:
    "동일한 정보의 회원이 여러 명입니다. 회원 정보를 확인해주세요.",
  DUPLICATE_MONG_RECIPIENT:
    "동일 회원이 중복되었습니다. 수령자 목록을 확인해주세요.",
  MONG_OWNER_REQUIRED:
    "잔여 몽을 받을 원장님의 닉네임과 전화번호를 입력해주세요.",
  BUSINESS_MONG_ALREADY_DISTRIBUTED:
    "이미 분배한 지급 건입니다. 분배 이력을 확인해주세요.",
  NOT_ENOUGH_BUSINESS_MONG:
    "잔여 몽이 부족합니다. 최신 잔액을 조회하고 수량을 조정해주세요.",
  DISTRIBUTION_REQUEST_CONFLICT:
    "기존 요청과 내용이 다릅니다. 원래 요청 키와 분배 이력을 운영 담당자가 확인해주세요.",
  DUPLICATE_GRANT_REQUEST_KEY:
    "이미 등록된 요청 키입니다. 처리 결과 확인으로 지급 건을 찾아주세요.",
};
export function businessMongError(error: unknown) {
  if (error instanceof z.ZodError)
    return error.issues[0]?.message ?? "입력 내용을 확인해주세요.";
  if (error instanceof ApiError && error.code && messages[error.code])
    return `${messages[error.code]} (${error.message})`;
  return error instanceof Error
    ? error.message
    : "처리 중 오류가 발생했습니다.";
}
// 통신 장애/서버 오류/충돌은 성공 여부가 불명확하므로 원래 요청을 보존한다.
export function canReleaseBusinessMongGrantRequest(
  error: unknown,
  wasPending: boolean,
) {
  return (
    !wasPending &&
    error instanceof ApiError &&
    ([400, 401, 403, 404, 422].includes(error.status) ||
      error.code === "NOT_ENOUGH_BUSINESS_MONG")
  );
}

// 서버가 같은 키의 성공 이력을 먼저 확인한 뒤 반환하는 확정 거절만 해제한다.
// 재시도의 인증 오류·통신 장애·충돌은 성공 여부를 증명하지 못한다.
export function canReleaseBusinessMongDistributionRequest(
  error: unknown,
  wasPending: boolean,
) {
  if (!(error instanceof ApiError)) return false;
  if (
    (error.status === 400 &&
      [
        "MONG_RECIPIENT_NOT_FOUND",
        "AMBIGUOUS_MONG_RECIPIENT",
        "DUPLICATE_MONG_RECIPIENT",
        "MONG_OWNER_REQUIRED",
      ].includes(error.code ?? "")) ||
    (error.status === 409 && error.code === "NOT_ENOUGH_BUSINESS_MONG")
  )
    return true;
  return !wasPending && [400, 401, 403, 404, 422].includes(error.status);
}
