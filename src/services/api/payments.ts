import type { Payment } from "@/types/domain";
import type { MobileMoneyProvider, PaymentType } from "@/types/enums";
import { api } from "./client";
import { endpoints } from "./endpoints";

export type PaymentRequest = {
  orderId: string;
  paymentType: PaymentType;
  phoneNumber: string;
  provider: MobileMoneyProvider;
};

export async function createPayment(input: PaymentRequest): Promise<Payment> {
  const { data } = await api.post<Payment>(endpoints.payments.create, input, { auth: "required" });
  return data;
}