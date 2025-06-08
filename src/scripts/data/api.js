// File: src/scripts/data/api.js
export const registerUser = async (userData) => {
  try {
    const response = await fetch('https://api-segarikan.vercel.app/api/register', {
      method: 'POST', // WAJIB POST
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal registrasi user');
    }

    return await response.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
};
