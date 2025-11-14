import { api } from "@/lib/api";
import { getErrorMessage } from "@/utils/errors";
import type { AuthResponse } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Falha no login"));
  }
}

export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function fetchProfile(): Promise<AuthResponse["user"]> {
  const { data } = await api.get("/auth/profile");
  return data;
}
