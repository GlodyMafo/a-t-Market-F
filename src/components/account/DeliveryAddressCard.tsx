import { MapPin } from "lucide-react";
import { AddressLines } from "@/components/account/AddressLines";
import { readDeliveryAddress } from "@/features/account/deliveryAddress";

export function DeliveryAddressCard({ raw }: { raw: unknown }) {
  const address = readDeliveryAddress(raw);
  return (
    <section aria-labelledby="delivery-address-title" className="rounded-3xl border border-line bg-white p-5">
      <h2 id="delivery-address-title" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
        <MapPin className="h-4 w-4 text-brand-500" aria-hidden /> Livraison
      </h2>
      <div className="mt-3">
        {address ? <AddressLines address={address} /> : <p className="text-sm text-muted">Livraison confirmée par téléphone.</p>}
      </div>
    </section>
  );
}