from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # biar bisa diakses dari frontend yang beda origin

@app.route('/api/check_fish', methods=['POST'])
def check_fish():
    data = request.get_json()
    image_data = data.get('image', '')
    # Contoh logika deteksi ikan (dummy)
    if image_data.startswith('data:image'):
        return jsonify({'isFish': True})
    else:
        return jsonify({'isFish': False})

@app.route('/api/check_freshness', methods=['POST'])
def check_freshness():
    data = request.get_json()
    image_data = data.get('image', '')
    # Contoh logika deteksi kesegaran ikan (dummy)
    if image_data.startswith('data:image'):
        return jsonify({'freshnessStatus': 'Segar'})
    else:
        return jsonify({'freshnessStatus': 'Tidak diketahui'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, debug=True)
