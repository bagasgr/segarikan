from flask import Blueprint, current_app
import tensorflow as tf
import logging

api_bp = Blueprint('api', __name__)

# Load model sekali saat blueprint diimport
try:
    model = tf.keras.models.load_model('model/ikan_segarkan.h5')
    logging.info("✅ Model berhasil dimuat")
except Exception as e:
    logging.error(f"❌ Gagal memuat model: {e}")
    model = None

# Buat atribut model di blueprint agar bisa dipakai di module lain
api_bp.model = model
