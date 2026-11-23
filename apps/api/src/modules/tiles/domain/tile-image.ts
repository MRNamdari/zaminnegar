export type TileImageContentType = "image/png" | "image/jpeg";

export function getTileImageContentType(
  buffer: Buffer,
): TileImageContentType | null {
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (
    buffer.length >= 24 &&
    buffer.subarray(0, 8).equals(pngSignature) &&
    buffer.readUInt32BE(16) === 256 &&
    buffer.readUInt32BE(20) === 256
  ) {
    return "image/png";
  }

  if (
    buffer.length < 4 ||
    buffer[0] !== 0xff ||
    buffer[1] !== 0xd8 ||
    buffer[buffer.length - 2] !== 0xff ||
    buffer[buffer.length - 1] !== 0xd9
  ) {
    return null;
  }

  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
    0xcf,
  ]);
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    while (buffer[offset] === 0xff) offset++;
    const marker = buffer[offset++];
    if (marker === undefined) return null;
    if (
      marker === 0xd9 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    )
      continue;

    if (offset + 2 > buffer.length) return null;
    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length)
      return null;

    if (startOfFrameMarkers.has(marker)) {
      if (segmentLength < 8) return null;
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return width === 256 && height === 256 ? "image/jpeg" : null;
    }

    offset += segmentLength;
  }

  return null;
}
