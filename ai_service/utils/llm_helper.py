import os
import requests
import json
from dotenv import load_dotenv

# Automatically load the user's combined .env file from the backend folder
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'backend', '.env'))

# Fallback basic recommendations if API is not configured or fails
FALLBACK_INSIGHTS = {
    'Late_blight': "Immediate action required. Apply copper-based fungicides or chlorothalonil. Remove and destroy infected foliage to prevent rapid spread. Avoid overhead watering.",
    'Early_blight': "Apply protectant fungicides such as mancozeb or chlorothalonil. Ensure proper crop rotation and remove crop debris after harvest to reduce overwintering spores.",
    'Powdery_mildew': "Apply sulfur-based fungicides or potassium bicarbonate sprays. Increase air circulation around the plant canopy by pruning. Avoid high nitrogen fertilizers.",
    'Bacterial_spot': "Copper-based bactericides can slow the spread. Do not work with plants when they are wet. Practice strict sanitation and crop rotation.",
    'Target_Spot': "Treat with appropriate systemic fungicides. Maintain good weed control and ensure optimal plant spacing to reduce canopy humidity.",
    'Spider_mites': "Apply insecticidal soaps, horticultural oils, or neem oil to the undersides of leaves. Introduce predatory mites if possible. Increase ambient humidity as mites thrive in dry conditions.",
    'Leaf_Mold': "Improve ventilation and air flow. Apply protectant fungicides. Reduce humidity levels inside greenhouses if applicable.",
    'healthy': "The plant exhibits excellent bio-markers. Continue your current regimen of balanced watering, appropriate sunlight exposure, and routine nutrient monitoring."
}

def get_fallback_insight(disease_name):
    for key, insight in FALLBACK_INSIGHTS.items():
        if key.lower() in disease_name.lower():
            return insight
    
    if "healthy" in disease_name.lower():
        return FALLBACK_INSIGHTS['healthy']
        
    return "Quarantine the affected plant to prevent potential spread. Prune significantly damaged tissue. Ensure optimal soil drainage and monitor continuously for secondary infections."

def load_training_reference():
    try:
        ref_path = os.path.join(os.path.dirname(__file__), 'training_reference.txt')
        with open(ref_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return ""

def generate_ai_insights(plant_name, disease_name):
    """
    Calls an LLM API (DeepSeek/OpenAI) to generate a detailed, expert treatment plan.
    Falls back to a local string if the API fails or no key is provided.
    """
    
    # Prioritize Perplexity, then DeepSeek, then OpenAI
    perplexity_key = os.environ.get("PERPLEXITY_API_KEY")
    deepseek_key = os.environ.get("DEEPSEEK_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    
    api_key = perplexity_key or deepseek_key or openai_key

    if perplexity_key:
        api_url = "https://api.perplexity.ai/chat/completions"
        model_name = "sonar-pro"
    elif deepseek_key:
        api_url = "https://api.deepseek.com/chat/completions"
        model_name = "deepseek-chat"
    else:
        api_url = "https://api.openai.com/v1/chat/completions"
        model_name = "gpt-3.5-turbo"

    if not api_key:
        print(f"No LLM API Key detected. Using fallback intelligence for {plant_name} {disease_name}.")
        return get_fallback_insight(disease_name)

    # Injecting the detailed prompt structure exactly as requested
    prompt = f"""
    Analyze this plant diagnosis:
    Identified Plant: {plant_name}
    Detected Condition: {disease_name}
    
    If the condition is "Healthy", state that the biological markers are excellent and provide a brief confirmation.

    Otherwise, provide a highly structured, plain-text response strictly following this format exactly:

    1. PLANT IDENTIFICATION:
       - Common name
       - Scientific name
       - Family

    2. DISEASE/PEST DIAGNOSIS:
       - Observed symptoms
       - Likely disease/pest
       - Causal organism (if applicable)
       - Confidence level (High/Medium/Low)

    3. SEVERITY ASSESSMENT:
       - Evaluate if it is Mild (<25% affected), Moderate (25-50% affected), or Severe (>50% affected)

    4. TREATMENT RECOMMENDATIONS:
       - Immediate actions
       - Organic options
       - Chemical options (if necessary)
       - Preventive measures

    5. ADDITIONAL NOTES:
       - Similar looking diseases to consider
       - When to re-evaluate
       - Prevention tips for future
    
    Tone: Professional, scientific, yet accessible. Formatting: Use plain text or light markdown. Do not include introductory filler. Respond directly with the 5 bullet points.
    """
    
    knowledge_base = load_training_reference()
    system_prompt = "You are a highly precise botanical AI diagnostic engine and plant pathologist."
    if knowledge_base:
        system_prompt += f"\n\nBase your analysis STRICTLY on the following agricultural knowledge data exactly as provided:\n{knowledge_base}"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 500,
        "temperature": 0.4
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content'].strip()
    except Exception as e:
        print(f"LLM API Error: {str(e)}. Falling back to local intelligence.")
        return get_fallback_insight(disease_name)
