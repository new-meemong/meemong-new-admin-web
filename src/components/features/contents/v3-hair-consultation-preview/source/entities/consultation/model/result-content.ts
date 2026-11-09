import catalogue from './result-catalog.json';
import {
  withObjectParticle,
  withPoliteCopula,
  withSubjectParticle,
} from '@/components/features/contents/v3-hair-consultation-preview/source/shared/lib/korean-particles';

export type ResultCategory = 'face' | 'bangs' | 'length' | 'curl' | 'layer';
export function resultDescription(category: ResultCategory, value: string, sex: string): string {
  if (!['남자', '여자'].includes(sex)) return '';
  const gender = sex === '남자' ? 'Male' : 'Female';
  const key = category === 'layer' ? 'layerFemale' : `${category}${gender}`;
  if (category === 'layer' && sex === '남자') return '';
  const label =
    category === 'bangs' && value === '사이드뱅/커튼뱅'
      ? '사이드뱅·커튼뱅'
      : category === 'length' && sex === '남자' && value === '미디엄 롱'
        ? '미디엄롱'
        : value;
  return (catalogue[key as keyof typeof catalogue] as Record<string, string>)[label] ?? '';
}
export function celebrityNames(shape: string, sex: string) {
  const entry = catalogue.celebrities[shape as keyof typeof catalogue.celebrities];
  return entry ? (sex === '남자' ? entry.male : sex === '여자' ? entry.female : '') : '';
}
export function rankSummary(values: string[], category: 'bangs' | 'length'): string {
  if (values.length < 2) return '';
  const [first, second, third] = values;
  if (values.length > 3) return values.map((value, i) => `${i + 1}순위 ${value}`).join(', ');
  if (values.length === 2)
    return `1순위는 ${first}, 2순위는 ${withPoliteCopula(second)}. ${withObjectParticle(first)} 가장 추천드리고, ${category === 'bangs' ? `${second}도 좋은 대안이 될 수 있어요.` : `지금 길이에서 조금씩 조정하며 ${second}도 시도해볼 수 있어요.`}`;
  return `1순위는 ${first}, 2순위는 ${second}, 3순위는 ${withPoliteCopula(third)}. ${withSubjectParticle(first)} 가장 잘 어울리고, ${second}도 좋은 대안이에요. ${category === 'bangs' ? `완전히 다른 분위기를 원한다면 ${third}도 고려해볼 만해요.` : `원하는 이미지에 따라 ${third}까지 폭넓게 시도해볼 수 있어요.`}`;
}
const faceImages: Record<string, string> = {
  계란형: 'oval',
  '긴 얼굴형': 'long',
  네모형: 'square',
  둥근형: 'round',
  땅콩형: 'peanut',
  마름모형: 'diamond',
  육각형: 'hexagon',
  하트형: 'heart',
};
const bangsImages = {
  남자: ['5705-154025', '5705-154018', '5705-154022', '5705-154020'],
  여자: ['5705-154024', '5705-154023', '5705-154021', '5705-154019'],
};
const lengthImages = {
  남자: ['3046-43693', '3046-43686', '3046-43682', '3046-43692', '3046-43684', '3046-43690'],
  // Export the complete Figma component: raw fills omit its crop, transform and filters.
  여자: [
    '3046-43688-rendered',
    '3046-43689-rendered',
    '3046-43683-rendered',
    '3046-43691-rendered',
    '3046-43685-rendered',
    '3698-80628-rendered',
  ],
};
const bangsLabels = {
  남자: ['덮은 머리', '가른 머리', '넘긴 머리', '올린 머리'],
  여자: ['노 뱅', '사이드뱅/커튼뱅', '시스루뱅', '풀 뱅'],
};
const lengthLabels = {
  남자: ['크롭', '숏', '미디엄', '미디엄 롱', '롱', '장발'],
  여자: ['숏컷', '단발', '중단발', '미디엄', '미디엄 롱', '장발'],
};
export function referenceImage(
  category: 'face' | 'bangs' | 'length',
  value: string,
  sex: string,
): string | undefined {
  if (category === 'face')
    return faceImages[value]
      ? `/v3-hair-preview/assets/consultation/results/face-${faceImages[value]}.webp`
      : undefined;
  if (sex !== '남자' && sex !== '여자') return undefined;
  const index = (category === 'bangs' ? bangsLabels : lengthLabels)[sex].indexOf(value);
  const imageKey = (category === 'bangs' ? bangsImages : lengthImages)[sex][index];
  return imageKey
    ? `/v3-hair-preview/assets/consultation/results/${category === 'bangs' ? 'bang' : 'length'}-${imageKey}.webp`
    : undefined;
}
