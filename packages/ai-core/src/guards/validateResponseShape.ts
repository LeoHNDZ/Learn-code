export function validateResponseShape(raw: any): boolean {
  return !!raw && Array.isArray(raw.candidates);
}