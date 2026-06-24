import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

TEST_CASES = [
    ("valid", "valid@test.io"),
    ("catch_all", "catch-all@test.io"),
    ("role_based", "role-based@test.io"),
    ("spam_trap", "spam-trap@test.io"),
    ("spam_trap_heuristic", "honeypot-user@gmail.com"), 
    ("spam_trap_typo", "john@gamil.com"),
    ("spam_trap_error_fix", "user@gmial.com"),
    ("inbox_full", "inbox-full@test.io"), 
    ("temporary_failure", "temporary-failure@test.io"),
    ("invalid", "invalid@test.io"),
    ("disposable", "disposable@test.io"),
    ("disabled", "disabled@test.io"),
    ("unknown", "unknown@test.io"),
    ("blocked", "blocked@test.io")
]

def run_tests():
    print(f"{'EXPECTED STATUS':<20} | {'EMAIL':<40} | {'ACTUAL STATUS':<15}")
    print("-" * 85)
    
    # Test Single Verification for each case
    for target_status, email in TEST_CASES:
        try:
            resp = requests.get(f"{BASE_URL}/verify/single", params={"email": email}, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                detected_status = data.get("status")
                print(f"{target_status:<20} | {email:<40} | {detected_status:<15}")
            else:
                print(f"{target_status:<20} | {email:<40} | ERROR {resp.status_code}")
        except Exception as e:
            print(f"{target_status:<20} | {email:<40} | FAILED: {str(e)}")

    print("\n" + "="*85)
    print("BULK SUMMARY TEST")
    print("="*85)
    
    bulk_data = {
        "task_name": "Powerful Spam Trap Verification",
        "emails": [e for _, e in TEST_CASES]
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/verify/bulk", json=bulk_data, timeout=30)
        if resp.status_code == 200:
            summary = resp.json().get("summary")
            print(json.dumps(summary, indent=4))
        else:
            print(f"Bulk ERROR {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"Bulk FAILED: {str(e)}")

if __name__ == "__main__":
    run_tests()
