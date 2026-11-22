import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = { title: "Mon profil" };

export default function ProfilePage() {
  return (
    <section aria-labelledby="profile-title">
      <h1 id="profile-title" className="mb-5 font-display text-2xl font-extrabold tracking-tight">
        Mon profil
      </h1>
      <ProfileForm />
    </section>
  );
}