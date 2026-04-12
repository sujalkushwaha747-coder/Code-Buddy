import type { ReactNode } from "react";

type StatusTone = "info" | "success" | "error" | "warning";

type StatusBannerProps = {
  tone?: StatusTone;
  title?: string;
  message: string;
  className?: string;
  action?: ReactNode;
};

const toneClasses: Record<StatusTone, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

const StatusBanner = ({
  tone = "info",
  title,
  message,
  className = "",
  action,
}: StatusBannerProps) => (
  <div className={`rounded-2xl border px-4 py-3 ${toneClasses[tone]} ${className}`.trim()}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        <p className="text-sm leading-6">{message}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  </div>
);

export default StatusBanner;
