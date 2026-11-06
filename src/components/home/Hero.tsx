import { sideTiles } from "@/constants/banners";
import { BannerCard } from "./BannerCard";
import { HeroCarousel } from "./HeroCarousel";

export function Hero() {
  return (
    <section aria-label="Offres" className="mx-auto grid max-w-7xl gap-3 px-4 pt-4 lg:grid-cols-[2fr_1fr]">
      <HeroCarousel />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {sideTiles.map((tile) => (
          <BannerCard key={tile.id} banner={tile} size="small" />
        ))}
      </div>
    </section>
  );
}