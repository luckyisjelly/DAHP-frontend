import type { AssetType } from "@/types/api";

interface Props {
  type: AssetType;
  size?: number;
  className?: string;
}

export function AssetTypeIcon({ type, size = 20, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (type) {
    case "ACCOUNT":
      // shield-like icon
      return (
        <svg {...common}>
          <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
        </svg>
      );
    case "FILE":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case "MESSAGE":
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9 9h.01M15 9h.01M9 13a3 3 0 0 0 6 0" />
        </svg>
      );
  }
}
