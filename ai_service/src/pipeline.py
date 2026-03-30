import os
import json
import base64
import requests
import torch
from torchvision import transforms, models
from PIL import Image
import numpy as np

# Configuration
CONFIDENCE_THRESHOLD = 0.85
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# Dual-Model Paths 
# Using placeholders - these are to be replaced with actual .pt models trained later
PLANT_MODEL_PATH = "models/plant_classifier.pt"
DISEASE_MODEL_PATH = "models/disease_classifier.pt"

class DiseasePipeline:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Initializing Dual-Model Pipeline on {self.device}...")
        
        # 1. Load Model 1: Plant Species Predictor
        try:
            self.plant_model = self._load_model(PLANT_MODEL_PATH, num_classes=10) # e.g., 10 plant species
        except Exception:
            print("Warning: Plant model weights not found. Running in integration mode.")
            self.plant_model = None
            
        # 2. Load Model 2: Disease Predictor
        try:
            self.disease_model = self._load_model(DISEASE_MODEL_PATH, num_classes=38) # e.g., 38 disease states
        except Exception:
            self.disease_model = None

        # Transform pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def _load_model(self, path, num_classes):
        # Using a fast architecture like EfficientNetB0 for real-time mobile scanning
        model = models.efficientnet_b0(pretrained=False)
        model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)
        
        if os.path.exists(path):
            model.load_state_dict(torch.load(path, map_location=self.device))
            
        model = model.to(self.device)
        model.eval()
        return model

    def _get_openai_fallback(self, image_pil):
        """Standardized fallback to GPT-o4/GPT-4-Vision when confidence is too low."""
        if not OPENAI_API_KEY:
            return {"plant": "Unknown", "disease": "Unknown (No API Key)", "confidence": 0, "ai_insights": "Please add OPENAI_API_KEY for advanced fallback."}
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }

        # Convert PIL Image to Base64
        import io
        buffered = io.BytesIO()
        image_pil.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a professional agronomist specializing in Indian agriculture and pest management. "
                        "Carefully identify the plant species and its exact disease or pest. "
                        "CRITICAL: Many models confuse Brinjal (Eggplant) with Potato/Tomato due to leaf shape. Double check taxonomy. "
                        "Identify specialized pests like 'Fruit and Shoot Borer' (locally called Pilu) in Brinjal. "
                        "Return ONLY a JSON object with this structure: "
                        "{'plant': '...', 'disease': '...', 'insights': 'Provide a detailed diagnosis, identifying the specific pest if visible. Suggest organic and chemical treatments specifically for preventing recurrence of pests like caterpillars/borers. Mention fertilizers like Neem Cake or Vermicompost if appropriate.'}"
                    )
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this leaf/plant image. If it is Brinjal, check specifically for 'Pilu' (borer) damage. If it is Potato/Tomato, check for blights."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{img_str}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 500
        }

        try:
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            data = response.json()
            content = data['choices'][0]['message']['content']
            
            # Extract JSON block
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            else:
                json_str = content
                
            result = json.loads(json_str)
            return {
                "plant": result.get("plant", "Unknown"),
                "disease": result.get("disease", "Unknown"),
                "confidence": 0.95, # High confidence for AI output
                "ai_insights": result.get("insights", "Evaluated by secondary AI protocol.")
            }
        except Exception as e:
            print(f"OpenAI fallback error: {e}")
            return {"plant": "Error", "disease": "Fallback Failed", "confidence": 0, "ai_insights": str(e)}

    def analyze(self, image_pil):
        """
        The Core Orchestrator
        Image -> Plant Predictor -> Disease Predictor -> API Fallback (if uncertain)
        """
        tensor_img = self.transform(image_pil).unsqueeze(0).to(self.device)
        
        # If models are not yet trained, simulate or fallback directly
        if self.plant_model is None or self.disease_model is None:
            return self._get_openai_fallback(image_pil)

        with torch.no_grad():
            # PHASE 1: Plant Classification
            plant_out = self.plant_model(tensor_img)
            plant_probs = torch.nn.functional.softmax(plant_out, dim=1)
            plant_conf, plant_idx = torch.max(plant_probs, 1)
            
            plant_conf = float(plant_conf)
            
            # Early Exit Fallback Check
            if plant_conf < CONFIDENCE_THRESHOLD:
                print(f"Low plant confidence ({plant_conf:.2f}). Triggering GPT-4o Fallback.")
                return self._get_openai_fallback(image_pil)
                
            # Simulate getting class name from idx (Normally loaded from a json)
            plant_name = f"Plant_Class_{int(plant_idx)}" 
            
            # PHASE 2: Disease Identification
            # (In an advanced system, you use the plant_name to load a specific disease sub-model here)
            disease_out = self.disease_model(tensor_img)
            disease_probs = torch.nn.functional.softmax(disease_out, dim=1)
            disease_conf, disease_idx = torch.max(disease_probs, 1)
            
            disease_conf = float(disease_conf)
            
            if disease_conf < CONFIDENCE_THRESHOLD:
                print(f"Low disease confidence ({disease_conf:.2f}). Triggering GPT-4o Fallback.")
                return self._get_openai_fallback(image_pil)
                
            disease_name = f"Disease_Class_{int(disease_idx)}"
            
            return {
                "plant": plant_name,
                "disease": disease_name,
                "confidence": disease_conf,
                "ai_insights": "Evaluated by local dual-model neural array."
            }

# Singleton instance exported for use in app.py
pipeline = DiseasePipeline()
