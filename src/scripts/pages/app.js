import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();

    const protectedRoutes = ['#/profile', '#/result'];
    const authRoutes = ['#/login', '#/register'];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let page = null;
    let routeParams = {};

    // Jika user sudah login tapi akses halaman login/register, redirect ke halaman profil
    if (loggedInUser && authRoutes.includes(url)) {
      window.location.hash = '#/profile';
      return;
    }

    // Jika user belum login tapi akses halaman yang butuh login, redirect ke halaman login
    if (!loggedInUser && protectedRoutes.includes(url)) {
      window.location.hash = '#/login';
      return;
    }

    for (const route in routes) {
      const paramNames = [];
      const regexPath = route.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
        paramNames.push(key);
        return '([^/]+)';
      });

      const match = url.match(new RegExp(`^${regexPath}$`));
      if (match) {
        page = routes[route];
        paramNames.forEach((key, index) => {
          routeParams[key] = match[index + 1];
        });
        break;
      }
    }

    if (!page) {
      this.#content.innerHTML = `
        <section style="padding:2rem; text-align:center;">
          <h2>404 - Halaman Tidak Ditemukan</h2>
          <p>Halaman '${url}' tidak tersedia.</p>
        </section>
      `;
      return;
    }

    // Kirim parameter ke halaman jika tersedia
    if (typeof page.setParams === 'function') {
      page.setParams(routeParams);
    }

    this.#content.innerHTML = await page.render();

    if (page.afterRender) {
      await page.afterRender();
    }

    // Update navbar setelah render
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    updateNavbar(user);
  }
}

// Fungsi global untuk memperbarui navbar sesuai status login
function updateNavbar(user) {
  const desktopUserInfo = document.getElementById('user-info-desktop');
  const mobileUserInfo = document.getElementById('user-info-mobile');

  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const loginLinkMobile = document.getElementById('login-link-mobile');
  const registerLinkMobile = document.getElementById('register-link-mobile');

  if (!desktopUserInfo || !mobileUserInfo) return;

  if (user) {
    // Sembunyikan tombol login dan daftar
    loginLink?.classList.add('hidden');
    registerLink?.classList.add('hidden');
    loginLinkMobile?.classList.add('hidden');
    registerLinkMobile?.classList.add('hidden');

    // Tampilkan info user
    desktopUserInfo.innerHTML = `
    <a href="#/profile" class="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.357 0 4.55.585 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="font-semibold">${user.name}</span>
    </a>
    <button id="logout-btn-desktop" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Logout</button>
  `;
  
  mobileUserInfo.innerHTML = `
  <a href="#/profile" class="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.357 0 4.55.585 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span class="font-semibold">${user.name}</span>
  </a>
  <button id="logout-btn-mobile" class="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Logout</button>
`;


    // Logout events
    document
      .getElementById('logout-btn-desktop')
      ?.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        location.reload();
      });
    document
      .getElementById('logout-btn-mobile')
      ?.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        location.reload();
      });
  } else {
    // Tampilkan tombol login dan daftar
    loginLink?.classList.remove('hidden');
    registerLink?.classList.remove('hidden');
    loginLinkMobile?.classList.remove('hidden');
    registerLinkMobile?.classList.remove('hidden');

    desktopUserInfo.innerHTML = '';
    mobileUserInfo.innerHTML = '';
  }
}

export default App;
