import type { DeliveryAddressView } from "@/features/account/deliveryAddress";

export function AddressLines({ address }: { address: DeliveryAddressView }) {
  const place = [address.street, address.neighborhood, address.commune, address.city].filter(Boolean).join(", ");
  return (
    <div className="text-sm">
      <p className="font-semibold">{address.fullName}</p>
      <p className="text-muted">{place}</p>
      {address.landmark && <p className="text-muted">Repère : {address.landmark}</p>}
      <p className="text-muted">{address.phone}</p>
    </div>
  );
}