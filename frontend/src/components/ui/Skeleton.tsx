import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className = "" }: Props) {
  return <div className={`animate-pulse rounded-data bg-pitch-raised ${className}`} />;
}
