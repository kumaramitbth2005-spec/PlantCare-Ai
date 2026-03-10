import os
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from src.config import MODEL_PATH, CLASS_NAMES
from src.preprocess import get_data_generators

def evaluate_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found at {MODEL_PATH}")
        return

    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    _, validation_generator = get_data_generators()
    if validation_generator is None:
        print("No validation data found.")
        return

    print("Evaluating...")
    loss, accuracy = model.evaluate(validation_generator)
    print(f"Validation Loss: {loss:.4f}")
    print(f"Validation Accuracy: {accuracy:.4f}")
    
    # Predict to get precision, recall, confusion matrix
    print("Generating predictions...")
    validation_generator.reset()
    predictions = model.predict(validation_generator, steps=len(validation_generator))
    y_pred = np.argmax(predictions, axis=1)
    y_true = validation_generator.classes
    
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=CLASS_NAMES))
    
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(12, 12))
    sns.heatmap(cm, annot=False, cmap='Blues', cbar=False)
    plt.title('Confusion Matrix')
    plt.ylabel('True Class')
    plt.xlabel('Predicted Class')
    plt.tight_layout()
    plt.savefig(os.path.join(os.path.dirname(MODEL_PATH), 'confusion_matrix.png'))
    print("Confusion matrix saved.")

if __name__ == '__main__':
    evaluate_model()
