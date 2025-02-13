export function base64ToArrayBuffer(base64: string) {
  const base64Data = base64.split(',')[1];
  const binaryString = atob(base64Data);

  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}
