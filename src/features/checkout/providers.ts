import type { MobileMoneyProvider } from "@/types/enums";

export const MOBILE_MONEY_PROVIDERS: ReadonlyArray<{ id: MobileMoneyProvider; name: string }> = [
  { id: "AIRTEL", name: "Airtel Money" },
  { id: "MTN", name: "MTN MoMo" },
  { id: "ORANGE", name: "Orange Money" },
  { id: "VODACOM", name: "M-Pesa" },
];