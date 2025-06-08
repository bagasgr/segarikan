import { initDB, getAllHistoryFromDB } from '../../data/indexdb.js';
import Chart from 'chart.js/auto';

export default class HomePage {
  constructor() {
    this.chartInstanceML = null;    // chart ML
    this.chartInstanceActual = null; // chart Aktual
    this.scanBtn = null;
    this.modalCloseBtn = null;
    this.modalOkBtn = null;
  }

  async render() {
    return `
<section class="relative px-4 py-20 bg-gradient-to-b from-blue-50 to-white min-h-[90vh] flex flex-col items-center overflow-hidden">
  <div class="container mx-auto max-w-6xl relative mt-20">
    <div class="flex flex-col md:flex-row items-center gap-12">
      <!-- Konten Kiri -->
      <div class="text-left md:w-1/2">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-700 mb-4 leading-tight">
          Segarikan: Deteksi Kesegaran Ikan Secara Instan
        </h1>
        <p class="text-gray-700 text-lg mb-8 leading-relaxed max-w-xl">
          Sistem berbasis web untuk mendeteksi kesegaran ikan secara cepat dan akurat menggunakan teknologi AI canggih. Dapatkan hasil dalam hitungan detik.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 mb-12">
          <button id="scan-btn" class="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-lg text-lg font-medium">
            Scan Kesegaran Ikan
          </button>
        </div>

        <div class="mt-12">
          <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Distribusi Kesegaran (Machine Learning)</h3>
          <canvas id="historyChartML" class="max-w-xl mx-auto mb-8"></canvas>

          <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Distribusi Kesegaran (Aktual)</h3>
          <canvas id="historyChartActual" class="max-w-xl mx-auto"></canvas>
        </div>
      </div>

      <!-- Konten Kanan: Gambar -->
      <div class="md:w-1/2 hidden md:block">
        <img src="./images/fish.png" alt="Ilustrasi Ikan Segar" class="max-w-full h-auto" />
      </div>
    </div>
  </div>
</section>

<!-- How It Works Section -->
<section class="px-4 py-16 bg-blue-50">
  <div class="container mx-auto max-w-6xl">
    <div class="text-center mb-12">
      <span class="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-3">CARA KERJA</span>
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Deteksi Kesegaran Ikan dalam 3 Langkah Mudah</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">Proses sederhana dan cepat untuk mengetahui kesegaran ikan Anda.</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="relative">
        <div class="bg-white rounded-xl shadow-md p-8 relative z-10">
          <div class="w-12 h-12 bg-blue-600 rounded-full text-white font-bold flex items-center justify-center mb-6">1</div>
          <h3 class="text-xl font-bold text-blue-700 mb-3">Unggah Gambar</h3>
          <p class="text-gray-600">Ambil foto ikan atau unggah gambar dari galeri Anda.</p>
        </div>
      </div>
      <div class="relative">
        <div class="bg-white rounded-xl shadow-md p-8 relative z-10">
          <div class="w-12 h-12 bg-blue-600 rounded-full text-white font-bold flex items-center justify-center mb-6">2</div>
          <h3 class="text-xl font-bold text-blue-700 mb-3">Analisis AI</h3>
          <p class="text-gray-600">Sistem akan menganalisis gambar untuk menentukan tingkat kesegaran.</p>
        </div>
      </div>
      <div class="relative">
        <div class="bg-white rounded-xl shadow-md p-8 relative z-10">
          <div class="w-12 h-12 bg-blue-600 rounded-full text-white font-bold flex items-center justify-center mb-6">3</div>
          <h3 class="text-xl font-bold text-blue-700 mb-3">Lihat Hasil</h3>
          <p class="text-gray-600">Dapatkan laporan kesegaran secara instan dan rekomendasi konsumsi.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Modal Notifikasi -->
<div id="notification-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
  <div class="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center relative">
    <button id="modal-close-btn" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold" aria-label="Close Modal">&times;</button>
    <p id="modal-message" class="text-gray-800 text-lg"></p>
    <button id="modal-ok-btn" class="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">OK</button>
  </div>
</div>
    `;
  }

  async afterRender() {
    // Ambil elemen tombol dan modal
    this.scanBtn = document.getElementById('scan-btn');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalOkBtn = document.getElementById('modal-ok-btn');

    // Event listener untuk modal close
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.hideModal());
    }
    if (this.modalOkBtn) {
      this.modalOkBtn.addEventListener('click', () => this.hideModal());
    }

    // Event listener untuk tombol scan
    if (this.scanBtn) {
      this.scanBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (!token) {
          this.showModal('Silakan login terlebih dahulu untuk menggunakan fitur scan.');
        } else {
          window.location.href = '#/scan';
        }
      });
    }

    // Inisialisasi DB dan load data chart
    await initDB();
    await this.loadChartData();
  }

  async loadChartData() {
    try {
      const localHistory = await getAllHistoryFromDB();
      console.log('Riwayat dari IndexedDB:', localHistory);

      let freshCountML = 0;
      let notFreshCountML = 0;

      let freshCountActual = 0;
      let notFreshCountActual = 0;

      // Regex untuk mendeteksi kata dasar segar/fresh/baik/dsb dengan case insensitive
      const regexFresh = /\b(segar|fresh|baik|bagus|fresh sekali)\b/i;

      localHistory.forEach(item => {
        // --- Machine Learning result ---
        let freshnessRawML = '';
        if (typeof item.freshness === 'string' && item.freshness.trim() !== '') {
          freshnessRawML = item.freshness.toLowerCase().trim();
        } else if (typeof item.result === 'string' && item.result.trim() !== '') {
          freshnessRawML = item.result.toLowerCase().trim();
        } else if (typeof item.freshness === 'boolean') {
          freshnessRawML = item.freshness ? 'fresh' : 'not fresh';
        } else {
          freshnessRawML = '';
        }
        const isFreshML = regexFresh.test(freshnessRawML);
        if (isFreshML) freshCountML++;
        else notFreshCountML++;

        // --- Actual result (asumsi ada di properti actualFreshness atau actual) ---
        let freshnessRawActual = '';
        if (typeof item.actualFreshness === 'string' && item.actualFreshness.trim() !== '') {
          freshnessRawActual = item.actualFreshness.toLowerCase().trim();
        } else if (typeof item.actual === 'string' && item.actual.trim() !== '') {
          freshnessRawActual = item.actual.toLowerCase().trim();
        } else if (typeof item.actualFreshness === 'boolean') {
          freshnessRawActual = item.actualFreshness ? 'fresh' : 'not fresh';
        } else {
          freshnessRawActual = '';
        }
        const isFreshActual = regexFresh.test(freshnessRawActual);
        if (isFreshActual) freshCountActual++;
        else notFreshCountActual++;
      });

      // Hitung persentase ML
      const totalML = freshCountML + notFreshCountML;
      const freshPercentML = totalML > 0 ? (freshCountML / totalML) * 100 : 0;
      const notFreshPercentML = totalML > 0 ? (notFreshCountML / totalML) * 100 : 0;

      // Hitung persentase Actual
      const totalActual = freshCountActual + notFreshCountActual;
      const freshPercentActual = totalActual > 0 ? (freshCountActual / totalActual) * 100 : 0;
      const notFreshPercentActual = totalActual > 0 ? (notFreshCountActual / totalActual) * 100 : 0;

      // Render Chart ML dengan doughnut chart (seperti sebelumnya)
      this.renderChartML({
        fresh: freshPercentML,
        notFresh: notFreshPercentML,
      });

      // Render Chart Actual dengan line chart (modifikasi sesuai permintaan)
      this.renderChartActual({
        fresh: freshPercentActual,
        notFresh: notFreshPercentActual,
      });
    } catch (error) {
      console.error('Error loadChartData:', error);
    }
  }

  renderChartML(data) {
    const ctxML = document.getElementById('historyChartML').getContext('2d');

    // Hapus chart sebelumnya jika ada
    if (this.chartInstanceML) {
      this.chartInstanceML.destroy();
    }

    this.chartInstanceML = new Chart(ctxML, {
      type: 'doughnut',
      data: {
        labels: ['Segar', 'Tidak Segar'],
        datasets: [{
          data: [data.fresh, data.notFresh],
          backgroundColor: ['#22c55e', '#ef4444'], // Hijau dan Merah
          hoverBackgroundColor: ['#16a34a', '#b91c1c'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 14 } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed.toFixed(2)}%`;
              }
            }
          },
        },
        cutout: '70%',
      }
    });
  }

  renderChartActual(data) {
    const ctxActual = document.getElementById('historyChartActual').getContext('2d');

    // Hapus chart sebelumnya jika ada
    if (this.chartInstanceActual) {
      this.chartInstanceActual.destroy();
    }

    // Karena kita ingin line chart dengan 2 titik data (fresh & not fresh)
    // Saya akan buat label sederhana ["Tidak Segar", "Segar"] agar data terlihat naik turun

    this.chartInstanceActual = new Chart(ctxActual, {
      type: 'line',
      data: {
        labels: ['Tidak Segar', 'Segar'],
        datasets: [{
          label: 'Distribusi Aktual (%)',
          data: [data.notFresh, data.fresh],
          fill: false,
          borderColor: '#3b82f6', // Biru cerah
          backgroundColor: '#3b82f6',
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#2563eb',
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            title: {
              display: true,
              text: 'Persentase (%)',
              font: { size: 14, weight: 'bold' }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Kategori Kesegaran',
              font: { size: 14, weight: 'bold' }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { size: 14 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y.toFixed(2)}%`;
              }
            }
          }
        }
      }
    });
  }

  showModal(message) {
    const modal = document.getElementById('notification-modal');
    const modalMessage = document.getElementById('modal-message');
    if (modal && modalMessage) {
      modalMessage.textContent = message;
      modal.classList.remove('hidden');
    }
  }

  hideModal() {
    const modal = document.getElementById('notification-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}
