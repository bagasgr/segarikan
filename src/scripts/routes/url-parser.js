// url-parser.js (perbaikan)
export function getActivePathname() {
  let path = location.hash.replace('#', '') || '/';
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return path;
}

/**
 * Fungsi getActiveRoute sekarang cukup mengembalikan path asli, 
 * misalnya '/result/123', tanpa mengubah ':id' menjadi literal
 */
export function getActiveRoute() {
  return getActivePathname();
}
