def calculate(signals: dict) -> dict:
    # Module 7: Scoring Engine
    score = 0
    
    # POSITIVE
    score += 15 if signals.get("is_valid_syntax") else 0
    score += 20 if signals.get("mx_accepts_mail") else 0
    score += 20 if signals.get("can_connect_smtp") else 0
    score += 30 if signals.get("is_deliverable") and not signals.get("is_disposable") else 0
    score += 5 if not signals.get("is_disposable") else 0
    score += 5 if not signals.get("is_role_account") else 0
    score += 5 if not signals.get("is_catch_all") else 0
    score += 15 if signals.get("is_mailbox_verified") else 0
    
    # NEGATIVE
    score -= 2 if signals.get("is_free_email") else 0
    score -= 20 if signals.get("is_catch_all") else 0
    score -= 10 if signals.get("has_inbox_full") else 0
    score -= 30 if signals.get("is_disposable") else 0
    score -= 50 if signals.get("is_disabled") else 0
    score -= 50 if signals.get("is_spamtrap") else 0
    score -= 15 if signals.get("is_gibberish") else 0
    
    g_score = signals.get("gibberish_score", 0)
    if 40 <= g_score <= 59:
        score -= 7
        
    return {
        "overall_score": min(max(int(score), 0), 100)
    }
