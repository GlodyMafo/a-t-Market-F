import type { Metadata } from "next";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountTiles } from "@/components/account/AccountTiles";
import { MenuRows } from "@/components/account/MenuRows";
import { ProfileCard } from "@/components/account/ProfileCard";
import { VerifyEmailBanner } from "@/components/account/VerifyEmailBanner";

export const metadata: Metadata = { title: "Mon compte" };

export default function AccountPage() {
  return (
    <div className="space-y-4">
      <AccountHeader />
      <VerifyEmailBanner />
      <AccountTiles />
      <MenuRows />
      <div className="hidden md:block">
        <ProfileCard />
      </div>
    </div>
  );
}