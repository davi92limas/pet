export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  const maybeAxiosError = error as { response?: { data?: { message?: string | string[] } } };
  const message = maybeAxiosError.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  if (typeof message === 'string') return message;
  return fallback;
}
