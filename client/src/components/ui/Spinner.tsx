type SpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

const Spinner = ({ label, size = "md", className = "" }: SpinnerProps) => (
  <div className={`flex items-center gap-3 text-sm text-slate-600 ${className}`.trim()}>
    <span
      className={`inline-block animate-spin rounded-full border-slate-300 border-t-blue-600 ${sizeClasses[size]}`}
      aria-hidden="true"
    />
    {label ? <span>{label}</span> : null}
  </div>
);

export default Spinner;
