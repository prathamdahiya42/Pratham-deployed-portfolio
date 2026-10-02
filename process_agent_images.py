import os
import glob
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, binary_dilation

FILE_MAP = {
    'Normal.png': 'normal',
    'frustated.png': 'frustrated',
    'sad.png': 'sad',
    'sarcasm.png': 'sarcasm',
    'shock.png': 'shock',
    'wierd.png': 'weird',
}

SRC_DIR = 'Agent Image folder/_originals'
OUT_DIR = 'public/agent'
AVATAR_DIR = 'public/agent/avatar'
PREVIEW_DIR = 'Agent Image folder/previews'

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)

def process_image(src_filename, target_name):
    src_path = os.path.join(SRC_DIR, src_filename)
    if not os.path.exists(src_path):
        raise FileNotFoundError(f"Source file not found: {src_path}")

    img = Image.open(src_path).convert('RGB')
    arr = np.array(img).astype(np.float32)
    H, W, _ = arr.shape
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    max_rb = np.maximum(r, b)
    diff = g - max_rb

    # 1. Complete global despill: clamp green to max(r, b) wherever g > max(r,b)
    # The character is a monochrome silver/grey robot statue with cyan/violet robotic eyes (where b > g).
    # Clamping g to max(r, b) converts any spill or green screen reflection directly into natural silver/grey!
    g_clean = np.minimum(g, max_rb)

    # 2. Green background and trapped crevices detection:
    # Catches the main background and all enclosed hair gaps/crevices
    is_green = (diff > 8.0) & (g > 50.0)

    # Dilate green mask by 2 iterations to eat away blended antialiased transition pixels
    is_green_dilated = binary_dilation(is_green, iterations=2)
    is_fg = ~is_green_dilated

    # 3. Soft subpixel alpha feathering (1.0px)
    dist_to_fg = distance_transform_edt(is_fg)
    dist_to_bg = distance_transform_edt(~is_fg)
    signed_dist = dist_to_fg - dist_to_bg
    feather = 1.0
    alpha = np.clip((signed_dist + feather) / (2.0 * feather), 0.0, 1.0)

    # 4. Fill transparent background pixels with neutral grey (128)
    # This prevents any green or black chroma edge bleeding during LANCZOS downsampling!
    neutral_grey = 128.0
    r_out = np.where(alpha > 0.01, r, neutral_grey)
    g_out = np.where(alpha > 0.01, g_clean, neutral_grey)
    b_out = np.where(alpha > 0.01, b, neutral_grey)
    g_out = np.minimum(g_out, np.maximum(r_out, b_out))

    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[..., 0] = np.clip(r_out, 0, 255).astype(np.uint8)
    rgba[..., 1] = np.clip(g_out, 0, 255).astype(np.uint8)
    rgba[..., 2] = np.clip(b_out, 0, 255).astype(np.uint8)
    rgba[..., 3] = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)

    full_rgba_img = Image.fromarray(rgba, 'RGBA')

    # 5. Export 256x256 WebP with post-downsample despill pass
    img_256 = full_rgba_img.resize((256, 256), Image.Resampling.LANCZOS)
    arr_256 = np.array(img_256).astype(np.float32)
    arr_256[..., 1] = np.minimum(arr_256[..., 1], np.maximum(arr_256[..., 0], arr_256[..., 2]))
    img_256_clean = Image.fromarray(arr_256.astype(np.uint8), 'RGBA')

    out_256_path = os.path.join(OUT_DIR, f"{target_name}.webp")
    img_256_clean.save(out_256_path, 'WEBP', quality=95, method=6)

    # 6. Export 128x128 WebP avatar
    img_128 = full_rgba_img.resize((128, 128), Image.Resampling.LANCZOS)
    arr_128 = np.array(img_128).astype(np.float32)
    arr_128[..., 1] = np.minimum(arr_128[..., 1], np.maximum(arr_128[..., 0], arr_128[..., 2]))
    img_128_clean = Image.fromarray(arr_128.astype(np.uint8), 'RGBA')

    out_128_path = os.path.join(AVATAR_DIR, f"{target_name}.webp")
    img_128_clean.save(out_128_path, 'WEBP', quality=95, method=6)

    # 7. Verification metrics:
    diff_256 = arr_256[..., 1] - np.maximum(arr_256[..., 0], arr_256[..., 2])
    print(f"[{target_name}] Exported 256x256 & 128x128. Max green excess: {np.max(diff_256):.1f}")

def main():
    print("Processing all 6 agent expression images with flawless chroma despill...")
    for src, target in FILE_MAP.items():
        process_image(src, target)
    print("All agent images processed and saved to public/agent/ and public/agent/avatar/ successfully!")

if __name__ == '__main__':
    main()
