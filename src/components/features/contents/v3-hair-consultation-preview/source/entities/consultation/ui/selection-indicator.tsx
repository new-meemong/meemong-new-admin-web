import { cn } from '@/components/features/contents/v3-hair-consultation-preview/source/shared/lib/utils';
import { ConsultationAsset } from './consultation-assets';

/** Visual control only: the owning button/input supplies semantics and keyboard handling. */
export function SelectionIndicator({
  selected,
  shape = 'square',
  size = 20,
  variant = 'default',
}: {
  selected: boolean;
  shape?: 'square' | 'round' | 'radio';
  size?: 20 | 24;
  variant?: 'default' | 'profile';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        size === 24 ? 'size-6' : 'size-5',
        shape === 'square' ? 'rounded-6' : 'rounded-full',
        shape === 'radio'
          ? cn(
              'bg-fill-weak border-solid',
              selected
                ? 'border-[6px] border-primitive-gray-800'
                : 'border-2 border-border-regular',
            )
          : selected
            ? 'bg-primitive-gray-800'
            : 'border border-border-regular bg-fill-weak',
      )}
    >
      {shape !== 'radio' &&
        (variant === 'profile' ? (
          // Preserve the exported 16px/12px icon viewport inside its 24px/20px control.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            src={`/v3-hair-preview/assets/consultation/profile-check-${selected ? 'on' : 'off'}-${size === 24 ? 16 : 12}.svg`}
            width={size === 24 ? 16 : 12}
            height={size === 24 ? 16 : 12}
          />
        ) : (
          <ConsultationAsset name={selected ? 'checkOn' : 'checkOff'} />
        ))}
    </span>
  );
}
