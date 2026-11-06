import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" aria-label="A&T Market, accueil" className="flex shrink-0 items-center gap-2">
      <Image src="/images/logo.png" alt="" width={36} height={36} priority className="h-9 w-9 object-contain" />
      <span className="text-lg font-bold tracking-tight text-brand-500">A&amp;T Market</span>
    </Link>
  );
}