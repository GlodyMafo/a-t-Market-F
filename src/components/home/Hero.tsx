import { HeroCarousel } from "./HeroCarousel";
import { NewArrivalsTile } from "./NewArrivalsTile";
import { QuoteTile } from "./QuoteTile";

export function Hero() {
  return (
    <section aria-label="Offres" className="mx-auto grid max-w-7xl gap-3 px-4 pt-4 lg:grid-cols-[2fr_1fr]">
      <HeroCarousel />
      {/* Sur lg, le bloc de droite est absolu dans une cellule qui prend la hauteur du carrousel :
          les deux tuiles se partagent exactement cette hauteur, quel que soit leur contenu. */}
      <div className="relative min-h-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:absolute lg:inset-0 lg:grid-cols-1 lg:grid-rows-2">
          <NewArrivalsTile />
          <QuoteTile />
        </div>
      </div>
    </section>
  );
}