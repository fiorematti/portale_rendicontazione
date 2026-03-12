/**
 * Scarica un blob come file tramite creazione di un link temporaneo.
 * @param blob - Il blob da scaricare
 * @param filename - Nome del file di download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Scarica un blob da una HttpResponse, estraendo il nome file dall'header content-disposition.
 * @param body - Il blob dalla response
 * @param headers - Gli headers della response (con metodo get)
 * @param fallbackName - Nome file di fallback
 */
export function downloadBlobFromResponse(
  body: Blob | null,
  headers: { get(name: string): string | null },
  fallbackName: string
): void {
  if (!body) return;
  let fileName = fallbackName;
  const disposition = headers.get('content-disposition');
  if (disposition) {
    const match = disposition.match(/filename\*?=UTF-8''([^;]+)|filename="?([^;"]+)"?/i);
    const extracted = match?.[1] || match?.[2];
    if (extracted) {
      fileName = decodeURIComponent(extracted);
    }
  }
  downloadBlob(body, fileName);
}
