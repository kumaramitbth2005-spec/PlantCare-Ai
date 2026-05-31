import os
import shutil
# pyright: ignore [missing-import]
from bing_image_downloader import downloader

# ==========================================
# REAL IMAGE SCRAPER FOR PLANT DISEASES
# ==========================================

DATASET_DIR = "dataset"

# We map the technical folder name to the search query we want to use on Bing
CATEGORIES = {
    "Healthy": "Healthy green plant leaf close up",
    "Tomato_Blight": "Tomato early blight leaf disease",
    "Apple_Scab": "Apple scab leaf disease",
    "Powdery_Mildew": "Powdery mildew plant leaf"
}

IMAGES_PER_CATEGORY = 250  # 4 categories * 250 = 1000 images. Adjust as needed.
# If you strictly want exactly 1000 healthy and 1000 diseased in total, 
# you can change IMAGES_PER_CATEGORY to 500, giving 500 Healthy, and 500 of each of the 3 diseases (1500 diseased total).

def setup_dataset():
    print(f"Starting Real Image Downloader...")
    print(f"WARNING: This will take several minutes to download high-quality images from the internet.")
    
    # Create the root dataset directory
    os.makedirs(DATASET_DIR, exist_ok=True)

    for folder_name, search_query in CATEGORIES.items():
        print(f"\n--- Downloading {IMAGES_PER_CATEGORY} images for: {folder_name} ---")
        
        # Download images using bing-image-downloader
        # This will create a folder named after the search_query inside DATASET_DIR
        downloader.download(
            search_query, 
            limit=IMAGES_PER_CATEGORY,  
            output_dir=DATASET_DIR, 
            adult_filter_off=True, 
            force_replace=False, 
            timeout=60, 
            verbose=False
        )

        # Rename the folder from the search query to the clean folder_name
        downloaded_folder = os.path.join(DATASET_DIR, search_query)
        target_folder = os.path.join(DATASET_DIR, folder_name)
        
        # If the downloaded folder exists and is different from the target folder
        if os.path.exists(downloaded_folder) and downloaded_folder != target_folder:
            # If target already exists, remove it so we can overwrite
            if os.path.exists(target_folder):
                shutil.rmtree(target_folder)
            os.rename(downloaded_folder, target_folder)

    print("\n✅ Successfully downloaded ALL real images!")
    print(f"Images are saved in the '{DATASET_DIR}' folder.")
    print("You can now run 'python src/train_model.py' to train the AI on these real images.")

if __name__ == "__main__":
    setup_dataset()
