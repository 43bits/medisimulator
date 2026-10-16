/**
 * Meridian design tokens — React Native translation of globals.css
 * Light and dark palettes exactly matching the web frontend.
 */

export const LightColors = {
  // Brand
  brand:             '#2563a8',
  brandStrong:       '#1a4f8f',
  pulse:             '#38bdf8',

  // Surfaces
  background:        '#f5fbff',
  surface1:          '#ffffff',
  surface2:          '#f0f6fc',
  surface3:          '#e6f0f8',
  card:              '#ffffff',

  // Text
  foreground:        '#1e2d45',
  cardForeground:    '#1e2d45',
  mutedForeground:   '#6b7c99',
  subtleForeground:  '#8b9ab5',

  // Interactive
  primary:           '#2563a8',
  primaryForeground: '#fafcff',
  secondary:         '#e5effa',
  secondaryForeground: '#2e4a72',
  accent:            '#e2edf5',
  accentForeground:  '#2a4570',

  // Status
  success:           '#16a34a',
  successSoft:       '#dcfce7',
  warning:           '#d97706',
  warningSoft:       '#fef9c3',
  destructive:       '#dc2626',
  destructiveSoft:   '#fee2e2',
  destructiveForeground: '#fafcff',
  info:              '#2563a8',
  infoSoft:          '#eff6ff',

  // Lines
  border:            '#d0dff0',
  borderStrong:      '#b0c8e0',
  input:             '#d0dff0',
  ring:              '#3b82c4',

  // Muted bg
  muted:             '#eaf2f8',

  // Charts
  chart1:            '#2d70b8',
  chart2:            '#06b6d4',
  chart3:            '#16a34a',
  chart4:            '#9333ea',
  chart5:            '#d97706',

  // Module accents
  moduleClinical:    '#2d70b8',
  moduleDiagnostics: '#0ea5c8',
  modulePharmacy:    '#16a34a',
  moduleFinance:     '#7c3aed',
  moduleInpatient:   '#4f46e5',
  moduleOperations:  '#b45309',
  moduleAdmin:       '#475569',
};

export const DarkColors: typeof LightColors = {
  brand:             '#60a5d8',
  brandStrong:       '#7ec0e8',
  pulse:             '#67d5f5',

  background:        '#000000',
  surface1:          '#171c26',
  surface2:          '#1d222e',
  surface3:          '#232838',
  card:              '#171c26',

  foreground:        '#fafafa',
  cardForeground:    '#fafafa',
  mutedForeground:   '#8a9ab5',
  subtleForeground:  '#5a6a85',

  primary:           '#60a5d8',
  primaryForeground: '#0a0f18',
  secondary:         '#1d222e',
  secondaryForeground: '#e8f0fc',
  accent:            '#1d222e',
  accentForeground:  '#e8f0fc',

  success:           '#22c55e',
  successSoft:       '#052e16',
  warning:           '#f59e0b',
  warningSoft:       '#1c1200',
  destructive:       '#ef4444',
  destructiveSoft:   '#2a0a0a',
  destructiveForeground: '#fafafa',
  info:              '#60a5d8',
  infoSoft:          '#0d1e38',

  border:            '#272d3d',
  borderStrong:      '#343c52',
  input:             '#2d3344',
  ring:              '#4a90c8',

  muted:             '#1f2430',

  chart1:            '#60a5d8',
  chart2:            '#22d3ee',
  chart3:            '#22c55e',
  chart4:            '#a855f7',
  chart5:            '#f59e0b',

  moduleClinical:    '#60a5d8',
  moduleDiagnostics: '#22d3ee',
  modulePharmacy:    '#22c55e',
  moduleFinance:     '#a855f7',
  moduleInpatient:   '#818cf8',
  moduleOperations:  '#f59e0b',
  moduleAdmin:       '#94a3b8',
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const Radius = {
  sm:   8,
  md:   10,
  lg:   12,
  xl:   18,
  '2xl': 24,
  full: 9999,
};

export const FontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};

export const FontWeight = {
  normal:    '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

export const LineHeight = {
  tight:  1.2,
  normal: 1.5,
  relaxed: 1.7,
};

/** Map roleCode → module accent color key */
export function moduleColorForRole(
  roleCode: string | null | undefined,
  colors: typeof LightColors,
): string {
  switch (roleCode) {
    case 'DOCTOR':
    case 'CLINICIAN':
    case 'NURSE':
    case 'TRIAGE_NURSE':
    case 'IPD_NURSE':
    case 'WARD_MANAGER':
      return colors.moduleClinical;
    case 'LAB_TECHNICIAN':
    case 'LAB_MANAGER':
      return colors.moduleDiagnostics;
    case 'PHARMACIST':
    case 'PHARMACY_MANAGER':
      return colors.modulePharmacy;
    case 'CASHIER':
    case 'BILLING_OFFICER':
      return colors.moduleFinance;
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'FACILITY_ADMIN':
    case 'BRANCH_ADMIN':
      return colors.moduleAdmin;
    default:
      return colors.brand;
  }
}
