import type { AuthResult, SessionUser } from "@/types/domain";
import { api } from "./client";
import { endpoints } from "./endpoints";

export async function registerUser(input: { email: string; phone: string; password: string }) {
  const { data } = await api.post<AuthResult>(endpoints.auth.register, input, { auth: "none" });
  return data;
}

export async function loginUser(input: { email: string; password: string }) {
  const { data } = await api.post<AuthResult>(endpoints.auth.login, input, { auth: "none" });
  return data;
}

export async function fetchMe(signal?: AbortSignal) {
  const { data } = await api.get<SessionUser>(endpoints.auth.me, { auth: "required", signal });
  return data;
}

export async function verifyEmail(token: string) {
  await api.post<null>(endpoints.auth.verifyEmail, { token }, { auth: "none" });
}

export async function resendVerificationEmail() {
  await api.post<null>(endpoints.auth.resendVerification, undefined, { auth: "required" });
}

export async function requestPasswordReset(email: string) {
  await api.post<null>(endpoints.auth.forgotPassword, { email }, { auth: "none" });
}

export async function resetPassword(input: { token: string; password: string }) {
  await api.post<null>(endpoints.auth.resetPassword, input, { auth: "none" });
}