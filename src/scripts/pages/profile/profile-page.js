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
  </div>
</section>
    `;
  }

  async afterRender() {
    // Load user data
    this.loadUserData();

    // Initialize database
    await initDB();

    // Load and display history
    await this.loadHistory();

    // Add event listener for start scan button
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
      document.getElementById('user-name').textContent =
        userData.name || 'Nama Pengguna';
      document.getElementById('user-email').textContent =
        userData.email || 'email@example.com';

      // Set member since date (you can store this when user registers)
      const memberSince =
        userData.memberSince || new Date().toLocaleDateString();
      document.getElementById('member-since').textContent = memberSince;
    }
  }

  // Helper functions (same as ResultPage)
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

      // Calculate statistics
      this.calculateStatistics(filteredHistory);

      // Clear loading state
      historyContainer.innerHTML = '';
      emptyState.classList.add('hidden');

      // Sort by date (newest first)
      filteredHistory.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

      // Render each history item
      filteredHistory.forEach((item, index) => {
        const date = new Date(item.savedAt);
        const dateStr = date.toLocaleString();
        const dateIso = date.toISOString();

        // Handle both old and new result formats
        const results = item.result || [];
        if (results.length === 0) {
          return; // Skip items with no results
        }

        // Create HTML for each result in the history item
        let resultsHtml = '';
        results.forEach((result, resultIndex) => {
          let fishType = 'Tidak diketahui';
          let confidence = 'N/A';
          let confidenceColor = 'gray';
          let confidenceText = 'Tidak diketahui';

          // Handle new format (step, type, score)
          if (result.step && result.type && result.score !== undefined) {
            fishType = result.type;
            confidence = this.formatScore(result.score);
            confidenceColor = this.getConfidenceColor(result.score);
            confidenceText = this.getConfidenceText(result.score);
          }
          // Handle old format (confidence, freshness, recommendation)
          else if (result.confidence !== undefined) {
            confidence = this.formatScore(result.confidence);
            confidenceColor = this.getConfidenceColor(result.confidence);
            confidenceText = this.getConfidenceText(result.confidence);
            fishType = result.freshness || 'Tidak diketahui';
          }

          resultsHtml += `
            <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mb-3">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold text-blue-700">
                  <i class="fas fa-fish mr-1"></i>Hasil #${resultIndex + 1}
                </h4>
                <span class="text-xs text-gray-500">${
                  result.step || 'Analisis'
                }</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span class="font-medium text-gray-600">Jenis:</span>
                  <div class="text-blue-600 font-semibold">${fishType}</div>
                </div>
                <div>
                  <span class="font-medium text-gray-600">Akurasi:</span>
                  <div class="text-${confidenceColor}-600 font-semibold">${confidence}</div>
                </div>
                <div>
                  <span class="font-medium text-gray-600">Kepercayaan:</span>
                  <div class="text-${confidenceColor}-600 font-medium">${confidenceText}</div>
                </div>
              </div>
              
              ${
                result.recommendation
                  ? `
                <div class="mt-2 pt-2 border-t border-blue-200">
                  <span class="font-medium text-gray-600 text-sm">Rekomendasi:</span>
                  <div class="text-gray-700 text-sm">${result.recommendation}</div>
                </div>
              `
                  : ''
              }
            </div>
          `;
        });

        const html = `
          <div class="border rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div class="flex flex-col md:flex-row md:items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-sm font-medium text-gray-500">Scan #${
                    filteredHistory.length - index
                  }</span>
                  <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span class="text-sm font-medium text-blue-700">${
                    results.length
                  } Hasil Deteksi</span>
                </div>
                
                <p class="font-semibold text-blue-700 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <time datetime="${dateIso}">${dateStr}</time>
                </p>
                
                <div class="space-y-2">
                  ${resultsHtml}
                </div>
              </div>
              
              ${
                item.imageData
                  ? `<div class="flex-shrink-0">
                       <img src="${item.imageData}" alt="Hasil Gambar Ikan" class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shadow-sm border">
                     </div>`
                  : ''
              }
            </div>
          </div>
        `;

        historyContainer.insertAdjacentHTML('beforeend', html);
      });
    } catch (error) {
      historyContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-600">Terjadi kesalahan saat memuat riwayat.</p>
        </div>
      `;
    }
  }

  calculateStatistics(historyList) {
  const totalScans = historyList.length;
  let highConfidenceCount = 0;
  let lowConfidenceCount = 0;

  historyList.forEach((item) => {
    const results = item.result || [];
    results.forEach((result) => {
      let score = null;

      // Handle new format
      if (result.score !== undefined) {
        score = result.score;
      }
      // Handle old format
      else if (result.confidence !== undefined) {
        score = result.confidence;
      }

      if (score !== null) {
        const percentage = parseFloat(score) * 100;
        if (percentage >= 80) {
          highConfidenceCount += 1;
        } else if (percentage < 60) {
          lowConfidenceCount += 1;
        }
      }
    });
  });

    document.getElementById('total-scans').textContent = totalScans;
    document.getElementById('high-confidence-count').textContent =
      highConfidenceCount;
    document.getElementById('low-confidence-count').textContent =
      lowConfidenceCount;
  }
}
