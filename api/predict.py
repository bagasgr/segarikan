from flask import request, jsonify, current_app
from . import api_bp
from utils.image_processing import decode_base64_image, preprocess_image
import numpy as np

class_names = ['Kurang Segar', 'Segar']

@api_bp.route('/predict', methods=['POST'])
def predict():
    model = getattr(api_bp, 'model', None)
    if model is None:
        return jsonify({"error": "Model belum dimuat"}), 500
    
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "Tidak ada data gambar"}), 400

        img = decode_base64_image(data['image'])
        processed_img = preprocess_image(img)
        predictions = model.predict(processed_img)

        confidence = float(np.max(predictions))
        class_idx = np.argmax(predictions)
        prediction = class_names[class_idx]

        return jsonify({
            "prediction": prediction,
            "confidence": confidence
        })

    except Exception as e:
        current_app.logger.error(f"Error predict: {e}")
        return jsonify({"error": str(e)}), 500
