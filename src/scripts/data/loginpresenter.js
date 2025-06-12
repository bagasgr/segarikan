import CONFIG from '../config.js';

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log('Response login:', result);

      if (!response.ok || result.error) {
        this.view.onLoginError(result.message || 'Login gagal');
        return;
      }

      const token = result.token || result?.data?.token || result?.loginResult?.token;
      const name = result.name || result?.data?.name || result?.loginResult?.name;
      const userId = result.userId || result?.data?.userId || result?.loginResult?.userId;

      if (!token) {
        this.view.onLoginError('Token tidak ditemukan pada response login.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('loggedInUser', JSON.stringify({ name, userId }));

      this.view.onLoginSuccess();
    } catch (error) {
      this.view.onLoginError('Terjadi kesalahan saat login. Silakan coba lagi.');
    }
  }
}
