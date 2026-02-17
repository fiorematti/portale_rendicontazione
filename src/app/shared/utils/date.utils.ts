/**
 * Parses a date string in dd/MM/yyyy format to a Date object.
 */
export function parseDateString(valore: string): Date | null {
  if (!valore || valore.length !== 10) return null;
  const [giorno, mese, anno] = valore.split('/').map((part) => Number(part));
  if (!giorno || !mese || !anno) return null;
  const data = new Date(anno, mese - 1, giorno);
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * Formats a Date or ISO string to dd/MM/yyyy.
 */
export function formatDateIt(val: string | Date | null | undefined): string {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Formats a dd/MM/yyyy string to ISO yyyy-MM-dd.
 */
export function formatDateISO(valore: string): string {
  const data = parseDateString(valore) || new Date();
  const yyyy = data.getFullYear();
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  const dd = String(data.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Auto-formats numeric input into dd/MM/yyyy pattern as user types.
 */
export function sanitizeDateInput(raw: string): string {
  let v = raw.replace(/\D/g, '');
  if (v.length > 8) v = v.substring(0, 8);
  if (v.length > 4) return `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
  if (v.length > 2) return `${v.substring(0, 2)}/${v.substring(2)}`;
  return v;
}
