import os
# pyright: ignore [missing-import]
import torch
# pyright: ignore [missing-import]
import torch.nn as nn
# pyright: ignore [missing-import]
from torchvision import transforms, models
# pyright: ignore [missing-import]
from PIL import Image

MODEL_SAVE_PATH = "src/plant_disease_model.pth"
CLASSES_SAVE_PATH = "src/plant_classes.txt"

class LocalVisionPipeline:
    def __init__(self):
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.class_names = []
        
        self.load_model()

    def load_model(self):
        if not os.path.exists(MODEL_SAVE_PATH):
            print(f"Warning: {MODEL_SAVE_PATH} not found. You need to run train_model.py first.")
            return
        if not os.path.exists(CLASSES_SAVE_PATH):
            print(f"Warning: {CLASSES_SAVE_PATH} not found.")
            return

        with open(CLASSES_SAVE_PATH, 'r') as f:
            self.class_names = [line.strip() for line in f.readlines()]

        # Initialize the same model architecture
        self.model = models.mobilenet_v2(weights=None)
        num_ftrs = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(num_ftrs, len(self.class_names))
        
        # Load the trained weights
        self.model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=self.device))
        self.model.to(self.device)
        self.model.eval() # Set to evaluation mode
        
        print("Local PyTorch vision model loaded successfully.")

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def predict(self, image_pil: Image.Image):
        if self.model is None:
            return "Model not trained yet"

        image_tensor = self.transform(image_pil).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(image_tensor)
            _, preds = torch.max(outputs, 1)
            predicted_class = self.class_names[preds[0].item()]
            
        return predicted_class

local_vision_pipeline = LocalVisionPipeline()
