export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CL");
}

export function fullName(first: string, last: string): string {
  return `${first} ${last}`;
}
