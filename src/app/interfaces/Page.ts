export type Page<T> = {
  content: T[];
  number: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
};

// Normalizes unknown responses to Page<T>
export function normalizePage<T>(body: unknown): Page<T> {
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

  if (isRecord(body)) {
    const content = body.content;
    if (Array.isArray(content)) {
      const number = typeof body.number === "number" ? (body.number as number) : 0;
      const size = typeof body.size === "number" ? (body.size as number) : content.length;
      const totalElements =
        typeof body.totalElements === "number" ? (body.totalElements as number) : content.length;
      const totalPages =
        typeof body.totalPages === "number" ? (body.totalPages as number) : 1;
      return {
        content: content as T[],
        number,
        size,
        totalElements,
        totalPages,
      };
    }
  }

  if (Array.isArray(body)) {
    const arr = body as T[];
    return {
      content: arr,
      number: 0,
      size: arr.length,
      totalElements: arr.length,
      totalPages: 1,
    };
  }
  // Fallback empty page
  return { content: [], number: 0, size: 0, totalElements: 0, totalPages: 0 };
}
