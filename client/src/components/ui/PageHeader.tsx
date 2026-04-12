import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

const PageHeader = ({
  title,
  description,
  actions,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}: PageHeaderProps) => (
  <section
    className={`rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur ${className}`.trim()}
  >
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1
          className={`text-3xl font-semibold tracking-tight text-slate-900 ${titleClassName}`.trim()}
        >
          {title}
        </h1>
        <p
          className={`mt-3 max-w-3xl text-sm leading-6 text-slate-600 ${descriptionClassName}`.trim()}
        >
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  </section>
);

export default PageHeader;
