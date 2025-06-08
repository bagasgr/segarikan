from flask import Blueprint, request, jsonify
import base64
from PIL import Image
import io
import numpy as np

# Blueprint untuk modul check_fish
check_fish_bp = Blueprint('check_fish', __name__)

# Fungsi dummy untuk mendeteksi apakah ada ikan di dalam gambar
def dummy_detect_fish(image_np):
    # Simulasi deteksi: jika resolusi lebih dari 100x100, dianggap mengandung ikan
    return image_np.shape[0] > 100 and image_np.shape[1] > 100

# Route POST /api/check_fish
@check_fish_bp.route('/api/check_fish', methods=['POST'])
def check_fish():
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({'error': 'Gambar tidak ditemukan dalam permintaan.'}), 400

        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]  # Menghapus header base64 (jika ada)

        # Decode base64 ke bytes
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception:
            return jsonify({'error': 'Format gambar base64 tidak valid.'}), 400

        # Buka gambar dan ubah ke numpy array
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        except Exception:
            return jsonify({'error': 'Gagal membuka gambar. Pastikan format gambar benar.'}), 400

        image_np = np.array(image)

        # Lakukan deteksi dummy
        is_fish = dummy_detect_fish(image_np)

        return jsonify({
            'isFish': is_fish,
            'message': 'Gambar berhasil diproses'
        })

    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan pada server: {str(e)}'}), 500
