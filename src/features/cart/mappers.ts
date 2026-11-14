
import { IMPORT_MARKETPLACES } from "@/features/international-import/marketplaces";
import { detectMarketplaceId, safeHost } from "@/lib/marketplace";
import { multiplyMoney } from "@/lib/money";
import { resolveImageUrl } from "@/lib/utils";
import { guestLineKey, type GuestLine } from "./guest-cart.store";
import { ISSUE_MESSAGES } from "./messages";
import type { CartLine, ServerCartItem } from "./types";

/** `undefined` = en chargement, `null` = produit indisponible au catalogue. */
export interface LiveProduct {
  price: string;
  stock: number | null;
}

type Live = LiveProduct | null | undefined;

const shopName = (url: string) =>
  IMPORT_MARKETPLACES.find((m) => m.id === detectMarketplaceId(url))?.name ?? null;

const httpsImage = (url: string | null | undefined) =>
  url && url.startsWith("https://") ? url : null;

function issueMessage(issue: string | null, specific?: string | null): string | null {
  if (!issue) return null;
  return specific ?? ISSUE_MESSAGES[issue] ?? "Cet article ne peut pas être payé pour le moment.";
}

export function lineFromServer(item: ServerCartItem, live: Live): CartLine {
  if (item.kind === "LOCAL" && item.product) {
    const product = item.product;
    const first = [...(product.images ?? [])].sort(
      (a, b) => a.position - b.position
    )[0]?.imageUrl;

    const unitPrice = item.unitPrice ?? live?.price ?? null;

    return {
      key: item.id,
      kind: "LOCAL",
      name: product.name,
      imageUrl: resolveImageUrl(first),
      href: `/products/${encodeURIComponent(product.id)}`,
      sourceHost: null,
      marketplace: null,
      unitPrice,
      lineTotal: item.lineTotal ?? multiplyMoney(unitPrice, item.quantity),
      quantity: item.quantity,
      maxQuantity: product.inventory?.quantity ?? null,
      quantityEditable: true,
      options: null,
      payable: item.payable,
      issue: item.issue,
      issueMessage: issueMessage(item.issue),
      needsReview: false,
      expiresAt: null,
    };
  }

  const quote = item.quote!;
  const host = safeHost(quote.productUrl);

  return {
    key: item.id,
    kind: "INTERNATIONAL",
    name: quote.productName ?? "Produit importé",
    imageUrl: httpsImage(quote.imageUrl),
    href: host ? quote.productUrl : null,
    sourceHost: host,
    marketplace: shopName(quote.productUrl),
    unitPrice: null,
    lineTotal: item.lineTotal ?? item.cartPricing?.totalPrice ?? quote.totalPrice,
    quantity: item.quantity,
    maxQuantity: null,
    quantityEditable: true,
    options: quote.options,
    payable: item.payable,
    issue: item.issue,
    issueMessage: issueMessage(item.issue, item.minimumOrderMessage),
    needsReview: quote.status === "PENDING_REVIEW",
    expiresAt: quote.expiresAt,
  };
}

export function lineFromGuest(
  line: GuestLine,
  live: Live,
  now: number
): CartLine {
  if (line.kind === "LOCAL") {
    let issue: string | null = null;

    if (live === null) issue = "UNAVAILABLE";
    else if (live && live.stock !== null && live.stock < line.quantity) {
      issue = "OUT_OF_STOCK";
    }

    const unitPrice = live?.price ?? null;

    return {
      key: guestLineKey(line),
      kind: "LOCAL",
      name: line.name,
      imageUrl: resolveImageUrl(line.imageUrl),
      href: `/products/${encodeURIComponent(line.productId)}`,
      sourceHost: null,
      marketplace: null,
      unitPrice,
      lineTotal: multiplyMoney(unitPrice, line.quantity),
      quantity: line.quantity,
      maxQuantity: live?.stock ?? null,
      quantityEditable: true,
      options: null,
      payable: issue === null && live !== undefined,
      issue,
      issueMessage: issueMessage(issue),
      needsReview: false,
      expiresAt: null,
    };
  }

  const expired = now > 0 && Date.parse(line.expiresAt) <= now;
  const issue = expired
    ? "EXPIRED"
    : line.needsReview
      ? "PENDING_REVIEW"
      : null;

  const host = safeHost(line.productUrl);

  return {
    key: guestLineKey(line),
    kind: "INTERNATIONAL",
    name: line.name,
    imageUrl: httpsImage(line.imageUrl),
    href: host ? line.productUrl : null,
    sourceHost: host,
    marketplace: shopName(line.productUrl),
    unitPrice: null,
    lineTotal: line.totalPrice,
    quantity: line.quantity,
    maxQuantity: null,
    quantityEditable: false,
    options: line.options,
    payable: issue === null,
    issue,
    issueMessage: issueMessage(issue),
    needsReview: line.needsReview,
    expiresAt: line.expiresAt,
  };
}
