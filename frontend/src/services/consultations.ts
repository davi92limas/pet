import { api } from '@/lib/api';
import type { Consulta } from '@/types';

export interface ConsultaPayload {
  data: string;
  animalId: string;
  veterinarioId: string;
  descricao: string;
  observacoes?: string;
}

export async function listConsultations(): Promise<Consulta[]> {
  const { data } = await api.get<Consulta[]>('/consultas');
  return data;
}

export async function createConsultation(payload: ConsultaPayload): Promise<Consulta> {
  const { observacoes: _omitObservacoes, ...rest } = payload;
  const body = {
    ...rest,
    animalId: payload.animalId,
    veterinarioId: payload.veterinarioId,
  };
  const { data } = await api.post<Consulta>('/consultas', body);
  return data;
}

export async function updateConsultation(
  id: string,
  payload: Partial<ConsultaPayload>,
): Promise<Consulta> {
  const { observacoes: _omitObservacoes, ...rest } = payload;
  const body: Partial<ConsultaPayload> = {
    ...rest,
    ...(payload?.animalId !== undefined ? { animalId: payload.animalId } : {}),
    ...(payload?.veterinarioId !== undefined ? { veterinarioId: payload.veterinarioId } : {}),
  };
  const { data } = await api.patch<Consulta>(`/consultas/${id}`, body);
  return data;
}

export async function deleteConsultation(id: string): Promise<void> {
  await api.delete(`/consultas/${id}`);
}
