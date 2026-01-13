export function stableStringify(obj: unknown) {
  // evita key diferente por ordem de propriedades
  if (!obj || typeof obj !== "object") return String(obj);

  const entries = Object.entries(obj as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b)
  );

  return JSON.stringify(Object.fromEntries(entries));
}

export function cacheKey(prefix: string, params?: unknown) {
  return params ? `${prefix}:${stableStringify(params)}` : prefix;
}
