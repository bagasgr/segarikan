export async function fetchUserHistory(token) {
  try {
    const response = await fetch('URL_API_HISTORY', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Gagal mengambil data riwayat');
    }
    const data = await response.json();
    return data; // Pastikan ini array
  } catch (error) {
    console.error(error);
    return null;
  }
}
