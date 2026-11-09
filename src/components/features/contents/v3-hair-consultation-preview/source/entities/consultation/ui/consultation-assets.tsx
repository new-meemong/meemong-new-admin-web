import Image from 'next/image';

// Default to the exported SVG viewport; explicit sizes preserve its aspect ratio.
const assets = {
  newDot: ['03ada.svg', 8, 8],
  quick: ['72a3a.svg', 26, 24.1132],
  progress: ['fddef.svg', 24, 24],
  tooltipArrow: ['c095f.svg', 10, 7.1132],
  closeInverse: ['a8309.svg', 12, 12],
  help: ['4111d.svg', 20, 20],
  chevron: ['45e44.svg', 16, 16],
  plus: ['a8003.svg', 16, 16],
  nudgeArrow: ['95508.svg', 8, 5.19722],
  complete: ['9042f.svg', 20, 20],
  deep: ['d1462.svg', 40, 40],
  star: ['734a2.svg', 20, 20],
  close: ['a8309.svg', 12, 12],
  checkOff: ['0f231.svg', 12, 12],
  checkOn: ['0f231.svg', 12, 12],
  numberOne: ['4e87d.svg', 20, 20],
  smallChevron: ['d9f3d.svg', 12, 12],
  chevronFill: ['chevron-right-fill-12.svg', 12, 12],
  reload: ['reload-line.svg', 20, 20],
  edit: ['a38d1.svg', 12, 12],
  statsSummary: ['stats-summary.svg', 32, 32],
  statsLock: ['stats-lock.svg', 20, 20],
  statsNoConsent: ['stats-no-consent.svg', 12, 12],
  rankSparkle: ['rank-sparkle.svg', 12, 12],
  rankFirst: ['rank-first.svg', 32, 32],
  rankSecond: ['rank-second.svg', 32, 32],
  rankThird: ['rank-third.svg', 32, 32],
  dot1: ['3056e.svg', 8, 8],
  dot2: ['3056e.svg', 8, 8],
  dot3: ['3056e.svg', 8, 8],
} as const;

export function ConsultationAsset({
  name,
  className,
  tone,
  size,
}: {
  name: keyof typeof assets;
  className?: string;
  tone?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
  /** Display width in pixels; the exported aspect ratio is preserved. */
  size?: number;
}) {
  const [file, intrinsicWidth, intrinsicHeight] = assets[name];
  const width = size ?? intrinsicWidth;
  const height = size === undefined ? intrinsicHeight : (size * intrinsicHeight) / intrinsicWidth;
  // Recolor the same exported shape instead of adding color-only SVG copies.
  if (tone || name === 'close' || name === 'checkOn') {
    const mask = `url(/v3-hair-preview/assets/consultation/${file}) center / contain no-repeat`;
    return (
      <span
        aria-hidden
        className={className}
        style={{
          display: 'inline-block',
          width,
          height,
          flexShrink: 0,
          backgroundColor:
            tone === 'primary'
              ? 'var(--color-icon-primary)'
              : tone === 'secondary'
                ? 'var(--color-icon-secondary)'
                : tone === 'tertiary' || name === 'close'
                  ? 'var(--color-icon-tertiary)'
                  : 'var(--color-icon-inverse)',
          mask,
          WebkitMask: mask,
        }}
      />
    );
  }
  return (
    <Image
      src={`/v3-hair-preview/assets/consultation/${file}`}
      width={width}
      height={height}
      alt=""
      aria-hidden
      className={className}
      unoptimized
    />
  );
}
