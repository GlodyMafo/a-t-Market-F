import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  href?: string;
  children: ReactNode;
}

export function Section({ title, href, children }: Props) {
  return (
    <section className="reveal mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-display text-xl font-extrabold tracking-tight md:text-2xl">{title}</h2>
        {href && (
          <Link href={href} className="-my-2 flex items-center gap-0.5 py-2 text-sm font-semibold text-brand-600 hover:underline">
            Voir tout <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}