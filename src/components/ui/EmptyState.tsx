"use client";

import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function EmptyState({ icon, title, description, actions }: Props) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-sm border p-8 text-center">
      {icon && <div className="flex justify-center mb-4 text-gray-500">{icon}</div>}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-gray-600 mb-6 text-sm leading-relaxed">{description}</p>}
      {actions && <div className="flex items-center justify-center gap-3">{actions}</div>}
    </div>
  );
}

