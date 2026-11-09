/** Figma customer rows use Km without a trailing .0 (5674:45937). */
export function consultationLocationParts(
  location?: { region: string | null; distanceM: number | null } | null,
) {
  const meters = location?.distanceM;
  return {
    region: location?.region?.trim() || '',
    distance:
      typeof meters === 'number' && Number.isFinite(meters) && meters >= 0
        ? meters < 1000
          ? `${meters}m`
          : `${Number((meters / 1000).toFixed(1))}Km`
        : '',
  };
}
