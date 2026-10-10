/**
 * Pure 100% Offline Client-Side ZIP Archive Packer (Zero External Dependencies)
 * Implements standard PKZIP (PK\x03\x04) file format
 * Master Reference: MasterDoc.md (FR13.4, NFR2)
 */

export interface ZipEntry {
  filename: string;
  data: string | Uint8Array;
}

export class ZipPacker {
  private entries: ZipEntry[] = [];

  public addFile(filename: string, content: string | Uint8Array) {
    this.entries.push({ filename, data: content });
  }

  public generateZipBlob(): Blob {
    const textEncoder = new TextEncoder();
    const fileRecords: Uint8Array[] = [];
    const centralDirRecords: Uint8Array[] = [];
    let offset = 0;

    for (const entry of this.entries) {
      const fileNameBytes = textEncoder.encode(entry.filename);
      const fileDataBytes = typeof entry.data === 'string' ? textEncoder.encode(entry.data) : entry.data;

      const crc = computeCRC32(fileDataBytes);
      const dataSize = fileDataBytes.length;

      // Local File Header (30 bytes + filename)
      const localHeader = new Uint8Array(30 + fileNameBytes.length);
      const lv = new DataView(localHeader.buffer);
      lv.setUint32(0, 0x04034b50, true);  // Local file header signature
      lv.setUint16(4, 20, true);          // Version needed to extract (2.0)
      lv.setUint16(6, 0, true);           // General purpose bit flag
      lv.setUint16(8, 0, true);           // Compression method (0 = store)
      lv.setUint16(10, 0x4821, true);     // File last mod time
      lv.setUint16(12, 0x5891, true);     // File last mod date
      lv.setUint32(14, crc, true);        // CRC-32
      lv.setUint32(18, dataSize, true);   // Compressed size
      lv.setUint32(22, dataSize, true);   // Uncompressed size
      lv.setUint16(26, fileNameBytes.length, true); // File name length
      lv.setUint16(28, 0, true);          // Extra field length
      localHeader.set(fileNameBytes, 30);

      // Central Directory File Header (46 bytes + filename)
      const cdHeader = new Uint8Array(46 + fileNameBytes.length);
      const cv = new DataView(cdHeader.buffer);
      cv.setUint32(0, 0x02014b50, true);  // Central file header signature
      cv.setUint16(4, 20, true);          // Version made by
      cv.setUint16(6, 20, true);          // Version needed
      cv.setUint16(8, 0, true);           // General purpose bit flag
      cv.setUint16(10, 0, true);          // Compression method (store)
      cv.setUint16(12, 0x4821, true);     // Mod time
      cv.setUint16(14, 0x5891, true);     // Mod date
      cv.setUint32(16, crc, true);        // CRC-32
      cv.setUint32(20, dataSize, true);   // Compressed size
      cv.setUint32(24, dataSize, true);   // Uncompressed size
      cv.setUint16(28, fileNameBytes.length, true); // File name length
      cv.setUint16(30, 0, true);          // Extra field length
      cv.setUint16(32, 0, true);          // Comment length
      cv.setUint16(34, 0, true);          // Disk start
      cv.setUint16(36, 0, true);          // Internal attributes
      cv.setUint32(38, 0, true);          // External attributes
      cv.setUint32(42, offset, true);     // Relative offset of local header
      cdHeader.set(fileNameBytes, 46);

      fileRecords.push(localHeader);
      fileRecords.push(fileDataBytes);
      centralDirRecords.push(cdHeader);

      offset += localHeader.length + fileDataBytes.length;
    }

    const cdStartOffset = offset;
    let cdTotalSize = 0;
    for (const record of centralDirRecords) {
      cdTotalSize += record.length;
    }

    // End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);   // EOCD signature
    ev.setUint16(4, 0, true);            // Disk number
    ev.setUint16(6, 0, true);            // Disk with central dir
    ev.setUint16(8, this.entries.length, true);   // Total entries on disk
    ev.setUint16(10, this.entries.length, true);  // Total entries
    ev.setUint32(12, cdTotalSize, true);          // Size of central dir
    ev.setUint32(16, cdStartOffset, true);        // Offset of central dir
    ev.setUint16(20, 0, true);           // Comment length

    // Assemble blob
    const allParts = [...fileRecords, ...centralDirRecords, eocd] as unknown as BlobPart[];
    return new Blob(allParts, { type: 'application/zip' });
  }
}

// Standard CRC-32 calculation
function computeCRC32(data: Uint8Array): number {
  let crc = -1;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}
