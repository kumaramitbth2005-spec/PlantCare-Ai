import os
from src.config import MODEL_PATH, MODEL_DIR, EPOCHS
from src.preprocess import get_data_generators
from src.model import build_model
import tensorflow as tf

def train_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print("Loading dataset...")
    train_generator, validation_generator = get_data_generators()
    
    if train_generator is None:
        print("No data found. Skipping training.")
        return

    print("Building model...")
    model = build_model()
    
    # Callbacks
    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH, 
        monitor='val_accuracy', 
        save_best_only=True, 
        mode='max', 
        verbose=1
    )
    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor='val_loss', 
        patience=3, 
        restore_best_weights=True
    )
    
    print("Starting training...")
    history = model.fit(
        train_generator,
        validation_data=validation_generator,
        epochs=EPOCHS,
        callbacks=[checkpoint, early_stop]
    )
    
    print(f"Training complete. Best model saved to {MODEL_PATH}")
    return history

if __name__ == '__main__':
    train_model()
