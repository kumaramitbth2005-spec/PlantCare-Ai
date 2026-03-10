import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from src.config import DATA_DIR, IMG_SIZE, BATCH_SIZE

def get_data_generators():
    """
    Returns train and validation data generators with data augmentation.
    Assumes dataset is organized in DATA_DIR with class subfolders.
    """
    if not os.path.exists(DATA_DIR) or len(os.listdir(DATA_DIR)) == 0:
        print(f"Warning: Dataset directory {DATA_DIR} is empty or does not exist.")
        return None, None
        
    # Data Augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )

    # Validation datagen (only rescaling)
    valid_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        DATA_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    validation_generator = valid_datagen.flow_from_directory(
        DATA_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    return train_generator, validation_generator
