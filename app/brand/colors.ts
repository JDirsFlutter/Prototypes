// Source: Figma "Stars UI Toolkit" (file PWHAQuZxpzMUoTFeVwX1O7), synced 2026-05-18.
// Names mirror the Figma style names. Prefer Tailwind classes (bg-ps-primary, text-ps-grey-70, etc.)
// in components; import these constants only for inline styles, SVG fills, or chart palettes.

export const psColors = {
  brand: {
    red: "#D70A0A",
  },
  primary: {
    base: "#F4FFFD",
    lighterAlt: "#91F2E0",
    lighter: "#36E7C7",
    light: "#06D6AE",
    primary: "#02BD9C",
    darker: "#089B80",
  },
  greys: {
    white: "#FFFFFF",
    grey10: "#F5F5F5",
    grey20: "#E0E0E0",
    grey30: "#DDDDDD",
    grey40: "#C0C0C0",
    grey41: "#BFBFBF", // new design system; disabled state
    grey50: "#999999",
    grey60: "#666666",
    grey69: "#575757", // new design system; disabled state
    grey70: "#525252",
    black: "#000000",
  },
  status: {
    success: "#089B80",
    successBase: "#F5FCFB",
    error: "#D70022",
    errorBase: "#FCF5F6",
    warning: "#CC3600",
    warningBase: "#FFF4EF",
    info: "#00599E",
    infoBase: "#F5FAFB",
    bonus: "#572CA4",
    bonusBase: "#F5EFFE",
  },
} as const;

export type PsColorGroup = keyof typeof psColors;
