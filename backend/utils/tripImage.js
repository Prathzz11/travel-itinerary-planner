const MAX_BYTES = 2 * 1024 * 1024;
function validTripImage(value) {
  if (!value || value === '/navigation.png') return true;
  if (typeof value !== 'string') return false;
  if (value.startsWith('data:')) {
    if (value.length > Math.ceil(MAX_BYTES / 3) * 4 + 40) return false;
    const match = value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) return false;
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length || bytes.length > MAX_BYTES) return false;
    if (match[1] === 'png') return bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'));
    if (match[1] === 'jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    return bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
  }
  if (value.length > 4096) return false;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
module.exports = { validTripImage };
