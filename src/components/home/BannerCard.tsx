import Image from "next/image";
import Link from "next/link";
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

  return (
    <Link
      href={banner.href}
      tabIndex={tabIndex}
      className={cn(
        "relative flex h-full overflow-hidden rounded-xl",
        theme.box,
        large ? "min-h-[210px] p-6 md:min-h-[340px] md:p-10" : "min-h-[150px] p-5",
      )}
    >
      {banner.image && (
        <>
          <Image
            src={banner.image}
            alt=""
            fill
            priority={priority}
            sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/35" aria-hidden />
        </>
      )}

      <div className={cn("relative z-10 flex flex-col justify-center", large ? "max-w-[75%] md:max-w-[55%]" : "max-w-[70%]")}>
        <p className={cn("font-bold leading-tight", large ? "text-2xl md:text-4xl" : "text-lg")}>{banner.title}</p>
        <p className={cn("mt-2 text-sm", banner.image ? "text-white/90" : theme.sub, large && "md:text-base")}>{banner.text}</p>
        <span className={cn("mt-4 inline-flex w-fit rounded-lg px-4 py-2 text-sm font-semibold", theme.btn)}>{banner.cta}</span>
      </div>

      {!banner.image && (
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