/** Current Flutter MeemongTypography tokens, expressed at their unscaled design sizes. */
export const MeemongTypography = {
  display1Bold: 'meemong-display1-bold',
  display2Bold: 'meemong-display2-bold',
  display3Bold: 'meemong-display3-bold',
  heading1Bold: 'meemong-heading1-bold',
  heading2Bold: 'meemong-heading2-bold',
  heading3Bold: 'meemong-heading3-bold',
  heading3SemiBold: 'meemong-heading3-semi-bold',
  title1SemiBold: 'meemong-title1-semi-bold',
  title2SemiBold: 'meemong-title2-semi-bold',
  title3SemiBold: 'meemong-title3-semi-bold',
  title4SemiBold: 'meemong-title4-semi-bold',
  body1Regular: 'meemong-body1-regular',
  body2Regular: 'meemong-body2-regular',
  body2Medium: 'meemong-body2-medium',
  body3Regular: 'meemong-body3-regular',
  body4Regular: 'meemong-body4-regular',
  body5Regular: 'meemong-body5-regular',
  caption1SemiBold: 'meemong-caption1-semi-bold',
  caption2Medium: 'meemong-caption2-medium',
  caption3SemiBold: 'meemong-caption3-semi-bold',
} as const;

export type MeemongTypographyKey = keyof typeof MeemongTypography;
