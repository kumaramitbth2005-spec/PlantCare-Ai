import os
import io
import time
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# Import config values
import sys
# Add current directory to path to find src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.config import CLASS_NAMES

from utils.disease_info import get_disease_info
from utils.llm_helper import generate_ai_insights

app = Flask(__name__)
CORS(app)

# Attempt to load the new advanced Gemini Pipeline
try:
    from src.gemini_pipeline import gemini_pipeline
    PIPELINE_READY = True
    print("Gemini Vision Pipeline initialized successfully.")
except ImportError as e:
    PIPELINE_READY = False
    print(f"Failed to load Gemini Pipeline. Error: {e}")
    print("Running in DEMO / FALLBACK mode.")

# Attempt to load the Local Vision Pipeline
try:
    from src.local_vision_pipeline import local_vision_pipeline
    LOCAL_VISION_READY = True
except ImportError as e:
    LOCAL_VISION_READY = False
    print(f"Failed to load Local Vision Pipeline. Error: {e}")

@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'PlantCare Advanced AI Pipeline (Gemini)',
        'pipeline_ready': PIPELINE_READY,
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
        
        if image.mode != "RGB":
            image = image.convert("RGB")

        if PIPELINE_READY:
            # 1. Run local model first (if ready and trained)
            predicted_disease = None
            if LOCAL_VISION_READY:
                local_pred = local_vision_pipeline.predict(image)
                if local_pred != "Model not trained yet":
                    predicted_disease = local_pred
                    print(f"Local Model Predicted: {predicted_disease}")

            # 2. Route image and local prediction through the Gemini Vision AI
            pipeline_result = gemini_pipeline.analyze(image, predicted_disease=predicted_disease)
            
            plant_name = pipeline_result.get("plant", "Unknown")
            disease_name = pipeline_result.get("disease", "Unknown")
            confidence = pipeline_result.get("confidence", 95)
            # Ensure confidence is a percentage
            if confidence <= 1.0:
                confidence = confidence * 100
                
            response = {
                'success': True,
                'prediction': {
                    'plant': plant_name,
                    'disease': disease_name,
                    'confidence': round(float(confidence), 2),
                    'type': pipeline_result.get('type', 'Unknown'),
                    'description': pipeline_result.get('description', ''),
                    'causes': pipeline_result.get('cause', 'Diagnosed by Gemini AI Engine.'),
                    'treatment': pipeline_result.get('treatment', ''),
                    'prevention': pipeline_result.get('treatment', ''),
                    'ai_insights': pipeline_result.get('ai_insights', ''),
                    'is_demo': pipeline_result.get('is_demo', False)
                }
            }
            return jsonify(response)
        else:
            # Fallback random values if pipeline isn't installed
            is_demo = True
            time.sleep(0.5)
            # Pick a random class for demo purposes
            class_idx = np.random.randint(0, len(CLASS_NAMES))
            predicted_class = CLASS_NAMES[class_idx]
            confidence = float(np.random.uniform(0.85, 0.99))
            
            parts = predicted_class.split('___')
            plant_name = parts[0].replace('_', ' ')
            disease_name = parts[1].replace('_', ' ') if len(parts) > 1 else "Healthy"
            ai_insights = generate_ai_insights(plant_name, disease_name)

            # Look up existing local disease database
            info = get_disease_info(predicted_class)

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
                    'is_demo': is_demo
                }
            }
            return jsonify(response)

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Production uses gunicorn, but this is fine for dev/docker
    app.run(host='0.0.0.0', port=5000)
