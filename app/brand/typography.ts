// Source: Figma "Stars UI Toolkit" (file PWHAQuZxpzMUoTFeVwX1O7), synced 2026-05-18.
// Druk Text is PokerStars' display face (proprietary). Roboto is the UI face (Google Fonts, loaded via next/font).
// Prefer the .text-ps-* utility classes from globals.css. Import these objects when you need values in JS/TS
// (e.g. dynamic styles, chart labels).

export const psTypography = {
  heading: {
    large:      { family: "display", weight: 500, size: 32, lineHeight: 40 },
    small:      { family: "display", weight: 500, size: 24, lineHeight: 32 },
    extraSmall: { family: "display", weight: 500, size: 20, lineHeight: 28 },
  },
  title: {
    large:            { family: "sans", weight: 500, size: 20, lineHeight: 30 },
    small:            { family: "sans", weight: 500, size: 18, lineHeight: 28 },
    numericalRegular: { family: "sans", weight: 400, size: 24, lineHeight: 28 },
    numericalMedium:  { family: "sans", weight: 500, size: 24, lineHeight: 28 },
  },
  body: {
    regular: { family: "sans", weight: 400, size: 16, lineHeight: 24 },
    medium:  { family: "sans", weight: 500, size: 16, lineHeight: 24 },
    bold:    { family: "sans", weight: 700, size: 16, lineHeight: 24 },
    link:    { family: "sans", weight: 700, size: 16, lineHeight: 24, underline: true },
  },
  label: {
    regular: { family: "sans", weight: 400, size: 15, lineHeight: 24 },
  },
  small: {
    regular: { family: "sans", weight: 400, size: 14, lineHeight: 20 },
    medium:  { family: "sans", weight: 500, size: 14, lineHeight: 20 },
    bold:    { family: "sans", weight: 700, size: 14, lineHeight: 20 },
    link:    { family: "sans", weight: 700, size: 14, lineHeight: 20, underline: true },
  },
  extraSmall: {
    regular: { family: "sans", weight: 400, size: 12, lineHeight: 16 },
    bold:    { family: "sans", weight: 700, size: 12, lineHeight: 16 },
    link:    { family: "sans", weight: 700, size: 12, lineHeight: 16, underline: true },
  },
} as const;
