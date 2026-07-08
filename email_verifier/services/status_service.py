def get_status(signals: dict, score: int) -> dict:
    # Module 8: Status Decision Engine
    # Adopted from Reoon Email Verifier methodology:
    # Status values: safe, invalid, disposable, inbox_full, catch_all,
    # role_account, spamtrap, blocked, temporary_failure, unknown, disabled.
    # is_safe_to_send is a separate bool, not derived from status name.
    
    status = "unknown"
    
    # 1. Critical Flags (Always Unsafe)
    if signals.get("is_spamtrap"):
        status = "spamtrap"
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
            
    # 2. Positive Check (safe if deliverable and score is high)
    elif score >= 70 and signals.get("is_deliverable"):
        status = "safe"
        
    # 3. Informational Flags (If score is not high enough to be 'safe')
    elif signals.get("has_inbox_full"):
        status = "inbox_full"
    elif signals.get("is_catch_all"):
        status = "catch_all"
    elif signals.get("is_role_account"):
        status = "role_account"
    elif signals.get("smtp_status") == "blocked":
        status = "blocked"
    elif signals.get("smtp_status") == "temporary_failure":
        status = "temporary_failure"
    else:
        status = "unknown"
        
    return {
        "status": status,
        "is_safe_to_send": status == "safe"
    }
