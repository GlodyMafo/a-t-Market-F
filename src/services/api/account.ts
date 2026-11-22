import type { Address, SessionUser } from "@/types/domain";
import { api } from "./client";
import { endpoints } from "./endpoints";

const authed = { auth: "required" as const };

export interface ProfileBody {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string;
  birthDate?: string | null;
  gender?: "FEMALE" | "MALE" | null;
}

export async function updateProfile(body: ProfileBody) {
  return (await api.patch<SessionUser>(endpoints.users.me, body, authed)).data;
}

export async function changePassword(body: { currentPassword: string; newPassword: string }) {
  await api.patch<null>(endpoints.auth.changePassword, body, authed);
}

export async function resendVerification() {
  await api.post<null>(endpoints.auth.resendVerification, undefined, authed);
}

export interface AddressBody {
  label?: string | null;
  fullName: string;
  phone: string;
  city: string;
  commune?: string | null;
  neighborhood: string;
  street: string;
  landmark?: string | null;
  isDefault?: boolean;
}

export async function listAddresses(signal?: AbortSignal) {
  return (await api.get<Address[]>(endpoints.users.addresses, { ...authed, signal })).data;
}

export async function createAddress(body: AddressBody) {
  return (await api.post<Address>(endpoints.users.addresses, body, authed)).data;
}

export async function updateAddress(id: string, body: Partial<AddressBody>) {
  return (await api.patch<Address>(endpoints.users.address(id), body, authed)).data;
}

export async function deleteAddress(id: string) {
  await api.delete<null>(endpoints.users.address(id), authed);
}