/** Saves `data` as a JSON file through the browser's download mechanism. */
export function downloadJson(filename: string, data: unknown, mimeType = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
