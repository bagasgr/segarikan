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
    this.scanBtn = document.getElementById('scan-btn');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalOkBtn = document.getElementById('modal-ok-btn');

    this.modalCloseBtn?.addEventListener('click', () => this.hideModal());
    this.modalOkBtn?.addEventListener('click', () => this.hideModal());

    this.scanBtn?.addEventListener('click', () => {
      const token = localStorage.getItem('token');
      if (!token) {
        this.showModal('Silakan login terlebih dahulu untuk menggunakan fitur scan.');
      } else {
        window.location.href = '#/scan';
      }
    });

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

      const regexFresh = /\b(segar|fresh|baik|bagus|fresh sekali)\b/i;

      for (const item of localHistory) {
        // --- Machine Learning result ---
        let freshnessML = 
          typeof item.freshness === 'string' && item.freshness.trim() !== '' ? item.freshness.toLowerCase().trim() :
          typeof item.result === 'string' && item.result.trim() !== '' ? item.result.toLowerCase().trim() :
          typeof item.freshness === 'boolean' ? (item.freshness ? 'fresh' : 'not fresh') :
          '';

        regexFresh.lastIndex = 0; // reset regex state
        const isFreshML = regexFresh.test(freshnessML);
        if (isFreshML) freshCountML++;
        else notFreshCountML++;

        // --- Actual result ---
        let freshnessActual =
          typeof item.actualFreshness === 'string' && item.actualFreshness.trim() !== '' ? item.actualFreshness.toLowerCase().trim() :
          typeof item.actual === 'string' && item.actual.trim() !== '' ? item.actual.toLowerCase().trim() :
          typeof item.actualFreshness === 'boolean' ? (item.actualFreshness ? 'fresh' : 'not fresh') :
          '';

        regexFresh.lastIndex = 0;
        const isFreshActual = regexFresh.test(freshnessActual);
        if (isFreshActual) freshCountActual++;
        else notFreshCountActual++;
      }

      const totalML = freshCountML + notFreshCountML;
      const totalActual = freshCountActual + notFreshCountActual;

      const freshPercentML = totalML > 0 ? (freshCountML / totalML) * 100 : 0;
      const notFreshPercentML = totalML > 0 ? (notFreshCountML / totalML) * 100 : 0;

      const freshPercentActual = totalActual > 0 ? (freshCountActual / totalActual) * 100 : 0;
      const notFreshPercentActual = totalActual > 0 ? (notFreshCountActual / totalActual) * 100 : 0;

      this.renderChartML({
        fresh: freshPercentML,
        notFresh: notFreshPercentML,
      });

      this.renderChartActual({
        fresh: freshPercentActual,
        notFresh: notFreshPercentActual,
      });

    } catch (error) {
      console.error('Error loadChartData:', error);
    }
  }

  renderChartML(data) {
    const ctxML = document.getElementById('historyChartML')?.getContext('2d');
    if (!ctxML) return;

    this.chartInstanceML?.destroy();

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
              label: ctx => `${ctx.label}: ${ctx.parsed.toFixed(2)}%`,
            },
          },
        },
        cutout: '60%',
      },
    });
  }

 renderChartActual(data) {
  const ctxActual = document.getElementById('historyChartActual')?.getContext('2d');
  if (!ctxActual) return;

  this.chartInstanceActual?.destroy();

  this.chartInstanceActual = new Chart(ctxActual, {
    type: 'bar',
    data: {
      labels: ['Segar', 'Tidak Segar'],
      datasets: [{
        label: 'Persentase Kesegaran Aktual',
        data: [data.fresh, data.notFresh],
        backgroundColor: ['#3b82f6', '#ef4444'], // Biru cerah dan Merah
        borderRadius: 10,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: value => value + '%',
            font: { size: 14, weight: 'bold' },
            color: '#334155',
          },
          grid: {
            color: '#e2e8f0',
          },
          title: {
            display: true,
            text: 'Persentase (%)',
            color: '#334155',
            font: { size: 16, weight: 'bold' },
          }
        },
        x: {
          ticks: {
            font: { size: 14, weight: 'bold' },
            color: '#334155',
          },
          grid: {
            display: false,
          },
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#2563eb',
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: ctx => `${ctx.parsed.y.toFixed(2)}%`,
          },
        },
        title: {
          display: true,
          text: 'Distribusi Kesegaran Aktual (Bar Chart)',
          font: { size: 18, weight: 'bold' },
          color: '#1e40af',
          padding: { bottom: 20 },
        },
      },
      cornerRadius: 10,
    },
  });
}


  showModal(message) {
    const modal = document.getElementById('notification-modal');
    const msgElem = document.getElementById('modal-message');

    if (modal && msgElem) {
      msgElem.textContent = message;
      modal.classList.remove('hidden');
    }
  }

  hideModal() {
    const modal = document.getElementById('notification-modal');
    if (modal) modal.classList.add('hidden');
  }
}
