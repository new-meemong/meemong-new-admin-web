import type { ResponseRecord } from '../api/contracts';
import { textValue, textValues } from './answer-state';

const scheduleLabels: Record<string, string> = {
  ASAP: '가능한 빨리',
  WITHIN_WEEK: '일주일 이내',
  NEGOTIABLE: '협의 가능',
  CUSTOM: '기타 입력',
};
const exclusiveAnswers: Record<string, { flag: string; label: string }> = {
  wantedTreatments: { flag: 'anyTreatment', label: '뭐든 상관 없어요' },
  additionalTreatments: { flag: 'noAdditionalTreatment', label: '딱히 없어요' },
  unwantedTreatments: { flag: 'noUnwantedTreatment', label: '딱히 없어요' },
};

/** Stored question values, shared by customer and designer readers without profile fallback. */
export function questionSnapshotText(question: ResponseRecord, key: string): string {
  const exclusive = exclusiveAnswers[key];
  // The API makes these flags exclusive with their arrays. Preserve an explicit answer even
  // if an older snapshot contains stale selections; null/unknown flags are not an answer.
  if (exclusive && question[exclusive.flag] === true) return exclusive.label;
  if (key === 'hasExtensionPieces') {
    if (question.hasExtensionPieces === true)
      return ['피스 있음', textValue(question, 'extensionPiecesDescription')]
        .filter(Boolean)
        .join(', ');
    return question.hasExtensionPieces === false ? '피스 없음' : '';
  }
  const text = Array.isArray(question[key])
    ? textValues(question, key).join(', ')
    : textValue(question, key);
  return key === 'desiredDateType' ? (scheduleLabels[text] ?? text) : text;
}

/** QUICK/DEEP request details show custom timing verbatim without the option label. */
export function questionScheduleText(question: ResponseRecord): string {
  return textValue(question, 'desiredDateType') === 'CUSTOM'
    ? textValue(question, 'desiredDateDescription')
    : questionSnapshotText(question, 'desiredDateType') ||
        textValue(question, 'desiredDateDescription');
}
