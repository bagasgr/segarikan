import { initDB, getAllHistoryFromDB } from '../../data/indexdb.js';

export default class ProfilePage {
  async render() {
    return `
<section class="relative px-4 py-20 bg-gradient-to-b from-blue-50 to-white min-h-[90vh]">
  <div class="container mx-auto max-w-6xl">
    <!-- Profile Header -->
    <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="text-center md:text-left">
          <h1 class="text-3xl font-bold text-blue-700 mb-2" id="user-name">Nama Pengguna</h1>
          <p class="text-gray-600" id="user-email">email@example.com</p>
          <p class="text-sm text-gray-500 mt-1">Member sejak <span id="member-since">-</span></p>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Total Scan</p>
            <p class="text-2xl font-bold text-blue-700" id="total-scans">0</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Deteksi Tinggi</p>
            <p class="text-2xl font-bold text-green-700" id="high-confidence-count">0</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Deteksi Rendah</p>
            <p class="text-2xl font-bold text-yellow-700" id="low-confidence-count">0</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div id="history-container" class="space-y-4">
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="ml-3 text-gray-600">Memuat riwayat...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div id="empty-state" class="hidden text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Belum Ada Riwayat Scan</h3>
      <p class="text-gray-500 mb-4">Mulai scan ikan pertama Anda untuk melihat riwayat di sini</p>
      <button id="start-scan-btn" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
        Mulai Scan Sekarang
      </button>
    </div>
  </div>
</section>
    `;
  }

  async afterRender() {
    this.loadUserData();
    await initDB();
    await this.loadHistory();

    const startScanBtn = document.getElementById('start-scan-btn');
    if (startScanBtn) {
      startScanBtn.addEventListener('click', () => {
        window.location.hash = '#/scan';
      });
    }
  }

  loadUserData() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      document.getElementById('user-name').textContent = userData.name || 'Nama Pengguna';
      document.getElementById('user-email').textContent = userData.email || 'email@example.com';
      const memberSince = userData.memberSince || new Date().toLocaleDateString();
      document.getElementById('member-since').textContent = memberSince;
    }
  }

  formatScore(score) {
    if (score === undefined || score === null) return 'N/A';
    const percentage = (parseFloat(score) * 100).toFixed(1);
    return `${percentage}%`;
  }

  getConfidenceColor(score) {
    if (score === undefined || score === null) return 'gray';
    const percentage = parseFloat(score) * 100;
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  }

  getConfidenceText(score) {
    if (score === undefined || score === null) return 'Tidak diketahui';
    const percentage = parseFloat(score) * 100;
    if (percentage >= 80) return 'Tinggi';
    if (percentage >= 60) return 'Sedang';
    return 'Rendah';
  }

  async loadHistory() {
    const historyContainer = document.getElementById('history-container');
    const emptyState = document.getElementById('empty-state');

    try {
      const historyList = await getAllHistoryFromDB();
      const loggedInUser = localStorage.getItem('loggedInUser');
      const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : null;

      const filteredHistory = userEmail
        ? historyList.filter((item) => item.email === userEmail)
        : [];

      if (!filteredHistory || filteredHistory.length === 0) {
        historyContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
      }

      // Tampilkan statistik
      this.calculateStatistics(filteredHistory);

      // Kosongkan loading
      historyContainer.innerHTML = '';
      emptyState.classList.add('hidden');

      // Urutkan dari terbaru
      filteredHistory.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

      filteredHistory.forEach((item) => {
        const date = new Date(item.savedAt);
        const dateStr = date.toLocaleString();
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow p-4';

        card.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold text-blue-600">${item.fishName || 'Ikan Tidak Dikenal'}</p>
              <p class="text-sm text-gray-500">${dateStr}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-600">Confidence</p>
              <p class="text-lg font-bold text-${this.getConfidenceColor(item.score)}-600">
                ${this.formatScore(item.score)}
              </p>
              <p class="text-sm text-gray-500">${this.getConfidenceText(item.score)}</p>
            </div>
          </div>
        `;
        historyContainer.appendChild(card);
      });
    } catch (error) {
      console.error('Gagal memuat riwayat:', error);
    }
  }

  calculateStatistics(history) {
    const totalScans = history.length;
    const highConfidence = history.filter((item) => item.score >= 0.8).length;
    const lowConfidence = history.filter((item) => item.score < 0.6).length;

    document.getElementById('total-scans').textContent = totalScans;
    document.getElementById('high-confidence-count').textContent = highConfidence;
    document.getElementById('low-confidence-count').textContent = lowConfidence;
  }
}
