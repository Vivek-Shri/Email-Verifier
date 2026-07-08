def get_status(signals: dict, score: int) -> dict:
    status = "unknown"

    if signals.get("is_spamtrap"):
        status = "spamtrap"
    elif signals.get("is_disabled"):
        status = "disabled"
    elif signals.get("is_disposable"):
        status = "disposable"
    elif signals.get("mx_accepts_mail") is False:
        status = "invalid"
    elif signals.get("is_catch_all"):
        status = "catch_all"
    elif signals.get("is_role_account"):
        status = "role_account"
    elif signals.get("smtp_status") == "blocked":
        status = "blocked"
    elif signals.get("smtp_status") == "temporary_failure":
        status = "temporary_failure"
    elif signals.get("has_inbox_full"):
        status = "inbox_full"
    elif signals.get("is_deliverable") is False:
        status = "invalid" if signals.get("can_connect_smtp") else "unknown"
    elif score >= 70 and signals.get("is_deliverable"):
        status = "safe"
    else:
        status = "unknown"

    return {
        "status": status,
        "is_safe_to_send": status == "safe"
    }
