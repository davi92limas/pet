import { api } from '@/lib/api';
import type { Tutor } from '@/types';

export interface TutorPayload {
  telefone: string;
  endereco: string;
  cidadeId: string;
}

export async function listTutors(): Promise<Tutor[]> {
  const { data } = await api.get<Tutor[]>('/tutores');
  return data;
}

export async function createTutor(payload: TutorPayload): Promise<Tutor> {
  const body = {
    telefone: payload.telefone,
    endereco: payload.endereco,
    cidadeId: payload.cidadeId,
  };
  const { data } = await api.post<Tutor>('/tutores', body);
  return data;
}

export async function updateTutor(id: string, payload: Partial<TutorPayload>): Promise<Tutor> {
  const body: Partial<TutorPayload> = {
    ...(payload.telefone ? { telefone: payload.telefone } : {}),
    ...(payload.endereco ? { endereco: payload.endereco } : {}),
    ...(payload.cidadeId ? { cidadeId: payload.cidadeId } : {}),
  };
  const { data } = await api.patch<Tutor>(`/tutores/${id}`, body);
  return data;
}

export async function deleteTutor(id: string): Promise<void> {
  await api.delete(`/tutores/${id}`);
}

export async function getMyTutor(): Promise<Tutor | null> {
  try {
    const { data } = await api.get<Tutor>('/tutores/meu-perfil');
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function upsertMyTutor(payload: TutorPayload): Promise<Tutor> {
  const existing = await getMyTutor();
  if (existing) {
    return updateTutor(existing.id as unknown as string, payload);
  }
  return createTutor(payload);
}
