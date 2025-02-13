export function base64ToUnit8Array(base64: string) {
  const base64Data = base64.split(',')[1];
  const binaryString = atob(base64Data);

  const length = binaryString.length;
  const uint8Array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
}
