import math
import re
from collections import Counter
import config

def score(username: str, domain: str) -> dict:
    # Module 6: Gibberish Detection
    if not username:
        return {"gibberish_score": 0, "is_gibberish": False, "gibberish_note": None}
        
    score_val = 0
    length = len(username)
    lowercase_user = username.lower()
    
    # Check 1: digit ratio
    digit_count = sum(c.isdigit() for c in username)
    if length > 0 and (digit_count / length) > 0.5:
        score_val += 35
        
    # Check 2: starts with digit
    if username[0].isdigit():
        score_val += 20
        
    # Check 3: no vowels
    vowels = ['a', 'e', 'i', 'o', 'u']
    vowel_count = sum(lowercase_user.count(v) for v in vowels)
    if vowel_count == 0:
        score_val += 25
        
    # Check 4: consecutive digits
    if re.search(r'\d{4,}', username):
        score_val += 20
        
    # Check 5: entropy
    freq = Counter(username)
    entropy = -sum((c / length) * math.log2(c / length) for c in freq.values()) if length > 0 else 0
    if entropy > 3.5:
        score_val += 20
        
    # Check 6: length
    if length < 3:
        score_val += 15
    elif length > 40:
        score_val += 10
        
    final_score = min(score_val, 100)
    is_gibberish = final_score >= 60
    
    note = None
    if is_gibberish:
        # Check if domain is free email
        if domain in set(config.FREE_EMAIL_DOMAINS):
            note = "high_risk_free_email_gibberish"
            
    return {
        "gibberish_score": final_score,
        "is_gibberish": is_gibberish,
        "gibberish_note": note
    }
