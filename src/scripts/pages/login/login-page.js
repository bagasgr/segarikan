import { initDB, getUserByEmail } from '../../data/indexdb.js';
import CONFIG from '../../config.js';

export default class LoginPage {
  async render() {
    return `
      <section class="min-h-screen flex items-center justify-center bg-gray-50 px-4 mt-9">
        <div class="max-w-md w-full bg-white rounded-xl shadow-md p-8">
          <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">Masuk ke Akun Anda</h2>
          <form id="login-form" class="space-y-5">
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
              class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">Masuk</button>
          </form>
          <p class="text-center text-sm text-gray-600 mt-6">
            Belum punya akun?
            <a href="#/register" class="text-blue-600 hover:underline">Daftar di sini</a>
          </p>
        </div>
      </section>

      <!-- Modal Notifikasi -->
      <div id="notification-modal" class="fixed inset-0 bg-black bg-opacity-50 items-center justify-center hidden z-50">
        <div class="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center relative">
          <button id="modal-close-btn" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
          <p id="modal-message" class="text-gray-800 text-lg"></p>
          <button id="modal-ok-btn" class="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">OK</button>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await initDB();

    const modal = document.getElementById('notification-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalOkBtn = document.getElementById('modal-ok-btn');

    function showModal(message) {
      modalMessage.textContent = message;
      modal.classList.remove('hidden');
      modal.classList.add('flex'); // tambahkan flex saat modal ditampilkan
    }

    function hideModal() {
      modal.classList.add('hidden');
      modal.classList.remove('flex'); // hilangkan flex saat modal disembunyikan
    }

    modalCloseBtn.addEventListener('click', hideModal);
    modalOkBtn.addEventListener('click', () => {
      hideModal();
      window.location.hash = '/';
    });

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

    const form = document.querySelector('#login-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value.trim();

      if (!email || !password) {
        alert('Semua field wajib diisi!');
        return;
      }

      try {
        const response = await fetch(`${CONFIG.BASE_URL}/v1/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        console.log('Response login:', result);

        if (!response.ok || result.error) {
          alert(result.message || 'Login gagal');
          return;
        }

        // Ambil token dan data user dari response
        const token = result.token || (result.data && result.data.token) || (result.loginResult && result.loginResult.token);
        const name = result.name || (result.data && result.data.name) || (result.loginResult && result.loginResult.name);
        const userId = result.userId || (result.data && result.data.userId) || (result.loginResult && result.loginResult.userId);

        if (!token) {
          alert('Token tidak ditemukan pada response login.');
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', JSON.stringify({ name, userId }));

        showModal('Login berhasil!');
      } catch (error) {
        alert('Terjadi kesalahan saat login. Silakan coba lagi.');
      }
    });
  }
}
