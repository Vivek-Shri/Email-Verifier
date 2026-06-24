import os
import csv
import time
from uuid import uuid4
import config

CSV_COLUMNS = [
    "input", "email", "username", "domain", "status", "overall_score",
    "is_safe_to_send", "is_valid_syntax", "is_disposable", "is_role_account",
    "mx_accepts_mail", "mx_records", "can_connect_smtp", "has_inbox_full",
    "is_catch_all", "is_deliverable", "is_disabled", "is_spamtrap",
    "is_free_email", "is_gibberish", "gibberish_score",
    "verification_time_ms", "checked_at", "error_note"
]

def generate_csv(results: list) -> str:
    if not os.path.exists(config.TMP_FILE_DIR):
        try:
            os.makedirs(config.TMP_FILE_DIR, exist_ok=True)
        except Exception:
            # Fallback to current directory /tmp if /tmp is not writable on Windows?
            # Actually, User's OS is Windows, /tmp might not exist.
            # I should use a more windows-friendly path if it fails, or rely on config.
            pass
            
    filename = f"result_{uuid4().hex[:8]}.csv"
    filepath = os.path.join(config.TMP_FILE_DIR, filename)
    
    # Ensure each row only contains keys in CSV_COLUMNS
    cleaned_results = []
    for res in results:
        cleaned_row = {k: res.get(k, "") for k in CSV_COLUMNS}
        cleaned_results.append(cleaned_row)
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(cleaned_results)
            
    return filename

def cleanup_expired_files():
    if not os.path.exists(config.TMP_FILE_DIR):
        return
        
    current_time = time.time()
    expiry_seconds = config.TMP_FILE_EXPIRY_MINUTES * 60
    
    for filename in os.listdir(config.TMP_FILE_DIR):
        if not filename.endswith(".csv"):
            continue
        filepath = os.path.join(config.TMP_FILE_DIR, filename)
        if os.path.isfile(filepath):
            file_age = current_time - os.path.getmtime(filepath)
            if file_age > expiry_seconds:
                try:
                    os.remove(filepath)
                except Exception:
                    pass
