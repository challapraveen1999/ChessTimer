const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPng(width, height, getPixelRgba) {
  const rowStride = 1 + width * 4;
  const raw = Buffer.alloc(height * rowStride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    raw[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a !== undefined ? a : 255;
    }
  }

  const compressed = zlib.deflateSync(raw);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);

  const crc = crc32(buf.slice(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC32
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate 512x512 App Icon
const iconBuf = createPng(512, 512, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Outer gold ring
  if (dist > 228 && dist <= 242) {
    return [212, 175, 55, 255]; // Gold
  }
  if (dist > 222 && dist <= 228) {
    return [245, 226, 179, 255]; // Champagne highlight
  }
  if (dist > 242) {
    return [0, 0, 0, 0]; // Transparent outer
  }

  // Inner dark background with vignette
  const vig = Math.min(1, dist / 222);
  const bgR = Math.round(18 * (1 - vig * 0.5));
  const bgG = Math.round(18 * (1 - vig * 0.5));
  const bgB = Math.round(24 * (1 - vig * 0.5));

  // Chess King Silhouette in center
  // Cross at top
  const inCrossVert = Math.abs(dx) <= 6 && y >= 110 && y <= 150;
  const inCrossHoriz = Math.abs(dx) <= 22 && y >= 122 && y <= 134;
  if (inCrossVert || inCrossHoriz) {
    return [212, 175, 55, 255];
  }

  // Crown head
  const crownHeadY = 150;
  if (y > crownHeadY && y <= 190) {
    const crownW = 30 + (y - crownHeadY) * 1.2;
    if (Math.abs(dx) <= crownW) {
      // Crown points
      if (y < 170 && Math.abs(dx) > 12 && Math.abs(dx) < crownW - 12) {
        return [bgR, bgG, bgB, 255];
      }
      return [236, 200, 108, 255];
    }
  }

  // King Body / Column
  if (y > 190 && y <= 310) {
    const bodyW = 28 + Math.sin((y - 190) / 120 * Math.PI) * 14;
    if (Math.abs(dx) <= bodyW) {
      return [212, 175, 55, 255];
    }
  }

  // King Pedestal Base
  if (y > 310 && y <= 370) {
    const baseW = 35 + (y - 310) * 1.5;
    if (Math.abs(dx) <= baseW) {
      return [245, 226, 179, 255];
    }
  }

  // Subtle clock tick marks around circle
  if (dist >= 195 && dist <= 212) {
    const angle = Math.atan2(dy, dx);
    const modAngle = Math.abs(angle % (Math.PI / 6));
    if (modAngle < 0.03 || modAngle > (Math.PI / 6 - 0.03)) {
      return [212, 175, 55, 220];
    }
  }

  return [bgR, bgG, bgB, 255];
});

// Generate 1024x500 Feature Graphic
const featureBuf = createPng(1024, 500, (x, y, w, h) => {
  // Rich horology radial background
  const dx = x - 512;
  const dy = y - 250;
  const dist = Math.sqrt(dx * dx * 0.4 + dy * dy);
  const factor = Math.min(1, dist / 400);

  let r = Math.round(20 * (1 - factor) + 10 * factor);
  let g = Math.round(20 * (1 - factor) + 10 * factor);
  let b = Math.round(28 * (1 - factor) + 12 * factor);

  // Border frame (Gold thin lines)
  if (x >= 24 && x <= 1000 && (y === 24 || y === 476)) return [212, 175, 55, 255];
  if (y >= 24 && y <= 476 && (x === 24 || x === 1000)) return [212, 175, 55, 255];
  if (x >= 28 && x <= 996 && (y === 28 || y === 472)) return [153, 117, 25, 180];
  if (y >= 28 && y <= 472 && (x === 28 || x === 996)) return [153, 117, 25, 180];

  // Right side clock badges (5:00 / 5:00)
  // Opponent Clock Card (top right: x 620..920, y 70..210)
  if (x >= 630 && x <= 910 && y >= 70 && y <= 210) {
    const isBorder = x === 630 || x === 910 || y === 70 || y === 210;
    if (isBorder) return [50, 48, 60, 255];
    return [22, 22, 28, 255];
  }

  // Active Player Clock Card (bottom right: x 630..910, y 250..410)
  if (x >= 630 && x <= 910 && y >= 250 && y <= 410) {
    const isBorder = x === 630 || x === 910 || y === 250 || y === 410;
    if (isBorder) return [212, 175, 55, 255]; // Active gold border!
    return [28, 27, 23, 255]; // Active gold tinted bg
  }

  // Center gold divider between cards
  if (x >= 730 && x <= 810 && y >= 225 && y <= 235) {
    return [212, 175, 55, 255];
  }

  // Left side: Stylized King Emblem watermark (around x=480, y=250)
  const kx = x - 470;
  const ky = y - 250;
  const kdist = Math.sqrt(kx * kx + ky * ky);
  if (kdist < 120 && Math.abs(kx) <= (30 + (ky > 0 ? ky * 0.7 : 0))) {
    return [Math.min(255, r + 24), Math.min(255, g + 20), Math.min(255, b + 6), 255];
  }

  return [r, g, b, 255];
});

fs.writeFileSync('D:/ChessTimer/playstore_screenshots/app_icon_512x512.png', iconBuf);
fs.writeFileSync('D:/ChessTimer/playstore_screenshots/feature_graphic_1024x500.png', featureBuf);
console.log('Successfully generated app_icon_512x512.png and feature_graphic_1024x500.png');
