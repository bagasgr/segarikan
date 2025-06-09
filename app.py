from flask import Flask, request, jsonify
from flask_cors import CORS 
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Load model-model
model1 = tf.keras.models.load_model('model/model_cek_ikan.h5')
model2 = tf.keras.models.load_model('model/model_cek_kepala_ikan.h5')
model3 = tf.keras.models.load_model('model/model_last_ikan.h5')

def decode_image(base64_string):
    image_bytes = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

def predict_with_models(img_tensor):
    preds = []
    for model, label in zip(
        [model1, model2, model3],
        ['Ikan Umum', 'Kepala Ikan', 'Model Lain']
    ):
        prob = model.predict(img_tensor)[0][0]
        result = {
            "freshness": "Segar" if prob > 0.5 else "Tidak Segar",
            "confidence": round(float(prob), 2),
            "fish_type": label,
            "recommendation": "Disarankan langsung dimasak atau disimpan di suhu dingin." if prob > 0.5 else "Sebaiknya tidak dikonsumsi langsung."
        }
        preds.append(result)
    return preds

@app.route('/')
def home():
    return "Flask server ready!"

@app.route('/api/check_fish', methods=['POST', 'OPTIONS'])
def check_fish():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        image_data = data.get('image')
        result = {
            "status": "success",
            "message": "Fish checked successfully",
            "image_length": len(image_data) if image_data else 0
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/check_freshness', methods=['POST', 'OPTIONS'])
def check_freshness():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        image_data = data.get('image')
        result = {
            "status": "success",
            "message": "Freshness checked successfully",
            "image_length": len(image_data) if image_data else 0
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        image_data = data.get('image')

        if not image_data:
            return jsonify({"error": "Gambar tidak ditemukan"}), 400

        img_tensor = decode_image(image_data)
        results = predict_with_models(img_tensor)

        return jsonify({"result": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/v1/stories', methods=['POST', 'OPTIONS'])
def save_story():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()

        image_data = data.get('imageData')
        result = data.get('result')
        created_at = data.get('createdAt')

        if not image_data or not result or not created_at:
            return jsonify({"status": "error", "message": "Data tidak lengkap"}), 400

        # Contoh logika dummy (belum simpan ke DB)
        response = {
            "status": "success",
            "message": "Data berhasil disimpan",
            "data": {
                "imageData": f"{image_data[:30]}...",  # tampilkan sebagian
                "result": result,
                "createdAt": created_at
            }
        }
        return jsonify(response), 201
    
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    
@app.route('/api/history', methods=['GET'])
def get_history():
    # Contoh data dummy riwayat kesegaran ikan
    history_data = [
        {"freshness": "Segar", "actualFreshness": "Segar"},
        {"freshness": "Tidak Segar", "actualFreshness": "Tidak Segar"},
        {"freshness": "Segar", "actualFreshness": "Segar"},
        {"freshness": "Segar", "actualFreshness": "Tidak Segar"},
    ]
    return jsonify(history_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, debug=True)
