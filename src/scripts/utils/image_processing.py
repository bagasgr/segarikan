from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import sys
import os

# Tambahkan path utils
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils import image_processing

app = Flask(__name__)

# Muat model yang sudah dilatih (ganti path jika perlu)
model = tf.keras.models.load_model('model/namafile_model.h5')

# Definisikan nama kelas (ganti sesuai label kamu)
class_names = ['Apel', 'Jeruk', 'Mangga']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        image_data = data['image']
        img = image_processing.decode_base64_image(image_data)
        processed_img = image_processing.preprocess_image(img)
        predictions = model.predict(processed_img)
        predicted_class = class_names[np.argmax(predictions)]
        return jsonify({'prediction': predicted_class})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
