// CSS imports
import '../styles/styles.css';
import { initDB, getUserByEmail } from '@data/indexdb.js';




import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const updateHeaderVisibility = () => {
    const header = document.querySelector('header');
    const currentHash = window.location.hash;
    if (currentHash === '#/login' || currentHash === '#/register') {
      header.style.display = 'none';
    } else {
      header.style.display = 'block';
    }
  };

  // Render page pertama dan atur visibilitas header
  await app.renderPage();
  updateHeaderVisibility();

  // Toggle menu navigasi
  const drawerButton = document.querySelector('#drawer-button');
  const navigationDrawer = document.querySelector('#navigation-drawer');

  drawerButton.addEventListener('click', () => {
    navigationDrawer.classList.toggle('hidden');
  });

  // Hash change listener: render ulang halaman dan perbarui header
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    updateHeaderVisibility();
  });
});
