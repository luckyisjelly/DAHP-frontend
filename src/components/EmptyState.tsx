import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center">
      {icon && <div className="text-slate-500">{icon}</div>}
      <p className="text-base font-medium text-slate-200">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-slate-400">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
