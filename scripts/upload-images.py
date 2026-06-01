"""
Extracts all menu item images from the original index.html
and uploads them to Supabase storage, then updates image_url in menu_items.
Uses curl for HTTP to avoid macOS SSL cert issues.
"""
import re, base64, subprocess, json, os, tempfile

SUPABASE_URL = "https://glmkqlpmrbixbuyecupi.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbWtxbHBtcmJpeGJ1eWVjdXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU5MjY2MywiZXhwIjoyMDk0MTY4NjYzfQ._Z_30ctLAYhvs-JhBbjeZaAXgCIDkWPBUdGqssuJA6Y"
HTML_FILE    = "/Users/bsebsa/Desktop/HTML/Appetiemenu/index.html"
TMP_DIR      = tempfile.mkdtemp(prefix="appetie_imgs_")

print("Reading HTML file…")
with open(HTML_FILE, "r", encoding="utf-8") as f:
    html = f.read()

start     = html.find("const menuItems = [")
arr_start = html.find("[", start)
depth, i  = 0, arr_start
while i < len(html):
    if html[i] == "[":  depth += 1
    elif html[i] == "]":
        depth -= 1
        if depth == 0: break
    i += 1

arr_raw = html[arr_start : i + 1]

# Extract id → (mime, b64) for each item
id_img = {}
for m in re.finditer(r'"id"\s*:\s*(\d+)', arr_raw):
    item_id = int(m.group(1))
    rest    = arr_raw[m.start():]
    img_m   = re.search(r'"image"\s*:\s*"data:image/([^;]+);base64,([^"]+)"', rest)
    if img_m:
        id_img[item_id] = (img_m.group(1), img_m.group(2))

print(f"Found {len(id_img)} images\n")

results = {}

for item_id, (mime, b64) in sorted(id_img.items()):
    ext      = "jpg" if mime == "jpeg" else mime
    path     = f"items/{item_id}.{ext}"
    img_path = os.path.join(TMP_DIR, f"{item_id}.{ext}")

    # Write decoded image to temp file
    img_bytes = base64.b64decode(b64)
    with open(img_path, "wb") as f:
        f.write(img_bytes)

    url = f"{SUPABASE_URL}/storage/v1/object/menu-images/{path}"
    result = subprocess.run([
        "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
        "-X", "POST", url,
        "-H", f"apikey: {SERVICE_KEY}",
        "-H", f"Authorization: Bearer {SERVICE_KEY}",
        "-H", f"Content-Type: image/{mime}",
        "-H", "x-upsert: true",
        "--data-binary", f"@{img_path}",
    ], capture_output=True, text=True)

    code = result.stdout.strip()
    size_kb = len(img_bytes) // 1024
    if code in ("200", "201"):
        print(f"  ✓ ID {item_id:4d} → {path}  ({size_kb} KB)")
        results[item_id] = path
    else:
        print(f"  ✗ ID {item_id:4d} FAILED (HTTP {code})")

print(f"\nUploaded {len(results)}/{len(id_img)} images.")

# Update menu_items table
print("\nUpdating menu_items.image_url in Supabase…")
table_missing = False
for item_id, path in results.items():
    url  = f"{SUPABASE_URL}/rest/v1/menu_items?id=eq.{item_id}"
    body = json.dumps({"image_url": path})
    result = subprocess.run([
        "curl", "-s", "-o", "/tmp/patch_out.txt", "-w", "%{http_code}",
        "-X", "PATCH", url,
        "-H", f"apikey: {SERVICE_KEY}",
        "-H", f"Authorization: Bearer {SERVICE_KEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: return=minimal",
        "-d", body,
    ], capture_output=True, text=True)
    code = result.stdout.strip()
    if code == "204":
        print(f"  ✓ Updated item {item_id}")
    else:
        with open("/tmp/patch_out.txt") as f:
            err = f.read()
        if "does not exist" in err:
            print(f"  ⚠  menu_items table not found. Run supabase-schema.sql first, then re-run this script.")
            table_missing = True
            break
        print(f"  ✗ Item {item_id} failed (HTTP {code}): {err[:80]}")

# Cleanup temp files
import shutil
shutil.rmtree(TMP_DIR, ignore_errors=True)

if table_missing:
    print("\n⚠  Images are in Supabase storage but menu_items table doesn't exist yet.")
    print("   1. Run supabase-schema.sql in Supabase SQL Editor")
    print("   2. Re-run: python3 scripts/upload-images.py")
else:
    print("\n✅ Done! All images uploaded and menu_items updated with image URLs.")
