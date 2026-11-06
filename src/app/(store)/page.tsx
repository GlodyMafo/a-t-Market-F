import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { Hero } from "@/components/home/Hero";
import { ImportSection } from "@/components/home/ImportSection";
import { TrustBar } from "@/components/home/TrustBar";
import { CategorySections } from "@/components/products/CategorySections";
import { ProductSection } from "@/components/products/ProductSection";

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">A&amp;T Market : produits locaux à Lubumbashi et importation depuis SHEIN, NOON et 1688</h1>
      <Hero />
      <CategoryShortcuts />
      <TrustBar />
      <ProductSection title="Nouveautés" href="/products?sort=newest" params={{ sort: "newest", limit: 10 }} layout="scroll" />
      <ImportSection />
      <ProductSection title="Disponibles à Lubumbashi" href="/products" params={{ limit: 10 }} />
      <CategorySections />
    </>
  );
}