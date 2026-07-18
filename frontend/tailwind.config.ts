import type { Config } from "tailwindcss";
import { colors, radius, spacing, typography, shadow } from "./src/theme/tokens";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: [typography.display],
        ui: [typography.ui],
      },
      fontSize: {
        data: typography.size.data,
        "data-sm": typography.size.dataSm,
        "data-md": typography.size.dataMd,
        body: typography.size.body,
        "body-lg": typography.size.bodyLg,
      },
      colors: {
        pitch: {
          night: colors.pitch.night,
          surface: colors.pitch.surface,
          raised: colors.pitch.raised,
        },
        floodlight: colors.floodlight,
        "pitch-green": colors.pitchGreen,
        alert: colors.alert,
        "text-primary": colors.text.primary,
        "text-secondary": colors.text.secondary,
        "text-muted": colors.text.muted,
        border: colors.border,
      },
      borderRadius: {
        data: radius.data,
        fan: radius.fan,
        pill: radius.pill,
      },
      spacing: {
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
      },
      boxShadow: {
        data: shadow.data,
        modal: shadow.modal,
        toast: shadow.toast,
      },
    },
  },
  plugins: [],
} satisfies Config;
