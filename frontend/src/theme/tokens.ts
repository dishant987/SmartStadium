export const colors = {
  pitch: {
    night: "#030712",    // Ultra-dark stadium night background (Tailwind Gray 950)
    surface: "#0f172a",  // Slate 900 for card backgrounds
    raised: "#1e293b",   // Slate 800 for inputs/hover states
  },
  floodlight: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fbbf24",      // Bright neon yellow (stadium lights)
    300: "#f59e0b",
    400: "#d97706",
    500: "#b45309",
  },
  pitchGreen: {
    400: "#10b981",      // Emerald green (pitch grass)
    500: "#059669",      // Vibrant green
    600: "#047857",
  },
  alert: {
    red: "#f43f5e",      // Soft red
    orange: "#f97316",
  },
  text: {
    primary: "#f9fafb",  // Ice white
    secondary: "#9ca3af", // Cool gray
    muted: "#6b7280",    // Muted gray
  },
  border: "rgba(255, 255, 255, 0.08)", // Thin glass border
} as const;

export const typography = {
  display: "'Inter Tight', system-ui, sans-serif",
  ui: "'Inter', system-ui, sans-serif",
  size: {
    data: "0.6875rem",
    dataSm: "0.75rem",
    dataMd: "0.8125rem",
    body: "0.875rem",
    bodyLg: "1rem",
    h3: "1.125rem",
    h2: "1.25rem",
    h1: "1.5rem",
  },
  weight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export const radius = {
  data: "6px",
  fan: "12px",
  pill: "9999px",
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
} as const;

export const shadow = {
  data: "0 4px 20px -2px rgba(0,0,0,0.5)",
  modal: "0 20px 50px -12px rgba(0,0,0,0.8)",
  toast: "0 10px 30px -5px rgba(0,0,0,0.6)",
} as const;

// ponytail: signature visual element — pitch-mark indicator (circle + line)
// used sparingly on "live" status badges and active-state markers
export const pitchMark = {
  size: "8px",
  lineHeight: "2px",
  color: "#10b981", // Emerald pitch green
} as const;

