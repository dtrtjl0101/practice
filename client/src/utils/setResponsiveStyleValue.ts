export function setResponsiveStyleValueSm<T>(
  sm: T,
  md: T
): {
  xs: T;
  sm: T;
  md: T;
  lg: T;
  xl: T;
} {
  return {
    xs: sm,
    sm: sm,
    md: md,
    lg: md,
    xl: md,
  };
}
