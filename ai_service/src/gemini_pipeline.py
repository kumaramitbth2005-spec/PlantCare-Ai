import os
import json
# pyright: ignore [missing-import]
import google.generativeai as genai
# pyright: ignore [missing-import]
from PIL import Image

# Initialize the Gemini API Key
# Make sure GEMINI_API_KEY is loaded in the environment
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class GeminiPipeline:
    def __init__(self):
        self.model = None
        if GEMINI_API_KEY:
            # We use gemini-1.5-flash for fast and accurate multimodal tasks
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            print("Gemini Vision Pipeline initialized successfully.")
        else:
            print("WARNING: GEMINI_API_KEY not found in environment. Gemini Vision will not work.")

    def analyze(self, image_pil: Image.Image, predicted_disease: str = None):
        """
        Takes a PIL image, sends it to Gemini, and returns structured data.
        If predicted_disease is provided from the local ML model, it will base treatments on that.
        """
        if not self.model:
            return {
                "plant": "Error",
                "disease": "Missing API Key",
                "confidence": 0,
                "type": "Unknown",
                "description": "Please set GEMINI_API_KEY in your .env file.",
                "treatment": "No treatment available. Setup API Key.",
                "ai_insights": "System requires GEMINI_API_KEY to process images.",
                "cause": "Unknown",
                "is_demo": True
            }

        if predicted_disease and predicted_disease != "Model not trained yet":
            prompt = f"""
            You are a highly skilled agronomist and plant pathologist.
            A highly accurate local machine learning model has already scanned this image and determined with 100% certainty that the disease/state is: '{predicted_disease}'.
            Your job is to provide the precise treatment, cause, and insights for '{predicted_disease}'.
            Crucially, specify the exact fertilizer to use and exactly how much water to put (e.g., '500ml twice a week').
            """
        else:
            prompt = """
            You are a highly skilled agronomist and plant pathologist.
            Analyze this plant image carefully.
            Identify the plant species, the disease (or state if it is Healthy), and provide precise treatment.
            Crucially, specify the exact fertilizer to use and exactly how much water to put (e.g., '500ml twice a week').
            """
            
        prompt += """
        
        Return ONLY a JSON object with EXACTLY these keys:
        {
            "plant": "Common name of the plant",
            "disease": "Specific disease name or 'Healthy'",
            "confidence": 95, 
            "type": "Virus/Bacterial/Fungal/Pest/Unknown/Healthy",
            "description": "A short 2-sentence description of the symptoms or condition.",
            "cause": "Explanation of why this disease occurred (e.g., overwatering, fungal spores in humid conditions, or pest infestation like Dragonflies/Whiteflies).",
            "treatment": "Provide precise protocol including WHICH FERTILIZER to use and exactly HOW MUCH WATER to apply.",
            "ai_insights": "Detailed 3-4 bullet points breaking down the bio-analytical intelligence."
        }
        
        Do not include Markdown formatting blocks like ```json. Return raw JSON string only.
        """

        try:
            response = self.model.generate_content([prompt, image_pil])
            response_text = response.text.strip()
            
            # Clean up the response if the model returned markdown
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            result = json.loads(response_text.strip())
            
            # Ensure all keys are present
            return {
                "plant": result.get("plant", "Unknown Plant"),
                "disease": result.get("disease", "Unknown Disease"),
                "confidence": float(result.get("confidence", 95.0)),
                "type": result.get("type", "Unknown"),
                "description": result.get("description", "Analyzed by Gemini Neural Engine."),
                "cause": result.get("cause", "Cause not specified."),
                "treatment": result.get("treatment", "Consult local expert."),
                "ai_insights": result.get("ai_insights", "Processed successfully."),
                "is_demo": False
            }

        except Exception as e:
            print(f"Gemini API error: {e}")
            return {
                "plant": "Error",
                "disease": "Analysis Failed",
                "confidence": 0,
                "type": "Error",
                "description": str(e),
                "cause": "Failed to determine cause.",
                "treatment": "Failed to generate treatment.",
                "ai_insights": "An error occurred while communicating with Gemini Neural Engine.",
                "is_demo": True
            }

# Singleton instance exported for use in app.py
gemini_pipeline = GeminiPipeline()