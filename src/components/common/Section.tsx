// app/components/common/Section.tsx
"use client";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function Section({ title, children }: Props) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <hr className="my-2 border-gray-400" />
      {children}
    </div>
  );
}
