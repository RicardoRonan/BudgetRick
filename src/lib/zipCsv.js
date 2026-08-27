function readUint16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8)
}

function readUint32LE(bytes, offset) {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0
}

function findEndOfCentralDirectory(bytes) {
  const minPos = Math.max(0, bytes.length - 65557)
  for (let i = bytes.length - 22; i >= minPos; i--) {
    if (
      bytes[i] === 0x50 &&
      bytes[i + 1] === 0x4b &&
      bytes[i + 2] === 0x05 &&
      bytes[i + 3] === 0x06
    ) {
      return i
    }
  }
  return -1
}

function parseZipEntries(bytes) {
  const eocdOffset = findEndOfCentralDirectory(bytes)
  if (eocdOffset === -1) {
    throw new Error('Invalid zip file')
  }

  const centralDirOffset = readUint32LE(bytes, eocdOffset + 16)
  const entries = []
  let offset = centralDirOffset

  while (offset + 46 <= bytes.length) {
    if (
      bytes[offset] !== 0x50 ||
      bytes[offset + 1] !== 0x4b ||
      bytes[offset + 2] !== 0x01 ||
      bytes[offset + 3] !== 0x02
    ) {
      break
    }

    const compression = readUint16LE(bytes, offset + 10)
    const compressedSize = readUint32LE(bytes, offset + 20)
    const nameLength = readUint16LE(bytes, offset + 28)
    const extraLength = readUint16LE(bytes, offset + 30)
    const commentLength = readUint16LE(bytes, offset + 32)
    const localHeaderOffset = readUint32LE(bytes, offset + 42)
    const nameStart = offset + 46
    const name = new TextDecoder().decode(bytes.subarray(nameStart, nameStart + nameLength))

    entries.push({
      name,
      compression,
      compressedSize,
      localHeaderOffset,
    })

    offset = nameStart + nameLength + extraLength + commentLength
  }

  return entries
}

async function inflateRaw(data) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function extractEntry(bytes, entry) {
  const localOffset = entry.localHeaderOffset
  const nameLength = readUint16LE(bytes, localOffset + 26)
  const extraLength = readUint16LE(bytes, localOffset + 28)
  const dataStart = localOffset + 30 + nameLength + extraLength
  const compressed = bytes.subarray(dataStart, dataStart + entry.compressedSize)

  if (entry.compression === 0) {
    return compressed
  }

  if (entry.compression === 8) {
    return inflateRaw(compressed)
  }

  throw new Error(`Unsupported zip compression (${entry.compression})`)
}

export async function extractCsvFromZipBuffer(buffer) {
  const bytes = new Uint8Array(buffer)
  const entries = parseZipEntries(bytes)
  const csvEntry = entries.find((entry) => entry.name.toLowerCase().endsWith('.csv'))

  if (!csvEntry) {
    throw new Error('No CSV file found in zip archive')
  }

  const data = await extractEntry(bytes, csvEntry)
  return new TextDecoder().decode(data)
}
