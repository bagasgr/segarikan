import CONFIG from '../config.js';

export default class RegisterPresenter {
  constructor({ registerView }) {
    this._registerView = registerView;
  }

  async register({ name, email, password }) {
    if (!name || !email || !password) {
      this._registerView.showAlert('Semua field wajib diisi!');
      return;
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        this._registerView.showAlert(result.message || 'Registrasi gagal');
        return;
      }

      this._registerView.showAlert('Registrasi berhasil! Silakan login.');
      this._registerView.redirectToLogin();
    } catch (error) {
      this._registerView.showAlert('Terjadi kesalahan saat registrasi, coba lagi.');
      console.error('RegisterPresenter error:', error);
    }
  }
}
