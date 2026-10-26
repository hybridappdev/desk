const storageKey = "desk.published";

export function storePublished(tree: unknown) {
  localStorage.setItem(storageKey, JSON.stringify(tree));
}

export function loadPublished(): unknown | null {
  const raw = localStorage.getItem(storageKey);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}
