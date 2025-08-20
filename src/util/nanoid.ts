export function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const arr = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) id += chars[arr[i] % chars.length];
  return id;
}