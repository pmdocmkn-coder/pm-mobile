/**
 * PM Mobile — Design Token Contract
 * Inspired by: SuperWallet/Meditation App UI (purple/teal, clean white, rounded)
 * All components MUST use these tokens. No hardcoded values allowed.
 */

export const Colors = {
  // ── Brand ──────────────────────────────────────────────────────
  primary:       "#7B6FE8",   // Purple utama
  primaryLight:  "#EAE8FC",   // Purple muda (background chip/badge)
  primaryDark:   "#5A4FD1",   // Purple gelap (pressed state)

  secondary:     "#4DD9C0",   // Teal/cyan aksen
  secondaryLight:"#E0F7F4",

  // ── Neutrals ───────────────────────────────────────────────────
  white:         "#FFFFFF",
  background:    "#F8F9FE",   // Background halaman
  surface:       "#FFFFFF",   // Background card
  border:        "#EFEFEF",
  divider:       "#F5F5F5",

  // ── Text ───────────────────────────────────────────────────────
  textPrimary:   "#1A1A2E",
  textSecondary: "#9E9E9E",
  textMuted:     "#C4C4C4",
  textOnPrimary: "#FFFFFF",

  // ── Semantic ───────────────────────────────────────────────────
  success:       "#00C48C",
  successLight:  "#E0F7F0",
  warning:       "#FFB800",
  warningLight:  "#FFF8E0",
  error:         "#FF6B6B",
  errorLight:    "#FFE8E8",
  info:          "#4DD9C0",
  infoLight:     "#E0F7F4",

  // ── Call Record Specific ───────────────────────────────────────
  callNormal:    "#00C48C",   // Close reason 0 - Normal/Complete
  callTEBusy:    "#FF6B6B",   // Close reason 1 - TE Busy
  callSysBusy:   "#FFB800",   // Close reason 2 - System Busy
  callOthers:    "#7B6FE8",   // Close reason 3+ - Others
} as const;

export const Spacing = {
  xs:      4,
  sm:      8,
  md:      12,
  lg:      16,
  xl:      20,
  xxl:     24,
  xxxl:    32,
  section: 40,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
} as const;

export const Typography = {
  xs:        10,
  sm:        12,
  md:        14,
  lg:        16,
  xl:        18,
  xxl:       22,
  xxxl:      28,
  display:   36,

  regular:   "400" as const,
  medium:    "500" as const,
  semibold:  "600" as const,
  bold:      "700" as const,
  extrabold: "800" as const,
} as const;

export const Shadow = {
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: "#7B6FE8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#7B6FE8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: "#7B6FE8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// Helper: get color for call close reason
export const getReasonColor = (reason: number): string => {
  switch (reason) {
    case 0: return Colors.callNormal;
    case 1: return Colors.callTEBusy;
    case 2: return Colors.callSysBusy;
    default: return Colors.callOthers;
  }
};
