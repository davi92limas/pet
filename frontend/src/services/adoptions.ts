import { api } from '@/lib/api';
import type { Adocao } from '@/types';

export interface AdocaoPayload {
  animalId: string | number;
  observacoes?: string;
}

export async function listAdoptions(): Promise<Adocao[]> {
  const { data } = await api.get<Adocao[]>('/adocoes');
  return data;
}

export async function createAdoption(payload: AdocaoPayload): Promise<Adocao> {
  const body = {
    animalId: String(payload.animalId),
    ...(payload.observacoes ? { observacoes: payload.observacoes } : {}),
  };
  const { data } = await api.post<Adocao>('/adocoes', body);
  return data;
}

export async function updateAdoption(id: string, payload: Partial<AdocaoPayload>): Promise<Adocao> {
  const body: Partial<AdocaoPayload> = {
    ...(payload?.animalId !== undefined ? { animalId: String(payload.animalId) } : {}),
    ...(payload?.observacoes ? { observacoes: payload.observacoes } : {}),
  };
  const { data } = await api.patch<Adocao>(`/adocoes/${id}`, body);
  return data;
}

export async function deleteAdoption(id: string): Promise<void> {
  await api.delete(`/adocoes/${id}`);
}
