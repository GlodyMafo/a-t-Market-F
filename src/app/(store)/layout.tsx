import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { CategoryBar } from "@/components/navigation/CategoryBar";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col pb-28 md:pb-0">
      <TopBar />
      <Header />
      <CategoryBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}