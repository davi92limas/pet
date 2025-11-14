import { api } from '@/lib/api';
import type { Veterinario } from '@/types';

export interface VeterinarioPayload {
  nome: string;
  crmv: string;
  especialidade: string;
  telefone: string;
  email: string;
  cidadeId: string;
}

export async function listVeterinarians(): Promise<Veterinario[]> {
  const { data } = await api.get<Veterinario[]>('/veterinarios');
  return data;
}

export async function createVeterinarian(payload: VeterinarioPayload): Promise<Veterinario> {
  const { email: _omitEmail, ...rest } = payload;
  const body = { ...rest, cidadeId: payload.cidadeId };
  const { data } = await api.post<Veterinario>('/veterinarios', body);
  return data;
}

export async function updateVeterinarian(
  id: string,
  payload: Partial<VeterinarioPayload>,
): Promise<Veterinario> {
  const { email: _omitEmail, ...rest } = payload;
  const body: Partial<VeterinarioPayload> = {
    ...rest,
    ...(payload?.cidadeId !== undefined ? { cidadeId: payload.cidadeId } : {}),
  };
  const { data } = await api.patch<Veterinario>(`/veterinarios/${id}`, body);
  return data;
}

export async function deleteVeterinarian(id: string): Promise<void> {
  await api.delete(`/veterinarios/${id}`);
}
