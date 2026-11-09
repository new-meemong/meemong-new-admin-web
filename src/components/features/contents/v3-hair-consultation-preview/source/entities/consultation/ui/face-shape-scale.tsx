import Image from 'next/image';
import { MeemongTypography as T } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/styles/typography';

// CST-C/FaceShapeScale 6805:84420: type-level scores, not individual measurements.
const scores: Record<string, readonly number[]> = {
  계란형: [5, 4, 2],
  '긴 얼굴형': [7, 4, 3],
  네모형: [2, 6, 6],
  둥근형: [1, 4, 1],
  땅콩형: [6, 5, 5],
  마름모형: [5, 4, 6],
  육각형: [4, 4, 7],
  하트형: [4, 2, 3],
};
const axes = [
  { name: '얼굴 비율', labels: ['가로형', '세로형'], color: '#cff3f6', marker: 'ratio' },
  { name: '무게 중심', labels: ['상안부', '중안부', '하안부'], color: '#ede1fe', marker: 'weight' },
  { name: '윤곽 형태', labels: ['곡선형', '각진형'], color: '#d3e8ff', marker: 'contour' },
];

export function FaceShapeScale({ shape, locked = false }: { shape?: string; locked?: boolean }) {
  const values = shape ? scores[shape] : undefined;
  if (!locked && !values) return null;
  return (
    <div
      className={`flex flex-col py-4 ${locked ? 'gap-5' : 'gap-3.5'}`}
      aria-label={locked ? '잠긴 얼굴형 척도' : '얼굴형 척도'}
    >
      {axes.map((axis, index) => (
        <div key={axis.name} className="flex items-end gap-3">
          <span className={`shrink-0 ${T.title4SemiBold}`}>{locked ? '???' : axis.name}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {!locked && (
              <div className={`flex justify-between text-text-tertiary ${T.caption2Medium}`}>
                {axis.labels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            )}
            <div
              role={locked ? undefined : 'meter'}
              aria-label={locked ? undefined : axis.name}
              aria-valuemin={locked ? undefined : 1}
              aria-valuemax={locked ? undefined : 7}
              aria-valuenow={locked ? undefined : values![index]}
              className="relative h-5 overflow-hidden rounded-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)]"
              style={{ backgroundColor: axis.color }}
            >
              <div className="absolute inset-y-0 left-2.5 right-2.5 grid grid-cols-6 auto-cols-[0px]">
                {[3, 5].map((column) => (
                  <span
                    key={column}
                    className="row-start-1 h-5 w-px -translate-x-1/2 bg-[url('/v3-hair-preview/assets/consultation/face-scale-guide.svg')] mix-blend-multiply"
                    style={{ gridColumnStart: column }}
                  />
                ))}
                <span
                  className="row-start-1 size-5 -translate-x-1/2"
                  style={{ gridColumnStart: locked ? [3, 6, 4][index] : values![index] }}
                >
                  <Image
                    unoptimized
                    src={`/v3-hair-preview/assets/consultation/face-marker-${axis.marker}.svg`}
                    width={20}
                    height={20}
                    alt=""
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
