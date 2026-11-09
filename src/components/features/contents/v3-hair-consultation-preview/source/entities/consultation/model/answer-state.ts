import type { AnswerPreview, Purchase, ResponseRecord } from '../api/contracts';

export function textValue(record: ResponseRecord, key: string): string {
  return typeof record[key] === 'string' ? record[key] : '';
}
export function textValues(record: ResponseRecord, key: string): string[] {
  return Array.isArray(record[key])
    ? record[key].filter((v): v is string => typeof v === 'string')
    : [];
}
export function answerPriceText(record: ResponseRecord): string | undefined {
  const valid = (n: unknown): n is number =>
    Number.isInteger(n) && Number(n) >= 10000 && Number(n) <= 1000000;
  const format = (n: number) => n.toLocaleString('ko-KR');
  if (record.priceType === 'SINGLE' && valid(record.price)) return `${format(record.price)}원`;
  if (
    record.priceType === 'RANGE' &&
    valid(record.minPrice) &&
    valid(record.maxPrice) &&
    record.minPrice <= record.maxPrice
  )
    return `${format(record.minPrice)}~${format(record.maxPrice)}원`;
  return undefined;
}

export function priceLabel(record: ResponseRecord): string {
  return answerPriceText(record) ?? '견적 정보 미확인';
}
/** A bundle contains three unpurchased, unread PAID answers from one round; overflow stays free. */
export function bundleFor(answers: AnswerPreview[], selectedId: number): number[] {
  const selected = answers.find((a) => a.id === selectedId);
  if (!selected || selected.accessType !== 'PAID' || selected.canRead || selected.firstReadAt)
    return [];
  const round = selected.v3HairConsultationRoundId;
  if (!Number.isSafeInteger(round)) return [];
  const available = answers.filter(
    (a) =>
      a.accessType === 'PAID' &&
      a.canRead === false &&
      !a.firstReadAt &&
      a.v3HairConsultationRoundId === round,
  );
  const group = [selected, ...available.filter((a) => a.id !== selectedId)].slice(0, 3);
  return group.length === 3 ? group.map((a) => a.id) : [];
}
export function purchaseAvailable(purchase: Purchase) {
  return (
    purchase.validationStatus === 'success' &&
    purchase.fulfillmentStatus === 'AVAILABLE' &&
    !purchase.refundAt
  );
}
export function purchaseLabel(purchase: Purchase) {
  if (purchase.refundAt) return '환불됨';
  if (purchase.fulfillmentStatus === 'UNAVAILABLE')
    return '구매한 내용을 제공할 수 없습니다. 거래 확인이 필요해요.';
  if (purchaseAvailable(purchase))
    return purchase.finishPending ? '열람 가능 · 스토어 처리 확인 중' : '열람 가능';
  if (purchase.validationStatus === 'fail') return '거래 취소 또는 확인 실패';
  return '거래 확인 중';
}
