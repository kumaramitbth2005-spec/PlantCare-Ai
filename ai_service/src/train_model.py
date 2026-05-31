import os
# pyright: ignore [missing-import]
import torch
# pyright: ignore [missing-import]
import torch.nn as nn
# pyright: ignore [missing-import]
import torch.optim as optim
# pyright: ignore [missing-import]
from torchvision import datasets, transforms, models
# pyright: ignore [missing-import]
from torch.utils.data import DataLoader
import copy

# ==========================================
# MANUAL AI TRAINING SCRIPT FOR PLANT DISEASES
# ==========================================

DATASET_DIR = "dataset"
MODEL_SAVE_PATH = "plant_disease_model.pth"
CLASSES_SAVE_PATH = "plant_classes.txt"

# Hyperparameters
BATCH_SIZE = 32
EPOCHS = 5  # For real training, set this to 10-20
LEARNING_RATE = 0.001

def train_model():
    if not os.path.exists(DATASET_DIR):
        print(f"Error: Directory '{DATASET_DIR}' not found. Please run download_dataset.py first.")
        return

    # 1. Setup Device (GPU if available, else CPU)
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    # 2. Data Preprocessing & Augmentation
    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Load dataset
    full_dataset = datasets.ImageFolder(DATASET_DIR, data_transforms)
    class_names = full_dataset.classes
    
    # Save classes for inference later
    with open(CLASSES_SAVE_PATH, 'w') as f:
        f.write("\n".join(class_names))
    print(f"Found classes: {class_names}")

    # Split into train/val (80/20)
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    # 3. Load Pretrained Model (MobileNetV2 is fast and accurate)
    model = models.mobilenet_v2(pretrained=True)
    
    # Freeze early layers so we only train the head on our leaves
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace the final classifier layer for our specific number of classes
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(class_names))
    
    model = model.to(device)

    # 4. Setup Loss & Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=LEARNING_RATE)

    # 5. Training Loop ("test karte rahna")
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch+1}/{EPOCHS}")
        print("-" * 10)

        # Each epoch has a training and validation phase
        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
                dataloader = train_loader
                dataset_size = train_size
            else:
                model.eval()
                dataloader = val_loader
                dataset_size = val_size

            running_loss = 0.0
            running_corrects = 0

            # Iterate over data
            for inputs, labels in dataloader:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                # Forward pass
                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    # Backward pass only if in training phase
                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_size
            epoch_acc = running_corrects.double() / dataset_size

            print(f"{phase.capitalize()} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            # Save best model
            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(model.state_dict())

    print(f"\nTraining complete. Best Validation Accuracy: {best_acc:4f}")
    
    # Save the final model
    model.load_state_dict(best_model_wts)
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train_model()
