type CloudinaryOptions = { w?: number; h?: number };

const CLOUDINARY_ORIGIN = "https://res.cloudinary.com/";
const UPLOAD_MARKER = "/image/upload/";

export function cloudinary(
  src: string,
  opts?: CloudinaryOptions,
): string {
  const w = opts?.w ?? 184;
  const h = opts?.h ?? 184;

  if (!src.startsWith(CLOUDINARY_ORIGIN)) {
    return src;
  }

  const uploadIndex = src.indexOf(UPLOAD_MARKER);
  if (uploadIndex === -1) {
    return src;
  }

  const afterUpload = src.slice(uploadIndex + UPLOAD_MARKER.length);
  const hasVersionSegment = /^v\d+\//.test(afterUpload);
  if (!hasVersionSegment) {
    return src;
  }

  const transform = `c_fill,g_face,w_${w},h_${h},q_auto,f_auto`;
  const insertAt = uploadIndex + UPLOAD_MARKER.length;
  return `${src.slice(0, insertAt)}${transform}/${afterUpload}`;
}
