// src/views/pages/ResultPage.js
import { saveHistoryToDB } from '../../data/indexdb.js';

export default class ResultPage {
  async render() {
    return `
      <section class="px-4 py-10 min-h-screen bg-gradient-to-b from-white to-blue-50 mt-16">
        <div class="max-w-3xl mx-auto">
          <div class="bg-white rounded-2xl shadow-xl p-6 md:p-10 text-center">
            <h1 class="text-2xl md:text-4xl font-bold text-blue-700 mb-6">Hasil Pemeriksaan Ikan</h1>

            <div id="image-section" class="mb-6">
              <img id="result-image" src="" alt="Hasil Scan" class="mx-auto rounded-lg shadow-md max-h-96" />
            </div>

            <div id="fish-warning" class="hidden mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    Peringatan: Gambar Bukan Ikan
                  </h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>Gambar yang Anda upload tampaknya bukan gambar ikan. Untuk hasil yang optimal, silakan upload gambar ikan yang jelas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="low-confidence-warning" class="hidden mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-circle text-yellow-400 text-xl"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">
                    Peringatan: Kepercayaan Rendah
                  </h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <p>Hasil deteksi memiliki tingkat kepercayaan yang rendah. Coba upload gambar ikan yang lebih jelas atau dengan pencahayaan yang baik.</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="result-content" class="text-left hidden">
              <h2 class="text-xl font-semibold text-gray-700 mb-6">Detail Hasil:</h2>
              <div id="result-list" class="space-y-6"></div>
            </div>

            <div id="non-fish-message" class="hidden text-center"></div>

            <div class="mt-10 space-y-4">
              <button id="save-button" class="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-semibold" disabled>
                <i class="fas fa-save mr-2"></i>Simpan Hasil Scan
              </button>

              <a href="#/scan" class="inline-block w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-semibold">
                <i class="fas fa-redo-alt mr-2"></i>Scan Ulang
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="notification-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white w-11/12 max-w-sm rounded-xl shadow-xl p-6 text-center">
          <div id="modal-icon" class="text-4xl mb-4 text-green-600">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 id="modal-message" class="text-lg font-semibold text-gray-700 mb-4">Berhasil menyimpan hasil scan!</h3>
          <button id="close-modal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Tutup
          </button>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const resultImage = document.getElementById('result-image');
    const resultList = document.getElementById('result-list');
    const saveButton = document.getElementById('save-button');
    const fishWarning = document.getElementById('fish-warning');
    const lowConfidenceWarning = document.getElementById('low-confidence-warning');
    const resultContent = document.getElementById('result-content');
    const modal = document.getElementById('notification-modal');
    const closeModal = document.getElementById('close-modal');

    if (!resultImage || !resultList || !saveButton || !fishWarning || !lowConfidenceWarning || !resultContent || !modal || !closeModal) {
      console.error('Element DOM tidak lengkap, proses dibatalkan.');
      return;
    }

    const storedData = sessionStorage.getItem('scanResult');
    if (!storedData) {
      resultList.innerHTML = '<div class="text-red-600 p-4 bg-red-50 rounded-lg">Data hasil tidak ditemukan.</div>';
      saveButton.disabled = true;
      return;
    }

    let data;
    try {
      data = JSON.parse(storedData);
    } catch (error) {
      resultList.innerHTML = '<div class="text-red-600 p-4 bg-red-50 rounded-lg">Data hasil rusak.</div>';
      saveButton.disabled = true;
      return;
    }

    resultImage.src = data.imageData || '';

    // Fungsi cek apakah gambar berisi ikan
    const checkIfFishImage = (results) => {
      if (!Array.isArray(results) || results.length === 0) {
        return { isFish: false, maxConfidence: 0, reason: 'no_detection' };
      }

      const fishKeywords = ['fish','ikan','tuna','salmon','cod','mackerel','snapper','grouper','bass','trout','sardine','anchovy','herring','mahi','swordfish','marlin','flounder','sole','halibut','catfish','carp','pike','perch','tilapia','barramundi','sea bass','red snapper','yellowtail','amberjack','bandeng','gurame','lele','nila','kakap','tenggiri','tongkol','cakalang','kembung','patin','bawal','belut'];

      const nonFishKeywords = ['person','orang','manusia','human','people','cat','kucing','dog','anjing','bird','burung','car','mobil','vehicle','kendaraan','building','gedung','bangunan','house','rumah','food','makanan','meal','dish','hidangan','object','objek','thing','barang','hand','tangan','finger','jari','face','wajah','muka','plant','tanaman','tree','pohon','bottle','botol','cup','gelas','phone','handphone','smartphone','table','meja','chair','kursi','book','buku','paper','kertas','cloth','baju','shirt','kemeja'];

      let maxConfidence = 0;
      let fishDetected = false;
      let nonFishDetected = false;

      for (const item of results) {
        const score = parseFloat(item.score) || 0;
        const type = (item.type || '').toLowerCase();

        maxConfidence = Math.max(maxConfidence, score);

        if (fishKeywords.some(keyword => type.includes(keyword))) fishDetected = true;
        if (nonFishKeywords.some(keyword => type.includes(keyword))) nonFishDetected = true;
        if (type.includes('bukan') && type.includes('ikan')) nonFishDetected = true;
      }

      if (nonFishDetected && maxConfidence >= 0.3) return { isFish: false, maxConfidence, reason: 'non_fish_detected' };
      if (!fishDetected && maxConfidence < 0.4) return { isFish: false, maxConfidence, reason: 'low_confidence_no_fish' };
      if (fishDetected && maxConfidence >= 0.3) return { isFish: true, maxConfidence, reason: 'fish_detected' };

      return { isFish: maxConfidence >= 0.6 && !nonFishDetected, maxConfidence, reason: 'uncertain' };
    };

    const result = data.result || [];
    const fishCheck = checkIfFishImage(result);

    // Reset tampilan
    fishWarning.classList.add('hidden');
    lowConfidenceWarning.classList.add('hidden');
    resultContent.classList.add('hidden');
    saveButton.disabled = true;

    if (!fishCheck.isFish) {
      fishWarning.classList.remove('hidden');
      saveButton.disabled = true;
      resultList.innerHTML = '';
    } else {
      resultContent.classList.remove('hidden');
      fishWarning.classList.add('hidden');

      if (fishCheck.maxConfidence < 0.5) {
        lowConfidenceWarning.classList.remove('hidden');
      }

      // Tambahan: Detail hasil utama (hasil deteksi #1) di atas
      const mainResult = result[0] || {};
      const mainScore = (parseFloat(mainResult.score || 0) * 100).toFixed(1);
      let confidenceLevel = 'Rendah';
      let confidenceColor = 'text-red-600';

      if (mainScore >= 80) {
        confidenceLevel = 'Tinggi';
        confidenceColor = 'text-green-600';
      } else if (mainScore >= 50) {
        confidenceLevel = 'Sedang';
        confidenceColor = 'text-yellow-600';
      }

      // Warna progress bar berdasar confidence
      let progressColor = 'bg-green-500';
      if (mainScore < 40) progressColor = 'bg-red-500';
      else if (mainScore < 70) progressColor = 'bg-yellow-400';

      // Buat detail hasil lengkap dengan desain card yang menarik
      resultList.innerHTML = `
        <div class="p-6 bg-white rounded-xl shadow-lg border border-blue-200">
          <h3 class="text-lg font-semibold text-blue-700 mb-4">Hasil Deteksi #1</h3>
          <ul class="text-gray-700 space-y-2 text-sm">
            <li><span class="font-semibold">Jenis Ikan:</span> ${mainResult.type || '-'}</li>
            <li><span class="font-semibold">Status:</span> ${mainResult.type && mainResult.type.toLowerCase().includes('seg') ? 'Segar' : 'Tidak Segar'}</li>
            <li><span class="font-semibold">Akurasi:</span> ${mainScore}%</li>
            <li><span class="font-semibold">Tingkat Kepercayaan:</span> <span class="${confidenceColor} font-semibold">${confidenceLevel}</span></li>
          </ul>
          <div class="mt-4 w-full bg-gray-300 rounded-full h-4">
            <div class="${progressColor} h-4 rounded-full transition-all duration-500" style="width: ${mainScore}%;"></div>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          ${result.slice(1).map((item, idx) => {
            const scorePct = (parseFloat(item.score || 0) * 100).toFixed(1);
            let color = 'text-gray-700';
            if (scorePct >= 70) color = 'text-green-600';
            else if (scorePct >= 40) color = 'text-yellow-600';
            else color = 'text-red-600';

            return `
              <div class="p-4 bg-white rounded-lg shadow border border-gray-200">
                <h4 class="font-semibold text-gray-800 mb-1">Alternatif #${idx + 2}</h4>
                <p><span class="font-semibold">Jenis Ikan:</span> ${item.type || '-'}</p>
                <p><span class="font-semibold">Akurasi:</span> <span class="${color}">${scorePct}%</span></p>
              </div>
            `;
          }).join('')}
        </div>
      `;

      saveButton.disabled = false;
    }

    saveButton.onclick = async () => {
      if (saveButton.disabled) return;
      saveButton.disabled = true;

      try {
        const historyData = {
          imageData: data.imageData,
          result: data.result,
          createdAt: new Date().toISOString(),
        };

        await saveHistoryToDB(historyData);

        // Show modal sukses
        modal.classList.remove('hidden');
      } catch (err) {
        alert('Gagal menyimpan hasil scan. Silakan coba lagi.');
        saveButton.disabled = false;
      }
    };

    closeModal.onclick = () => {
      modal.classList.add('hidden');
    };
  }
}
