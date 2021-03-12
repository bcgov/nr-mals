export function createDownload(blob, filename = undefined) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

export function getDispositionFilename(disposition) {
  let filename;
  if (disposition) {
    filename = disposition.substring(disposition.indexOf("filename=") + 9);
  }
  return filename;
}
