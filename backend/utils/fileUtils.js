// utils.js
const path = require('path');
let uuidv4 = null;

// 1. Try to load UUID (CommonJS is fine)
try {
  uuidv4 = require('uuid').v4;
} catch (e) { /* uuid optional */ }

// 2. We use a holder for the library since we load it asynchronously
let fileTypeLib = null;

/**
 * Helper to ensure file-type is loaded. 
 * This fixes the "require() fails on ESM" bug.
 */
async function loadFileType() {
  if (fileTypeLib) return fileTypeLib;
  try {
    // Dynamic import works in CommonJS for ESM modules
    const loaded = await import('file-type');
    fileTypeLib = loaded;
    return loaded;
  } catch (e) {
    console.warn("Security Warning: 'file-type' could not be loaded. Magic number detection is disabled.");
    return null;
  }
}

async function detectFileType(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) return null;
  
  const ft = await loadFileType();
  if (ft && ft.fileTypeFromBuffer) {
    try {
      return await ft.fileTypeFromBuffer(buffer);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function makeSafeFilename(ext) {
  // If no extension provided, default to 'bin'
  const safeExt = ext && typeof ext === 'string' 
    ? ext.replace(/[^a-z0-9]+/gi, '').toLowerCase() 
    : 'bin';
    
  const id = uuidv4 ? uuidv4() : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return `${id}.${safeExt}`;
}

async function prepareUpload(buffer, declaredMime, opts = {}) {
  const detected = await detectFileType(buffer);
  
  // LOGIC: Use detected mime if available; otherwise fallback to declared.
  let mime = (detected && detected.mime) ? detected.mime : null;
  let ext = (detected && detected.ext) ? detected.ext : null;

  // If detection failed, we must rely on declared info (Less Secure, but usable)
  if (!mime) {
    mime = declaredMime && typeof declaredMime === 'string' ? declaredMime.trim().toLowerCase() : 'application/octet-stream';
    
    // USABILITY FIX: If we couldn't detect the extension, try to infer it from the declared mime
    // instead of defaulting to '.bin' immediately.
    // (Simple mapping for common types)
    if (mime === 'image/jpeg') ext = 'jpg';
    else if (mime === 'image/png') ext = 'png';
    else if (mime === 'application/pdf') ext = 'pdf';
  }

  // Validate against allowlist
  if (opts.allowlist) {
    const set = opts.allowlist instanceof Set ? opts.allowlist : new Set(opts.allowlist);
    if (!mime || !set.has(mime)) {
      throw new Error(`Invalid file type: ${mime}`);
    }
  }

  const filename = makeSafeFilename(ext);
  return { filename, mime, detected };
}

function sanitizeForDownload(name, mime) {
  const safeName = (name && typeof name === 'string')
    ? name.replace(/[\r\n"\\/]+/g, '_').replace(/[\x00-\x1f\x7f]+/g, '').trim().slice(0, 100)
    : 'download';
  
  const candidateMime = (mime && typeof mime === 'string') ? mime.trim().toLowerCase() : 'application/octet-stream';
  
  // Basic Regex to ensure mime type looks like "type/subtype"
  if (!/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(candidateMime)) {
    return { safeName, safeMime: 'application/octet-stream' };
  }
  return { safeName, safeMime: candidateMime };
}

module.exports = {
  detectFileType,
  makeSafeFilename,
  prepareUpload,
  sanitizeForDownload,
};