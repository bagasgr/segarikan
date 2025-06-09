import CONFIG from '../../config.js';


export default class RegisterPage {
  async render() {
    return `
      <section class="min-h-screen flex items-center justify-center bg-gray-50 px-4 mt-9">
        <div class="max-w-md w-full bg-white rounded-xl shadow-md p-8">
          <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">Daftar Akun Baru</h2>
          <form id="register-form" class="space-y-5">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" id="name" name="name" required
                class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" required
                class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Kata Sandi</label>
              <div class="relative">
                <input type="password" id="password" name="password" required
                  class="w-full mt-1 px-4 py-2 pr-12 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <button type="button" id="toggle-password" 
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                  <svg id="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg id="eye-off-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit"
              class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">Daftar</button>
          </form>
          <p class="text-center text-sm text-gray-600 mt-6">
            Sudah punya akun?
            <a href="#/login" class="text-blue-600 hover:underline">Masuk di sini</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Fungsi toggle show/hide password
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeOffIcon = document.getElementById('eye-off-icon');

    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';

      if (isPassword) {
        passwordInput.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      } else {
        passwordInput.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      }
    });

    const form = document.querySelector('#register-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();

      if (!name || !email || !password) {
        alert('Semua field wajib diisi!');
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
          alert(result.message || 'Registrasi gagal');
          return;
        }

        alert('Registrasi berhasil! Silakan login.');
        window.location.hash = '/login';
      } catch (error) {
        alert('Terjadi kesalahan saat registrasi, coba lagi.');
        console.error('Register error:', error);
      }
    });
  }
}
