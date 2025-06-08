export async function saveHistoryToDB(data) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('Token tidak ditemukan. Silakan login dulu!');
    return;
  }

  try {
    const response = await fetch('https://api-segarikan-production.up.railway.app/v1/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // <== PENTING: format harus Bearer + spasi + token
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorRes = await response.json();
      console.error('❌ Gagal kirim data ke API:', response.status, errorRes);
      return;
    }

    const resJson = await response.json();
    console.log('✅ Data berhasil dikirim:', resJson);
  } catch (error) {
    console.error('❌ Error saat kirim data:', error);
  }
}
