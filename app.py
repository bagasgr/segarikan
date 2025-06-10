import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64

# Init Flask
app = Flask(__name__)

# Dynamic CORS
allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
print(f"Allowed origins: {allowed_origins}")  # Debug CORS ENV

CORS(app, supports_credentials=True, resources={r"/*": {"origins": allowed_origins}})

# Simpan user sementara di memori
registered_users = []

# Load model-model
model1 = tf.keras.models.load_model('model/model_cek_ikan.h5')
model2 = tf.keras.models.load_model('model/model_cek_kepala_ikan.h5')
model3 = tf.keras.models.load_model('model/model_last_ikan.h5')

# Image decoder
def decode_image(base64_string):
    image_bytes = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

# Predict with models
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

# Routes
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

        response = {
            "status": "success",
            "message": "Data berhasil disimpan (tanpa file)",
            "data": {
                "imageData": f"{image_data[:30]}...",
                "result": result,
                "createdAt": created_at
            }
        }
        return jsonify(response), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    history_data = [
        {"freshness": "Segar", "actualFreshness": "Segar"},
        {"freshness": "Tidak Segar", "actualFreshness": "Tidak Segar"},
        {"freshness": "Segar", "actualFreshness": "Segar"},
        {"freshness": "Segar", "actualFreshness": "Tidak Segar"},
    ]
    return jsonify(history_data)
# === REGISTER ROUTES ===

# /api/v1/register → biarkan tetap
@app.route('/api/v1/register', methods=['POST', 'OPTIONS'])
# /v1/register → tambahkan supaya frontend bisa pakai BASE_URL yang sekarang
@app.route('/v1/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        full_name = data.get('fullName')
        email = data.get('email')
        password = data.get('password')

        if not full_name or not email or not password:
            return jsonify({"status": "error", "message": "Data tidak lengkap"}), 400

        if any(user["email"] == email for user in registered_users):
            return jsonify({"status": "error", "message": "Email sudah terdaftar"}), 409

        registered_users.append({
            "fullName": full_name,
            "email": email,
            "password": password
        })

        return jsonify({"status": "success", "message": "Registrasi berhasil"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route('/api/v1/login', methods=['POST', 'OPTIONS'])
@app.route('/v1/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"status": "error", "message": "Data tidak lengkap"}), 400

        user = next((user for user in registered_users if user['email'] == email and user['password'] == password), None)

        if not user:
            return jsonify({"status": "error", "message": "Email atau password salah"}), 401

        return jsonify({
            "status": "success",
            "message": "Login berhasil",
            "user": {
                "fullName": user['fullName'],
                "email": user['email']
            }
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# Main entry point
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 9000))  # PORT dynamic
    app.run(host='0.0.0.0', port=port, debug=True)
