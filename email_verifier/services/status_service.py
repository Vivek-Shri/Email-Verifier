def get_status(signals: dict, score: int) -> dict:
    # Module 8: Status Decision Engine
    # Refined Priority for "Safe to Send" results on restricted networks
    
    status = "unknown"
    
    # 1. Critical Flags (Always Invalid/Unsafe)
    if signals.get("is_spamtrap"):
        status = "spam_trap"
    elif signals.get("is_disabled"):
        status = "disabled"
    elif signals.get("is_disposable"):
        status = "disposable"
    elif signals.get("mx_accepts_mail") is False:
        status = "invalid"
    elif signals.get("is_deliverable") is False and signals.get("smtp_status") != "blocked":
        if signals.get("can_connect_smtp"):
            status = "invalid"
        else:
            status = "unknown"
            
    # 2. Positive Check (Valid if deliverable and score is high)
    elif score >= 70 and signals.get("is_deliverable"):
        # This handles the "Relay False Positive" by trusting deliverability 
        # for IDs with high heuristic scores (non-gibberish, not on blacklists, etc.)
        status = "valid"
        
    # 3. Informational Flags (If score is not high enough to be 'valid')
    elif signals.get("has_inbox_full"):
        status = "inbox_full"
    elif signals.get("is_catch_all"):
        status = "catch_all"
    elif signals.get("is_role_account"):
        status = "role_based"
    elif signals.get("smtp_status") == "blocked":
        status = "blocked"
    elif signals.get("smtp_status") == "temporary_failure":
        status = "temporary_failure"
    else:
        status = "unknown"
        
    return {
        "status": status,
        "is_safe_to_send": status == "valid"
    }
