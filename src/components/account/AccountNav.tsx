"use client";

import { FileText, LogOut, User,ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/authentication/useLogout";
import { cn } from "@/lib/utils";

const items = [
    { href: "/account", label: "Mon profil", icon: User },
    { href: "/account/quotes", label: "Mes devis", icon: FileText },
] as const;

export function AccountNav() {
    const pathname = usePathname();
    const logout = useLogout();
    const link = "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm";

    return (
        <>
            {pathname !== "/account" && (
                <Link href="/account" className="mb-2 flex items-center gap-1 text-sm font-medium text-brand-600 md:hidden">
                    <ChevronLeft className="h-4 w-4" aria-hidden /> Mon compte
                </Link>
            )}
            <nav aria-label="Mon compte" className="hidden md:block">
                <ul className="flex flex-col gap-1">
                    {items.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(link, active ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-surface")}
                                >
                                    <Icon className="h-4 w-4" aria-hidden /> {label}
                                </Link>
                            </li>
                        );
                    })}
                    <li>
                        <button type="button" onClick={logout} className={cn(link, "w-full text-muted hover:bg-surface hover:text-sale")}>
                            <LogOut className="h-4 w-4" aria-hidden /> Se déconnecter
                        </button>
                    </li>
                </ul>
            </nav>
        </>
    );
}