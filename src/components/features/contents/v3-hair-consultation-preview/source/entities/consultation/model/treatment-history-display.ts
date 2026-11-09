import type { TreatmentHistory } from '../api/contracts';

type HistorySource = Partial<Record<keyof TreatmentHistory, unknown>>;

/** CST-C/TreatmentHistoryItem 5517:24513/24534: month, self label, area and bleach details. */
export function treatmentHistoryDisplay(history: HistorySource) {
  const date = typeof history.treatmentDate === 'string' ? history.treatmentDate : '';
  const title = typeof history.treatmentType === 'string' ? history.treatmentType.trim() : '';
  const area = typeof history.treatmentArea === 'string' ? history.treatmentArea.trim() : '';
  const count = history.decolorizationCount;
  const details = [
    area ? (/시술$/.test(area) ? area : `${area} 시술`) : '',
    // Zero is a reported count; missing legacy data must not imply no bleaching.
    typeof count === 'number' && Number.isInteger(count) && count >= 0 ? `탈색 ${count}회` : '',
  ].filter(Boolean);
  return {
    date: date.replace(/^(\d{4})-(\d{2})-\d{2}$/, '$1.$2'),
    title: history.isSelf === true && !/\(셀프\)$/.test(title) ? `${title} (셀프)` : title,
    description: details.length ? details.join(' · ') : undefined,
  };
}
