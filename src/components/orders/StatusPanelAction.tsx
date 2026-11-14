import Link from "next/link";
import { statusButton } from "@/components/feedback/StatusPanel";

export function StatusPanelAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={statusButton}>
      {label}
    </Link>
  );
}