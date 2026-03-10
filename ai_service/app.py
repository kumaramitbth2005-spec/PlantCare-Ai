import os
import io
import time
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# Try to import TensorFlow
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("TensorFlow not installed. Running in demo mode.")

# Import config values
import sys
# Add current directory to path to find src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.config import MODEL_PATH, CLASS_NAMES, IMG_SIZE

from utils.disease_info import get_disease_info
from utils.llm_helper import generate_ai_insights

app = Flask(__name__)
CORS(app)

# Load the model directly or via a lazy loader
model = None

def load_ml_model():
    global model
    if model is None:
        if not TF_AVAILABLE:
            print("TensorFlow not available. Using demo mode.")
            model = "demo_mode"
            return
        try:
            print(f"Loading model from {MODEL_PATH}...")
            if os.path.exists(MODEL_PATH):
                model = tf.keras.models.load_model(MODEL_PATH)
                print("Model loaded successfully.")
            else:
                print(f"Model file not found at {MODEL_PATH}. Running in demo mode.")
                model = "demo_mode"
        except Exception as e:
            print(f"Could not load model: {e}")
            print("Running in demo mode.")
            model = "demo_mode"

# Attempt to load model at startup
load_ml_model()

def prepare_image(image, target_size):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    img_array = np.array(image, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'PlantCare AI Model API',
        'model_loaded': model != "demo_mode" if model else False,
        'timestamp': time.time()
    })

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    try:
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        processed_image = prepare_image(image, target_size=IMG_SIZE)

        # Ensure model is loaded (lazy loading if not at startup)
        load_ml_model()

        if model == "demo_mode":
            # Simulate processing time
            time.sleep(0.5)
            # Pick a random class for demo purposes
            class_idx = np.random.randint(0, len(CLASS_NAMES))
            confidence = float(np.random.uniform(0.85, 0.99))
        else:
            predictions = model.predict(processed_image)
            class_idx = int(np.argmax(predictions[0]))
            confidence = float(predictions[0][class_idx])

        predicted_class = CLASS_NAMES[class_idx]
        info = get_disease_info(predicted_class)

        # Extract plant and disease from class name (Format: Plant___Disease)
        parts = predicted_class.split('___')
        plant_name = parts[0].replace('_', ' ')
        disease_name = parts[1].replace('_', ' ') if len(parts) > 1 else "Healthy"
        
        # Invoke DeepSeek / OpenAI for rich contextual treatment plans
        ai_insights = generate_ai_insights(plant_name, disease_name)

        response = {
            'success': True,
            'prediction': {
                'plant': plant_name,
                'disease': disease_name,
                'confidence': round(confidence * 100, 2),
                'type': info.get('type', 'Unknown'),
                'description': info.get('description', ''),
                'causes': info.get('causes', ''),
                'treatment': info.get('treatment', ''),
                'prevention': info.get('prevention', ''),
                'ai_insights': ai_insights,
                'is_demo': model == "demo_mode"
            }
        }
        return jsonify(response)

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Production uses gunicorn, but this is fine for dev/docker
    app.run(host='0.0.0.0', port=5000)
