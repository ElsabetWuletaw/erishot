import { readFileSync, writeFileSync } from "fs";
import { deflateSync, inflateSync } from "zlib";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/make-logo-transparent.mjs input.png output.png");
  process.exit(1);
}

const source = readFileSync(inputPath);
const signature = source.subarray(0, 8);
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

if (!signature.equals(pngSignature)) {
  throw new Error("Input must be a PNG file.");
}

let offset = 8;
let width = 0;
let height = 0;
let colorType = 0;
const idatChunks = [];

while (offset < source.length) {
  const length = source.readUInt32BE(offset);
  const type = source.toString("ascii", offset + 4, offset + 8);
  const data = source.subarray(offset + 8, offset + 8 + length);

  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    colorType = data[9];
  } else if (type === "IDAT") {
    idatChunks.push(data);
  } else if (type === "IEND") {
    break;
  }

  offset += 12 + length;
}

const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;

if (!width || !height || !channels) {
  throw new Error(`Unsupported PNG color type: ${colorType}`);
}

const inflated = inflateSync(Buffer.concat(idatChunks));
const stride = width * channels;
const raw = Buffer.alloc(width * height * channels);
let inputOffset = 0;
let rawOffset = 0;

function paeth(left, above, upperLeft) {
  const p = left + above - upperLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - above);
  const pc = Math.abs(p - upperLeft);

  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return above;
  return upperLeft;
}

for (let y = 0; y < height; y += 1) {
  const filter = inflated[inputOffset];
  inputOffset += 1;

  for (let x = 0; x < stride; x += 1) {
    const value = inflated[inputOffset + x];
    const left = x >= channels ? raw[rawOffset + x - channels] : 0;
    const above = y > 0 ? raw[rawOffset + x - stride] : 0;
    const upperLeft = y > 0 && x >= channels ? raw[rawOffset + x - stride - channels] : 0;

    if (filter === 0) raw[rawOffset + x] = value;
    else if (filter === 1) raw[rawOffset + x] = (value + left) & 255;
    else if (filter === 2) raw[rawOffset + x] = (value + above) & 255;
    else if (filter === 3) raw[rawOffset + x] = (value + Math.floor((left + above) / 2)) & 255;
    else if (filter === 4) raw[rawOffset + x] = (value + paeth(left, above, upperLeft)) & 255;
    else throw new Error(`Unsupported PNG filter: ${filter}`);
  }

  inputOffset += stride;
  rawOffset += stride;
}

const transparentLow = 24;
const opaqueHigh = 82;
const rgba = Buffer.alloc(width * height * 4);
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const sourceIndex = (y * width + x) * channels;
    const targetIndex = (y * width + x) * 4;
    const r = raw[sourceIndex];
    const g = raw[sourceIndex + 1];
    const b = raw[sourceIndex + 2];
    const brightest = Math.max(r, g, b);
    const alpha = Math.max(
      0,
      Math.min(255, Math.round(((brightest - transparentLow) / (opaqueHigh - transparentLow)) * 255))
    );

    rgba[targetIndex] = r;
    rgba[targetIndex + 1] = g;
    rgba[targetIndex + 2] = b;
    rgba[targetIndex + 3] = alpha;

    if (alpha > 8) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const padding = 18;
minX = Math.max(0, minX - padding);
minY = Math.max(0, minY - padding);
maxX = Math.min(width - 1, maxX + padding);
maxY = Math.min(height - 1, maxY + padding);

const outputWidth = maxX - minX + 1;
const outputHeight = maxY - minY + 1;
const filtered = Buffer.alloc((outputWidth * 4 + 1) * outputHeight);

for (let y = 0; y < outputHeight; y += 1) {
  const rowStart = y * (outputWidth * 4 + 1);
  filtered[rowStart] = 0;

  for (let x = 0; x < outputWidth; x += 1) {
    const sourceIndex = ((y + minY) * width + x + minX) * 4;
    const targetIndex = rowStart + 1 + x * 4;
    rgba.copy(filtered, targetIndex, sourceIndex, sourceIndex + 4);
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const lengthBuffer = Buffer.alloc(4);
  const crcBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(outputWidth, 0);
ihdr.writeUInt32BE(outputHeight, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

writeFileSync(
  outputPath,
  Buffer.concat([
    pngSignature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(filtered, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ])
);
