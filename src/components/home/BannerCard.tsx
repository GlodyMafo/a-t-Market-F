import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Banner } from "@/constants/banners";
import { cn } from "@/lib/utils";
import { bannerThemes } from "./banner-theme";

interface Props {
  banner: Banner;
  size?: "large" | "small";
  priority?: boolean;
  tabIndex?: number;
}

export function BannerCard({ banner, size = "large", priority = false, tabIndex }: Props) {
  const theme = bannerThemes[banner.theme];
  const Icon = banner.icon;
  const large = size === "large";
  const photo = Boolean(banner.image);
  const overlay = photo && large; // texte posé sur une photo
  const lightTone = banner.tone === "light";

  const titleClass = cn(
    "font-display font-extrabold leading-tight tracking-tight",
    large ? "text-xl md:text-4xl" : "text-lg",
    overlay && (lightTone ? "text-ink md:text-brand-900" : "text-ink md:text-white"),
  );
  const textClass = cn(
    "mt-1.5 text-sm md:mt-2",
    large && "md:text-base",
    overlay ? cn("text-ink/70", lightTone ? "md:text-brand-800" : "md:text-white/90") : theme.sub,
  );
  const ctaClass = cn(
    "mt-3 inline-flex min-h-11 w-fit items-center rounded-full px-5 text-sm font-semibold motion-safe:transition-colors md:mt-4",
    overlay ? cn("bg-brand-500 text-white hover:bg-brand-600", !lightTone && "md:bg-white md:text-brand-700 md:hover:bg-brand-50") : theme.btn,
  );

  return (
    <Link
      href={banner.href}
      tabIndex={tabIndex}
      className={cn(
        "group relative flex h-full overflow-hidden rounded-2xl motion-safe:transition-transform motion-safe:duration-200 motion-safe:active:scale-[0.99]",
        theme.box,
        large ? (photo ? "min-h-[280px] p-3 md:min-h-[340px] md:p-10" : "min-h-[210px] p-6 md:min-h-[340px] md:p-10") : "min-h-[150px] p-5",
      )}
    >
      {banner.image && (
        <Image
          src={banner.image}
          alt=""
          fill
          priority={priority}
          sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
          style={{ "--pos": banner.mobilePosition } as CSSProperties}
          className="object-cover [object-position:var(--pos,center)] md:[object-position:center]"
        />
      )}

      <div
        className={cn(
          "relative z-10 flex flex-col justify-center",
          overlay && "glass-sheet mt-auto w-full rounded-2xl p-4 md:mt-0 md:max-w-[55%] md:p-0",
          large && !photo && "max-w-[75%] md:max-w-[55%]",
          !large && "max-w-[70%]",
        )}
      >
        <p className={titleClass}>{banner.title}</p>
        <p className={textClass}>{banner.text}</p>
        <span className={ctaClass}>{banner.cta}</span>
      </div>

      {!photo && (
        <div
          aria-hidden
          className={cn(
            "absolute -right-8 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full",
            theme.deco,
            large ? "h-56 w-56 md:h-80 md:w-80" : "h-32 w-32",
          )}
        >
          <Icon className={large ? "h-24 w-24 md:h-36 md:w-36" : "h-14 w-14"} />
        </div>
      )}
    </Link>
  );
}