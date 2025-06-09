// save-resul.js
export async function saveHistoryToDB(data) {
  const token = localStorage.getItem('authToken');
  console.log('Token dari localStorage:', token);
  if (!token) {
    console.error('Token tidak ditemukan. Silakan login dulu!');
    return;
  }

  try {
    const response = await fetch('https://api-segarikan-production.up.railway.app/v1/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // <-- ini penting
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gagal menyimpan data: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Data berhasil disimpan:', result);
    return result;
  } catch (error) {
    console.error('Error saat menyimpan data:', error.message);
  }
}
