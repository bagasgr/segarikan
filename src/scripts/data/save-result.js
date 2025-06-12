// save-result.js
export async function saveHistoryToDB(data) {
  const token = localStorage.getItem('authToken');
  console.log('Token dari localStorage:', token);
  console.log('Data yang dikirim ke API:', data);

  if (!token) {
    console.error('⚠️ Token tidak ditemukan. Silakan login dulu!');
    return;
  }

  try {
    const response = await fetch('https://api-segarikan-production.up.railway.app/v1/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Gagal menyimpan data:', result);
      throw new Error(result.message || 'Unknown error');
    }

    console.log('✅ Data berhasil disimpan ke API:', result);
    return result;
  } catch (error) {
    console.error('🔥 Error saat menyimpan data:', error.message);
  }
}
