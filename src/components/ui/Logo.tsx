import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="A&T Market, accueil" className="flex shrink-0 items-center gap-2">
      <Image src="/images/logo.png" alt="" width={36} height={36} priority className="h-9 w-9 object-contain" />
      <span className={cn("font-display text-lg font-extrabold tracking-tight text-brand-500", compact && "hidden sm:inline")}>
        A&amp;T Market
      </span>
    </Link>
  );
}